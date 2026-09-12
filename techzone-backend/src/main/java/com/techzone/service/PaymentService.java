package com.techzone.service;

import com.techzone.dto.PaymentWebhookRequest;
import com.techzone.entity.Order;
import com.techzone.entity.PaymentTransaction;
import com.techzone.repository.OrderRepository;
import com.techzone.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;

    @Value("${techzone.payment.vietqr.bank-bin:}")
    private String vietQrBankBin;

    @Value("${techzone.payment.vietqr.account-no:}")
    private String vietQrAccountNo;

    @Value("${techzone.payment.vietqr.account-name:TECHZONE}")
    private String vietQrAccountName;

    @Value("${techzone.payment.vietqr.template:compact2}")
    private String vietQrTemplate;

    @Value("${techzone.payment.webhook-secret}")
    private String webhookSecret;

    @Transactional
    public PaymentTransaction createPaymentForOrder(Order order) {
        if ("COD".equalsIgnoreCase(order.getPaymentMethod())) {
            return null;
        }

        if ("QR_TRANSFER".equalsIgnoreCase(order.getPaymentMethod())) {
            String reference = order.getOrderCode();
            String paymentUrl = buildVietQrUrl(order, reference);

            return paymentTransactionRepository.save(PaymentTransaction.builder()
                    .order(order)
                    .provider("VIETQR")
                    .method("QR_TRANSFER")
                    .amount(order.getTotalAmount())
                    .status("PENDING")
                    .reference(reference)
                    .paymentUrl(paymentUrl)
                    .build());
        }

        throw new IllegalArgumentException("Unsupported online payment method: " + order.getPaymentMethod());
    }

    public List<PaymentTransaction> getTransactionsForOrder(Order order) {
        return paymentTransactionRepository.findByOrderOrderByCreatedAtDesc(order);
    }

    public String getPaymentStatus(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderCode));
        return order.getPaymentStatus();
    }

    @Transactional
    public PaymentTransaction mockPaymentResult(String orderCode, String status) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderCode));

        PaymentTransaction transaction = paymentTransactionRepository.findByOrderOrderByCreatedAtDesc(order)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Payment transaction not found for order: " + orderCode));

        String normalizedStatus = normalizeWebhookStatus(status);
        transaction.setStatus(normalizedStatus);
        transaction.setProcessedAt(LocalDateTime.now());
        transaction.setGatewayTransactionId("MOCK-" + UUID.randomUUID());

        if ("PAID".equals(normalizedStatus)) {
            order.setPaymentStatus("PAID");
            order.setOrderStatus("CONFIRMED");
        } else if ("FAILED".equals(normalizedStatus)) {
            order.setPaymentStatus("FAILED");
        } else if ("EXPIRED".equals(normalizedStatus)) {
            order.setPaymentStatus("EXPIRED");
        }

        orderRepository.save(order);
        return paymentTransactionRepository.save(transaction);
    }

    @Transactional
    public PaymentTransaction handleWebhook(PaymentWebhookRequest request, String signature) {
        String payload = canonicalPayload(request);
        if (!verifySignature(payload, signature)) {
            throw new AccessDeniedException("Invalid payment webhook signature");
        }

        PaymentTransaction transaction = paymentTransactionRepository.findByReference(request.getReference())
                .orElseThrow(() -> new RuntimeException("Payment transaction not found: " + request.getReference()));

        if (isTerminal(transaction.getStatus())) {
            return transaction;
        }

        if (request.getAmount() == null || transaction.getAmount().compareTo(request.getAmount()) != 0) {
            transaction.setStatus("FAILED");
            transaction.setFailureReason("Webhook amount does not match order amount");
            transaction.setProcessedAt(LocalDateTime.now());
            return paymentTransactionRepository.save(transaction);
        }

        String newStatus = normalizeWebhookStatus(request.getStatus());
        transaction.setStatus(newStatus);
        transaction.setGatewayTransactionId(request.getGatewayTransactionId());
        transaction.setFailureReason(request.getFailureReason());
        transaction.setProcessedAt(LocalDateTime.now());

        Order order = transaction.getOrder();
        if ("PAID".equals(newStatus)) {
            order.setPaymentStatus("PAID");
        } else if ("FAILED".equals(newStatus)) {
            order.setPaymentStatus("FAILED");
        }
        orderRepository.save(order);

        return paymentTransactionRepository.save(transaction);
    }

    private String buildVietQrUrl(Order order, String reference) {
        if (vietQrBankBin == null || vietQrBankBin.isBlank() || vietQrAccountNo == null || vietQrAccountNo.isBlank()) {
            return null;
        }

        return UriComponentsBuilder
                .fromUriString("https://img.vietqr.io/image/{bank}-{account}-{template}.png")
                .queryParam("amount", order.getTotalAmount().toBigInteger().toString())
                .queryParam("addInfo", reference)
                .queryParam("accountName", vietQrAccountName)
                .buildAndExpand(vietQrBankBin, vietQrAccountNo, vietQrTemplate)
                .toUriString();
    }

    private boolean verifySignature(String payload, String signature) {
        if (signature == null || signature.isBlank()) {
            return false;
        }
        return hmacSha256(payload).equalsIgnoreCase(signature.trim());
    }

    private String hmacSha256(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Cannot sign payment webhook payload", e);
        }
    }

    private String canonicalPayload(PaymentWebhookRequest request) {
        BigDecimal amount = request.getAmount() != null ? request.getAmount().stripTrailingZeros() : BigDecimal.ZERO;
        return String.join("|",
                safe(request.getReference()),
                amount.toPlainString(),
                safe(request.getStatus()),
                safe(request.getGatewayTransactionId()));
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean isTerminal(String status) {
        return "PAID".equalsIgnoreCase(status) || "FAILED".equalsIgnoreCase(status) || "REFUNDED".equalsIgnoreCase(status);
    }

    private String normalizeWebhookStatus(String status) {
        if ("PAID".equalsIgnoreCase(status) || "SUCCESS".equalsIgnoreCase(status)) {
            return "PAID";
        }
        if ("FAILED".equalsIgnoreCase(status) || "CANCELLED".equalsIgnoreCase(status)) {
            return "FAILED";
        }
        if ("EXPIRED".equalsIgnoreCase(status)) {
            return "EXPIRED";
        }
        return "PENDING";
    }
}

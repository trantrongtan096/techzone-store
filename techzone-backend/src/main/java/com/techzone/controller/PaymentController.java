package com.techzone.controller;

import com.techzone.dto.PaymentWebhookRequest;
import com.techzone.entity.Order;
import com.techzone.entity.PaymentTransaction;
import com.techzone.entity.User;
import com.techzone.service.AuthService;
import com.techzone.service.OrderService;
import com.techzone.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;
    private final AuthService authService;

    @GetMapping("/orders/{orderCode}")
    public ResponseEntity<List<PaymentTransaction>> getOrderPayments(@PathVariable String orderCode,
                                                                     @RequestParam(required = false) String contact,
                                                                     Principal principal) {
        User user = principal != null ? authService.getCurrentUser(principal.getName()) : null;
        Order order = orderService.getOrderByCode(orderCode, user, contact);
        return ResponseEntity.ok(paymentService.getTransactionsForOrder(order));
    }

    @GetMapping("/{orderCode}/status")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(@PathVariable String orderCode) {
        return ResponseEntity.ok(new PaymentStatusResponse(paymentService.getPaymentStatus(orderCode)));
    }

    @PostMapping("/webhooks/vietqr")
    public ResponseEntity<PaymentTransaction> handleVietQrWebhook(@RequestBody PaymentWebhookRequest request,
                                                                  @RequestHeader("X-TechZone-Signature") String signature) {
        return ResponseEntity.ok(paymentService.handleWebhook(request, signature));
    }

    public record PaymentStatusResponse(String status) {}
}

package com.techzone.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentWebhookRequest {
    private String reference;
    private BigDecimal amount;
    private String status;
    private String gatewayTransactionId;
    private String failureReason;
}

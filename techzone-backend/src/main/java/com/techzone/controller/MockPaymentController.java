package com.techzone.controller;

import com.techzone.entity.PaymentTransaction;
import com.techzone.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Profile("dev")
@RestController
@RequestMapping("/api/dev/payments")
@RequiredArgsConstructor
public class MockPaymentController {

    private final PaymentService paymentService;

    @PostMapping("/{orderCode}/success")
    public ResponseEntity<PaymentTransaction> mockSuccess(@PathVariable String orderCode) {
        return ResponseEntity.ok(paymentService.mockPaymentResult(orderCode, "PAID"));
    }

    @PostMapping("/{orderCode}/failed")
    public ResponseEntity<PaymentTransaction> mockFailed(@PathVariable String orderCode) {
        return ResponseEntity.ok(paymentService.mockPaymentResult(orderCode, "FAILED"));
    }

    @PostMapping("/{orderCode}/expired")
    public ResponseEntity<PaymentTransaction> mockExpired(@PathVariable String orderCode) {
        return ResponseEntity.ok(paymentService.mockPaymentResult(orderCode, "EXPIRED"));
    }
}

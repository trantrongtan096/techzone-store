package com.techzone.controller;

import com.techzone.dto.CheckoutRequest;
import com.techzone.entity.Order;
import com.techzone.entity.User;
import com.techzone.service.AuthService;
import com.techzone.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    @PostMapping("/checkout")
    public ResponseEntity<Order> checkout(@Valid @RequestBody CheckoutRequest request, Principal principal) {
        User user = principal != null ? authService.getCurrentUser(principal.getName()) : null;
        return ResponseEntity.ok(orderService.checkout(request, user));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<Order> getOrderByCode(@PathVariable String orderCode,
                                                @RequestParam(required = false) String contact,
                                                Principal principal) {
        User user = principal != null ? authService.getCurrentUser(principal.getName()) : null;
        return ResponseEntity.ok(orderService.getOrderByCode(orderCode, user, contact));
    }
}

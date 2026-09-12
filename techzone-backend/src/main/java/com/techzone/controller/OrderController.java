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
import java.util.List;

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

    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders(Principal principal) {
        if (principal == null) {
            throw new org.springframework.security.access.AccessDeniedException("Login is required");
        }
        User user = authService.getCurrentUser(principal.getName());
        return ResponseEntity.ok(orderService.getOrdersForUser(user));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<Order> getOrderByCode(@PathVariable String orderCode,
                                                @RequestParam(required = false) String contact,
                                                Principal principal) {
        User user = principal != null ? authService.getCurrentUser(principal.getName()) : null;
        return ResponseEntity.ok(orderService.getOrderByCode(orderCode, user, contact));
    }
}

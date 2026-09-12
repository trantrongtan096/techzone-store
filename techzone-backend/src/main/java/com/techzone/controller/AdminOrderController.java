package com.techzone.controller;

import com.techzone.dto.AdminOrderResponse;
import com.techzone.entity.Order;
import com.techzone.repository.OrderRepository;
import com.techzone.service.OrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
public class AdminOrderController {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<AdminOrderResponse>> getAllOrders() {
        List<AdminOrderResponse> orders = orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(AdminOrderResponse::from)
                .toList();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AdminOrderResponse> updateOrderStatus(@PathVariable Long id, @RequestBody OrderStatusRequest req) {
        Order updatedOrder = orderService.updateOrderStatus(id, req.getOrderStatus(), req.getPaymentStatus());
        return ResponseEntity.ok(AdminOrderResponse.from(updatedOrder));
    }

    @Data
    public static class OrderStatusRequest {
        private String orderStatus;
        private String paymentStatus;
    }
}

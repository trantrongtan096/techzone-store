package com.techzone.controller;

import com.techzone.dto.AdminOrderResponse;
import com.techzone.entity.Order;
import com.techzone.entity.Product;
import com.techzone.repository.OrderRepository;
import com.techzone.repository.ProductRepository;
import com.techzone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
public class AdminDashboardController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Order> orders = orderRepository.findAll();
        BigDecimal totalRevenue = orders.stream()
                .filter(o -> !"CANCELLED".equals(o.getOrderStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalOrders", orders.size());
        stats.put("totalProducts", productRepository.count());
        stats.put("totalUsers", userRepository.count());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<List<AdminOrderResponse>> getRecentOrders() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        if (orders.size() > 5) {
            orders = orders.subList(0, 5);
        }
        return ResponseEntity.ok(orders.stream().map(AdminOrderResponse::from).toList());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockProducts() {
        List<Product> lowStock = productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() <= 5)
                .toList();
        return ResponseEntity.ok(lowStock);
    }
}

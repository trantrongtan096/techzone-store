package com.techzone.service;

import com.techzone.dto.CheckoutRequest;
import com.techzone.entity.*;
import com.techzone.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Order checkout(CheckoutRequest request, User user) {
        Cart cart = cartService.getOrCreateCart(user, request.getSessionId());

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng của bạn đang trống!");
        }

        // Atomic Stock Deduction for each cart item during checkout (Overselling Prevention)
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            int quantity = cartItem.getQuantity();

            if (product != null) {
                int updated = productRepository.deductStockAtomic(product.getId(), quantity);
                if (updated == 0) {
                    int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                    throw new RuntimeException("Sản phẩm [" + product.getName() + "] không đủ tồn kho (chỉ còn " + currentStock + " sản phẩm)!");
                }
            }
        }

        BigDecimal totalAmount = cart.getItems().stream()
                .map(item -> {
                    BigDecimal price = item.getProduct().getPromotionPrice() != null ?
                            item.getProduct().getPromotionPrice() : item.getProduct().getOriginalPrice();
                    return price.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String orderCode = "TZ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerEmail(request.getCustomerEmail())
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "COD")
                .paymentStatus("PENDING")
                .orderStatus("PENDING")
                .totalAmount(totalAmount)
                .note(request.getNote())
                .build();

        List<OrderItem> orderItems = cart.getItems().stream().map(cartItem -> {
            BigDecimal price = cartItem.getProduct().getPromotionPrice() != null ?
                    cartItem.getProduct().getPromotionPrice() : cartItem.getProduct().getOriginalPrice();

            return OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .productName(cartItem.getProduct().getName())
                    .price(price)
                    .quantity(cartItem.getQuantity())
                    .build();
        }).toList();

        order.getItems().addAll(orderItems);
        Order savedOrder = orderRepository.save(order);

        // Clear cart after checkout
        cart.getItems().clear();
        cartRepository.save(cart);

        return savedOrder;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newOrderStatus, String newPaymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng id: " + orderId));

        String oldStatus = order.getOrderStatus();

        // 1. Order Cancelled: Auto restore stock back to products
        if (!"CANCELLED".equalsIgnoreCase(oldStatus) && "CANCELLED".equalsIgnoreCase(newOrderStatus)) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    productRepository.restoreStockAtomic(item.getProduct().getId(), item.getQuantity());
                }
            }
        }
        // 2. Un-cancelling an Order: Re-deduct stock atomically
        else if ("CANCELLED".equalsIgnoreCase(oldStatus) && !"CANCELLED".equalsIgnoreCase(newOrderStatus)) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    int updated = productRepository.deductStockAtomic(item.getProduct().getId(), item.getQuantity());
                    if (updated == 0) {
                        throw new RuntimeException("Không thể mở lại đơn hàng vì sản phẩm [" + item.getProductName() + "] không đủ tồn kho!");
                    }
                }
            }
        }

        order.setOrderStatus(newOrderStatus);
        if (newPaymentStatus != null && !newPaymentStatus.trim().isEmpty()) {
            order.setPaymentStatus(newPaymentStatus);
        }

        return orderRepository.save(order);
    }

    public Order getOrderByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderCode));
    }
}

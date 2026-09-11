package com.techzone.service;

import com.techzone.dto.CheckoutRequest;
import com.techzone.entity.Cart;
import com.techzone.entity.CartItem;
import com.techzone.entity.Order;
import com.techzone.entity.OrderItem;
import com.techzone.entity.Product;
import com.techzone.entity.User;
import com.techzone.repository.CartRepository;
import com.techzone.repository.OrderRepository;
import com.techzone.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
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
            throw new RuntimeException("Cart is empty");
        }

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            int quantity = cartItem.getQuantity();

            if (product != null) {
                int updated = productRepository.deductStockAtomic(product.getId(), quantity);
                if (updated == 0) {
                    int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                    throw new RuntimeException("Product [" + product.getName() + "] does not have enough stock. Current stock: " + currentStock);
                }
            }
        }

        BigDecimal totalAmount = cart.getItems().stream()
                .map(item -> {
                    BigDecimal price = item.getProduct().getPromotionPrice() != null
                            ? item.getProduct().getPromotionPrice()
                            : item.getProduct().getOriginalPrice();
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
            BigDecimal price = cartItem.getProduct().getPromotionPrice() != null
                    ? cartItem.getProduct().getPromotionPrice()
                    : cartItem.getProduct().getOriginalPrice();

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

        cart.getItems().clear();
        cartRepository.save(cart);

        return savedOrder;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newOrderStatus, String newPaymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        String oldStatus = order.getOrderStatus();

        if (!"CANCELLED".equalsIgnoreCase(oldStatus) && "CANCELLED".equalsIgnoreCase(newOrderStatus)) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    productRepository.restoreStockAtomic(item.getProduct().getId(), item.getQuantity());
                }
            }
        } else if ("CANCELLED".equalsIgnoreCase(oldStatus) && !"CANCELLED".equalsIgnoreCase(newOrderStatus)) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    int updated = productRepository.deductStockAtomic(item.getProduct().getId(), item.getQuantity());
                    if (updated == 0) {
                        throw new RuntimeException("Cannot reopen order because product [" + item.getProductName() + "] does not have enough stock");
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

    public Order getOrderByCode(String orderCode, User user, String contact) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderCode));

        if (user != null && order.getUser() != null && order.getUser().getId().equals(user.getId())) {
            return order;
        }

        if (contact != null && !contact.isBlank()) {
            String normalizedContact = contact.trim();
            boolean matchesEmail = order.getCustomerEmail() != null
                    && order.getCustomerEmail().equalsIgnoreCase(normalizedContact);
            boolean matchesPhone = order.getCustomerPhone() != null
                    && order.getCustomerPhone().equals(normalizedContact);
            if (matchesEmail || matchesPhone) {
                return order;
            }
        }

        throw new AccessDeniedException("Order verification is required");
    }
}

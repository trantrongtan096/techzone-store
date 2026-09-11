package com.techzone.service;

import com.techzone.dto.CartItemRequest;
import com.techzone.entity.*;
import com.techzone.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public Cart getOrCreateCart(User user, String sessionId) {
        if (user != null) {
            return cartRepository.findByUser(user).orElseGet(() ->
                    cartRepository.save(Cart.builder().user(user).build())
            );
        } else if (sessionId != null) {
            return cartRepository.findBySessionId(sessionId).orElseGet(() ->
                    cartRepository.save(Cart.builder().sessionId(sessionId).build())
            );
        }
        return cartRepository.save(Cart.builder().sessionId(java.util.UUID.randomUUID().toString()).build());
    }

    @Transactional
    public Cart addToCart(CartItemRequest request, User user) {
        Cart cart = getOrCreateCart(user, request.getSessionId());
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(item);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateCartItem(Long itemId, int quantity) {
        Cart cart = cartRepository.findAll().stream()
                .filter(c -> c.getItems().stream().anyMatch(i -> i.getId().equals(itemId)))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Giỏ hàng không tồn tại"));

        if (quantity <= 0) {
            cart.getItems().removeIf(item -> item.getId().equals(itemId));
        } else {
            cart.getItems().stream()
                    .filter(item -> item.getId().equals(itemId))
                    .findFirst()
                    .ifPresent(item -> item.setQuantity(quantity));
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItem(Long itemId) {
        return updateCartItem(itemId, 0);
    }
}

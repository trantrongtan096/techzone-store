package com.techzone.service;

import com.techzone.dto.CartItemRequest;
import com.techzone.entity.Cart;
import com.techzone.entity.CartItem;
import com.techzone.entity.Product;
import com.techzone.entity.User;
import com.techzone.repository.CartRepository;
import com.techzone.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Cart getOrCreateCart(User user, String sessionId) {
        if (user != null) {
            return cartRepository.findByUser(user).orElseGet(() ->
                    cartRepository.save(Cart.builder().user(user).build())
            );
        }
        if (sessionId != null && !sessionId.isBlank()) {
            return cartRepository.findBySessionId(sessionId).orElseGet(() ->
                    cartRepository.save(Cart.builder().sessionId(sessionId).build())
            );
        }
        return cartRepository.save(Cart.builder().sessionId(UUID.randomUUID().toString()).build());
    }

    @Transactional
    public Cart addToCart(CartItemRequest request, User user) {
        Cart cart = getOrCreateCart(user, request.getSessionId());
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product does not exist"));

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
    public Cart updateCartItem(Long itemId, int quantity, User user, String sessionId) {
        Cart cart = findAccessibleCart(user, sessionId);
        CartItem targetItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item does not belong to this cart"));

        if (quantity <= 0) {
            cart.getItems().remove(targetItem);
        } else {
            targetItem.setQuantity(quantity);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItem(Long itemId, User user, String sessionId) {
        return updateCartItem(itemId, 0, user, sessionId);
    }

    private Cart findAccessibleCart(User user, String sessionId) {
        if (user != null) {
            return cartRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Cart does not exist"));
        }
        if (sessionId != null && !sessionId.isBlank()) {
            return cartRepository.findBySessionId(sessionId)
                    .orElseThrow(() -> new RuntimeException("Cart does not exist"));
        }
        throw new RuntimeException("Missing cart session");
    }
}

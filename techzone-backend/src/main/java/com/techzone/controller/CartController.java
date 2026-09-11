package com.techzone.controller;

import com.techzone.dto.CartItemRequest;
import com.techzone.entity.Cart;
import com.techzone.entity.User;
import com.techzone.service.AuthService;
import com.techzone.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<Cart> getCart(@RequestParam(required = false) String sessionId, Principal principal) {
        User user = getCurrentUser(principal);
        return ResponseEntity.ok(cartService.getOrCreateCart(user, sessionId));
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(@RequestBody CartItemRequest request, Principal principal) {
        User user = getCurrentUser(principal);
        return ResponseEntity.ok(cartService.addToCart(request, user));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<Cart> updateCartItem(@PathVariable Long itemId,
                                               @RequestParam int quantity,
                                               @RequestParam(required = false) String sessionId,
                                               Principal principal) {
        User user = getCurrentUser(principal);
        return ResponseEntity.ok(cartService.updateCartItem(itemId, quantity, user, sessionId));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Cart> removeItem(@PathVariable Long itemId,
                                           @RequestParam(required = false) String sessionId,
                                           Principal principal) {
        User user = getCurrentUser(principal);
        return ResponseEntity.ok(cartService.removeItem(itemId, user, sessionId));
    }

    private User getCurrentUser(Principal principal) {
        return principal != null ? authService.getCurrentUser(principal.getName()) : null;
    }
}

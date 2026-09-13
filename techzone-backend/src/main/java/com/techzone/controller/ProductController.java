package com.techzone.controller;

import com.techzone.entity.Product;
import com.techzone.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/flash-sale")
    public ResponseEntity<List<Product>> getFlashSaleProducts(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(productService.getFlashSaleProducts(limit));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Product> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    @GetMapping
    public ResponseEntity<Page<Product>> filterProducts(
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) List<Long> brandIds,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.filterProducts(
                categoryIds != null ? categoryIds : categoryId == null ? List.of() : List.of(categoryId),
                brandIds != null ? brandIds : brandId == null ? List.of() : List.of(brandId),
                minPrice, maxPrice, search, sortBy, page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> quickSearch(@RequestParam String q) {
        return ResponseEntity.ok(productService.quickSearch(q));
    }
}

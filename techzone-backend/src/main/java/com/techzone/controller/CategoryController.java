package com.techzone.controller;

import com.techzone.entity.Brand;
import com.techzone.entity.Category;
import com.techzone.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/categories/navbar")
    public ResponseEntity<List<Category>> getNavbarCategories() {
        return ResponseEntity.ok(categoryService.getNavbarCategories());
    }

    @GetMapping("/categories/homepage")
    public ResponseEntity<List<Category>> getHomepageCategories() {
        return ResponseEntity.ok(categoryService.getHomepageCategories());
    }

    @GetMapping("/brands")
    public ResponseEntity<List<Brand>> getBrands() {
        return ResponseEntity.ok(categoryService.getAllBrands());
    }
}

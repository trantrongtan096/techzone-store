package com.techzone.controller;

import com.techzone.entity.Category;
import com.techzone.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
public class AdminCategoryController {

    private final CategoryRepository categoryRepository;
    private final com.techzone.repository.ProductRepository productRepository;
    private final com.techzone.service.CategoryService categoryService;

    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class CategoryBulkDeleteResult {
        private int deletedCount;
        private int skippedCount;
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAllByOrderByPriorityAsc());
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category req) {
        if (req.getSlug() == null || req.getSlug().trim().isEmpty()) {
            req.setSlug(com.techzone.service.CategoryService.toSlug(req.getName()));
        }
        if (req.getPriority() == null) {
            req.setPriority(1);
        }
        if (req.getIsActive() == null) {
            req.setIsActive(true);
        }
        if (req.getShowInNavbar() == null) {
            req.setShowInNavbar(false);
        }
        if (req.getShowOnHomepage() == null) {
            req.setShowOnHomepage(false);
        }
        return ResponseEntity.ok(categoryRepository.save(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category req) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục id: " + id));

        category.setName(req.getName());
        if (req.getSlug() != null && !req.getSlug().trim().isEmpty()) {
            category.setSlug(req.getSlug());
        } else {
            category.setSlug(com.techzone.service.CategoryService.toSlug(req.getName()));
        }
        if (req.getIcon() != null) {
            category.setIcon(req.getIcon());
        }
        if (req.getPriority() != null) {
            category.setPriority(req.getPriority());
        }
        if (req.getIsActive() != null) {
            category.setIsActive(req.getIsActive());
        }
        if (req.getShowInNavbar() != null) {
            category.setShowInNavbar(req.getShowInNavbar());
        }
        if (req.getShowOnHomepage() != null) {
            category.setShowOnHomepage(req.getShowOnHomepage());
        }

        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<Category> toggleActive(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục id: " + id));
        boolean current = category.getIsActive() == null || category.getIsActive();
        category.setIsActive(!current);
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderCategories(@RequestBody List<Long> ids) {
        categoryService.reorderCategories(ids);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        if (productRepository.existsByCategoryId(id)) {
            return ResponseEntity.badRequest().body("Không thể xóa danh mục này vì vẫn còn sản phẩm đang thuộc danh mục!");
        }
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<CategoryBulkDeleteResult> bulkDelete(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.ok(new CategoryBulkDeleteResult(0, 0));
        }
        int deleted = 0;
        int skipped = 0;
        for (Long id : ids) {
            if (productRepository.existsByCategoryId(id)) {
                skipped++;
            } else {
                categoryRepository.deleteById(id);
                deleted++;
            }
        }
        return ResponseEntity.ok(new CategoryBulkDeleteResult(deleted, skipped));
    }
}

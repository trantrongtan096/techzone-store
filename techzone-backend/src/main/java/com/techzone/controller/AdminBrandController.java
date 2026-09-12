package com.techzone.controller;

import com.techzone.dto.BrandDTO;
import com.techzone.entity.Brand;
import com.techzone.repository.BrandRepository;
import com.techzone.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/brands")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
public class AdminBrandController {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class BrandBulkDeleteResult {
        private int deletedCount;
        private int skippedCount;
    }

    @GetMapping
    public ResponseEntity<List<BrandDTO>> getAllBrands() {
        List<Brand> brands = brandRepository.findAllByOrderByPriorityAscIdAsc();
        List<BrandDTO> dtos = brands.stream().map(b -> {
            long pCount = productRepository.findAll().stream().filter(p -> p.getBrand() != null && p.getBrand().getId().equals(b.getId())).count();
            return BrandDTO.builder()
                    .id(b.getId())
                    .name(b.getName())
                    .slug(b.getSlug())
                    .logoUrl(b.getLogoUrl())
                    .websiteUrl(b.getWebsiteUrl())
                    .description(b.getDescription())
                    .priority(b.getPriority())
                    .isActive(b.getIsActive() == null || b.getIsActive())
                    .isFeatured(b.getIsFeatured() != null && b.getIsFeatured())
                    .productCount(pCount)
                    .build();
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<Brand> createBrand(@RequestBody Brand req) {
        if (req.getSlug() == null || req.getSlug().trim().isEmpty()) {
            req.setSlug(toSlug(req.getName()));
        }
        if (req.getPriority() == null) {
            req.setPriority((int) brandRepository.count() + 1);
        }
        if (req.getIsActive() == null) {
            req.setIsActive(true);
        }
        if (req.getIsFeatured() == null) {
            req.setIsFeatured(false);
        }
        return ResponseEntity.ok(brandRepository.save(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Brand> updateBrand(@PathVariable Long id, @RequestBody Brand req) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu id: " + id));

        brand.setName(req.getName());
        
        if (req.getSlug() != null && !req.getSlug().trim().isEmpty()) {
            brand.setSlug(req.getSlug().trim());
        } else {
            brand.setSlug(toSlug(req.getName()));
        }

        if (req.getLogoUrl() != null) {
            brand.setLogoUrl(req.getLogoUrl());
        }
        if (req.getWebsiteUrl() != null) {
            brand.setWebsiteUrl(req.getWebsiteUrl());
        }
        if (req.getDescription() != null) {
            brand.setDescription(req.getDescription());
        }
        if (req.getPriority() != null) {
            brand.setPriority(req.getPriority());
        }
        if (req.getIsActive() != null) {
            brand.setIsActive(req.getIsActive());
        }
        if (req.getIsFeatured() != null) {
            brand.setIsFeatured(req.getIsFeatured());
        }

        return ResponseEntity.ok(brandRepository.save(brand));
    }

    @PutMapping("/reorder")
    @Transactional
    public ResponseEntity<?> reorderBrands(@RequestBody List<Long> brandIds) {
        if (brandIds != null && !brandIds.isEmpty()) {
            for (int i = 0; i < brandIds.size(); i++) {
                Long id = brandIds.get(i);
                int priority = i + 1;
                brandRepository.findById(id).ifPresent(b -> {
                    b.setPriority(priority);
                    brandRepository.save(b);
                });
            }
        }
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu id: " + id));
        boolean current = brand.getIsActive() == null || brand.getIsActive();
        brand.setIsActive(!current);
        brandRepository.save(brand);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/toggle-featured")
    public ResponseEntity<?> toggleFeatured(@PathVariable Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu id: " + id));
        boolean current = brand.getIsFeatured() != null && brand.getIsFeatured();
        brand.setIsFeatured(!current);
        brandRepository.save(brand);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBrand(@PathVariable Long id) {
        if (productRepository.existsByBrandId(id)) {
            return ResponseEntity.badRequest().body("Không thể xóa thương hiệu này vì vẫn còn sản phẩm đang thuộc hãng!");
        }
        brandRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<BrandBulkDeleteResult> bulkDelete(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.ok(new BrandBulkDeleteResult(0, 0));
        }
        int deleted = 0;
        int skipped = 0;
        for (Long id : ids) {
            if (productRepository.existsByBrandId(id)) {
                skipped++;
            } else {
                brandRepository.deleteById(id);
                deleted++;
            }
        }
        return ResponseEntity.ok(new BrandBulkDeleteResult(deleted, skipped));
    }

    private String toSlug(String input) {
        if (input == null || input.trim().isEmpty()) return "";
        String str = input.trim().replace('đ', 'd').replace('Đ', 'D');
        String normalized = java.text.Normalizer.normalize(str, java.text.Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-+|-+$", "");
    }
}

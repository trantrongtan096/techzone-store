package com.techzone.controller;

import com.techzone.dto.ProductRequest;
import com.techzone.dto.BulkUpdateRequest;
import com.techzone.entity.Product;
import com.techzone.repository.ProductRepository;
import com.techzone.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
public class AdminProductController {

    private final ProductRepository productRepository;
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) String status) {
        
        Page<Product> p = productService.filterAdminProducts(categoryId, brandId, status, search, page, size);
        return ResponseEntity.ok(p);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm id: " + id));
        return ResponseEntity.ok(product);
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody ProductRequest req) {
        Product created = productService.createProduct(req);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody ProductRequest req) {
        Product updated = productService.updateProduct(id, req);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        ProductService.BulkDeleteResult result = productService.deleteProducts(List.of(id));
        if (result.getDeletedCount() == 0) {
            return ResponseEntity.badRequest().body("Không thể xóa sản phẩm này vì đã tồn tại trong đơn hàng của khách!");
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<?> bulkDelete(@RequestBody List<Long> ids) {
        ProductService.BulkDeleteResult result = productService.deleteProducts(ids);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/bulk-update")
    @Transactional
    public ResponseEntity<Void> bulkUpdate(@RequestBody BulkUpdateRequest req) {
        if (req.getIds() == null || req.getIds().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<Product> products = productRepository.findAllById(req.getIds());
        for (Product p : products) {
            if (req.getIsActive() != null) {
                p.setIsActive(req.getIsActive());
            }
            if (req.getIsFlashSale() != null) {
                p.setIsFlashSale(req.getIsFlashSale());
                if (req.getFlashSaleEndTime() != null) {
                    p.setFlashSaleEndTime(req.getFlashSaleEndTime());
                }
            }
        }
        productRepository.saveAll(products);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/toggle-active")
    @Transactional
    public ResponseEntity<Product> toggleActive(@PathVariable Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm id: " + id));
        boolean current = p.getIsActive() == null || p.getIsActive();
        p.setIsActive(!current);
        return ResponseEntity.ok(productRepository.save(p));
    }

    @PostMapping("/import")
    public ResponseEntity<?> importProducts(@RequestParam("file") MultipartFile file) {
        try {
            List<Product> imported = productService.importProductsFromCsv(file);
            return ResponseEntity.ok(imported.size());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

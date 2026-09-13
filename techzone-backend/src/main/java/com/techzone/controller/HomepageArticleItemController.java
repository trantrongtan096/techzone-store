package com.techzone.controller;

import com.techzone.entity.HomepageArticleItem;
import com.techzone.service.HomepageArticleItemService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HomepageArticleItemController {
    private final HomepageArticleItemService service;

    @GetMapping("/api/admin/homepage/article-items")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<HomepageArticleItem>> getAdminItems() {
        return ResponseEntity.ok(service.getAdminItems());
    }

    @PostMapping("/api/admin/homepage/article-items")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<HomepageArticleItem>> addItems(@RequestBody AddRequest request) {
        return ResponseEntity.ok(service.addArticles(request.getArticleIds()));
    }

    @PutMapping("/api/admin/homepage/article-items/reorder")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<HomepageArticleItem>> reorder(@RequestBody List<Long> ids) {
        return ResponseEntity.ok(service.reorder(ids));
    }

    @PutMapping("/api/admin/homepage/article-items/{id}/toggle")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<HomepageArticleItem> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleActive(id));
    }

    @DeleteMapping("/api/admin/homepage/article-items/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/public/homepage/article-items")
    public ResponseEntity<List<HomepageArticleItem>> getPublicItems() {
        return ResponseEntity.ok(service.getPublicItems());
    }

    @Data
    public static class AddRequest {
        private List<Long> articleIds;
    }
}

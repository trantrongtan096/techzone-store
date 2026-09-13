package com.techzone.controller;

import com.techzone.dto.ArticleRequest;
import com.techzone.entity.Article;
import com.techzone.entity.ArticleStatus;
import com.techzone.repository.ArticleCategoryRepository;
import com.techzone.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
public class AdminArticleController {
    private final ArticleService articleService;
    private final ArticleCategoryRepository categoryRepository;

    @GetMapping("/articles")
    public ResponseEntity<Page<Article>> getArticles(@RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size,
                                                     @RequestParam(required = false) String search,
                                                     @RequestParam(required = false) Long categoryId,
                                                     @RequestParam(required = false) ArticleStatus status) {
        return ResponseEntity.ok(articleService.getAdminArticles(page, size, search, categoryId, status));
    }

    @GetMapping("/articles/{id}")
    public ResponseEntity<Article> getArticle(@PathVariable Long id) {
        return ResponseEntity.ok(articleService.getById(id));
    }

    @PostMapping("/articles")
    public ResponseEntity<Article> createArticle(@RequestBody ArticleRequest req) {
        return ResponseEntity.ok(articleService.create(req));
    }

    @PutMapping("/articles/{id}")
    public ResponseEntity<Article> updateArticle(@PathVariable Long id, @RequestBody ArticleRequest req) {
        return ResponseEntity.ok(articleService.update(id, req));
    }

    @DeleteMapping("/articles/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/article-categories")
    public ResponseEntity<?> getArticleCategories() {
        return ResponseEntity.ok(categoryRepository.findByActiveTrueOrderByNameAsc());
    }
}

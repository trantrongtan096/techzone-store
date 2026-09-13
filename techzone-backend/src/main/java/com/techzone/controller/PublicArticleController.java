package com.techzone.controller;

import com.techzone.entity.Article;
import com.techzone.repository.ArticleCategoryRepository;
import com.techzone.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicArticleController {
    private final ArticleService articleService;
    private final ArticleCategoryRepository categoryRepository;

    @GetMapping("/articles")
    public ResponseEntity<Page<Article>> getPublishedArticles(@RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "12") int size,
                                                              @RequestParam(required = false) String search,
                                                              @RequestParam(required = false) Long categoryId,
                                                              @RequestParam(defaultValue = "NEWEST") String sort) {
        return ResponseEntity.ok(articleService.getPublishedArticles(page, size, search, categoryId, sort));
    }

    @GetMapping("/articles/{slug}")
    public ResponseEntity<Article> getPublishedArticle(@PathVariable String slug) {
        return ResponseEntity.ok(articleService.getPublishedBySlug(slug));
    }

    @GetMapping("/article-categories")
    public ResponseEntity<?> getArticleCategories() {
        return ResponseEntity.ok(categoryRepository.findByActiveTrueOrderByNameAsc());
    }
}

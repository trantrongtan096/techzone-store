package com.techzone.repository;

import com.techzone.entity.ArticleCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ArticleCategoryRepository extends JpaRepository<ArticleCategory, Long> {
    Optional<ArticleCategory> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<ArticleCategory> findByActiveTrueOrderByNameAsc();
}

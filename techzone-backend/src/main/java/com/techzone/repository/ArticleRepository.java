package com.techzone.repository;

import com.techzone.entity.Article;
import com.techzone.entity.ArticleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
    Optional<Article> findBySlugAndStatus(String slug, ArticleStatus status);

    @Query("""
        SELECT a FROM Article a
        WHERE (:status IS NULL OR a.status = :status)
          AND (:categoryId IS NULL OR a.category.id = :categoryId)
          AND (:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Article> searchAdmin(@Param("search") String search,
                              @Param("categoryId") Long categoryId,
                              @Param("status") ArticleStatus status,
                              Pageable pageable);

    @Query("""
        SELECT a FROM Article a
        WHERE a.status = com.techzone.entity.ArticleStatus.PUBLISHED
          AND (:categoryId IS NULL OR a.category.id = :categoryId)
          AND (:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Article> searchPublished(@Param("search") String search,
                                  @Param("categoryId") Long categoryId,
                                  Pageable pageable);
}

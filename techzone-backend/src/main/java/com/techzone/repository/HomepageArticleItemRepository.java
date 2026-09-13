package com.techzone.repository;

import com.techzone.entity.HomepageArticleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface HomepageArticleItemRepository extends JpaRepository<HomepageArticleItem, Long> {
    boolean existsByArticleId(Long articleId);

    @Query("SELECT COALESCE(MAX(i.displayOrder), 0) FROM HomepageArticleItem i")
    Integer findMaxDisplayOrder();

    List<HomepageArticleItem> findAllByOrderByDisplayOrderAscIdAsc();

    @Query("""
        SELECT i FROM HomepageArticleItem i
        JOIN FETCH i.article a
        JOIN FETCH a.category
        WHERE i.active = true
          AND a.status = com.techzone.entity.ArticleStatus.PUBLISHED
        ORDER BY i.displayOrder ASC, i.id ASC
    """)
    List<HomepageArticleItem> findActivePublishedForHomepage();
}

package com.techzone.service;

import com.techzone.entity.Article;
import com.techzone.entity.ArticleStatus;
import com.techzone.entity.HomepageArticleItem;
import com.techzone.repository.ArticleRepository;
import com.techzone.repository.HomepageArticleItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HomepageArticleItemService {
    private final HomepageArticleItemRepository itemRepository;
    private final ArticleRepository articleRepository;

    public List<HomepageArticleItem> getAdminItems() {
        return itemRepository.findAllByOrderByDisplayOrderAscIdAsc();
    }

    public List<HomepageArticleItem> getPublicItems() {
        return itemRepository.findActivePublishedForHomepage();
    }

    @Transactional
    public List<HomepageArticleItem> addArticles(List<Long> articleIds) {
        if (articleIds == null || articleIds.isEmpty()) return getAdminItems();
        int nextOrder = itemRepository.findMaxDisplayOrder() + 1;
        for (Long articleId : articleIds.stream().distinct().toList()) {
            if (articleId == null || itemRepository.existsByArticleId(articleId)) continue;
            Article article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết id: " + articleId));
            if (article.getStatus() != ArticleStatus.PUBLISHED) {
                throw new RuntimeException("Chỉ được thêm bài viết đã xuất bản vào trang chủ.");
            }
            itemRepository.save(HomepageArticleItem.builder()
                    .article(article)
                    .displayOrder(nextOrder++)
                    .active(true)
                    .build());
        }
        return getAdminItems();
    }

    @Transactional
    public HomepageArticleItem toggleActive(Long id) {
        HomepageArticleItem item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình bài viết trang chủ id: " + id));
        item.setActive(!Boolean.TRUE.equals(item.getActive()));
        return itemRepository.save(item);
    }

    @Transactional
    public List<HomepageArticleItem> reorder(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return getAdminItems();
        List<HomepageArticleItem> items = itemRepository.findAllByOrderByDisplayOrderAscIdAsc();
        for (HomepageArticleItem item : items) {
            int idx = ids.indexOf(item.getId());
            if (idx >= 0) item.setDisplayOrder(idx + 1);
        }
        itemRepository.saveAll(items);
        return getAdminItems();
    }

    @Transactional
    public void delete(Long id) {
        itemRepository.deleteById(id);
    }
}

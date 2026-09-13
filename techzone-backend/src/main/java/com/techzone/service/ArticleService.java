package com.techzone.service;

import com.techzone.dto.ArticleRequest;
import com.techzone.entity.*;
import com.techzone.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ArticleService {
    private final ArticleRepository articleRepository;
    private final ArticleCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public Page<Article> getAdminArticles(int page, int size, String search, Long categoryId, ArticleStatus status) {
        return articleRepository.searchAdmin(clean(search), categoryId, status, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt")));
    }

    public Page<Article> getPublishedArticles(int page, int size, String search, Long categoryId) {
        return getPublishedArticles(page, size, search, categoryId, "NEWEST");
    }

    public Page<Article> getPublishedArticles(int page, int size, String search, Long categoryId, String sortType) {
        return articleRepository.searchPublished(clean(search), categoryId, PageRequest.of(page, size, publishedSort(sortType)));
    }

    public Article getById(Long id) {
        return articleRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết id: " + id));
    }

    public Article getPublishedBySlug(String slug) {
        return articleRepository.findBySlugAndStatus(slug, ArticleStatus.PUBLISHED)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết: " + slug));
    }

    @Transactional
    public Article create(ArticleRequest req) {
        validate(req, null);
        ArticleCategory category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên mục bài viết"));

        Article article = Article.builder()
                .title(req.getTitle().trim())
                .slug(uniqueSlug(req.getSlug(), req.getTitle(), null))
                .excerpt(clean(req.getExcerpt()))
                .content(sanitizeHtml(req.getContent()))
                .thumbnail(clean(req.getThumbnail()))
                .category(category)
                .status(req.getStatus() == null ? ArticleStatus.DRAFT : req.getStatus())
                .author(currentUser())
                .seoTitle(clean(req.getSeoTitle()))
                .seoDescription(clean(req.getSeoDescription()))
                .build();
        if (article.getStatus() == ArticleStatus.PUBLISHED) {
            article.setPublishedAt(LocalDateTime.now());
        }
        return articleRepository.save(article);
    }

    @Transactional
    public Article update(Long id, ArticleRequest req) {
        Article article = getById(id);
        validate(req, id);
        ArticleCategory category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên mục bài viết"));

        ArticleStatus oldStatus = article.getStatus();
        ArticleStatus newStatus = req.getStatus() == null ? ArticleStatus.DRAFT : req.getStatus();
        article.setTitle(req.getTitle().trim());
        article.setSlug(uniqueSlug(req.getSlug(), req.getTitle(), id));
        article.setExcerpt(clean(req.getExcerpt()));
        article.setContent(sanitizeHtml(req.getContent()));
        article.setThumbnail(clean(req.getThumbnail()));
        article.setCategory(category);
        article.setStatus(newStatus);
        article.setSeoTitle(clean(req.getSeoTitle()));
        article.setSeoDescription(clean(req.getSeoDescription()));
        if (oldStatus != ArticleStatus.PUBLISHED && newStatus == ArticleStatus.PUBLISHED) {
            article.setPublishedAt(LocalDateTime.now());
        }
        return articleRepository.save(article);
    }

    @Transactional
    public void delete(Long id) {
        articleRepository.delete(getById(id));
    }

    private void validate(ArticleRequest req, Long currentId) {
        if (req.getTitle() == null || req.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Tiêu đề bài viết là bắt buộc");
        }
        if (req.getCategoryId() == null) {
            throw new RuntimeException("Chuyên mục bài viết là bắt buộc");
        }
        ArticleStatus status = req.getStatus() == null ? ArticleStatus.DRAFT : req.getStatus();
        if (status == ArticleStatus.PUBLISHED && (req.getContent() == null || stripHtml(req.getContent()).trim().isEmpty())) {
            throw new RuntimeException("Nội dung là bắt buộc khi xuất bản");
        }
        String slug = toSlug(req.getSlug() == null || req.getSlug().isBlank() ? req.getTitle() : req.getSlug());
        boolean exists = currentId == null ? articleRepository.existsBySlug(slug) : articleRepository.existsBySlugAndIdNot(slug, currentId);
        if (exists) {
            throw new RuntimeException("Slug đã tồn tại");
        }
    }

    private String uniqueSlug(String requestedSlug, String title, Long currentId) {
        return toSlug(requestedSlug == null || requestedSlug.isBlank() ? title : requestedSlug);
    }

    public static String toSlug(String input) {
        String nowhitespace = Pattern.compile("\\s+").matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("")
                .replace("đ", "d").replace("Đ", "D")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9-]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        return slug.isBlank() ? "bai-viet" : slug;
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private String clean(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private String sanitizeHtml(String html) {
        if (html == null) return null;
        return html.replaceAll("(?is)<script.*?>.*?</script>", "")
                .replaceAll("(?is)on\\w+\\s*=\\s*\"[^\"]*\"", "")
                .replaceAll("(?is)on\\w+\\s*=\\s*'[^']*'", "");
    }

    private String stripHtml(String html) {
        return html == null ? "" : html.replaceAll("<[^>]*>", "");
    }

    private Sort publishedSort(String sortType) {
        String sort = sortType == null ? "NEWEST" : sortType.trim().toUpperCase(Locale.ROOT);
        return switch (sort) {
            case "OLDEST" -> Sort.by(Sort.Direction.ASC, "publishedAt");
            case "TITLE_ASC" -> Sort.by(Sort.Direction.ASC, "title");
            case "TITLE_DESC" -> Sort.by(Sort.Direction.DESC, "title");
            default -> Sort.by(Sort.Direction.DESC, "publishedAt");
        };
    }
}

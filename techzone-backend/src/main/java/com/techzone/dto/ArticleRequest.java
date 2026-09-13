package com.techzone.dto;

import com.techzone.entity.ArticleStatus;
import lombok.Data;

@Data
public class ArticleRequest {
    private String title;
    private String slug;
    private String excerpt;
    private String content;
    private String thumbnail;
    private Long categoryId;
    private ArticleStatus status;
    private String seoTitle;
    private String seoDescription;
}

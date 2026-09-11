package com.techzone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandDTO {
    private Long id;
    private String name;
    private String slug;
    private String logoUrl;
    private String websiteUrl;
    private String description;
    private Integer priority;
    private Boolean isActive;
    private Boolean isFeatured;
    private long productCount;
}

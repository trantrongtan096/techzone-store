package com.techzone.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductRequest {
    private String name;
    private String sku;
    private Long categoryId;
    private Long brandId;
    private BigDecimal originalPrice;
    private BigDecimal promotionPrice;
    private String thumbnail;
    private String description;
    private String specsJson;
    private Integer stockQuantity;
    private Boolean isFeatured;
    private Boolean isFlashSale;
    private Boolean isActive;
    private List<String> subImages;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd['T'][ ]HH:mm[:ss]")
    private LocalDateTime flashSaleEndTime;
}

package com.techzone.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class FlashSaleCampaignRequest {
    private String title;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean isActive;
    private List<FlashSaleItemRequest> items;

    @Data
    public static class FlashSaleItemRequest {
        private Long productId;
        private BigDecimal flashSalePrice;
        private Integer quantityLimit;
    }
}

package com.techzone.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class BulkUpdateRequest {
    private List<Long> ids;

    @JsonProperty("isActive")
    private Boolean isActive;

    @JsonProperty("isFlashSale")
    private Boolean isFlashSale;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd['T'][ ]HH:mm[:ss]")
    private LocalDateTime flashSaleEndTime;

    // Fallback getters & setters for Jackson aliases
    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsFlashSale() {
        return isFlashSale;
    }

    public void setIsFlashSale(Boolean isFlashSale) {
        this.isFlashSale = isFlashSale;
    }
}

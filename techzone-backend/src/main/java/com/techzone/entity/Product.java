package com.techzone.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(unique = true)
    private String sku;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(nullable = false)
    private BigDecimal originalPrice;

    private BigDecimal promotionPrice;

    private String thumbnail;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String specsJson; // Store key specs as JSON string: {"CPU": "Core i7", "RAM": "16GB", "VGA": "RTX 4060"}

    private Integer stockQuantity;

    private Boolean isFeatured;

    private Boolean isFlashSale;

    private Boolean isActive;

    private Integer discountPercentage;

    private LocalDateTime flashSaleEndTime;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isFeatured == null) this.isFeatured = false;
        if (this.isFlashSale == null) this.isFlashSale = false;
        if (this.stockQuantity == null) this.stockQuantity = 10;
        if (this.isActive == null) this.isActive = true;
        calculateDiscount();
    }

    @PreUpdate
    protected void onUpdate() {
        calculateDiscount();
    }

    private void calculateDiscount() {
        if (originalPrice != null && promotionPrice != null && originalPrice.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = originalPrice.subtract(promotionPrice);
            if (diff.compareTo(BigDecimal.ZERO) > 0) {
                this.discountPercentage = diff.multiply(BigDecimal.valueOf(100))
                        .divide(originalPrice, 0, java.math.RoundingMode.HALF_UP).intValue();
            } else {
                this.discountPercentage = 0;
            }
        } else {
            this.discountPercentage = 0;
        }
    }
}

package com.techzone.repository;

import com.techzone.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);
    Optional<Product> findBySku(String sku);

    @Modifying
    @Query("DELETE FROM CartItem c WHERE c.product.id IN :ids")
    void deleteCartItemsByProductIds(@Param("ids") List<Long> ids);

    @Modifying
    @Query("DELETE FROM ProductImage pi WHERE pi.product.id IN :ids")
    void deleteProductImagesByProductIds(@Param("ids") List<Long> ids);

    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi WHERE oi.product.id IN :ids")
    boolean existsInOrderItems(@Param("ids") List<Long> ids);

    @Query("SELECT DISTINCT oi.product.id FROM OrderItem oi WHERE oi.product.id IN :ids")
    List<Long> findProductIdsInOrderItems(@Param("ids") List<Long> ids);

    @Query("SELECT p FROM Product p WHERE (p.isActive IS NULL OR p.isActive = true) AND p.isFlashSale = true")
    List<Product> findByIsFlashSaleTrue();

    @Query("SELECT p FROM Product p WHERE (p.isActive IS NULL OR p.isActive = true) AND p.isFlashSale = true AND (p.flashSaleEndTime IS NULL OR p.flashSaleEndTime > :now) ORDER BY p.flashSaleEndTime ASC")
    List<Product> findActiveFlashSaleProducts(@Param("now") java.time.LocalDateTime now, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE (p.isActive IS NULL OR p.isActive = true) AND p.isFeatured = true")
    List<Product> findByIsFeaturedTrue();

    @Query("SELECT p FROM Product p WHERE " +
           "(p.isActive IS NULL OR p.isActive = true) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:brandId IS NULL OR p.brand.id = :brandId) AND " +
           "(:minPrice IS NULL OR p.promotionPrice >= :minPrice OR (p.promotionPrice IS NULL AND p.originalPrice >= :minPrice)) AND " +
           "(:maxPrice IS NULL OR p.promotionPrice <= :maxPrice OR (p.promotionPrice IS NULL AND p.originalPrice <= :maxPrice)) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.specsJson) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> filterProducts(@Param("categoryId") Long categoryId,
                                 @Param("brandId") Long brandId,
                                 @Param("minPrice") BigDecimal minPrice,
                                 @Param("maxPrice") BigDecimal maxPrice,
                                 @Param("search") String search,
                                 Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:brandId IS NULL OR p.brand.id = :brandId) AND " +
           "(:status IS NULL OR " +
           "  (:status = 'in_stock' AND p.stockQuantity > 0) OR " +
           "  (:status = 'out_of_stock' AND p.stockQuantity <= 0) OR " +
           "  (:status = 'flash_sale' AND p.isFlashSale = true) OR " +
           "  (:status = 'inactive' AND p.isActive = false) OR " +
           "  (:status = 'active' AND (p.isActive IS NULL OR p.isActive = true))" +
           ") AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR (p.sku IS NOT NULL AND LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Product> filterAdminProducts(@Param("categoryId") Long categoryId,
                                      @Param("brandId") Long brandId,
                                      @Param("status") String status,
                                      @Param("search") String search,
                                      Pageable pageable);

    @Query("SELECT p FROM Product p WHERE (p.isActive IS NULL OR p.isActive = true) AND LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Product> findTop8ByNameContainingIgnoreCase(@Param("query") String query);

    boolean existsByCategoryId(Long categoryId);

    boolean existsByBrandId(Long brandId);

    @Modifying
    @Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity - :quantity WHERE p.id = :productId AND (p.stockQuantity IS NOT NULL AND p.stockQuantity >= :quantity)")
    int deductStockAtomic(@Param("productId") Long productId, @Param("quantity") Integer quantity);

    @Modifying
    @Query("UPDATE Product p SET p.stockQuantity = COALESCE(p.stockQuantity, 0) + :quantity WHERE p.id = :productId")
    int restoreStockAtomic(@Param("productId") Long productId, @Param("quantity") Integer quantity);
}

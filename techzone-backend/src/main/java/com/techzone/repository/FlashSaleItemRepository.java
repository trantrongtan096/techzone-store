package com.techzone.repository;

import com.techzone.entity.FlashSaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface FlashSaleItemRepository extends JpaRepository<FlashSaleItem, Long> {

    @Query("""
            SELECT item FROM FlashSaleItem item
            JOIN item.campaign campaign
            WHERE item.product.id = :productId
              AND campaign.isActive = true
              AND campaign.startTime <= :now
              AND campaign.endTime > :now
            ORDER BY campaign.endTime ASC
            """)
    Optional<FlashSaleItem> findActiveItemByProductId(@Param("productId") Long productId,
                                                      @Param("now") LocalDateTime now);

    @Modifying
    @Query("""
            UPDATE FlashSaleItem item
            SET item.soldCount = COALESCE(item.soldCount, 0) + :quantity
            WHERE item.id = :itemId
              AND (
                item.quantityLimit IS NULL
                OR COALESCE(item.soldCount, 0) + :quantity <= item.quantityLimit
              )
            """)
    int reserveQuantity(@Param("itemId") Long itemId, @Param("quantity") Integer quantity);
}

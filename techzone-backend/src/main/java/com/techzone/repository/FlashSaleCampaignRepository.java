package com.techzone.repository;

import com.techzone.entity.FlashSaleCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlashSaleCampaignRepository extends JpaRepository<FlashSaleCampaign, Long> {
    Optional<FlashSaleCampaign> findFirstByIsActiveTrueAndStartTimeBeforeAndEndTimeAfterOrderByEndTimeAsc(LocalDateTime now1, LocalDateTime now2);
    List<FlashSaleCampaign> findAllByOrderByIdDesc();
}

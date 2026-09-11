package com.techzone.repository;

import com.techzone.entity.Banner;
import com.techzone.entity.BannerPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByPositionAndIsActiveTrueOrderByPriorityIndexAsc(BannerPosition position);
    List<Banner> findAllByOrderByPriorityIndexAscIdDesc();
}

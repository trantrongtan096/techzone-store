package com.techzone.service;

import com.techzone.entity.Banner;
import com.techzone.entity.BannerPosition;
import com.techzone.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;

    public List<Banner> getActiveBannersByPosition(BannerPosition position) {
        return bannerRepository.findByPositionAndIsActiveTrueOrderByPriorityIndexAsc(position);
    }

    public List<Banner> getAllBanners() {
        return bannerRepository.findAllByOrderByPriorityIndexAscIdDesc();
    }

    @Transactional
    public Banner saveBanner(Banner banner) {
        if (banner.getPriorityIndex() == null) {
            banner.setPriorityIndex(1);
        }
        if (banner.getIsActive() == null) {
            banner.setIsActive(true);
        }
        if (banner.getShowOverlay() == null) {
            banner.setShowOverlay(false);
        }
        return bannerRepository.save(banner);
    }

    @Transactional
    public Banner updateBanner(Long id, Banner updated) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy banner id: " + id));

        banner.setTitle(updated.getTitle());
        banner.setImageUrl(updated.getImageUrl());
        banner.setTargetUrl(updated.getTargetUrl());
        banner.setPosition(updated.getPosition());
        banner.setPriorityIndex(updated.getPriorityIndex());
        banner.setIsActive(updated.getIsActive());
        banner.setShowOverlay(updated.getShowOverlay() != null ? updated.getShowOverlay() : false);
        banner.setStartDate(updated.getStartDate());
        banner.setEndDate(updated.getEndDate());

        return bannerRepository.save(banner);
    }

    @Transactional
    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }

    @Transactional
    public Banner toggleActive(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy banner id: " + id));
        banner.setIsActive(!Boolean.TRUE.equals(banner.getIsActive()));
        return bannerRepository.save(banner);
    }
}

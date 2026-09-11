package com.techzone.service;

import com.techzone.dto.FlashSaleCampaignRequest;
import com.techzone.entity.FlashSaleCampaign;
import com.techzone.entity.FlashSaleItem;
import com.techzone.entity.Product;
import com.techzone.repository.FlashSaleCampaignRepository;
import com.techzone.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FlashSaleService {

    private final FlashSaleCampaignRepository campaignRepository;
    private final ProductRepository productRepository;

    public Optional<FlashSaleCampaign> getCurrentActiveCampaign() {
        LocalDateTime now = LocalDateTime.now();
        return campaignRepository.findFirstByIsActiveTrueAndStartTimeBeforeAndEndTimeAfterOrderByEndTimeAsc(now, now);
    }

    public List<FlashSaleCampaign> getAllCampaigns() {
        return campaignRepository.findAllByOrderByIdDesc();
    }

    public FlashSaleCampaign getCampaignById(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chiến dịch Flash Sale id: " + id));
    }

    @Transactional
    public FlashSaleCampaign createCampaign(FlashSaleCampaignRequest req) {
        FlashSaleCampaign campaign = FlashSaleCampaign.builder()
                .title(req.getTitle())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .items(new ArrayList<>())
                .build();

        if (req.getItems() != null) {
            for (FlashSaleCampaignRequest.FlashSaleItemRequest itemReq : req.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm id: " + itemReq.getProductId()));
                
                // Also update product's isFlashSale and flashSaleEndTime
                product.setIsFlashSale(true);
                product.setFlashSaleEndTime(req.getEndTime());
                product.setPromotionPrice(itemReq.getFlashSalePrice());
                productRepository.save(product);

                FlashSaleItem item = FlashSaleItem.builder()
                        .campaign(campaign)
                        .product(product)
                        .flashSalePrice(itemReq.getFlashSalePrice())
                        .quantityLimit(itemReq.getQuantityLimit() != null ? itemReq.getQuantityLimit() : 10)
                        .soldCount(0)
                        .build();

                campaign.getItems().add(item);
            }
        }

        return campaignRepository.save(campaign);
    }

    @Transactional
    public FlashSaleCampaign updateCampaign(Long id, FlashSaleCampaignRequest req) {
        FlashSaleCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chiến dịch Flash Sale id: " + id));

        campaign.setTitle(req.getTitle());
        campaign.setStartTime(req.getStartTime());
        campaign.setEndTime(req.getEndTime());
        if (req.getIsActive() != null) {
            campaign.setIsActive(req.getIsActive());
        }

        campaign.getItems().clear();

        if (req.getItems() != null) {
            for (FlashSaleCampaignRequest.FlashSaleItemRequest itemReq : req.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm id: " + itemReq.getProductId()));

                product.setIsFlashSale(true);
                product.setFlashSaleEndTime(req.getEndTime());
                product.setPromotionPrice(itemReq.getFlashSalePrice());
                productRepository.save(product);

                FlashSaleItem item = FlashSaleItem.builder()
                        .campaign(campaign)
                        .product(product)
                        .flashSalePrice(itemReq.getFlashSalePrice())
                        .quantityLimit(itemReq.getQuantityLimit() != null ? itemReq.getQuantityLimit() : 10)
                        .soldCount(0)
                        .build();

                campaign.getItems().add(item);
            }
        }

        return campaignRepository.save(campaign);
    }

    @Transactional
    public void deleteCampaign(Long id) {
        campaignRepository.deleteById(id);
    }

    @Transactional
    public FlashSaleCampaign toggleActive(Long id) {
        FlashSaleCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chiến dịch id: " + id));
        campaign.setIsActive(!Boolean.TRUE.equals(campaign.getIsActive()));
        return campaignRepository.save(campaign);
    }
}

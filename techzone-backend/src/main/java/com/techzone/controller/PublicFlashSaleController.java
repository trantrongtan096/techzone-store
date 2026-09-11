package com.techzone.controller;

import com.techzone.entity.FlashSaleCampaign;
import com.techzone.service.FlashSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/flash-sale")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicFlashSaleController {

    private final FlashSaleService flashSaleService;

    @GetMapping("/current")
    public ResponseEntity<FlashSaleCampaign> getCurrentActiveCampaign() {
        return flashSaleService.getCurrentActiveCampaign()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}

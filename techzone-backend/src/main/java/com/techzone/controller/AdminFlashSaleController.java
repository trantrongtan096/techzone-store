package com.techzone.controller;

import com.techzone.dto.FlashSaleCampaignRequest;
import com.techzone.entity.FlashSaleCampaign;
import com.techzone.service.FlashSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/flash-sale")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AdminFlashSaleController {

    private final FlashSaleService flashSaleService;

    @GetMapping
    public ResponseEntity<List<FlashSaleCampaign>> getAllCampaigns() {
        return ResponseEntity.ok(flashSaleService.getAllCampaigns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlashSaleCampaign> getCampaignById(@PathVariable Long id) {
        return ResponseEntity.ok(flashSaleService.getCampaignById(id));
    }

    @PostMapping
    public ResponseEntity<FlashSaleCampaign> createCampaign(@RequestBody FlashSaleCampaignRequest req) {
        return ResponseEntity.ok(flashSaleService.createCampaign(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlashSaleCampaign> updateCampaign(@PathVariable Long id, @RequestBody FlashSaleCampaignRequest req) {
        return ResponseEntity.ok(flashSaleService.updateCampaign(id, req));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<FlashSaleCampaign> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(flashSaleService.toggleActive(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable Long id) {
        flashSaleService.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }
}

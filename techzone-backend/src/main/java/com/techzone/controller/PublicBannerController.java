package com.techzone.controller;

import com.techzone.entity.Banner;
import com.techzone.entity.BannerPosition;
import com.techzone.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/banners")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicBannerController {

    private final BannerService bannerService;

    @GetMapping
    public ResponseEntity<List<Banner>> getBannersByPosition(@RequestParam("position") BannerPosition position) {
        return ResponseEntity.ok(bannerService.getActiveBannersByPosition(position));
    }
}

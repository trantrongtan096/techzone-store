package com.techzone.controller;

import com.techzone.entity.Showroom;
import com.techzone.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/system")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicSystemController {

    private final SystemSettingService settingService;

    @GetMapping("/settings")
    public ResponseEntity<Map<String, String>> getAllSettings() {
        return ResponseEntity.ok(settingService.getAllSettingsMap());
    }

    @GetMapping("/showrooms")
    public ResponseEntity<List<Showroom>> getActiveShowrooms() {
        return ResponseEntity.ok(settingService.getActiveShowrooms());
    }
}

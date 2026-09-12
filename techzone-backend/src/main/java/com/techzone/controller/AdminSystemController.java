package com.techzone.controller;

import com.techzone.entity.Showroom;
import com.techzone.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/system")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
public class AdminSystemController {

    private final SystemSettingService settingService;

    // Settings (Hotline, Social links, CMS policy pages)
    @GetMapping("/settings")
    public ResponseEntity<Map<String, String>> getAllSettings() {
        return ResponseEntity.ok(settingService.getAllSettingsMap());
    }

    @PostMapping("/settings")
    public ResponseEntity<Map<String, String>> updateSettings(@RequestBody Map<String, String> settingsMap) {
        settingService.saveAllSettings(settingsMap);
        return ResponseEntity.ok(settingService.getAllSettingsMap());
    }

    // Showrooms
    @GetMapping("/showrooms")
    public ResponseEntity<List<Showroom>> getAllShowrooms() {
        return ResponseEntity.ok(settingService.getAllShowrooms());
    }

    @PostMapping("/showrooms")
    public ResponseEntity<Showroom> createShowroom(@RequestBody Showroom showroom) {
        return ResponseEntity.ok(settingService.saveShowroom(showroom));
    }

    @PutMapping("/showrooms/{id}")
    public ResponseEntity<Showroom> updateShowroom(@PathVariable Long id, @RequestBody Showroom showroom) {
        return ResponseEntity.ok(settingService.updateShowroom(id, showroom));
    }

    @PutMapping("/showrooms/{id}/toggle")
    public ResponseEntity<Showroom> toggleShowroomActive(@PathVariable Long id) {
        return ResponseEntity.ok(settingService.toggleShowroomActive(id));
    }

    @DeleteMapping("/showrooms/{id}")
    public ResponseEntity<Void> deleteShowroom(@PathVariable Long id) {
        settingService.deleteShowroom(id);
        return ResponseEntity.noContent().build();
    }
}

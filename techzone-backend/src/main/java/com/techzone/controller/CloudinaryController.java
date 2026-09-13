package com.techzone.controller;

import com.techzone.service.CloudinaryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/cloudinary")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "subFolder", required = false) String subFolder) {
        try {
            @SuppressWarnings("rawtypes")
            Map uploadResult = cloudinaryService.uploadImage(file, subFolder);

            Map<String, String> response = new HashMap<>();
            response.put("url", (String) uploadResult.get("secure_url"));
            response.put("public_id", (String) uploadResult.get("public_id"));
            response.put("format", (String) uploadResult.get("format"));

            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            Map<String, String> response = new HashMap<>();
            response.put("message", ex.getMessage() != null ? ex.getMessage() : "Không thể upload ảnh.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/upload-base64")
    public ResponseEntity<Map<String, String>> uploadBase64(@RequestBody Base64UploadRequest request) {
        if (request.getBase64() == null || request.getBase64().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        @SuppressWarnings("rawtypes")
        Map uploadResult = cloudinaryService.uploadBase64(request.getBase64(), request.getSubFolder());

        Map<String, String> response = new HashMap<>();
        response.put("url", (String) uploadResult.get("secure_url"));
        response.put("public_id", (String) uploadResult.get("public_id"));
        response.put("format", (String) uploadResult.get("format"));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-url")
    public ResponseEntity<Map<String, String>> uploadUrl(@RequestBody UrlUploadRequest request) {
        if (request.getUrl() == null || request.getUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        @SuppressWarnings("rawtypes")
        Map uploadResult = cloudinaryService.uploadUrl(request.getUrl().trim(), request.getSubFolder());

        Map<String, String> response = new HashMap<>();
        response.put("url", (String) uploadResult.get("secure_url"));
        response.put("public_id", (String) uploadResult.get("public_id"));
        response.put("format", (String) uploadResult.get("format"));

        return ResponseEntity.ok(response);
    }

    @Data
    public static class Base64UploadRequest {
        private String base64;
        private String subFolder;
    }

    @Data
    public static class UrlUploadRequest {
        private String url;
        private String subFolder;
    }
}

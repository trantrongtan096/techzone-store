package com.techzone.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    private String buildTargetFolder(String subFolder) {
        if (subFolder != null && !subFolder.trim().isEmpty()) {
            String clean = subFolder.trim().replaceAll("^/+|/+$", "");
            return "techzone_products/" + clean;
        }
        return "techzone_products/uncategorized";
    }

    @SuppressWarnings("rawtypes")
    public Map uploadImage(MultipartFile file, String subFolder) {
        try {
            validateImage(file);
            Map params = ObjectUtils.asMap(
                    "folder", buildTargetFolder(subFolder),
                    "format", "webp",
                    "quality", "auto:good",
                    "fetch_format", "auto"
            );
            return cloudinary.uploader().upload(file.getBytes(), params);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tải ảnh lên Cloudinary: " + e.getMessage());
        }
    }

    @SuppressWarnings("rawtypes")
    public Map uploadBase64(String base64Data, String subFolder) {
        try {
            Map params = ObjectUtils.asMap(
                    "folder", buildTargetFolder(subFolder),
                    "format", "webp",
                    "quality", "auto:good",
                    "fetch_format", "auto"
            );
            return cloudinary.uploader().upload(base64Data, params);
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi tải ảnh Base64 lên Cloudinary: " + e.getMessage());
        }
    }

    @SuppressWarnings("rawtypes")
    public Map uploadUrl(String imageUrl, String subFolder) {
        try {
            Map params = ObjectUtils.asMap(
                    "folder", buildTargetFolder(subFolder),
                    "format", "webp",
                    "quality", "auto:good",
                    "fetch_format", "auto"
            );
            return cloudinary.uploader().upload(imageUrl, params);
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi bốc ảnh từ URL sang Cloudinary: " + e.getMessage());
        }
    }

    @SuppressWarnings("rawtypes")
    public Map deleteImage(String publicId) {
        try {
            return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi xóa ảnh trên Cloudinary: " + e.getMessage());
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File ảnh không được để trống");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.matches("image/(jpeg|png|webp)")) {
            throw new RuntimeException("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("Ảnh không được vượt quá 5MB");
        }
    }
}

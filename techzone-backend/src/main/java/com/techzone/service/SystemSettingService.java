package com.techzone.service;

import com.techzone.entity.Showroom;
import com.techzone.entity.SystemSetting;
import com.techzone.repository.ShowroomRepository;
import com.techzone.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository settingRepository;
    private final ShowroomRepository showroomRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void initDefaultSettingsAndShowrooms() {
        // Init default settings if empty
        if (settingRepository.count() == 0) {
            saveSetting("HOTLINE", "1900.5301", "Hotline tổng đài tư vấn");
            saveSetting("WORKING_HOURS", "8:00 - 21:30 (Cả T7 & CN)", "Giờ mở cửa hệ thống");
            saveSetting("EMAIL_SUPPORT", "cskh@techzone.vn", "Email hỗ trợ khách hàng");
            saveSetting("FACEBOOK_URL", "https://facebook.com", "Link Fanpage Facebook");
            saveSetting("YOUTUBE_URL", "https://youtube.com", "Link Kênh Youtube");
            saveSetting("TIKTOK_URL", "https://tiktok.com", "Link TikTok Shop");
            saveSetting("WARRANTY_POLICY_HTML", "<h2>Chính Sách Bảo Hành TechZone Premium</h2><p>Tất cả sản phẩm bán ra đều được bảo hành chính hãng 1 đổi 1 trong 30 ngày đầu tiên.</p>", "Nội dung trang Bảo Hành");
            saveSetting("INSTALLMENT_GUIDE_HTML", "<h2>Hướng Dẫn Mua Hàng Trả Góp 0%</h2><p>Hỗ trợ trả góp qua thẻ tín dụng và công ty tài chính HD SAISON / Home Credit thủ tục cực nhanh.</p>", "Nội dung trang Trả Góp");
        }

        // Init default showrooms if empty
        if (showroomRepository.count() == 0) {
            showroomRepository.save(Showroom.builder()
                    .name("TechZone Hoàng Hoa Thám")
                    .address("123 Hoàng Hoa Thám, Phường 6, Quận Bình Thạnh, TP.HCM")
                    .phone("0909.123.456")
                    .priorityIndex(1)
                    .isActive(true)
                    .build());

            showroomRepository.save(Showroom.builder()
                    .name("TechZone Kha Vạn Cân")
                    .address("456 Kha Vạn Cân, Phường Linh Đông, TP. Thủ Đức, TP.HCM")
                    .phone("0909.789.012")
                    .priorityIndex(2)
                    .isActive(true)
                    .build());

            showroomRepository.save(Showroom.builder()
                    .name("TechZone Thái Hà - Hà Nội")
                    .address("78 Thái Hà, Phường Trung Liệt, Quận Đống Đa, Hà Nội")
                    .phone("0909.333.444")
                    .priorityIndex(3)
                    .isActive(true)
                    .build());
        }
    }

    public Map<String, String> getAllSettingsMap() {
        List<SystemSetting> list = settingRepository.findAll();
        Map<String, String> map = new HashMap<>();
        for (SystemSetting s : list) {
            map.put(s.getSettingKey(), s.getSettingValue() != null ? s.getSettingValue() : "");
        }
        return map;
    }

    @Transactional
    public void saveSetting(String key, String value, String description) {
        SystemSetting s = settingRepository.findById(key)
                .orElse(SystemSetting.builder().settingKey(key).build());
        s.setSettingValue(value);
        if (description != null) {
            s.setDescription(description);
        }
        settingRepository.save(s);
    }

    @Transactional
    public void saveAllSettings(Map<String, String> settingsMap) {
        for (Map.Entry<String, String> entry : settingsMap.entrySet()) {
            saveSetting(entry.getKey(), entry.getValue(), null);
        }
    }

    // Showrooms
    public List<Showroom> getActiveShowrooms() {
        return showroomRepository.findByIsActiveTrueOrderByPriorityIndexAsc();
    }

    public List<Showroom> getAllShowrooms() {
        return showroomRepository.findAllByOrderByPriorityIndexAscIdDesc();
    }

    @Transactional
    public Showroom saveShowroom(Showroom showroom) {
        if (showroom.getPriorityIndex() == null) showroom.setPriorityIndex(1);
        if (showroom.getIsActive() == null) showroom.setIsActive(true);
        return showroomRepository.save(showroom);
    }

    @Transactional
    public Showroom updateShowroom(Long id, Showroom updated) {
        Showroom s = showroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy showroom id: " + id));

        s.setName(updated.getName());
        s.setAddress(updated.getAddress());
        s.setPhone(updated.getPhone());
        s.setMapUrl(updated.getMapUrl());
        s.setPriorityIndex(updated.getPriorityIndex());
        s.setIsActive(updated.getIsActive());

        return showroomRepository.save(s);
    }

    @Transactional
    public void deleteShowroom(Long id) {
        showroomRepository.deleteById(id);
    }

    @Transactional
    public Showroom toggleShowroomActive(Long id) {
        Showroom s = showroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy showroom id: " + id));
        s.setIsActive(!Boolean.TRUE.equals(s.getIsActive()));
        return showroomRepository.save(s);
    }
}

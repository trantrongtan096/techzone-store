package com.techzone.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:lseyhus0}")
    private String cloudName;

    @Value("${cloudinary.api-key:521621565353845}")
    private String apiKey;

    @Value("${cloudinary.api-secret:CfdhnhDPDxb1mK5fbl5B7KsLo6c}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", "true"
        );
        return new Cloudinary(config);
    }
}

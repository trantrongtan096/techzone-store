package com.techzone.service;

import com.techzone.entity.Brand;
import com.techzone.entity.Category;
import com.techzone.repository.BrandRepository;
import com.techzone.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public List<Category> getAllCategories() {
        return categoryRepository.findActiveCategoriesOrdered();
    }

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    @Transactional
    public void reorderCategories(List<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) return;
        for (int i = 0; i < categoryIds.size(); i++) {
            Long id = categoryIds.get(i);
            int newPriority = i + 1;
            categoryRepository.findById(id).ifPresent(cat -> {
                cat.setPriority(newPriority);
                categoryRepository.save(cat);
            });
        }
    }

    public static String toSlug(String input) {
        if (input == null || input.trim().isEmpty()) return "";
        String str = input.trim();
        // Replace Vietnamese specific characters 'đ' and 'Đ'
        str = str.replace("đ", "d").replace("Đ", "D");
        // Normalize unicode accents
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        String nowhitespace = WHITESPACE.matcher(normalized).replaceAll("-");
        String slug = NONLATIN.matcher(nowhitespace).replaceAll("");
        // Remove duplicate dashes
        slug = slug.replaceAll("-+", "-").replaceAll("^-|-$", "");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}

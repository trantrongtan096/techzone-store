package com.techzone.repository;

import com.techzone.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    Optional<Category> findByNameIgnoreCase(String name);
    List<Category> findAllByOrderByPriorityAsc();

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Category c WHERE c.isActive IS NULL OR c.isActive = true ORDER BY c.priority ASC")
    List<Category> findActiveCategoriesOrdered();
}

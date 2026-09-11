package com.techzone.repository;

import com.techzone.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    Optional<Brand> findByName(String name);
    Optional<Brand> findByNameIgnoreCase(String name);
    Optional<Brand> findBySlug(String slug);

    List<Brand> findAllByOrderByPriorityAscIdAsc();

    @Query("SELECT b FROM Brand b WHERE (b.isActive IS NULL OR b.isActive = true) ORDER BY b.priority ASC, b.id ASC")
    List<Brand> findActiveBrandsOrdered();

    @Query("SELECT b FROM Brand b WHERE (b.isActive IS NULL OR b.isActive = true) AND b.isFeatured = true ORDER BY b.priority ASC, b.id ASC")
    List<Brand> findFeaturedBrands();
}

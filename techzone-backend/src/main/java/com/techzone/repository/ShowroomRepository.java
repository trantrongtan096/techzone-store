package com.techzone.repository;

import com.techzone.entity.Showroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowroomRepository extends JpaRepository<Showroom, Long> {
    List<Showroom> findByIsActiveTrueOrderByPriorityIndexAsc();
    List<Showroom> findAllByOrderByPriorityIndexAscIdDesc();
}

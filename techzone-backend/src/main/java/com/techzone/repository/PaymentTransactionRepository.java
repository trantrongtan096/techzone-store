package com.techzone.repository;

import com.techzone.entity.Order;
import com.techzone.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByReference(String reference);
    List<PaymentTransaction> findByOrderOrderByCreatedAtDesc(Order order);
}

package com.techzone.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerPhone;

    @Column(nullable = false)
    private String customerEmail;

    @Column(nullable = false)
    private String shippingAddress;

    private String paymentMethod; // COD, QR_TRANSFER, VNPAY

    private String paymentStatus; // PENDING, PAID, FAILED

    private String orderStatus; // PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED

    @Column(nullable = false)
    private BigDecimal totalAmount;

    private BigDecimal discountAmount;

    private String note;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.paymentStatus == null) this.paymentStatus = "PENDING";
        if (this.orderStatus == null) this.orderStatus = "PENDING";
        if (this.discountAmount == null) this.discountAmount = BigDecimal.ZERO;
    }
}

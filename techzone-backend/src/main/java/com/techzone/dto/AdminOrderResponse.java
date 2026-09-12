package com.techzone.dto;

import com.techzone.entity.Order;
import com.techzone.entity.OrderItem;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AdminOrderResponse {
    private Long id;
    private String orderCode;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String shippingAddress;
    private String paymentMethod;
    private String paymentStatus;
    private String orderStatus;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private String note;
    private LocalDateTime createdAt;
    private List<ItemResponse> items;

    public static AdminOrderResponse from(Order order) {
        return AdminOrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .customerEmail(order.getCustomerEmail())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .items(order.getItems() == null
                        ? List.of()
                        : order.getItems().stream().map(ItemResponse::from).toList())
                .build();
    }

    @Data
    @Builder
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productSku;
        private String productThumbnail;
        private BigDecimal price;
        private Integer quantity;

        public static ItemResponse from(OrderItem item) {
            return ItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                    .productName(item.getProductName())
                    .productSku(item.getProduct() != null ? item.getProduct().getSku() : null)
                    .productThumbnail(item.getProduct() != null ? item.getProduct().getThumbnail() : null)
                    .price(item.getPrice())
                    .quantity(item.getQuantity())
                    .build();
        }
    }
}

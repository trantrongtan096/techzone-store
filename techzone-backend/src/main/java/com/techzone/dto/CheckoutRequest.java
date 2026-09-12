package com.techzone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CheckoutRequest {
    @NotBlank(message = "Tên người nhận không được để trống")
    private String customerName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String customerPhone;

    @Email(message = "Email không đúng định dạng")
    private String customerEmail;

    @NotBlank(message = "Địa chỉ nhận hàng không được để trống")
    private String shippingAddress;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod; // COD, QR_TRANSFER, VNPAY
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private String voucherCode;
    private String note;
    private String sessionId;
}

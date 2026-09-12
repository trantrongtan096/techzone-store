import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Order, PaymentTransaction } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="checkout-page text-slate-900">
      <div class="checkout-container">
        <nav class="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <a routerLink="/" class="hover:text-red-600">Trang chủ</a>
          <i class="pi pi-angle-right text-[10px]"></i>
          <a routerLink="/cart" class="hover:text-red-600">Giỏ hàng</a>
          <i class="pi pi-angle-right text-[10px]"></i>
          <span class="font-bold text-slate-800">Thanh toán</span>
        </nav>

        <div class="checkout-heading flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-7">
          <div class="border-l-4 border-red-600 pl-4">
            <h1 class="text-2xl font-black uppercase tracking-tight text-slate-900">Thanh Toán Đơn Hàng</h1>
            <p class="text-sm text-slate-500 mt-1">Hoàn tất thông tin để nhận hàng nhanh chóng</p>
          </div>
          <div class="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 shadow-sm border border-white">
            <div class="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <i class="pi pi-shield"></i>
            </div>
            <div>
              <div class="text-sm font-black">Thanh toán an toàn</div>
              <div class="text-xs text-slate-500">Thông tin của bạn được bảo mật</div>
            </div>
          </div>
        </div>

        <div *ngIf="!completedOrder()" class="checkout-grid">
          <form id="checkout-form" (ngSubmit)="onSubmitOrder()" class="checkout-form" novalidate>
            <section class="checkout-card recipient-card bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
              <div *ngIf="formError" class="checkout-alert" role="alert">
                <i class="pi pi-exclamation-triangle"></i>
                <div>
                  <strong>Thông tin chưa đầy đủ</strong>
                  <span>{{ formError }}</span>
                </div>
              </div>

              <div class="flex items-start justify-between gap-4 mb-5">
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/20">
                    <i class="pi pi-map-marker"></i>
                  </div>
                  <div>
                    <h2 class="text-lg font-black">Thông tin nhận hàng</h2>
                    <p class="text-xs text-slate-500 mt-1">Vui lòng nhập đầy đủ thông tin để chúng tôi giao hàng chính xác</p>
                  </div>
                </div>
                <button *ngIf="!authService.currentUser()" type="button" class="hidden sm:flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700">
                  <i class="pi pi-user"></i>
                  Đăng nhập để lấy thông tin đã lưu
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="space-y-2">
                  <span class="text-xs font-bold">Họ và tên người nhận <b class="text-red-600">*</b></span>
                  <span class="relative block">
                    <i class="pi pi-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input [(ngModel)]="customerName" (ngModelChange)="clearFieldError('customerName')" name="customerName" placeholder="Nhập họ và tên" [class.field-invalid]="fieldErrors['customerName']" class="w-full h-11 rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50" />
                  </span>
                  <small *ngIf="fieldErrors['customerName']" class="field-error">{{ fieldErrors['customerName'] }}</small>
                </label>

                <label class="space-y-2">
                  <span class="text-xs font-bold">Số điện thoại <b class="text-red-600">*</b></span>
                  <span class="relative block">
                    <i class="pi pi-phone absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input [(ngModel)]="customerPhone" (ngModelChange)="clearFieldError('customerPhone')" name="customerPhone" placeholder="Nhập số điện thoại" [class.field-invalid]="fieldErrors['customerPhone']" class="w-full h-11 rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50" />
                  </span>
                  <small *ngIf="fieldErrors['customerPhone']" class="field-error">{{ fieldErrors['customerPhone'] }}</small>
                </label>
              </div>

              <label class="email-field block mt-4 space-y-2">
                <span class="text-xs font-bold">Email nhận thông báo</span>
                <span class="relative block">
                  <i class="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input [(ngModel)]="customerEmail" (ngModelChange)="clearFieldError('customerEmail')" name="customerEmail" type="email" placeholder="Nhập email của bạn (không bắt buộc)" [class.field-invalid]="fieldErrors['customerEmail']" class="w-full h-11 rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50" />
                </span>
                <small *ngIf="fieldErrors['customerEmail']" class="field-error">{{ fieldErrors['customerEmail'] }}</small>
              </label>

              <div class="mt-4 space-y-2">
                <span class="text-xs font-bold">Địa chỉ nhận hàng <b class="text-red-600">*</b></span>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <span class="relative block">
                    <i class="pi pi-home absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <select [(ngModel)]="province" (ngModelChange)="clearFieldError('province')" name="province" [class.field-invalid]="fieldErrors['province']" class="w-full h-11 rounded-lg border border-slate-300 bg-white pl-11 pr-9 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50">
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      <option>TP. Hồ Chí Minh</option>
                      <option>Hà Nội</option>
                      <option>Đà Nẵng</option>
                    </select>
                  </span>
                  <span class="relative block">
                    <i class="pi pi-home absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <select [(ngModel)]="district" (ngModelChange)="clearFieldError('district')" name="district" [class.field-invalid]="fieldErrors['district']" class="w-full h-11 rounded-lg border border-slate-300 bg-white pl-11 pr-9 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50">
                      <option value="">Chọn Quận/Huyện</option>
                      <option>Quận Bình Thạnh</option>
                      <option>Quận 1</option>
                      <option>Quận Cầu Giấy</option>
                    </select>
                  </span>
                  <span class="relative block">
                    <i class="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <select [(ngModel)]="ward" (ngModelChange)="clearFieldError('ward')" name="ward" [class.field-invalid]="fieldErrors['ward']" class="w-full h-11 rounded-lg border border-slate-300 bg-white pl-11 pr-9 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50">
                      <option value="">Chọn Phường/Xã</option>
                      <option>Phường 6</option>
                      <option>Phường 12</option>
                      <option>Phường Dịch Vọng</option>
                    </select>
                  </span>
                </div>
                <span class="address-field relative block">
                  <i class="pi pi-map-marker absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true"></i>
                  <input [(ngModel)]="shippingAddress" (ngModelChange)="clearFieldError('shippingAddress')" name="shippingAddress" placeholder="Số nhà, tên đường, tòa nhà, ghi chú..." [class.field-invalid]="fieldErrors['shippingAddress']" class="w-full h-11 rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50" />
                </span>
                <small *ngIf="fieldErrors['province'] || fieldErrors['district'] || fieldErrors['ward'] || fieldErrors['shippingAddress']" class="field-error address-error">
                  {{ fieldErrors['province'] || fieldErrors['district'] || fieldErrors['ward'] || fieldErrors['shippingAddress'] }}
                </small>
              </div>

              <label class="mt-4 flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" [(ngModel)]="saveInfo" name="saveInfo" class="w-4 h-4 accent-red-600" />
                Lưu thông tin này cho lần sau
              </label>
            </section>

            <section class="checkout-card delivery-card bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
              <div class="flex items-start gap-4 mb-5">
                <div class="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/20">
                  <i class="pi pi-truck"></i>
                </div>
                <div>
                  <h2 class="text-lg font-black">Phương thức giao hàng</h2>
                  <p class="text-xs text-slate-500 mt-1">Chọn hình thức giao hàng phù hợp với nhu cầu của bạn</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition"
                  [ngClass]="shippingMethod === 'STANDARD' ? 'border-red-500 bg-red-50/60' : 'border-slate-300 bg-white hover:border-slate-400'">
                  <input type="radio" name="shippingMethod" value="STANDARD" [(ngModel)]="shippingMethod" (ngModelChange)="clearFieldError('shippingMethod')" class="accent-red-600" />
                  <i class="pi pi-truck text-3xl text-red-500"></i>
                  <span class="flex-1">
                    <span class="block text-sm font-black">Giao hàng tiêu chuẩn</span>
                    <span class="block text-xs text-slate-500 mt-1">Nhận hàng từ 2 - 4 ngày</span>
                  </span>
                  <b class="text-sm text-red-600">Miễn phí</b>
                </label>

                <label class="flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition"
                  [ngClass]="shippingMethod === 'EXPRESS' ? 'border-red-500 bg-red-50/60' : 'border-slate-300 bg-white hover:border-slate-400'">
                  <input type="radio" name="shippingMethod" value="EXPRESS" [(ngModel)]="shippingMethod" (ngModelChange)="clearFieldError('shippingMethod')" class="accent-red-600" />
                  <i class="pi pi-send text-3xl text-red-500"></i>
                  <span class="flex-1">
                    <span class="block text-sm font-black">Giao hàng nhanh 2H (Nội thành HCM)</span>
                    <span class="block text-xs text-slate-500 mt-1">Nhận hàng trong 2 giờ</span>
                  </span>
                  <b class="text-sm text-red-600">+ 30.000đ</b>
                </label>
              </div>
            </section>

            <section class="checkout-card payment-card bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
              <div class="flex items-start gap-4 mb-5">
                <div class="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/20">
                  <i class="pi pi-credit-card"></i>
                </div>
                <div>
                  <h2 class="text-lg font-black">Phương thức thanh toán</h2>
                  <p class="text-xs text-slate-500 mt-1">Chọn phương thức thanh toán phù hợp</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="payment-option" [ngClass]="paymentMethod === 'QR_TRANSFER' ? 'payment-option-active' : ''">
                  <input type="radio" name="payment" value="QR_TRANSFER" [(ngModel)]="paymentMethod" (ngModelChange)="clearFieldError('paymentMethod')" class="accent-red-600" />
                  <i class="pi pi-qrcode text-3xl text-red-500"></i>
                  <span>
                    <b>Chuyển khoản ngân hàng (VietQR)</b>
                    <small>Quét mã QR để thanh toán</small>
                  </span>
                </label>

                <label class="payment-option" [ngClass]="paymentMethod === 'COD' ? 'payment-option-active' : ''">
                  <input type="radio" name="payment" value="COD" [(ngModel)]="paymentMethod" (ngModelChange)="clearFieldError('paymentMethod')" class="accent-red-600" />
                  <i class="pi pi-money-bill text-3xl text-red-500"></i>
                  <span>
                    <b>Thanh toán khi nhận hàng (COD)</b>
                    <small>Thanh toán tiền mặt cho shipper</small>
                  </span>
                </label>

                <label class="payment-option opacity-60 cursor-not-allowed">
                  <input type="radio" name="paymentWallet" disabled />
                  <i class="pi pi-wallet text-3xl text-slate-500"></i>
                  <span>
                    <b>Ví điện tử</b>
                    <small>MoMo, VNPAY, ZaloPay</small>
                  </span>
                </label>

                <label class="payment-option opacity-60 cursor-not-allowed">
                  <input type="radio" name="paymentCard" disabled />
                  <i class="pi pi-credit-card text-3xl text-slate-500"></i>
                  <span>
                    <b>Thẻ ngân hàng</b>
                    <small>Visa, MasterCard, JCB</small>
                  </span>
                </label>
              </div>
              <small *ngIf="fieldErrors['shippingMethod'] || fieldErrors['paymentMethod']" class="field-error block mt-3">
                {{ fieldErrors['shippingMethod'] || fieldErrors['paymentMethod'] }}
              </small>
            </section>
          </form>

          <aside class="checkout-aside">
            <div class="order-card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div class="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 class="text-lg font-black">Đơn hàng của bạn <span class="text-sm font-medium text-slate-500">({{ itemCount() }} sản phẩm)</span></h2>
                <a routerLink="/cart" class="text-xs text-red-600 font-bold hover:underline">Chỉnh sửa <i class="pi pi-pencil text-[10px]"></i></a>
              </div>

              <div class="p-5 space-y-4 border-b border-slate-100 max-h-72 overflow-y-auto">
                <div *ngFor="let item of cartService.cart()?.items" class="flex gap-3">
                  <img [src]="item.product.thumbnail" [alt]="item.product.name" class="product-image w-20 h-16 object-contain rounded-xl border border-slate-200 bg-white" />
                  <div class="min-w-0 flex-1">
                    <h3 class="text-sm font-black leading-snug line-clamp-2">{{ item.product.name }}</h3>
                    <p class="text-[11px] text-slate-400 mt-1">SKU: {{ item.product.sku || 'TECHZONE' }}</p>
                    <div class="flex items-center justify-between mt-3">
                      <div class="inline-flex items-center rounded-lg border border-slate-200 overflow-hidden text-xs">
                        <button type="button" aria-label="Giảm số lượng" [disabled]="item.quantity <= 1" (click)="changeQuantity(item.id, item.quantity - 1)" class="px-3 py-1 bg-slate-50">−</button>
                        <span class="px-3 py-1 font-bold">{{ item.quantity }}</span>
                        <button type="button" aria-label="Tăng số lượng" (click)="changeQuantity(item.id, item.quantity + 1)" class="px-3 py-1 bg-slate-50">+</button>
                      </div>
                      <b class="text-red-600">{{ lineTotal(item) | number:'1.0-0' }}đ</b>
                      <button type="button" aria-label="Xóa sản phẩm khỏi giỏ hàng" (click)="removeItem(item.id)" class="text-slate-500 hover:text-red-600"><i class="pi pi-trash"></i></button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-5 border-b border-slate-100">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="flex items-center gap-2 text-sm font-black"><i class="pi pi-tag text-red-600"></i> Mã giảm giá</h3>
                  <button type="button" class="voucher-toggle" (click)="voucherOpen = !voucherOpen" [attr.aria-expanded]="voucherOpen" aria-label="Ẩn hiện mã giảm giá">
                    <i class="pi" [ngClass]="voucherOpen ? 'pi-angle-up' : 'pi-angle-down'"></i>
                  </button>
                </div>
                <div *ngIf="voucherOpen" class="flex gap-3">
                  <input [(ngModel)]="voucherCode" (ngModelChange)="voucherMessage = ''" name="voucherCode" placeholder="Nhập mã giảm giá" class="min-w-0 flex-1 h-11 rounded-lg border border-slate-300 px-4 text-sm outline-none focus:border-red-500" />
                  <button type="button" (click)="applyVoucher()" class="voucher-apply px-5 rounded-lg bg-red-300 text-white text-sm font-bold">Áp dụng</button>
                </div>
                <p *ngIf="voucherMessage" class="voucher-message" [class.error]="voucherError">{{ voucherMessage }}</p>
              </div>

              <div class="p-5 space-y-3">
                <h3 class="text-base font-black mb-3">Tóm tắt đơn hàng</h3>
                <div class="summary-row">
                  <span>Tạm tính ({{ itemCount() }} sản phẩm)</span>
                  <b>{{ subtotal() | number:'1.0-0' }}đ</b>
                </div>
                <div class="summary-row">
                  <span>Phí vận chuyển</span>
                  <b>{{ shippingFee() | number:'1.0-0' }}đ</b>
                </div>
                <div class="summary-row">
                  <span>Giảm giá</span>
                  <b class="text-emerald-600">-{{ discountAmount | number:'1.0-0' }}đ</b>
                </div>

                <div class="rounded-xl bg-slate-50 p-4 flex items-center justify-between mt-4">
                  <div>
                    <div class="font-black">Tổng thanh toán</div>
                    <div class="text-xs text-slate-500">(Đã bao gồm VAT nếu có)</div>
                  </div>
                  <div class="text-2xl font-black text-red-600">{{ grandTotal() | number:'1.0-0' }}đ</div>
                </div>

                <div class="commitment-box rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-slate-600 space-y-2">
                  <h4 class="font-black text-blue-700 flex items-center gap-2"><i class="pi pi-info-circle"></i> Cam kết từ TechZone</h4>
                  <p><i class="pi pi-check text-emerald-600 font-black mr-2"></i>Sản phẩm chính hãng 100%</p>
                  <p><i class="pi pi-check text-emerald-600 font-black mr-2"></i>Giao hàng nhanh toàn quốc</p>
                  <p><i class="pi pi-check text-emerald-600 font-black mr-2"></i>Đổi trả trong 30 ngày</p>
                  <p><i class="pi pi-check text-emerald-600 font-black mr-2"></i>Hỗ trợ kỹ thuật trọn đời</p>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  [disabled]="loading() || !itemCount()"
                  class="place-order-button w-full h-14 rounded-xl bg-red-600 text-white font-black uppercase hover:bg-red-700">
                  <i class="pi pi-lock mr-2"></i>{{ loading() ? 'Đang xử lý...' : 'Đặt hàng ngay' }}
                </button>

                <p class="text-center text-[11px] text-slate-500">
                  Bằng cách đặt hàng, bạn đồng ý với <a class="font-bold text-red-600 hover:underline">Điều khoản mua hàng</a> của TechZone
                </p>
              </div>
            </div>
          </aside>
        </div>

        <div *ngIf="completedOrder()" class="max-w-2xl mx-auto bg-white border border-emerald-200 rounded-3xl p-8 text-center space-y-6 shadow-xl">
          <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
            <i class="pi pi-check-circle"></i>
          </div>

          <div>
            <h2 class="text-2xl font-black text-slate-900">Đặt hàng thành công!</h2>
            <p class="text-sm text-slate-500 mt-2">TechZone sẽ liên hệ xác nhận đơn trong 15 phút.</p>
          </div>

          <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm space-y-3 text-left">
            <div class="flex justify-between gap-4">
              <span class="text-slate-500">Mã đơn hàng:</span>
              <strong class="font-mono text-red-600">{{ completedOrder()?.orderCode }}</strong>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-slate-500">Người nhận:</span>
              <span class="font-bold text-slate-800 text-right">{{ completedOrder()?.customerName }} ({{ completedOrder()?.customerPhone }})</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-slate-500">Tổng tiền:</span>
              <span class="font-black text-red-600">{{ completedOrder()?.totalAmount | number:'1.0-0' }}đ</span>
            </div>
          </div>

          <div *ngIf="completedOrder()?.paymentMethod === 'QR_TRANSFER'" class="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm space-y-3 text-left">
            <div class="flex justify-between gap-4">
              <span class="text-slate-500">Nội dung chuyển khoản:</span>
              <strong class="font-mono text-blue-700 text-right">{{ paymentTransaction()?.reference || 'Đang tạo mã...' }}</strong>
            </div>
            <img *ngIf="paymentTransaction()?.paymentUrl" [src]="paymentTransaction()?.paymentUrl" alt="VietQR" class="w-60 h-60 object-contain mx-auto rounded-xl bg-white p-2" />
            <div *ngIf="paymentTransaction() && !paymentTransaction()?.paymentUrl" class="vietqr-missing">
              <i class="pi pi-exclamation-triangle"></i>
              <span>Chưa hiển thị được mã QR vì backend chưa cấu hình VIETQR_BANK_BIN hoặc VIETQR_ACCOUNT_NO.</span>
            </div>
            <div *ngIf="!paymentTransaction()" class="vietqr-missing">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Đang lấy thông tin thanh toán VietQR...</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-slate-500">Trạng thái:</span>
              <strong class="text-amber-600">{{ paymentTransaction()?.status || 'PENDING' }}</strong>
            </div>
          </div>

          <a routerLink="/" class="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-red-600 text-white font-black hover:bg-red-700">
            Về trang chủ TechZone
          </a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./checkout.component.css'],
  styles: [`
    .payment-option {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-height: 5.25rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.75rem;
      padding: 1rem;
      cursor: pointer;
      background: white;
      transition: border-color 160ms ease, background-color 160ms ease;
    }

    .payment-option-active {
      border-color: #ef233c;
      background: #fff1f2;
    }

    .payment-option b,
    .payment-option small {
      display: block;
    }

    .payment-option b {
      font-size: 0.875rem;
      line-height: 1.2;
    }

    .payment-option small {
      margin-top: 0.25rem;
      color: #64748b;
      font-size: 0.75rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      font-size: 0.875rem;
      color: #475569;
    }
  `]
})
export class CheckoutComponent implements OnInit {
  customerName = '';
  customerPhone = '';
  customerEmail = '';
  province = '';
  district = '';
  ward = '';
  shippingAddress = '';
  paymentMethod = 'QR_TRANSFER';
  shippingMethod = 'STANDARD';
  voucherCode = '';
  note = '';
  saveInfo = true;
  discountAmount = 0;
  voucherMessage = '';
  voucherError = false;
  voucherOpen = true;
  formError = '';
  fieldErrors: Record<string, string> = {};

  loading = signal(false);
  completedOrder = signal<Order | null>(null);
  paymentTransaction = signal<PaymentTransaction | null>(null);

  itemCount = computed(() => {
    const items = this.cartService.cart()?.items || [];
    return items.reduce((sum, item) => sum + item.quantity, 0);
  });

  subtotal = computed(() => {
    const items = this.cartService.cart()?.items || [];
    return items.reduce((sum, item) => sum + this.lineTotal(item), 0);
  });

  shippingFee(): number {
    return this.shippingMethod === 'EXPRESS' ? 30000 : 0;
  }

  grandTotal(): number {
    return Math.max(0, this.subtotal() + this.shippingFee() - this.discountAmount);
  }

  constructor(
    public cartService: CartService,
    public authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.customerName = user.fullName;
      this.customerEmail = user.email;
    }
    this.restoreCheckoutInfo();
  }

  lineTotal(item: any): number {
    const price = item.product.promotionPrice || item.product.originalPrice;
    return price * item.quantity;
  }

  changeQuantity(itemId: number, quantity: number): void {
    this.cartService.updateQuantity(itemId, quantity).subscribe();
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe();
  }

  applyVoucher(): void {
    const code = this.voucherCode.trim().toUpperCase();
    this.voucherError = false;

    if (!code) {
      this.discountAmount = 0;
      this.voucherError = true;
      this.voucherMessage = 'Vui lòng nhập mã giảm giá.';
      return;
    }

    if (code === 'TECHZONE10') {
      this.discountAmount = Math.min(Math.round(this.subtotal() * 0.1), 500000);
      this.voucherMessage = `Đã áp dụng TECHZONE10, giảm ${this.discountAmount.toLocaleString('vi-VN')}đ.`;
      return;
    }

    if (code === 'TECHZONE50K') {
      if (this.subtotal() < 1000000) {
        this.discountAmount = 0;
        this.voucherError = true;
        this.voucherMessage = 'Mã TECHZONE50K chỉ áp dụng cho đơn từ 1.000.000đ.';
        return;
      }
      this.discountAmount = 50000;
      this.voucherMessage = 'Đã áp dụng TECHZONE50K, giảm 50.000đ.';
      return;
    }

    this.discountAmount = 0;
    this.voucherError = true;
    this.voucherMessage = 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
  }

  onSubmitOrder(): void {
    if (this.loading()) return;
    if (!this.validateCheckout()) return;

    this.loading.set(true);
    this.orderService.checkout({
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerEmail: this.customerEmail,
      shippingAddress: this.fullShippingAddress(),
      paymentMethod: this.paymentMethod,
      shippingFee: this.shippingFee(),
      discountAmount: this.discountAmount,
      voucherCode: this.voucherCode.trim().toUpperCase() || undefined,
      note: this.buildOrderNote(),
      sessionId: this.cartService.sessionId
    }).subscribe({
      next: (order) => {
        this.loading.set(false);
        this.cartService.loadCart();
        this.persistCheckoutInfo();
        if (order.paymentMethod === 'QR_TRANSFER') {
          this.router.navigate(['/payment', order.orderCode], {
            queryParams: { contact: order.customerEmail || order.customerPhone }
          });
          return;
        }

        this.completedOrder.set(order);
      },
      error: () => {
        this.loading.set(false);
        this.formError = 'Không thể tạo đơn hàng lúc này. Vui lòng thử lại.';
      }
    });
  }

  clearFieldError(field: string): void {
    if (!this.fieldErrors[field]) return;

    const nextErrors = { ...this.fieldErrors };
    delete nextErrors[field];
    this.fieldErrors = nextErrors;

    if (!Object.keys(nextErrors).length) {
      this.formError = '';
    }
  }

  private validateCheckout(): boolean {
    const errors: Record<string, string> = {};
    const email = this.customerEmail.trim();
    const phone = this.customerPhone.trim();

    if (!this.cartService.cart()?.items?.length) {
      this.formError = 'Giỏ hàng của bạn hiện chưa có sản phẩm.';
      return false;
    }

    if (!this.customerName.trim()) {
      errors['customerName'] = 'Vui lòng nhập họ và tên người nhận.';
    }

    if (!phone) {
      errors['customerPhone'] = 'Vui lòng nhập số điện thoại.';
    } else if (!/^(0|\+84)(\d{9,10})$/.test(phone.replace(/\s/g, ''))) {
      errors['customerPhone'] = 'Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors['customerEmail'] = 'Email không đúng định dạng.';
    }

    if (!this.province) {
      errors['province'] = 'Vui lòng chọn Tỉnh/Thành phố.';
    } else if (!this.district) {
      errors['district'] = 'Vui lòng chọn Quận/Huyện.';
    } else if (!this.ward) {
      errors['ward'] = 'Vui lòng chọn Phường/Xã.';
    }

    if (!this.shippingAddress.trim()) {
      errors['shippingAddress'] = 'Vui lòng nhập số nhà, tên đường.';
    }

    if (!this.shippingMethod) {
      errors['shippingMethod'] = 'Vui lòng chọn phương thức giao hàng.';
    }

    if (!this.paymentMethod) {
      errors['paymentMethod'] = 'Vui lòng chọn phương thức thanh toán.';
    }

    this.fieldErrors = errors;
    this.formError = Object.keys(errors).length
      ? 'Vui lòng kiểm tra các trường được đánh dấu đỏ trước khi đặt hàng.'
      : '';

    if (this.formError) {
      queueMicrotask(() => this.scrollToFirstError());
      return false;
    }

    return true;
  }

  private scrollToFirstError(): void {
    const firstError = document.querySelector('.field-invalid, .checkout-alert');
    firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  private restoreCheckoutInfo(): void {
    const saved = localStorage.getItem('techzone_checkout_info');
    if (!saved) return;

    try {
      const info = JSON.parse(saved);
      this.customerName = this.customerName || info.customerName || '';
      this.customerPhone = info.customerPhone || '';
      this.customerEmail = this.customerEmail || info.customerEmail || '';
      this.province = info.province || '';
      this.district = info.district || '';
      this.ward = info.ward || '';
      this.shippingAddress = info.shippingAddress || '';
    } catch {
      localStorage.removeItem('techzone_checkout_info');
    }
  }

  private persistCheckoutInfo(): void {
    if (!this.saveInfo) {
      localStorage.removeItem('techzone_checkout_info');
      return;
    }

    localStorage.setItem('techzone_checkout_info', JSON.stringify({
      customerName: this.customerName.trim(),
      customerPhone: this.customerPhone.trim(),
      customerEmail: this.customerEmail.trim(),
      province: this.province,
      district: this.district,
      ward: this.ward,
      shippingAddress: this.shippingAddress.trim()
    }));
  }

  private fullShippingAddress(): string {
    return [this.shippingAddress, this.ward, this.district, this.province]
      .filter(Boolean)
      .join(', ');
  }

  private buildOrderNote(): string {
    const shipping = this.shippingMethod === 'EXPRESS'
      ? 'Giao hàng nhanh 2H (+30000)'
      : 'Giao hàng tiêu chuẩn';
    return [this.note, shipping].filter(Boolean).join(' | ');
  }

  private loadPaymentTransaction(order: Order): void {
    if (order.paymentMethod !== 'QR_TRANSFER') {
      this.paymentTransaction.set(null);
      return;
    }

    this.paymentTransaction.set(null);
    const contact = order.customerEmail || order.customerPhone;
    this.orderService.getOrderPayments(order.orderCode, contact).subscribe({
      next: (transactions) => this.paymentTransaction.set(transactions[0] || null),
      error: () => this.paymentTransaction.set(null)
    });
  }
}

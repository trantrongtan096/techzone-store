import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-black text-white uppercase tracking-tight mb-6 border-l-4 border-red-600 pl-3">
        Thanh Toán Đơn Hàng TechZone
      </h1>

      <div *ngIf="!completedOrder()" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- CHECKOUT FORM -->
        <div class="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 class="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <i class="pi pi-user text-red-500"></i> Thông Tin Giao Hàng
          </h3>

          <form (ngSubmit)="onSubmitOrder()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1 uppercase">Họ và tên người nhận *</label>
              <input type="text" [(ngModel)]="customerName" name="customerName" required placeholder="Nguyễn Văn A" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1 uppercase">Số điện thoại *</label>
                <input type="text" [(ngModel)]="customerPhone" name="customerPhone" required placeholder="0988xxxxxx" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1 uppercase">Email nhận thông báo *</label>
                <input type="email" [(ngModel)]="customerEmail" name="customerEmail" required placeholder="email@gmail.com" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1 uppercase">Địa chỉ giao hàng chi tiết *</label>
              <textarea [(ngModel)]="shippingAddress" name="shippingAddress" required rows="2" placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, TP..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1 uppercase">Ghi chú đơn hàng (Tùy chọn)</label>
              <input type="text" [(ngModel)]="note" name="note" placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500" />
            </div>

            <!-- PAYMENT METHOD SELECTION -->
            <div class="pt-4 border-t border-slate-800">
              <h4 class="text-xs font-bold text-slate-300 uppercase mb-3">Phương Thức Thanh Toán</h4>
              <div class="space-y-3 text-xs">
                <label class="flex items-center gap-3 p-3 bg-slate-950 border rounded-xl cursor-pointer" [class.border-red-500]="paymentMethod === 'COD'">
                  <input type="radio" name="payment" value="COD" [(ngModel)]="paymentMethod" class="accent-red-600" />
                  <div>
                    <span class="font-bold text-white block">Thanh toán khi nhận hàng (COD)</span>
                    <span class="text-slate-400 text-[11px]">Trả tiền mặt cho shipper khi nhận & kiểm tra hàng</span>
                  </div>
                </label>

                <label class="flex items-center gap-3 p-3 bg-slate-950 border rounded-xl cursor-pointer" [class.border-red-500]="paymentMethod === 'QR_TRANSFER'">
                  <input type="radio" name="payment" value="QR_TRANSFER" [(ngModel)]="paymentMethod" class="accent-red-600" />
                  <div>
                    <span class="font-bold text-white block">Chuyển khoản Ngân hàng (Quét mã VietQR)</span>
                    <span class="text-slate-400 text-[11px]">Giao hàng tự động ngay sau khi xác nhận chuyển khoản</span>
                  </div>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              [disabled]="loading()"
              class="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/30 transition-all text-xs tracking-wider uppercase mt-6">
              {{ loading() ? 'ĐANG XỬ LÝ ĐƠN HÀNG...' : 'XÁC NHẬN ĐẶT HÀNG' }}
            </button>
          </form>
        </div>

        <!-- ORDER ITEMS PREVIEW -->
        <div class="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 self-start">
          <h3 class="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">Sản Phẩm Trong Đơn Hàng</h3>

          <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
            <div *ngFor="let item of cartService.cart()?.items" class="flex items-center gap-3 text-xs border-b border-slate-800/60 pb-3 last:border-0">
              <img [src]="item.product.thumbnail" [alt]="item.product.name" class="w-12 h-12 object-cover rounded-lg bg-slate-950" />
              <div class="flex-1 min-w-0">
                <span class="font-semibold text-slate-200 block truncate">{{ item.product.name }}</span>
                <span class="text-slate-400">SL: {{ item.quantity }}</span>
              </div>
              <span class="font-bold text-red-500">
                {{ ((item.product.promotionPrice || item.product.originalPrice) * item.quantity) | number:'1.0-0' }}đ
              </span>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800 text-xs space-y-2">
            <div class="flex justify-between text-slate-400">
              <span>Giao hàng:</span>
              <span class="text-emerald-400 font-bold">Miễn phí 100%</span>
            </div>
            <div class="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
              <span>Tổng thanh toán:</span>
              <span class="text-lg font-black text-red-500">{{ calculateTotal() | number:'1.0-0' }}đ</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SUCCESS ORDER DIALOG -->
      <div *ngIf="completedOrder()" class="max-w-2xl mx-auto bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in">
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto border border-emerald-500/40">
          <i class="pi pi-check-circle"></i>
        </div>

        <div>
          <h2 class="text-2xl font-black text-white">ĐẶT HÀNG THÀNH CÔNG!</h2>
          <p class="text-xs text-slate-400 mt-2">Cảm ơn bạn đã tin tưởng lựa chọn TechZone. Nhân viên tư vấn sẽ liên hệ xác nhận đơn trong 15 phút.</p>
        </div>

        <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-left">
          <div class="flex justify-between">
            <span class="text-slate-400">Mã đơn hàng:</span>
            <strong class="font-mono text-red-400 text-sm font-bold">{{ completedOrder()?.orderCode }}</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Người nhận:</span>
            <span class="text-slate-200 font-bold">{{ completedOrder()?.customerName }} ({{ completedOrder()?.customerPhone }})</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Địa chỉ:</span>
            <span class="text-slate-200 font-bold">{{ completedOrder()?.shippingAddress }}</span>
          </div>
          <div class="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold">
            <span class="text-slate-300">Tổng tiền thanh toán:</span>
            <span class="text-red-500 font-black">{{ completedOrder()?.totalAmount | number:'1.0-0' }}đ</span>
          </div>
        </div>

        <a routerLink="/" class="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-lg shadow-red-600/30 inline-block transition-all">
          VỀ TRANG CHỦ TECHZONE
        </a>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  customerName = '';
  customerPhone = '';
  customerEmail = '';
  shippingAddress = '';
  paymentMethod = 'COD';
  note = '';

  loading = signal(false);
  completedOrder = signal<Order | null>(null);

  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.customerName = user.fullName;
      this.customerEmail = user.email;
    }
  }

  calculateTotal(): number {
    const items = this.cartService.cart()?.items;
    if (!items) return 0;
    return items.reduce((sum, item) => {
      const price = item.product.promotionPrice || item.product.originalPrice;
      return sum + price * item.quantity;
    }, 0);
  }

  onSubmitOrder(): void {
    this.loading.set(true);
    this.orderService.checkout({
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      customerEmail: this.customerEmail,
      shippingAddress: this.shippingAddress,
      paymentMethod: this.paymentMethod,
      note: this.note,
      sessionId: this.cartService.sessionId
    }).subscribe({
      next: (order) => {
        this.loading.set(false);
        this.completedOrder.set(order);
        this.cartService.loadCart();
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}

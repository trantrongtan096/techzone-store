import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tight mb-6 border-l-4 border-[#E30019] pl-3">
        Giỏ Hàng Của Bạn ({{ cartService.itemCount() }} sản phẩm)
      </h1>

      <div *ngIf="cartService.cart()?.items?.length; else emptyCart" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- CART ITEMS TABLE -->
        <div class="lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div *ngFor="let item of cartService.cart()?.items" class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
            <!-- Product Info -->
            <div class="flex items-center gap-4 w-full sm:w-auto">
              <img [src]="item.product.thumbnail" [alt]="item.product.name" class="w-16 h-16 object-cover rounded-xl bg-slate-50 border border-gray-100" />
              <div>
                <a [routerLink]="['/products', item.product.slug]" class="text-xs font-bold text-slate-800 hover:text-[#E30019] line-clamp-2">
                  {{ item.product.name }}
                </a>
                <span class="text-xs font-black text-[#E30019] block mt-1">
                  {{ (item.product.promotionPrice || item.product.originalPrice) | number:'1.0-0' }}đ
                </span>
              </div>
            </div>

            <!-- Quantity & Actions -->
            <div class="flex items-center gap-6 w-full sm:w-auto justify-between">
              <div class="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <button (click)="cartService.updateQuantity(item.id, item.quantity - 1).subscribe()" class="px-3 py-1 text-slate-600 hover:bg-gray-100 font-bold">-</button>
                <span class="px-3 py-1 text-xs font-bold text-slate-800">{{ item.quantity }}</span>
                <button (click)="cartService.updateQuantity(item.id, item.quantity + 1).subscribe()" class="px-3 py-1 text-slate-600 hover:bg-gray-100 font-bold">+</button>
              </div>

              <!-- Item Total -->
              <span class="text-xs font-black text-slate-800 min-w-24 text-right">
                {{ ((item.product.promotionPrice || item.product.originalPrice) * item.quantity) | number:'1.0-0' }}đ
              </span>

              <!-- Remove -->
              <button (click)="cartService.removeItem(item.id).subscribe()" class="text-slate-400 hover:text-[#E30019] p-1" title="Xóa">
                <i class="pi pi-trash text-base"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- ORDER SUMMARY -->
        <div class="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 self-start">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-gray-100 pb-3">Tóm Tắt Đơn Hàng</h3>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between text-slate-500">
              <span>Tạm tính:</span>
              <span class="font-bold text-slate-800">{{ calculateSubtotal() | number:'1.0-0' }}đ</span>
            </div>
            <div class="flex justify-between text-slate-500">
              <span>Phí vận chuyển:</span>
              <span class="font-bold text-emerald-600">Miễn phí giao hàng</span>
            </div>
            <div class="flex justify-between text-sm font-bold text-slate-800 pt-3 border-t border-gray-100">
              <span>Tổng cộng:</span>
              <span class="text-lg font-black text-[#E30019]">{{ calculateSubtotal() | number:'1.0-0' }}đ</span>
            </div>
          </div>

          <button 
            routerLink="/checkout"
            class="w-full bg-[#E30019] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-600/30 transition-all text-xs tracking-wider uppercase mt-4">
            TIẾN HÀNH THANH TOÁN
          </button>

          <a routerLink="/products" class="block text-center text-xs text-slate-500 hover:text-[#E30019] font-semibold pt-2">
            <i class="pi pi-arrow-left mr-1"></i> Tiếp tục chọn mua sản phẩm
          </a>
        </div>
      </div>

      <ng-template #emptyCart>
        <div class="bg-white border border-gray-100 rounded-2xl p-16 text-center text-slate-500">
          <i class="pi pi-shopping-bag text-5xl text-slate-300 mb-4 block"></i>
          <h2 class="text-base font-bold text-slate-800">Giỏ hàng của bạn đang trống!</h2>
          <p class="text-xs text-slate-500 mt-1 mb-6">Hãy chọn thêm sản phẩm công nghệ tuyệt vời từ TechZone.</p>
          <a routerLink="/products" class="bg-[#E30019] hover:bg-red-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-red-600/30 inline-block transition-all">
            KHÁM PHÁ SẢN PHẨM NGAY
          </a>
        </div>
      </ng-template>
    </div>
  `
})
export class CartComponent {
  constructor(public cartService: CartService) {}

  calculateSubtotal(): number {
    const items = this.cartService.cart()?.items;
    if (!items) return 0;
    return items.reduce((sum, item) => {
      const price = item.product.promotionPrice || item.product.originalPrice;
      return sum + price * item.quantity;
    }, 0);
  }
}

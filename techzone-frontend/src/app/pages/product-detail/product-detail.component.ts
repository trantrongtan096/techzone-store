import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8" *ngIf="product(); else loadingState">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <a routerLink="/" class="text-slate-600 hover:text-[#E30019]">Trang chủ</a>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <a [routerLink]="['/products']" [queryParams]="{ categoryId: product()?.category?.id }" class="text-slate-600 hover:text-[#E30019]">
          {{ product()?.category?.name }}
        </a>
        <i class="pi pi-chevron-right text-[10px]"></i>
        <span class="text-slate-700 font-semibold line-clamp-1">{{ product()?.name }}</span>
      </div>

      <!-- PRODUCT MAIN GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Gallery & Preview -->
        <div class="lg:col-span-6 space-y-4">
          <div class="bg-white border border-gray-200 rounded-xl p-4 overflow-hidden aspect-video flex items-center justify-center relative shadow-sm">
            <img 
              [src]="selectedImage() || product()?.thumbnail" 
              [alt]="product()?.name" 
              [class.opacity-30]="isImageChanging()"
              [class.opacity-100]="!isImageChanging()"
              class="max-h-full max-w-full object-contain transition-opacity duration-150 ease-in-out" />
            <span *ngIf="product()?.discountPercentage" class="absolute top-4 left-4 bg-[#E30019] text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md z-10">
              Giảm {{ product()?.discountPercentage }}%
            </span>
          </div>

          <!-- Thumbnails List (Sub-images Gallery) -->
          <div *ngIf="product()?.images && product()!.images!.length > 0" class="flex items-center gap-3 overflow-x-auto py-2 pr-2 scrollbar-thin">
            <!-- Main thumbnail -->
            <div 
              (click)="selectImage(product()?.thumbnail)"
              [class.border-[#E30019]]="!selectedImage() || selectedImage() === product()?.thumbnail"
              [class.border-gray-200]="selectedImage() && selectedImage() !== product()?.thumbnail"
              class="w-20 h-20 rounded-xl bg-white border-2 p-1 flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 shrink-0 shadow-sm">
              <img [src]="product()?.thumbnail" class="max-h-full max-w-full object-contain" />
            </div>
            
            <!-- Sub images -->
            <div 
              *ngFor="let img of product()?.images"
              (click)="selectImage(img.imageUrl)"
              [class.border-[#E30019]]="selectedImage() === img.imageUrl"
              [class.border-gray-200]="selectedImage() !== img.imageUrl"
              class="w-20 h-20 rounded-xl bg-white border-2 p-1 flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 shrink-0 shadow-sm">
              <img [src]="img.imageUrl" class="max-h-full max-w-full object-contain" (error)="onSubImageError($event)" />
            </div>
          </div>
        </div>

        <!-- PRODUCT INFO & PRICING -->
        <div class="lg:col-span-6 space-y-6">
          <div>
            <span class="text-xs font-extrabold text-[#E30019] uppercase tracking-widest">{{ product()?.brand?.name }}</span>
            <h1 class="text-xl md:text-2xl font-black text-slate-800 leading-snug mt-1">
              {{ product()?.name }}
            </h1>
            <div class="flex items-center gap-4 text-xs text-slate-500 mt-2">
              <span>Mã SP: <strong class="text-slate-700">{{ product()?.sku }}</strong></span>
              <span>•</span>
              <span class="text-emerald-600 font-semibold flex items-center gap-1">
                <i class="pi pi-check-circle"></i> Còn hàng ({{ product()?.stockQuantity }} SP)
              </span>
            </div>
          </div>

          <!-- Pricing Box -->
          <div class="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-2">
            <div class="flex items-baseline gap-3">
              <span class="text-3xl font-black text-[#E30019]">
                {{ (product()?.promotionPrice || product()?.originalPrice) | number:'1.0-0' }}đ
              </span>
              <span *ngIf="product()?.promotionPrice" class="text-sm text-slate-400 line-through">
                {{ product()?.originalPrice | number:'1.0-0' }}đ
              </span>
            </div>
            <p class="text-xs text-emerald-700 font-semibold">
              <i class="pi pi-gift mr-1"></i> Giá đã bao gồm thuế VAT & Bảo hành chính hãng 12-36 tháng
            </p>
          </div>

          <!-- Promotions / Perks Box -->
          <div class="border border-red-200 bg-red-50/60 rounded-2xl p-4 space-y-2 text-xs">
            <div class="font-bold text-[#E30019] uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-star-fill"></i> QUÀ TẶNG & ƯU ĐÃI KÈM THEO
            </div>
            <ul class="space-y-1.5 text-slate-700 list-disc list-inside">
              <li>Tặng Balo Gaming TechZone cao cấp trị giá 790.000đ.</li>
              <li>Giảm 20% khi mua thêm Chuột Gaming hoặc Tai nghe.</li>
              <li>Miễn phí vệ sinh máy & tra keo tản nhiệt trọn đời.</li>
            </ul>
          </div>

          <!-- Quantity Counter & Buy Actions -->
          <div class="space-y-4 pt-2">
            <div class="flex items-center gap-4">
              <span class="text-xs font-bold text-slate-500 uppercase">Số lượng:</span>
              <div class="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <button (click)="decreaseQty()" class="px-3 py-1.5 text-slate-600 hover:bg-gray-100 text-sm font-bold">-</button>
                <span class="px-4 py-1.5 text-sm font-bold text-slate-800">{{ quantity() }}</span>
                <button (click)="increaseQty()" class="px-3 py-1.5 text-slate-600 hover:bg-gray-100 text-sm font-bold">+</button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                (click)="onAddToCart()"
                class="w-full bg-slate-800 hover:bg-slate-950 text-white font-bold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow">
                <i class="pi pi-shopping-cart text-[#E30019]"></i> THÊM VÀO GIỎ HÀNG
              </button>

              <button 
                (click)="onBuyNow()"
                class="w-full bg-[#E30019] hover:bg-red-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer">
                MUA NGAY (GIAO NHANH 2H)
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SPECS & DESCRIPTION TABS -->
      <div class="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Specs Table -->
        <div class="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 class="text-base font-bold text-slate-800 uppercase tracking-wider mb-4 border-l-4 border-[#E30019] pl-3">
            Thông Số Kỹ Thuật Chi Tiết
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <tbody>
                <tr *ngFor="let item of parsedSpecs() | keyvalue" class="border-b border-gray-100 last:border-0">
                  <td class="py-3 font-semibold text-slate-500 w-1/3 bg-gray-50/50 px-3 rounded-l">{{ item.key }}</td>
                  <td class="py-3 font-bold text-slate-800 px-3">{{ item.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Description -->
        <div class="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 class="text-base font-bold text-slate-800 uppercase tracking-wider border-l-4 border-[#E30019] pl-3">
            Đánh Giá Chi Tiết
          </h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            {{ product()?.description }}
          </p>
        </div>
      </div>
    </div>

    <ng-template #loadingState>
      <div class="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        <i class="pi pi-spin pi-spinner text-3xl text-red-500 mb-2"></i>
        <p class="text-sm">Đang tải thông tin sản phẩm TechZone...</p>
      </div>
    </ng-template>
  `
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  selectedImage = signal<string | null>(null);
  isImageChanging = signal(false);
  quantity = signal<number>(1);
  parsedSpecs = signal<Record<string, string>>({});

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      window.scrollTo(0, 0);
      const slug = params.get('slug');
      if (slug) {
        this.productService.getProductBySlug(slug).subscribe({
          next: (prod) => {
            this.product.set(prod);
            if (prod.specsJson) {
              try {
                this.parsedSpecs.set(JSON.parse(prod.specsJson));
              } catch (e) {
                this.parsedSpecs.set({});
              }
            }
          }
        });
      }
    });
  }

  increaseQty(): void {
    this.quantity.set(this.quantity() + 1);
  }

  decreaseQty(): void {
    if (this.quantity() > 1) {
      this.quantity.set(this.quantity() - 1);
    }
  }

  onAddToCart(): void {
    const prod = this.product();
    if (prod) {
      this.cartService.addToCart(prod.id, this.quantity()).subscribe();
    }
  }

  onBuyNow(): void {
    const prod = this.product();
    if (prod) {
      this.cartService.addToCart(prod.id, this.quantity()).subscribe(() => {
        this.router.navigate(['/cart']);
      });
    }
  }

  selectImage(url: string | undefined): void {
    if (!url) return;
    this.isImageChanging.set(true);
    setTimeout(() => {
      this.selectedImage.set(url);
      this.isImageChanging.set(false);
    }, 150);
  }

  onSubImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&auto=format&fit=crop';
  }
}

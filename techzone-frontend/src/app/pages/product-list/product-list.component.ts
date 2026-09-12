import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Brand, Category, Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div
        *ngIf="cartToast()"
        class="fixed top-24 right-6 z-[100] w-[360px] max-w-[calc(100vw-32px)] bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        <div class="p-4 flex items-start gap-3">
          <div [class]="cartToast()?.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'" class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0">
            <i [class]="cartToast()?.type === 'success' ? 'pi pi-check-circle text-lg' : 'pi pi-exclamation-triangle text-lg'"></i>
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-black">{{ cartToast()?.title }}</div>
            <div class="mt-2 flex gap-3">
              <img *ngIf="cartToast()?.product" [src]="getProductImage(cartToast()?.product)" (error)="onProductImageError($event)" [alt]="cartToast()?.product?.name" class="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 object-contain p-1 shrink-0" />
              <div class="min-w-0">
                <div class="text-xs font-bold text-slate-800 line-clamp-2">{{ cartToast()?.product?.name || cartToast()?.message }}</div>
                <div *ngIf="cartToast()?.product" class="mt-1 text-sm font-black text-[#E30019]">
                  {{ ((cartToast()?.product?.promotionPrice || cartToast()?.product?.originalPrice) || 0) | number:'1.0-0' }}đ
                </div>
              </div>
            </div>
          </div>
          <button type="button" (click)="cartToast.set(null)" class="text-slate-400 hover:text-slate-700 cursor-pointer">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="grid grid-cols-2 gap-2 px-4 pb-4">
          <a routerLink="/cart" (click)="cartToast.set(null)" class="text-center bg-slate-950 hover:bg-[#E30019] text-white text-xs font-black py-2.5 rounded-2xl transition-colors">
            XEM GIỎ HÀNG
          </a>
          <button type="button" (click)="cartToast.set(null)" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black py-2.5 rounded-2xl transition-colors cursor-pointer">
            TIẾP TỤC MUA
          </button>
        </div>
      </div>
      <div class="space-y-6 animate-fade-in">
      <!-- Title & Breadcrumb Bar -->
      <div class="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 class="text-2xl font-black text-gray-800 uppercase tracking-wide">Danh Mục Sản Phẩm</h1>
          <p class="text-xs text-slate-500">Khám phá các thiết bị Gaming & Linh kiện PC cao cấp tại TechZone</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- SIDEBAR FILTERS -->
        <aside class="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-6">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 class="text-xs font-black uppercase text-gray-800 flex items-center gap-2">
              <i class="pi pi-filter text-[#E30019]"></i> Bộ Lọc Tìm Kiếm
            </h3>
            <button (click)="resetFilters()" class="text-[10px] font-bold text-[#E30019] hover:underline">Đặt lại</button>
          </div>

          <!-- Search Input -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">Từ khóa</label>
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearchInput()"
              placeholder="VD: RTX 4070, ROG..." 
              class="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#E30019]" />
          </div>

          <!-- Category Filter -->
          <div>
            <h4 class="text-xs font-bold text-slate-700 uppercase mb-3">Danh Mục</h4>
            <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <label 
                *ngFor="let cat of categories()" 
                class="flex items-center gap-2 text-xs text-slate-700 hover:text-[#E30019] cursor-pointer py-1">
                <input 
                  type="radio" 
                  name="category" 
                  [value]="cat.id" 
                  [ngModel]="selectedCategoryId()" 
                  (ngModelChange)="onCategorySelect(cat.id)"
                  class="accent-[#E30019]" />
                <span>{{ cat.name }}</span>
              </label>
            </div>
          </div>

          <!-- Brand Filter -->
          <div>
            <h4 class="text-xs font-bold text-slate-700 uppercase mb-3">Thương Hiệu</h4>
            <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <label 
                *ngFor="let brand of brands()" 
                class="flex items-center gap-2 text-xs text-slate-700 hover:text-[#E30019] cursor-pointer py-1">
                <input 
                  type="radio" 
                  name="brand" 
                  [value]="brand.id" 
                  [ngModel]="selectedBrandId()" 
                  (ngModelChange)="onBrandSelect(brand.id)"
                  class="accent-[#E30019]" />
                <span>{{ brand.name }}</span>
              </label>
            </div>
          </div>

          <!-- Price Range Filter -->
          <div>
            <h4 class="text-xs font-bold text-slate-700 uppercase mb-3">Khoảng Giá</h4>
            <div class="space-y-2 text-xs font-semibold">
              <button 
                (click)="setPriceRange(0, 15000000)"
                [class.text-[#E30019]]="maxPrice() === 15000000"
                class="block text-left w-full hover:text-[#E30019] py-1">
                • Dưới 15 Triệu
              </button>
              <button 
                (click)="setPriceRange(15000000, 35000000)"
                [class.text-[#E30019]]="minPrice() === 15000000 && maxPrice() === 35000000"
                class="block text-left w-full hover:text-[#E30019] py-1">
                • Từ 15 - 35 Triệu
              </button>
              <button 
                (click)="setPriceRange(35000000, 100000000)"
                [class.text-[#E30019]]="minPrice() === 35000000"
                class="block text-left w-full hover:text-[#E30019] py-1">
                • Trên 35 Triệu
              </button>
            </div>
          </div>
        </aside>

        <!-- MAIN PRODUCT CATALOG -->
        <main class="lg:col-span-9 space-y-6">
          <!-- Toolbar (Sort & Count) -->
          <div class="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div class="text-xs text-slate-600 font-bold">
              Hiển thị <strong class="text-slate-900 font-black">{{ products().length }}</strong> sản phẩm
            </div>

            <!-- Sort By -->
            <div class="flex items-center gap-2 text-xs">
              <span class="text-slate-500 font-semibold">Sắp xếp:</span>
              <select 
                [ngModel]="sortBy()" 
                (ngModelChange)="onSortChange($event)"
                class="bg-slate-50 border border-gray-200 text-slate-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#E30019] cursor-pointer">
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
            </div>
          </div>

          <!-- Product Grid -->
          <div *ngIf="products().length > 0; else emptyState" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            <div *ngFor="let p of products()" class="p-5 flex flex-col justify-between group relative bg-white border border-red-500/80 rounded-3xl hover:shadow-xl hover:-translate-y-0.5 transition-all h-full min-h-[430px]">
              <!-- Discount Badge -->
              <span *ngIf="p.discountPercentage" class="absolute top-3 left-3 z-10 bg-[#E30019] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                -{{ p.discountPercentage }}%
              </span>

              <div>
                <!-- Thumbnail -->
                <a [routerLink]="['/products', p.slug]" class="block relative overflow-hidden rounded-2xl bg-slate-50 h-52 mb-4">
                  <img [src]="getProductImage(p)" (error)="onProductImageError($event)" [alt]="p.name" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-3" />
                </a>

                <!-- Brand & Name -->
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{{ p.brand?.name || 'TechZone' }}</span>
                <h3 class="text-sm font-black text-slate-950 line-clamp-2 hover:text-[#E30019] transition-colors mt-1 leading-snug min-h-[40px]">
                  <a [routerLink]="['/products', p.slug]">{{ p.name }}</a>
                </h3>
              </div>

              <!-- Price & Add to Cart -->
              <div class="mt-4 pt-3 border-t border-gray-100 space-y-3">
                <div>
                  <div class="text-lg font-black text-[#E30019]">
                    {{ (p.promotionPrice || p.originalPrice) | number:'1.0-0' }}đ
                  </div>
                  <div *ngIf="p.originalPrice && p.promotionPrice" class="text-[10px] text-slate-400 line-through">
                    {{ p.originalPrice | number:'1.0-0' }}đ
                  </div>
                </div>

                <button 
                  (click)="addToCart(p, $event)"
                  class="w-full bg-slate-950 hover:bg-[#E30019] text-white font-black text-xs py-2.5 rounded-2xl transition-colors shadow cursor-pointer flex items-center justify-center gap-1.5">
                  <i class="pi pi-shopping-cart text-xs"></i>
                  <span>THÊM VÀO GIỎ</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <ng-template #emptyState>
            <div class="bg-white border border-gray-100 rounded-2xl p-12 text-center space-y-3">
              <i class="pi pi-inbox text-4xl text-slate-300"></i>
              <h3 class="text-sm font-bold text-slate-700">Không tìm thấy sản phẩm phù hợp</h3>
              <p class="text-xs text-slate-400">Vui lòng thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
              <button (click)="resetFilters()" class="bg-[#E30019] text-white font-bold text-xs px-4 py-2 rounded-xl">Xóa bộ lọc</button>
            </div>
          </ng-template>
        </main>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  readonly productPlaceholder = 'assets/placeholder-product.svg';

  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  products = signal<Product[]>([]);
  cartToast = signal<{ type: 'success' | 'error'; title: string; message: string; product?: Product } | null>(null);

  searchQuery: string = '';
  selectedCategoryId = signal<number | undefined>(undefined);
  selectedBrandId = signal<number | undefined>(undefined);
  minPrice = signal<number | undefined>(undefined);
  maxPrice = signal<number | undefined>(undefined);
  search = signal<string | undefined>(undefined);
  sortBy = signal<string>('newest');

  constructor(
    private productService: ProductService,
    public cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productService.getCategories().subscribe(res => {
      this.categories.set(res);
      this.resolveParams();
    });
    this.productService.getBrands().subscribe(res => this.brands.set(res));

    this.route.queryParams.subscribe(() => {
      this.resolveParams();
    });
  }

  private toSlug(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  getProductImage(product?: Product | null): string {
    const thumbnail = product?.thumbnail?.trim();
    return thumbnail ? thumbnail : this.productPlaceholder;
  }

  onProductImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.endsWith(this.productPlaceholder)) {
      img.src = this.productPlaceholder;
    }
  }

  private resolveParams(): void {
    const params = this.route.snapshot.queryParams;
    if (params['category']) {
      const catParam = params['category'].toString().toLowerCase().trim();
      const foundCat = this.categories().find(c => 
        (c.slug && c.slug.toLowerCase().trim() === catParam) || 
        (c.name && this.toSlug(c.name) === catParam) ||
        (c.name && c.name.toLowerCase().replace(/\s+/g, '-') === catParam) ||
        c.id.toString() === catParam
      );
      if (foundCat) {
        this.selectedCategoryId.set(foundCat.id);
      } else {
        this.selectedCategoryId.set(params['categoryId'] ? Number(params['categoryId']) : undefined);
      }
    } else if (params['categoryId']) {
      this.selectedCategoryId.set(Number(params['categoryId']));
    } else {
      this.selectedCategoryId.set(undefined);
    }

    this.selectedBrandId.set(params['brandId'] ? Number(params['brandId']) : undefined);
    if (params['search']) {
      this.searchQuery = params['search'];
      this.search.set(params['search']);
    } else {
      this.searchQuery = '';
      this.search.set(undefined);
    }
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.filterProducts({
      categoryId: this.selectedCategoryId(),
      brandId: this.selectedBrandId(),
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      search: this.search(),
      sortBy: this.sortBy(),
      page: 0,
      size: 20
    }).subscribe(res => {
      this.products.set(res.content);
    });
  }

  onSearchInput(): void {
    this.search.set(this.searchQuery.trim() || undefined);
    this.loadProducts();
  }

  onCategorySelect(catId: number): void {
    this.selectedCategoryId.set(catId);
    const cat = this.categories().find(c => c.id === catId);
    const catSlug = cat?.slug || (cat?.name ? this.toSlug(cat.name) : catId);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: catSlug, categoryId: null },
      queryParamsHandling: 'merge'
    });
  }

  onBrandSelect(brandId: number): void {
    this.selectedBrandId.set(brandId);
    this.loadProducts();
  }

  setPriceRange(min?: number, max?: number): void {
    this.minPrice.set(min);
    this.maxPrice.set(max);
    this.loadProducts();
  }

  onSortChange(value: string): void {
    this.sortBy.set(value);
    this.loadProducts();
  }

  resetFilters(): void {
    this.selectedCategoryId.set(undefined);
    this.selectedBrandId.set(undefined);
    this.minPrice.set(undefined);
    this.maxPrice.set(undefined);
    this.search.set(undefined);
    this.searchQuery = '';
    this.sortBy.set('newest');
    this.router.navigate(['/products']);
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart(product).subscribe({
      next: () => this.showCartToast('success', 'Đã thêm vào giỏ hàng', 'Sản phẩm đã được thêm thành công.', product),
      error: () => this.showCartToast('error', 'Không thể thêm vào giỏ', 'Vui lòng thử lại sau.')
    });
  }

  private showCartToast(type: 'success' | 'error', title: string, message: string, product?: Product): void {
    this.cartToast.set({ type, title, message, product });
    setTimeout(() => this.cartToast.set(null), 5000);
  }
}

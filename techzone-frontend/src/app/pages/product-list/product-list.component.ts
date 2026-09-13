import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
    <div class="max-w-[1440px] mx-auto px-4 py-6 pb-8">
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
      <div class="space-y-5 animate-fade-in">
      <!-- Title & Breadcrumb Bar -->
      <div class="space-y-2 border-b border-gray-200 pb-4">
        <nav class="text-[11px] font-semibold text-slate-400 flex items-center gap-2">
          <a routerLink="/" class="hover:text-[#E30019]">Trang chủ</a>
          <i class="pi pi-chevron-right text-[9px]"></i>
          <span class="text-slate-700">Danh mục sản phẩm</span>
        </nav>
        <div class="border-l-4 border-[#E30019] pl-4">
          <h1 class="text-2xl font-black text-gray-800 uppercase tracking-wide leading-tight">Danh Mục Sản Phẩm</h1>
          <p class="text-xs text-slate-500 mt-1">Khám phá các thiết bị Gaming & Linh kiện PC cao cấp tại TechZone</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- SIDEBAR FILTERS -->
        <aside class="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-6 lg:sticky lg:top-28 self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto filter-sidebar-scroll">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 class="text-xs font-black uppercase text-gray-800 flex items-center gap-2">
              <i class="pi pi-filter-fill text-[#E30019]"></i> Bộ Lọc Tìm Kiếm
            </h3>
            <button (click)="resetFilters()" class="text-[10px] font-bold text-[#E30019] hover:underline">Xóa tất cả</button>
          </div>

          <div *ngIf="selectedCategoryIds().length || selectedBrandIds().length || minPrice() !== undefined || maxPrice() !== undefined"
            class="space-y-2 border-b border-gray-100 pb-4" aria-live="polite">
            <h4 class="text-xs font-bold text-slate-700 uppercase">Đã chọn</h4>
            <div class="flex flex-wrap gap-2">
              <button *ngFor="let cat of selectedCategories()" type="button" (click)="onCategoryToggle(cat.id)"
                [attr.aria-label]="'Bỏ danh mục ' + cat.name"
                class="text-xs text-[#E30019] bg-red-50 border border-red-100 rounded-lg px-2 py-1.5">
                Danh mục: {{ cat.name }} <span aria-hidden="true">×</span>
              </button>
              <button *ngFor="let brand of selectedBrands()" type="button" (click)="onBrandToggle(brand.id)"
                [attr.aria-label]="'Bỏ thương hiệu ' + brand.name"
                class="text-xs text-[#E30019] bg-red-50 border border-red-100 rounded-lg px-2 py-1.5">
                Thương hiệu: {{ brand.name }} <span aria-hidden="true">×</span>
              </button>
              <button *ngIf="minPrice() !== undefined || maxPrice() !== undefined" type="button"
                (click)="setPriceRange(undefined, undefined)" aria-label="Bỏ khoảng giá"
                class="text-xs text-slate-700 bg-slate-100 rounded-lg px-2 py-1.5">
                Giá: {{ priceFilterLabel() }} <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>

          <!-- Category Filter -->
          <div>
            <h4 class="text-xs font-bold text-slate-700 uppercase mb-3">Danh Mục</h4>
            <div class="space-y-1.5">
              <label class="flex items-center gap-2 text-xs cursor-pointer py-1.5 px-2 rounded-xl border border-transparent"
                [class.bg-red-50]="selectedCategoryIds().length === 0"
                [class.text-red-600]="selectedCategoryIds().length === 0">
                <input type="checkbox" name="allCategories"
                  [checked]="selectedCategoryIds().length === 0"
                  (change)="selectAllCategories($event)"
                  class="accent-[#E30019] w-4 h-4 shrink-0" />
                <span>Tất cả</span>
              </label>
              <label 
                *ngFor="let cat of visibleCategories()" 
                [ngClass]="{
                  'bg-red-50 text-[#E30019] border-red-100 font-black': selectedCategoryIds().includes(cat.id),
                  'border-transparent hover:bg-slate-50': !selectedCategoryIds().includes(cat.id)
                }"
                class="flex items-center justify-between gap-2 text-xs text-slate-700 hover:text-[#E30019] cursor-pointer py-1.5 px-2 rounded-xl border transition-colors">
                <span class="flex items-center gap-2 min-w-0">
                <input 
                  type="checkbox" 
                  name="category" 
                  [value]="cat.id" 
                  [checked]="selectedCategoryIds().includes(cat.id)"
                  (change)="onCategoryToggle(cat.id)"
                  class="accent-[#E30019] w-4 h-4 shrink-0" />
                <span class="truncate">{{ cat.name }}</span>
                </span>
                <span class="text-[10px] text-slate-400 bg-white border border-slate-100 rounded-full px-1.5">{{ getCategoryCount(cat.id) }}</span>
              </label>
              <button *ngIf="categories().length > 6" type="button"
                (click)="showAllCategories.set(!showAllCategories())" [attr.aria-expanded]="showAllCategories()"
                class="text-xs font-bold text-[#E30019] hover:underline px-2 pt-2">
                {{ showAllCategories() ? 'Thu gọn' : 'Xem thêm (' + (categories().length - 6) + ')' }}
              </button>
            </div>
          </div>

          <!-- Brand Filter -->
          <div class="border-t border-gray-100 pt-5">
            <h4 class="text-xs font-bold text-slate-700 uppercase mb-3">Thương Hiệu</h4>
            <div class="space-y-1.5">
              <label class="flex items-center gap-2 text-xs cursor-pointer py-1.5 px-2 rounded-xl border border-transparent"
                [class.bg-red-50]="selectedBrandIds().length === 0"
                [class.text-red-600]="selectedBrandIds().length === 0">
                <input type="checkbox" name="allBrands"
                  [checked]="selectedBrandIds().length === 0"
                  (change)="selectAllBrands($event)"
                  class="accent-[#E30019] w-4 h-4 shrink-0" />
                <span>Tất cả</span>
              </label>
              <label 
                *ngFor="let brand of visibleBrands()" 
                [ngClass]="{
                  'bg-red-50 text-[#E30019] border-red-100 font-black': selectedBrandIds().includes(brand.id),
                  'border-transparent hover:bg-slate-50': !selectedBrandIds().includes(brand.id)
                }"
                class="flex items-center justify-between gap-2 text-xs text-slate-700 hover:text-[#E30019] cursor-pointer py-1.5 px-2 rounded-xl border transition-colors">
                <span class="flex items-center gap-2 min-w-0">
                <input 
                  type="checkbox" 
                  name="brand" 
                  [value]="brand.id" 
                  [checked]="selectedBrandIds().includes(brand.id)"
                  (change)="onBrandToggle(brand.id)"
                  class="accent-[#E30019] w-4 h-4 shrink-0" />
                <span class="truncate">{{ brand.name }}</span>
                </span>
                <span class="text-[10px] text-slate-400 bg-white border border-slate-100 rounded-full px-1.5">{{ getBrandCount(brand.id) }}</span>
              </label>
              <button *ngIf="brands().length > 6" type="button"
                (click)="showAllBrands.set(!showAllBrands())" [attr.aria-expanded]="showAllBrands()"
                class="text-xs font-bold text-[#E30019] hover:underline px-2 pt-2">
                {{ showAllBrands() ? 'Thu gọn' : 'Xem thêm (' + (brands().length - 6) + ')' }}
              </button>
            </div>
          </div>

          <!-- Price Range Filter -->
          <div>
            <h4 class="text-xs font-bold text-slate-700 uppercase mb-3">Khoảng Giá</h4>
            <div class="space-y-3 text-xs font-semibold">
              <label
                *ngFor="let range of priceRanges"
                class="flex items-center gap-3 text-slate-700 cursor-pointer hover:text-[#E30019]">
                <input
                  type="checkbox"
                  [checked]="isPriceRangeSelected(range.min, range.max)"
                  (change)="setPriceRange(range.min, range.max)"
                  class="w-5 h-5 rounded accent-[#E30019]" />
                <span>{{ range.label }}</span>
              </label>
            </div>

            <div class="mt-4 space-y-3">
              <p class="text-xs font-semibold text-slate-600">Hoặc nhập khoảng giá phù hợp với bạn:</p>
              <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <input
                  type="text"
                  [ngModel]="formatPriceInput(minPrice() || 0)"
                  (ngModelChange)="onMinPriceInput($event)"
                  class="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-center font-bold text-slate-700 focus:outline-none focus:border-[#E30019]" />
                <span class="text-slate-400 font-black">~</span>
                <input
                  type="text"
                  [ngModel]="formatPriceInput(maxPrice() || 50000000)"
                  (ngModelChange)="onMaxPriceInput($event)"
                  class="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-center font-bold text-slate-700 focus:outline-none focus:border-[#E30019]" />
              </div>
              <div class="relative h-9 pt-4">
                <div class="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-300"></div>
                <div class="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#E30019]"
                  [style.left.%]="priceMinPercent()"
                  [style.right.%]="100 - priceMaxPercent()"></div>
                <input type="range" min="0" max="50000000" step="100000"
                  [ngModel]="minPrice() || 0"
                  (ngModelChange)="onMinPriceInput($event)"
                  class="price-range-input" />
                <input type="range" min="0" max="50000000" step="100000"
                  [ngModel]="maxPrice() || 50000000"
                  (ngModelChange)="onMaxPriceInput($event)"
                  class="price-range-input" />
              </div>
            </div>
          </div>
        </aside>

        <!-- MAIN PRODUCT CATALOG -->
        <main class="lg:col-span-9 space-y-5">
          <!-- Toolbar (Sort & Count) -->
          <div class="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-sm">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs text-slate-600 font-bold">
              Hiển thị <strong class="text-slate-900 font-black">{{ products().length }}</strong> / {{ totalElements() }} sản phẩm
            </div>

            <!-- Sort By -->
            <div class="flex items-center gap-2 text-xs flex-wrap justify-end">
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
          </div>

          <!-- Product Grid -->
          <div *ngIf="products().length > 0; else emptyState" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <div *ngFor="let p of products()" class="p-4 flex flex-col justify-between group relative bg-white border border-slate-200 rounded-3xl hover:border-red-500 hover:shadow-xl hover:-translate-y-0.5 transition-all h-full min-h-[405px]">
              <!-- Discount Badge -->
              <span *ngIf="p.discountPercentage" class="absolute top-3 left-3 z-10 bg-[#E30019] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                -{{ p.discountPercentage }}%
              </span>

              <div>
                <!-- Thumbnail -->
                <button type="button" class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 border border-slate-200 text-slate-400 hover:text-[#E30019] hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                  <i class="pi pi-heart text-xs"></i>
                </button>
                <a [routerLink]="['/products', p.slug]" class="block relative overflow-hidden rounded-2xl bg-slate-50 h-44 mb-4">
                  <img [src]="getProductImage(p)" (error)="onProductImageError($event)" [alt]="p.name" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-4" />
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
                  class="w-full h-10 bg-slate-950 hover:bg-[#E30019] text-white font-black text-xs rounded-2xl transition-colors shadow cursor-pointer flex items-center justify-center gap-1.5">
                  <i class="pi pi-shopping-cart text-xs"></i>
                  <span>THÊM VÀO GIỎ</span>
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="totalPages() > 1" class="flex items-center justify-center gap-2 pt-3">
            <button type="button" (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 0" class="h-11 px-5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#E30019]">
              Trước
            </button>
            <ng-container *ngFor="let page of paginationItems()">
              <span *ngIf="page === '...'" class="px-2 text-slate-400 font-black">...</span>
              <button *ngIf="page !== '...'" type="button" (click)="goToPage(+page - 1)"
                [ngClass]="currentPage() === (+page - 1) ? 'border-slate-950 text-slate-950 ring-1 ring-slate-950' : 'border-slate-200 text-slate-900 hover:border-[#E30019] hover:text-[#E30019]'"
                class="w-11 h-11 rounded-xl border bg-white font-bold transition-colors">
                {{ page }}
              </button>
            </ng-container>
            <button type="button" (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() >= totalPages() - 1" class="h-11 px-5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#E30019]">
              Sau
            </button>
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
  `,
  styles: [`
    .price-range-input {
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      height: 28px;
      left: 0;
      margin: 0;
      pointer-events: none;
      position: absolute;
      right: 0;
      top: 2px;
      width: 100%;
      z-index: 2;
    }

    .price-range-input::-webkit-slider-runnable-track {
      background: transparent;
      border: 0;
      height: 4px;
    }

    .price-range-input::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      background: #ffffff;
      border: 4px solid #E30019;
      border-radius: 9999px;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.18);
      cursor: pointer;
      height: 18px;
      margin-top: -7px;
      pointer-events: auto;
      width: 18px;
    }

    .price-range-input::-moz-range-track {
      background: transparent;
      border: 0;
      height: 4px;
    }

    .price-range-input::-moz-range-thumb {
      background: #ffffff;
      border: 4px solid #E30019;
      border-radius: 9999px;
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.18);
      cursor: pointer;
      height: 18px;
      pointer-events: auto;
      width: 18px;
    }

    .filter-sidebar-scroll {
      scrollbar-width: thin;
      scrollbar-color: rgba(148, 163, 184, 0.45) transparent;
    }

    .filter-sidebar-scroll::-webkit-scrollbar {
      width: 6px;
    }

    .filter-sidebar-scroll::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.45);
      border-radius: 9999px;
    }

    .filter-sidebar-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
  `]
})
export class ProductListComponent implements OnInit {
  readonly productPlaceholder = 'assets/placeholder-product.svg';

  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  products = signal<Product[]>([]);
  catalogProducts = signal<Product[]>([]);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  pageSize = signal(20);
  showAllCategories = signal(false);
  showAllBrands = signal(false);
  cartToast = signal<{ type: 'success' | 'error'; title: string; message: string; product?: Product } | null>(null);

  searchQuery: string = '';
  selectedCategoryIds = signal<number[]>([]);
  selectedBrandIds = signal<number[]>([]);
  minPrice = signal<number | undefined>(undefined);
  maxPrice = signal<number | undefined>(undefined);
  search = signal<string | undefined>(undefined);
  sortBy = signal<string>('newest');
  priceRanges = [
    { label: 'Tất cả', min: undefined, max: undefined },
    { label: 'Dưới 5 triệu', min: 0, max: 5000000 },
    { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
    { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
    { label: '20 - 30 triệu', min: 20000000, max: 30000000 },
    { label: 'Trên 30 triệu', min: 30000000, max: 100000000 }
  ];

  constructor(
    private productService: ProductService,
    public cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.productService.getCategories().subscribe(res => {
      this.categories.set(res);
      this.resolveParams();
    });
    this.productService.getBrands().subscribe(res => this.brands.set(res));
    this.productService.filterProducts({ page: 0, size: 1000 }).subscribe(res => this.catalogProducts.set(res.content));

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
    if (this.isBrokenPlaceholderImage(thumbnail)) return this.productPlaceholder;
    return thumbnail ? thumbnail : this.productPlaceholder;
  }

  private isBrokenPlaceholderImage(url?: string): boolean {
    if (!url) return true;
    const normalized = url.toLowerCase();
    return normalized.includes('placeholder') ||
      normalized.includes('placehold.co') ||
      normalized.includes('via.placeholder') ||
      normalized.includes('no-image') ||
      normalized.includes('default-product');
  }

  onProductImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.endsWith(this.productPlaceholder)) {
      img.src = this.productPlaceholder;
    }
  }

  private resolveParams(): void {
    const params = this.route.snapshot.queryParams;
    if (params['categoryIds']) {
      this.selectedCategoryIds.set(this.parseIds(params['categoryIds']));
    } else if (params['category']) {
      const catParam = params['category'].toString().toLowerCase().trim();
      const foundCat = this.categories().find(c => 
        (c.slug && c.slug.toLowerCase().trim() === catParam) || 
        (c.name && this.toSlug(c.name) === catParam) ||
        (c.name && c.name.toLowerCase().replace(/\s+/g, '-') === catParam) ||
        c.id.toString() === catParam
      );
      if (foundCat) {
        this.selectedCategoryIds.set([foundCat.id]);
      } else {
        this.selectedCategoryIds.set(this.parseIds(params['categoryId']));
      }
    } else if (params['categoryId']) {
      this.selectedCategoryIds.set(this.parseIds(params['categoryId']));
    } else {
      this.selectedCategoryIds.set([]);
    }

    this.selectedBrandIds.set(this.parseIds(params['brandIds'] || params['brandId']));
    this.minPrice.set(params['minPrice'] ? Number(params['minPrice']) : undefined);
    this.maxPrice.set(params['maxPrice'] ? Number(params['maxPrice']) : undefined);
    this.sortBy.set(params['sort'] || params['sortBy'] || 'newest');
    this.currentPage.set(params['page'] ? Number(params['page']) : 0);
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
      categoryIds: this.selectedCategoryIds(),
      brandIds: this.selectedBrandIds(),
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      search: this.search(),
      sortBy: this.sortBy(),
      page: this.currentPage(),
      size: this.pageSize()
    }).subscribe(res => {
      this.products.set(res.content);
      this.totalElements.set(res.totalElements || res.content.length);
      this.totalPages.set(res.totalPages || 1);
    });
  }

  onSearchInput(): void {
    this.search.set(this.searchQuery.trim() || undefined);
    this.currentPage.set(0);
    this.updateQueryParams();
  }

  private parseIds(value: unknown): number[] {
    return [...new Set(String(value || '').split(',').map(Number).filter(id => Number.isInteger(id) && id > 0))];
  }

  selectAllCategories(event: Event): void {
    this.selectedCategoryIds.set([]);
    (event.target as HTMLInputElement).checked = true;
    this.currentPage.set(0);
    this.updateQueryParams();
  }

  selectAllBrands(event: Event): void {
    this.selectedBrandIds.set([]);
    (event.target as HTMLInputElement).checked = true;
    this.currentPage.set(0);
    this.updateQueryParams();
  }

  onCategoryToggle(catId: number): void {
    this.selectedCategoryIds.update(ids => ids.includes(catId) ? ids.filter(id => id !== catId) : [...ids, catId]);
    this.currentPage.set(0);
    this.updateQueryParams();
  }

  onBrandToggle(brandId: number): void {
    this.selectedBrandIds.update(ids => ids.includes(brandId) ? ids.filter(id => id !== brandId) : [...ids, brandId]);
    this.currentPage.set(0);
    this.updateQueryParams();
  }

  setPriceRange(min?: number, max?: number): void {
    this.minPrice.set(min);
    this.maxPrice.set(max);
    this.currentPage.set(0);
    this.updateQueryParams();
  }

  onSortChange(value: string): void {
    this.sortBy.set(value);
    this.currentPage.set(0);
    this.updateQueryParams();
  }

  onMinPriceInput(value: number | string): void {
    const price = Math.max(0, Math.min(this.parsePriceInput(value), 50000000));
    const currentMax = this.maxPrice() || 50000000;
    this.minPrice.set(price > 0 ? Math.min(price, currentMax) : undefined);
    this.currentPage.set(0);
    this.updateQueryParams();
  }

  onMaxPriceInput(value: number | string): void {
    const price = Math.max(0, Math.min(this.parsePriceInput(value), 50000000));
    const currentMin = this.minPrice() || 0;
    this.maxPrice.set(price > 0 ? Math.max(price, currentMin) : undefined);
    this.currentPage.set(0);
    this.updateQueryParams();
  }

  loadMore(): void {
    const nextPage = this.currentPage() + 1;
    this.productService.filterProducts({
      categoryIds: this.selectedCategoryIds(),
      brandIds: this.selectedBrandIds(),
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      search: this.search(),
      sortBy: this.sortBy(),
      page: nextPage,
      size: this.pageSize()
    }).subscribe(res => {
      this.products.set([...this.products(), ...res.content]);
      this.totalElements.set(res.totalElements || this.products().length);
      this.currentPage.set(nextPage);
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages() || page === this.currentPage()) return;
    this.currentPage.set(page);
    this.updateQueryParams();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetFilters(): void {
    this.selectedCategoryIds.set([]);
    this.selectedBrandIds.set([]);
    this.minPrice.set(undefined);
    this.maxPrice.set(undefined);
    this.search.set(undefined);
    this.searchQuery = '';
    this.sortBy.set('newest');
    this.currentPage.set(0);
    this.updateQueryParams();
  }

  visibleCategories(): Category[] {
    return this.showAllCategories() ? this.categories() : this.categories().slice(0, 6);
  }

  visibleBrands(): Brand[] {
    return this.showAllBrands() ? this.brands() : this.brands().slice(0, 6);
  }

  selectedCategories(): Category[] {
    return this.categories().filter(cat => this.selectedCategoryIds().includes(cat.id));
  }

  selectedBrands(): Brand[] {
    return this.brands().filter(brand => this.selectedBrandIds().includes(brand.id));
  }

  getCategoryCount(categoryId: number): number {
    return this.catalogProducts().filter(p => p.category?.id === categoryId).length;
  }

  getBrandCount(brandId: number): number {
    return this.catalogProducts().filter(p => p.brand?.id === brandId).length;
  }

  isPriceRangeSelected(min?: number, max?: number): boolean {
    return this.minPrice() === min && this.maxPrice() === max;
  }

  formatPriceInput(value: number): string {
    return `${value.toLocaleString('vi-VN')}đ`;
  }

  parsePriceInput(value: number | string): number {
    if (typeof value === 'number') return value;
    const parsed = Number(value.replace(/[^\d]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  priceMinPercent(): number {
    const min = Math.min(this.minPrice() || 0, 50000000);
    return Math.max(0, Math.min(100, (min / 50000000) * 100));
  }

  priceMaxPercent(): number {
    const max = Math.min(this.maxPrice() || 50000000, 50000000);
    return Math.max(0, Math.min(100, (max / 50000000) * 100));
  }

  priceFilterLabel(): string {
    const selected = this.priceRanges.find(r => this.isPriceRangeSelected(r.min, r.max));
    if (selected && selected.label !== 'Tất cả') return selected.label;
    return `${this.formatPriceInput(this.minPrice() || 0)} - ${this.formatPriceInput(this.maxPrice() || 50000000)}`;
  }

  paginationItems(): Array<number | '...'> {
    const total = this.totalPages();
    const current = this.currentPage() + 1;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: Array<number | '...'> = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) pages.push('...');
    for (let page = start; page <= end; page++) pages.push(page);
    if (end < total - 1) pages.push('...');
    pages.push(total);
    return pages;
  }

  private updateQueryParams(): void {
    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: {
        category: null,
        categoryIds: this.selectedCategoryIds().join(',') || null,
        categoryId: null,
        brandId: null,
        brandIds: this.selectedBrandIds().join(',') || null,
        search: this.search() || null,
        minPrice: this.minPrice() || null,
        maxPrice: this.maxPrice() || null,
        sort: this.sortBy() !== 'newest' ? this.sortBy() : null,
        page: this.currentPage() > 0 ? this.currentPage() : null
      },
      queryParamsHandling: 'merge'
    });
    this.location.replaceState(this.router.serializeUrl(urlTree));
    this.loadProducts();
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

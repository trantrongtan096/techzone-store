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
          <div *ngIf="products().length > 0; else emptyState" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <div *ngFor="let p of products()" class="tech-card p-4 flex flex-col justify-between group relative bg-white border border-gray-100 rounded-lg">
              <!-- Discount Badge -->
              <span *ngIf="p.discountPercentage" class="absolute top-3 left-3 z-10 bg-[#E30019] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                -{{ p.discountPercentage }}%
              </span>

              <div>
                <!-- Thumbnail -->
                <a [routerLink]="['/products', p.slug]" class="block relative overflow-hidden rounded-md bg-slate-50 aspect-video mb-3">
                  <img [src]="p.thumbnail" [alt]="p.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </a>

                <!-- Brand & Name -->
                <span class="text-[10px] font-bold text-[#E30019] uppercase tracking-widest block">{{ p.brand?.name }}</span>
                <h3 class="text-xs font-bold text-gray-800 line-clamp-2 hover:text-[#E30019] transition-colors mt-1 leading-tight">
                  <a [routerLink]="['/products', p.slug]">{{ p.name }}</a>
                </h3>
              </div>

              <!-- Price & Add to Cart -->
              <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <div>
                  <div class="text-sm font-black text-[#E30019]">
                    {{ (p.promotionPrice || p.originalPrice) | number:'1.0-0' }}đ
                  </div>
                  <div *ngIf="p.originalPrice && p.promotionPrice" class="text-[10px] text-slate-400 line-through">
                    {{ p.originalPrice | number:'1.0-0' }}đ
                  </div>
                </div>

                <button 
                  (click)="addToCart(p, $event)"
                  class="bg-[#E30019] hover:bg-red-700 text-white p-2.5 rounded-xl transition-colors shadow cursor-pointer">
                  <i class="pi pi-shopping-cart text-xs"></i>
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
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  products = signal<Product[]>([]);

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
    this.cartService.addToCart(product).subscribe();
  }
}

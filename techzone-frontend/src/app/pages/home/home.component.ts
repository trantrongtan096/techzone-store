import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { HomeService, Banner } from '../../services/home.service';
import { HomepageBuilderService, ProductShelf } from '../../services/homepage-builder.service';
import { Category, Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-10 pb-12 animate-fade-in">
      
      <!-- DYNAMIC BLOCKS ORDER RENDERER -->
      <ng-container *ngFor="let blk of activeSortedBlocks()">
        
        <!-- 1. HERO BANNER SLIDER -->
        <section *ngIf="blk.type === 'HERO_SLIDER'" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Main Banner Carousel Container -->
          <div class="lg:col-span-8 relative rounded-2xl overflow-hidden shadow-sm h-[320px] md:h-[400px] group border-0 bg-transparent">
            
            <!-- Slide Image Area -->
            <a [routerLink]="currentHeroBanner()?.targetUrl || '/products'" class="block w-full h-full relative rounded-2xl overflow-hidden">
              <img 
                [src]="currentHeroBanner()?.imageUrl || defaultHero.imageUrl" 
                [alt]="currentHeroBanner()?.title || defaultHero.title" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 rounded-2xl" />

              <!-- OPTIONAL SUBTLE OVERLAY BADGE -->
              <div 
                *ngIf="currentHeroBanner()?.showOverlay" 
                class="absolute top-4 left-4 z-10 animate-fade-in pointer-events-none">
                <div class="inline-flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 text-white shadow-lg">
                  <span class="text-amber-400 font-black text-xs shrink-0">
                    {{ currentHeroBanner()?.subtitle || '🔥 DEAL HOT:' }}
                  </span>
                  <span class="text-xs font-bold text-white line-clamp-1 drop-shadow">
                    {{ currentHeroBanner()?.title }}
                  </span>
                </div>
              </div>
            </a>

            <!-- NAVIGATION ARROWS -->
            <button 
              *ngIf="heroBanners().length > 1"
              (click)="onPrevSlide($event)"
              aria-label="Previous Slide"
              class="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-[#E30019] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md hover:scale-110">
              <i class="pi pi-chevron-left text-sm font-bold"></i>
            </button>

            <button 
              *ngIf="heroBanners().length > 1"
              (click)="onNextSlide($event)"
              aria-label="Next Slide"
              class="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-[#E30019] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md hover:scale-110">
              <i class="pi pi-chevron-right text-sm font-bold"></i>
            </button>

            <!-- DASH INDICATORS -->
            <div *ngIf="heroBanners().length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-950/50 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-full shadow-lg animate-fade-in">
              <button 
                *ngFor="let item of heroBanners(); let i = index" 
                (click)="onSelectSlide(i, $event)"
                [attr.aria-label]="'Go to slide ' + (i + 1)"
                [ngClass]="{
                  'w-8 bg-[#E30019] shadow-md': currentBannerIndex() === i,
                  'w-2.5 bg-white/40 hover:bg-white/80': currentBannerIndex() !== i
                }"
                class="h-2 rounded-full transition-all duration-300 cursor-pointer border-0 p-0 block">
              </button>
            </div>
          </div>

          <!-- Side Promo Cards -->
          <div class="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <!-- Card Top -->
            <a [routerLink]="sideTopBanner()?.targetUrl || '/products'" class="border-0 rounded-2xl relative overflow-hidden block shadow-sm hover:shadow-md transition-all group min-h-[190px] h-full bg-transparent">
              <img *ngIf="sideTopBanner()?.imageUrl" [src]="sideTopBanner()?.imageUrl" [alt]="sideTopBanner()?.title || 'Banner Side Top'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl" />
              
              <div *ngIf="sideTopBanner()?.showOverlay && sideTopBanner()?.imageUrl" class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent p-4 flex flex-col justify-end text-white animate-fade-in pointer-events-none rounded-2xl">
                <span class="text-amber-400 font-bold text-xs tracking-wider uppercase drop-shadow-xs">{{ sideTopBanner()?.subtitle || 'DEAL HOT MỖI NGÀY' }}</span>
                <h3 class="text-base font-black text-white mt-0.5 drop-shadow-md leading-tight line-clamp-1">{{ sideTopBanner()?.title }}</h3>
              </div>

              <div *ngIf="!sideTopBanner()?.imageUrl" class="p-5 flex flex-col justify-between h-full bg-slate-900 text-white rounded-2xl">
                <span class="text-amber-400 font-bold text-xs tracking-wider uppercase">{{ sideTopBanner()?.subtitle || 'DEAL HOT MỖI NGÀY' }}</span>
                <h3 class="text-base font-black text-white mt-1">{{ sideTopBanner()?.title || 'PC Build Sẵn Giảm Đến 7 Trđ' }}</h3>
                <span class="text-xs font-bold text-yellow-300 inline-flex items-center gap-1 mt-3">
                  Xem ngay <i class="pi pi-chevron-right text-[10px]"></i>
                </span>
              </div>
            </a>

            <!-- Card Bottom -->
            <a [routerLink]="sideBottomBanner()?.targetUrl || '/products'" class="border-0 rounded-2xl relative overflow-hidden block shadow-sm hover:shadow-md transition-all group min-h-[190px] h-full bg-transparent">
              <img *ngIf="sideBottomBanner()?.imageUrl" [src]="sideBottomBanner()?.imageUrl" [alt]="sideBottomBanner()?.title || 'Banner Side Bottom'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl" />
              
              <div *ngIf="sideBottomBanner()?.showOverlay && sideBottomBanner()?.imageUrl" class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent p-4 flex flex-col justify-end text-white animate-fade-in pointer-events-none rounded-2xl">
                <span class="text-amber-400 font-bold text-xs tracking-wider uppercase drop-shadow-xs">{{ sideBottomBanner()?.subtitle || 'KHUYẾN MÃI KHỦNG' }}</span>
                <h3 class="text-base font-black text-white mt-0.5 drop-shadow-md leading-tight line-clamp-1">{{ sideBottomBanner()?.title }}</h3>
              </div>

              <div *ngIf="!sideBottomBanner()?.imageUrl" class="p-5 flex flex-col justify-between h-full bg-slate-900 text-white rounded-2xl">
                <span class="text-amber-400 font-bold text-xs tracking-wider uppercase">KHUYẾN MÃI KHỦNG</span>
                <h3 class="text-base font-black text-white mt-1">{{ sideBottomBanner()?.title || 'VGA RTX 40 Series Giá Tốt' }}</h3>
                <span class="text-xs font-bold text-yellow-300 inline-flex items-center gap-1 mt-3">
                  Săn ngay <i class="pi pi-chevron-right text-[10px]"></i>
                </span>
              </div>
            </a>
          </div>
        </section>

        <!-- 2. THANH CAM KẾT DỊCH VỤ (SERVICE COMMITMENT BAR) -->
        <section *ngIf="blk.type === 'USP_BAR'" class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div *ngFor="let usp of builderService.usps(); let idx = index" class="flex items-center gap-3.5 pt-2 md:pt-0 md:px-2 group">
              <div 
                [ngClass]="{
                  'bg-red-50 text-[#E30019] group-hover:bg-[#E30019]': idx === 0,
                  'bg-amber-50 text-amber-600 group-hover:bg-amber-500': idx === 1,
                  'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600': idx === 2,
                  'bg-purple-50 text-purple-600 group-hover:bg-purple-600': idx === 3
                }"
                class="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 group-hover:text-white transition-all shadow-xs">
                {{ usp.icon }}
              </div>
              <div>
                <h4 class="text-xs font-black text-slate-900 uppercase tracking-wide">{{ usp.title }}</h4>
                <p class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{{ usp.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. LƯỚI DANH MỤC NỔI BẬT (QUICK CATEGORY GRID) -->
        <section *ngIf="blk.type === 'QUICK_CATEGORIES'" class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>⚡ DANH MỤC SẢN PHẨM NỔI BẬT</span>
            </h3>
            <a routerLink="/products" class="text-xs font-bold text-[#E30019] hover:underline flex items-center gap-1">
              Tất cả danh mục <i class="pi pi-chevron-right text-[10px]"></i>
            </a>
          </div>

          <div class="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-7 gap-3">
            <a 
              *ngFor="let cat of quickCategories" 
              [routerLink]="['/products']" 
              [queryParams]="{ category: cat.slug }"
              class="bg-white border border-slate-200/80 hover:border-[#E30019] rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all group hover:shadow-md cursor-pointer">
              <div class="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-red-50 flex items-center justify-center text-2xl mb-2 transition-transform group-hover:scale-110 shadow-xs">
                {{ cat.icon }}
              </div>
              <span class="text-xs font-bold text-slate-800 group-hover:text-[#E30019] line-clamp-1">
                {{ cat.name }}
              </span>
            </a>
          </div>
        </section>

        <!-- 4. FLASH SALE SECTION WITH FOMO PROGRESS BAR -->
        <section *ngIf="blk.type === 'FLASH_SALE' && isFlashSaleActive()">
          <div class="bg-[#0F172A] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white animate-fade-in">
            <!-- Flash Sale Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#E30019] text-white flex items-center justify-center text-xl shadow animate-pulse">
                  <i class="pi pi-bolt"></i>
                </div>
                <div>
                  <h2 class="text-2xl font-black text-white tracking-wide flex items-center gap-2">
                    {{ currentCampaign()?.title || 'FLASH SALE GIÁ SỐC' }}
                    <span class="text-xs font-black bg-[#E30019] text-white px-2.5 py-0.5 rounded-lg uppercase shadow">⚡ SIÊU BÃO GIÁ</span>
                  </h2>
                  <p class="text-xs text-slate-400">Chỉ có tại TechZone Premium Store - Số lượng suất có hạn</p>
                </div>
              </div>

              <!-- Countdown Timer -->
              <div class="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-2xl">
                <span class="text-[10px] font-black uppercase text-amber-400 tracking-wider">KẾT THÚC SAU:</span>
                <div class="flex items-center gap-1 font-mono font-black text-sm">
                  <span class="bg-[#E30019] text-white px-2 py-1 rounded-lg">{{ countdown().hours }}</span>
                  <span>:</span>
                  <span class="bg-[#E30019] text-white px-2 py-1 rounded-lg">{{ countdown().minutes }}</span>
                  <span>:</span>
                  <span class="bg-[#E30019] text-white px-2 py-1 rounded-lg">{{ countdown().seconds }}</span>
                </div>
              </div>
            </div>

            <!-- Flash Sale Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div 
                *ngFor="let p of flashSaleDisplayProducts(); let idx = index" 
                [routerLink]="['/products', p.slug]"
                class="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl transition-all group cursor-pointer text-slate-900 relative">
                
                <div class="relative">
                  <div class="w-full h-36 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center mb-3">
                    <img [src]="p.thumbnail" [alt]="p.name" loading="lazy" class="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  </div>

                  <span class="absolute top-1 right-1 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow">
                    🔥 GIÁ SỐC
                  </span>

                  <div class="text-xs font-bold text-slate-800 line-clamp-2 min-h-[32px]">
                    {{ p.name }}
                  </div>
                </div>

                <div class="mt-3 pt-2 border-t border-slate-100 space-y-2">
                  <div>
                    <div class="text-sm font-black text-red-600">
                      {{ (p.flashSalePrice || p.promotionPrice || p.originalPrice) | number:'1.0-0' }}đ
                    </div>
                    <div *ngIf="p.originalPrice && p.originalPrice > (p.flashSalePrice || p.promotionPrice)" class="text-[10px] text-slate-400 line-through">
                      {{ p.originalPrice | number:'1.0-0' }}đ
                    </div>
                  </div>

                  <!-- THANH TIẾN ĐỘ ĐÃ BÁN (FOMO PROGRESS BAR) -->
                  <div class="space-y-1">
                    <div class="flex items-center justify-between text-[10px] font-black">
                      <span class="text-red-600 flex items-center gap-1">
                        🔥 {{ getSoldCountLabel(idx, p) }}
                      </span>
                      <span class="text-slate-400">Còn {{ getRemainingCount(idx, p) }} suất</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        class="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 h-full rounded-full transition-all duration-500" 
                        [style.width.%]="getSoldPercentage(idx, p)">
                      </div>
                    </div>
                  </div>

                  <button 
                    (click)="onAddToCart(p, $event)"
                    class="w-full bg-slate-900 hover:bg-red-600 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow">
                    <i class="pi pi-shopping-cart text-xs"></i>
                    <span>THÊM VÀO GIỎ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 5. NÂNG CẤP KHỐI "SẢN PHẨM NỔI BẬT" THÀNH HỆ THỐNG TAB -->
        <section *ngIf="blk.type === 'FEATURED_TABS'" class="space-y-5">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <h2 class="text-xl font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span>🌟 SẢN PHẨM NỔI BẬT</span>
            </h2>

            <!-- SYSTEM TABS -->
            <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button 
                (click)="activeFeaturedTab.set('BEST_SELLER')"
                [ngClass]="{
                  'bg-[#E30019] text-white shadow-md font-black': activeFeaturedTab() === 'BEST_SELLER',
                  'text-slate-600 hover:text-slate-900 hover:bg-white/60': activeFeaturedTab() !== 'BEST_SELLER'
                }"
                class="px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
                <span>🔥 Bán Chạy Nhất</span>
              </button>

              <button 
                (click)="activeFeaturedTab.set('NEW_ARRIVALS')"
                [ngClass]="{
                  'bg-[#E30019] text-white shadow-md font-black': activeFeaturedTab() === 'NEW_ARRIVALS',
                  'text-slate-600 hover:text-slate-900 hover:bg-white/60': activeFeaturedTab() !== 'NEW_ARRIVALS'
                }"
                class="px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
                <span>✨ Hàng Mới Về</span>
              </button>

              <button 
                (click)="activeFeaturedTab.set('RECOMMENDED')"
                [ngClass]="{
                  'bg-[#E30019] text-white shadow-md font-black': activeFeaturedTab() === 'RECOMMENDED',
                  'text-slate-600 hover:text-slate-900 hover:bg-white/60': activeFeaturedTab() !== 'RECOMMENDED'
                }"
                class="px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
                <span>💡 Đề Xuất Cho Bạn</span>
              </button>
            </div>
          </div>

          <!-- Featured Products Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            <div 
              *ngFor="let p of displayedFeaturedProducts()" 
              [routerLink]="['/products', p.slug]"
              class="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl hover:border-red-500 transition-all group cursor-pointer text-slate-900">
              
              <div>
                <div class="w-full h-44 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center mb-3">
                  <img [src]="p.thumbnail" [alt]="p.name" loading="lazy" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" />
                </div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{{ p.brand?.name || 'TechZone Official' }}</span>
                <h3 class="text-xs font-bold text-slate-800 line-clamp-2 mt-0.5 min-h-[32px]">{{ p.name }}</h3>
              </div>

              <div class="mt-3 pt-2 border-t border-slate-100">
                <div class="text-sm font-black text-red-600">
                  {{ (p.promotionPrice || p.originalPrice) | number:'1.0-0' }}đ
                </div>
                <button 
                  (click)="onAddToCart(p, $event)"
                  class="w-full mt-2 bg-slate-900 hover:bg-red-600 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                  <i class="pi pi-shopping-cart text-xs"></i>
                  <span>THÊM VÀO GIỎ</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 6. KHỐI SẢN PHẨM THEO DANH MỤC (DYNAMIC CATEGORY PRODUCT SHELVES) -->
        <section *ngIf="blk.type === 'CATEGORY_SHELF' && getShelfData(blk.shelfId)" class="space-y-4 bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-sm">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-red-100 text-[#E30019] flex items-center justify-center font-bold text-lg">
                {{ getShelfData(blk.shelfId)?.icon }}
              </div>
              <div>
                <h3 class="text-lg font-black text-slate-900 uppercase">{{ getShelfData(blk.shelfId)?.title }}</h3>
                <p class="text-xs text-slate-400">Hiệu năng cao - Sản phẩm bán chạy hàng đầu TechZone</p>
              </div>
            </div>

            <!-- Quick Filters Pills -->
            <div class="flex items-center gap-1.5 flex-wrap text-xs font-bold">
              <button 
                *ngFor="let filterItem of getShelfData(blk.shelfId)?.subFilters || []"
                (click)="setShelfActiveFilter(blk.shelfId, filterItem)"
                [ngClass]="{
                  'bg-slate-900 text-white': getShelfActiveFilter(blk.shelfId) === filterItem,
                  'bg-slate-100 text-slate-600 hover:bg-slate-200': getShelfActiveFilter(blk.shelfId) !== filterItem
                }"
                class="px-3 py-1 rounded-xl transition-all cursor-pointer">
                {{ filterItem }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              *ngFor="let p of getFilteredShelfProducts(blk.shelfId)" 
              [routerLink]="['/products', p.slug]"
              class="border border-slate-100 hover:border-red-500 rounded-2xl p-3 flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer">
              <div>
                <div class="w-full h-36 rounded-xl bg-slate-50 flex items-center justify-center mb-2 overflow-hidden">
                  <img [src]="p.thumbnail" [alt]="p.name" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h4 class="text-xs font-bold text-slate-800 line-clamp-2 min-h-[32px]">{{ p.name }}</h4>
              </div>
              <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span class="text-xs font-black text-red-600">{{ (p.promotionPrice || p.originalPrice) | number:'1.0-0' }}đ</span>
                <button (click)="onAddToCart(p, $event)" class="w-8 h-8 rounded-xl bg-slate-900 hover:bg-red-600 text-white flex items-center justify-center text-xs">
                  <i class="pi pi-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 7. KHỐI TIN TỨC & ĐÁNH GIÁ CÔNG NGHỆ (TECH BLOG & REVIEWS) -->
        <section *ngIf="blk.type === 'TECH_BLOG' && activeHomepageBlogs().length > 0" class="space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 class="text-xl font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span>📰 TIN TỨC & ĐÁNH GIÁ CÔNG NGHỆ 2026</span>
            </h2>
            <a routerLink="/products" class="text-xs font-bold text-[#E30019] hover:underline flex items-center gap-1">
              Xem tất cả tin tức <i class="pi pi-arrow-right text-[10px]"></i>
            </a>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div 
              *ngFor="let article of activeHomepageBlogs()" 
              class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between">
              <div>
                <div class="h-44 w-full overflow-hidden relative">
                  <img [src]="article.image" [alt]="article.title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <span class="absolute top-3 left-3 bg-[#E30019] text-white font-bold text-[10px] px-2.5 py-1 rounded-lg uppercase shadow">
                    {{ article.category }}
                  </span>
                </div>
                <div class="p-4 space-y-2">
                  <div class="flex items-center justify-between text-[11px] text-slate-400">
                    <span>📅 {{ article.date }}</span>
                    <span>⏱️ {{ article.readTime }}</span>
                  </div>
                  <h3 class="text-xs font-bold text-slate-900 group-hover:text-[#E30019] transition-colors leading-snug line-clamp-2">
                    {{ article.title }}
                  </h3>
                  <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {{ article.summary }}
                  </p>
                </div>
              </div>
              <div class="p-4 pt-0">
                <span class="text-xs font-bold text-[#E30019] group-hover:underline inline-flex items-center gap-1">
                  Đọc bài viết <i class="pi pi-arrow-right text-[10px]"></i>
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- 8. KHỐI THƯƠNG HIỆU ĐỒNG HÀNH (BRAND SHOWCASE) -->
        <section *ngIf="blk.type === 'BRAND_SHOWCASE' && activeHomepageBrands().length > 0" class="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div class="text-center space-y-1">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">THƯƠNG HIỆU ĐỒNG HÀNH CHÍNH HÃNG</h3>
            <p class="text-xs text-slate-400">TechZone là đối tác phân phối ủy quyền cấp cao của các tập đoàn công nghệ hàng đầu thế giới</p>
          </div>

          <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3 items-center pt-2">
            <div 
              *ngFor="let brand of activeHomepageBrands()" 
              class="bg-slate-50 border border-slate-100 hover:border-red-500/30 rounded-2xl p-3 flex items-center justify-center h-14 hover:shadow-md transition-all group cursor-pointer">
              <span class="font-black text-xs sm:text-sm text-slate-700 group-hover:text-[#E30019] tracking-wider uppercase">
                {{ brand.name }}
              </span>
            </div>
          </div>
        </section>

      </ng-container>

    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  categories = signal<Category[]>([]);
  flashSaleProducts = signal<Product[]>([]);
  featuredProducts = signal<Product[]>([]);

  // Banners Signals
  heroBanners = signal<Banner[]>([]);
  currentBannerIndex = signal(0);
  sideTopBanner = signal<Banner | null>(null);
  sideBottomBanner = signal<Banner | null>(null);

  // Flash Sale Campaign Signal
  currentCampaign = signal<any | null>(null);

  // System Tabs Signal for Featured Products
  activeFeaturedTab = signal<'BEST_SELLER' | 'NEW_ARRIVALS' | 'RECOMMENDED'>('BEST_SELLER');

  // Dynamic Shelf Active Filters Map
  shelfActiveFilters = signal<Record<string, string>>({});

  defaultHero = {
    title: 'SIÊU PHẨM LAPTOP GAMING GEN 14TH',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&auto=format&fit=crop'
  };

  // Quick Category Grid Items
  quickCategories = [
    { name: 'Laptop Gaming', icon: '💻', slug: 'laptop-gaming' },
    { name: 'PC Build Sẵn', icon: '🖥️', slug: 'pc-build' },
    { name: 'Màn Hình', icon: '🖥️', slug: 'man-hinh' },
    { name: 'Bàn Phím Cơ', icon: '⌨️', slug: 'ban-phim' },
    { name: 'Tai Nghe 7.1', icon: '🎧', slug: 'tai-nghe' },
    { name: 'Ghế Gaming', icon: '💺', slug: 'ghe-gaming' },
    { name: 'Linh Kiện PC', icon: '🧩', slug: 'linh-kien' }
  ];

  countdown = signal({ hours: '24', minutes: '00', seconds: '00' });
  private targetEndTime: number = Date.now() + 24 * 3600 * 1000;
  private timerSubscription?: Subscription;
  private autoSlideSubscription?: Subscription;

  // Active Sorted Blocks computed from HomepageBuilderService
  activeSortedBlocks = computed(() => {
    return this.builderService.blocks()
      .filter(b => b.active)
      .sort((a, b) => a.order - b.order);
  });

  activeHomepageBlogs = computed(() => {
    return this.builderService.blogs().filter(b => b.showOnHomepage);
  });

  activeHomepageBrands = computed(() => {
    return this.builderService.brands().filter(b => b.showOnHomepage);
  });

  constructor(
    private productService: ProductService,
    public cartService: CartService,
    private homeService: HomeService,
    public builderService: HomepageBuilderService
  ) {}

  currentHeroBanner(): Banner | null {
    const list = this.heroBanners();
    if (list.length === 0) return null;
    const idx = this.currentBannerIndex() % list.length;
    return list[idx];
  }

  onSelectSlide(index: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.currentBannerIndex.set(index);
  }

  onPrevSlide(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const list = this.heroBanners();
    if (list.length === 0) return;
    const prev = (this.currentBannerIndex() - 1 + list.length) % list.length;
    this.currentBannerIndex.set(prev);
  }

  onNextSlide(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const list = this.heroBanners();
    if (list.length === 0) return;
    const next = (this.currentBannerIndex() + 1) % list.length;
    this.currentBannerIndex.set(next);
  }

  isFlashSaleActive(): boolean {
    const camp = this.currentCampaign();
    if (!camp || camp.isActive === false) return false;
    if (camp.endTime) {
      const endMs = new Date(camp.endTime).getTime();
      if (new Date().getTime() >= endMs) return false;
    }
    const products = this.flashSaleDisplayProducts();
    return products && products.length > 0;
  }

  flashSaleDisplayProducts(): any[] {
    const camp = this.currentCampaign();
    if (camp && camp.isActive !== false && camp.items && camp.items.length > 0) {
      return camp.items.map((it: any) => ({
        ...it.product,
        flashSalePrice: it.flashSalePrice,
        quantityLimit: it.quantityLimit || 10,
        soldCount: it.soldCount !== undefined ? it.soldCount : 0
      }));
    }
    return [];
  }

  // FOMO Progress Bar Calculation Helpers
  getSoldCountLabel(index: number, product?: any): string {
    if (product && product.quantityLimit) {
      const sold = product.soldCount !== undefined ? product.soldCount : Math.min(product.quantityLimit - 1, (index + 7) % product.quantityLimit);
      return `Đã bán ${sold}/${product.quantityLimit}`;
    }
    const baseSold = [14, 18, 9, 22, 15, 12, 19, 8];
    const val = baseSold[index % baseSold.length];
    return `Đã bán ${val}`;
  }

  getRemainingCount(index: number, product?: any): number {
    if (product && product.quantityLimit) {
      const sold = product.soldCount !== undefined ? product.soldCount : Math.min(product.quantityLimit - 1, (index + 7) % product.quantityLimit);
      return Math.max(0, product.quantityLimit - sold);
    }
    const baseRemaining = [3, 2, 5, 1, 4, 6, 2, 7];
    return baseRemaining[index % baseRemaining.length];
  }

  getSoldPercentage(index: number, product?: any): number {
    if (product && product.quantityLimit) {
      const sold = product.soldCount !== undefined ? product.soldCount : Math.min(product.quantityLimit - 1, (index + 7) % product.quantityLimit);
      return Math.min(100, Math.round((sold / product.quantityLimit) * 100));
    }
    const baseSold = [14, 18, 9, 22, 15, 12, 19, 8];
    const baseRemaining = [3, 2, 5, 1, 4, 6, 2, 7];
    const sold = baseSold[index % baseSold.length];
    const rem = baseRemaining[index % baseRemaining.length];
    return Math.min(95, Math.round((sold / (sold + rem)) * 100));
  }

  // Dynamic Featured Products Filtering by Tab
  displayedFeaturedProducts(): Product[] {
    const list = this.featuredProducts();
    if (list.length === 0) return [];

    const tab = this.activeFeaturedTab();
    if (tab === 'BEST_SELLER') {
      return [...list].sort((a, b) => b.id - a.id).slice(0, 8);
    } else if (tab === 'NEW_ARRIVALS') {
      return [...list].reverse().slice(0, 8);
    } else {
      return list.slice(0, 8);
    }
  }

  // Dynamic Product Shelves Helper Methods
  getShelfData(shelfId?: string): ProductShelf | undefined {
    if (!shelfId) return undefined;
    return this.builderService.shelves().find(s => s.id === shelfId);
  }

  getShelfActiveFilter(shelfId?: string): string {
    if (!shelfId) return 'Tất cả';
    return this.shelfActiveFilters()[shelfId] || 'Tất cả';
  }

  setShelfActiveFilter(shelfId: string | undefined, filter: string): void {
    if (!shelfId) return;
    const current = { ...this.shelfActiveFilters() };
    current[shelfId] = filter;
    this.shelfActiveFilters.set(current);
  }

  getFilteredShelfProducts(shelfId?: string): Product[] {
    const shelf = this.getShelfData(shelfId);
    const list = this.featuredProducts();
    if (!shelf) return list.slice(0, 4);

    const activeFilter = this.getShelfActiveFilter(shelfId);
    const targetSlug = shelf.categorySlug.toLowerCase();

    const categoryProducts = list.filter(p => 
      p.category?.slug?.toLowerCase() === targetSlug || 
      p.name.toLowerCase().includes(targetSlug.replace('-', ' '))
    );

    const baseList = categoryProducts.length > 0 ? categoryProducts : list;

    if (activeFilter === 'Tất cả') return baseList.slice(0, 4);
    return baseList.filter(p => 
      p.name.toLowerCase().includes(activeFilter.toLowerCase()) || 
      (p.brand && p.brand.name.toLowerCase().includes(activeFilter.toLowerCase()))
    ).slice(0, 4);
  }

  onAddToCart(product: Product, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart(product).subscribe();
  }

  ngOnInit(): void {
    this.homeService.getBannersByPosition('HERO_SLIDER').subscribe(res => {
      if (res && res.length > 0) this.heroBanners.set(res);
    });

    this.homeService.getBannersByPosition('HERO_SIDE_TOP').subscribe(res => {
      if (res && res.length > 0) this.sideTopBanner.set(res[0]);
    });

    this.homeService.getBannersByPosition('HERO_SIDE_BOTTOM').subscribe(res => {
      if (res && res.length > 0) this.sideBottomBanner.set(res[0]);
    });

    // Auto Slide Hero Carousel every 5 seconds
    this.autoSlideSubscription = interval(5000).subscribe(() => {
      const list = this.heroBanners();
      if (list.length > 1) {
        this.currentBannerIndex.set((this.currentBannerIndex() + 1) % list.length);
      }
    });

    // Fetch Active Flash Sale Campaign
    this.homeService.getCurrentFlashSaleCampaign().subscribe(res => {
      if (res) {
        this.currentCampaign.set(res);
        if (res.endTime) {
          this.targetEndTime = new Date(res.endTime).getTime();
        }
      }
    });

    // Fetch Products & Categories
    this.productService.getCategories().subscribe(res => this.categories.set(res));
    this.productService.getFlashSaleProducts().subscribe(res => this.flashSaleProducts.set(res));
    this.productService.getFeaturedProducts().subscribe(res => this.featuredProducts.set(res));

    // Live RxJS Countdown Timer
    this.timerSubscription = interval(1000).subscribe(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((this.targetEndTime - now) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      this.countdown.set({
        hours: h < 10 ? '0' + h : '' + h,
        minutes: m < 10 ? '0' + m : '' + m,
        seconds: s < 10 ? '0' + s : '' + s
      });
    });
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.autoSlideSubscription) {
      this.autoSlideSubscription.unsubscribe();
    }
  }
}

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HomepageBuilderService, HomepageBlock, UspItem, ProductShelf, BlogArticle, BrandItem } from '../../../services/homepage-builder.service';
import { ProductService } from '../../../services/product.service';
import { Category } from '../../../models/product.model';

import { AdminHeaderComponent } from '../../../components/admin-header/admin-header.component';

@Component({
  selector: 'app-admin-homepage-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminHeaderComponent],
  template: `
    <div class="space-y-6 animate-fade-in text-slate-100 min-h-screen">
      
      <!-- Standardized Admin Header Component -->
      <app-admin-header 
        title="Quản Lý Trang Chủ (Homepage Builder)"
        subtitle="Tùy biến sắp xếp thứ tự khối, bật/tắt hiển thị, cụm sản phẩm shelves và cam kết dịch vụ real-time"
        icon="pi pi-palette"
        badge="100% Dynamic Engine"
        [breadcrumbs]="[{ label: 'Homepage Builder' }]">
        
        <a routerLink="/" target="_blank" class="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all border border-slate-800 shadow cursor-pointer">
          <i class="pi pi-globe text-amber-400"></i>
          <span>Xem Màn Hình Trang Chủ</span>
        </a>
      </app-admin-header>

      <!-- TOAST NOTIFICATION -->
      <div *ngIf="toastMessage()" class="fixed top-6 right-6 z-50 animate-fade-in">
        <div 
          [ngClass]="{
            'bg-emerald-950 border-emerald-500 text-emerald-200': toastMessage()?.type === 'success',
            'bg-red-950 border-red-500 text-red-200': toastMessage()?.type === 'error'
          }"
          class="border px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold">
          <i [class]="toastMessage()?.type === 'success' ? 'pi pi-check-circle text-emerald-400 text-base' : 'pi pi-exclamation-triangle text-red-400 text-base'"></i>
          <span>{{ toastMessage()?.text }}</span>
        </div>
      </div>

      <!-- TAB 1: SẮP XẾP THỨ TỰ & BẬT/TẮT KHỐI (LAYOUT ORDER MANAGER) -->
      <div *ngIf="activeTab() === 'LAYOUT'" class="space-y-4">
        <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i class="pi pi-sort-alt text-purple-400"></i>
                <span>Bảng Quản Lý Thứ Tự & Trạng Thái Khối Trang Chủ</span>
              </h3>
              <p class="text-xs text-slate-400 mt-1">Dùng nút mũi tên ⬆️ ⬇️ để thay đổi vị trí xuất hiện ngoài Trang chủ. Gạt công tắc để Bật/Ẩn khối tức thì.</p>
            </div>
            
            <button (click)="resetDefaultLayout()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all border border-slate-700 cursor-pointer">
              ↺ Khôi Phục Mặc Định
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th class="p-3 text-center w-16">Thứ Tự</th>
                  <th class="p-3">Tên Khối Nội Dung (Block Name)</th>
                  <th class="p-3">Mã Loại (Block Type)</th>
                  <th class="p-3 text-center">Trạng Thái</th>
                  <th class="p-3 text-center">Sắp Xếp</th>
                  <th class="p-3 text-center">Thao Tác Cấu Hình</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-semibold text-slate-200">
                <tr *ngFor="let blk of sortedBlocks(); let idx = index" class="hover:bg-slate-800/40 transition-colors">
                  <td class="p-3 text-center">
                    <span class="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 font-mono font-black text-amber-400 flex items-center justify-center mx-auto">
                      {{ blk.order }}
                    </span>
                  </td>
                  <td class="p-3 font-bold text-white">
                    {{ blk.name }}
                  </td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                      {{ blk.type }}
                    </span>
                  </td>
                  <td class="p-3 text-center">
                    <button 
                      (click)="builderService.toggleBlockActive(blk.id)"
                      [ngClass]="{
                        'bg-emerald-950 text-emerald-400 border-emerald-500/50': blk.active,
                        'bg-red-950 text-red-400 border-red-500/50': !blk.active
                      }"
                      class="px-3 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer">
                      {{ blk.active ? '🟢 Hiển thị' : '🔴 Ẩn' }}
                    </button>
                  </td>
                  <td class="p-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button 
                        (click)="builderService.moveBlockOrder(blk.id, 'UP')"
                        [disabled]="idx === 0"
                        class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-slate-800 text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700">
                        <i class="pi pi-arrow-up text-xs"></i>
                      </button>

                      <button 
                        (click)="builderService.moveBlockOrder(blk.id, 'DOWN')"
                        [disabled]="idx === sortedBlocks().length - 1"
                        class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-slate-800 text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700">
                        <i class="pi pi-arrow-down text-xs"></i>
                      </button>
                    </div>
                  </td>
                  <td class="p-3 text-center">
                    <button 
                      (click)="navigateBlockConfig(blk)"
                      class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all border border-slate-700 cursor-pointer inline-flex items-center gap-1">
                      <i class="pi pi-cog text-amber-400 text-xs"></i>
                      <span>Cấu hình</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: QUẢN LÝ THANH CAM KẾT DỊCH VỤ (USP_BAR) -->
      <div *ngIf="activeTab() === 'USPS'" class="space-y-5 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          
          <!-- 1. Header Card Container Mismatch Fix -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-amber-950/40">
                <i class="pi pi-shield"></i>
              </div>
              <div>
                <h3 class="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Quản Lý Thanh Cam Kết Dịch Vụ (USPs Bar)</span>
                  <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/30">
                    Trust Signals
                  </span>
                </h3>
                <p class="text-xs text-slate-400 mt-0.5">Tùy biến icon, tiêu đề, thông điệp ngắn & bật/tắt hiển thị từng item ngay dưới Hero Banner</p>
              </div>
            </div>

            <button 
              (click)="saveUsps()"
              class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2 shrink-0">
              <i class="pi pi-save text-sm"></i>
              <span>Lưu Cấu Hình USPs</span>
            </button>
          </div>

          <!-- 3. Khối Xem Trước Real-Time (Live Preview Bar) -->
          <div class="space-y-3 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 shadow-inner">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <i class="pi pi-eye text-xs"></i> Xem Trước Hiển Thị Thực Tế (Live Real-time Preview)
              </span>
              <span class="text-[10px] text-slate-500 font-medium">Giao diện sẽ hiển thị ngoài Trang chủ Client</span>
            </div>

            <!-- Client Style Live Bar -->
            <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <ng-container *ngFor="let usp of editableUsps; let idx = index">
                  <div *ngIf="usp.active !== false" class="flex items-center gap-3.5 pt-2 md:pt-0 md:px-2 group animate-fade-in">
                    <div 
                      [ngClass]="{
                        'bg-red-50 text-[#E30019]': idx % 4 === 0,
                        'bg-amber-50 text-amber-600': idx % 4 === 1,
                        'bg-emerald-50 text-emerald-600': idx % 4 === 2,
                        'bg-purple-50 text-purple-600': idx % 4 === 3
                      }"
                      class="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs font-bold">
                      <i *ngIf="isIconClass(usp.icon)" [class]="usp.icon"></i>
                      <span *ngIf="!isIconClass(usp.icon)">{{ usp.icon }}</span>
                    </div>
                    <div class="min-w-0">
                      <h4 class="text-xs font-black text-slate-900 uppercase tracking-wide truncate">{{ usp.title || 'Tiêu Đề Cam Kết' }}</h4>
                      <p class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{{ usp.description || 'Mô tả ngắn...' }}</p>
                    </div>
                  </div>
                </ng-container>
              </div>
            </div>
          </div>

          <!-- 4 USP Edit Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div *ngFor="let usp of editableUsps; let idx = index" class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4 shadow-md hover:border-slate-700 transition-all">
              
              <!-- 5. Badge ITEM 1, 2, 3, 4 Frosted Glass & 4. Active Toggle -->
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <span class="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                  <i class="pi pi-tag text-[10px]"></i> ITEM {{ idx + 1 }}
                </span>

                <!-- Active Toggle Switch -->
                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-bold" [class.text-emerald-400]="usp.active !== false" [class.text-slate-500]="usp.active === false">
                    {{ usp.active !== false ? '🟢 Hiển thị' : '⚪ Ẩn' }}
                  </span>
                  <button 
                    type="button" 
                    (click)="usp.active = (usp.active === false ? true : false)" 
                    [class.bg-emerald-600]="usp.active !== false"
                    [class.bg-slate-800]="usp.active === false"
                    class="w-10 h-6 rounded-full transition-colors relative cursor-pointer border border-slate-700">
                    <div 
                      [class.translate-x-4.5]="usp.active !== false"
                      [class.translate-x-0.5]="usp.active === false"
                      class="w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 shadow-md">
                    </div>
                  </button>
                </div>
              </div>

              <!-- Form Fields -->
              <div class="space-y-3">
                <!-- 2. Icon Selection Control: Preview Box + Readonly Value Input + Action Modal Trigger Button -->
                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1 flex items-center justify-between">
                    <span>Icon Biểu Tượng</span>
                    <span class="text-[10px] text-slate-500 font-normal">Emoji hoặc Icon Class</span>
                  </label>
                  <div class="flex items-center gap-2.5">
                    <!-- Standalone Enlarged Visual Preview Box -->
                    <div class="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shrink-0 shadow-inner text-amber-400 font-bold">
                      <i *ngIf="isIconClass(usp.icon)" [class]="usp.icon"></i>
                      <span *ngIf="!isIconClass(usp.icon)">{{ usp.icon }}</span>
                    </div>

                    <!-- Readonly Current Icon Value Input -->
                    <input 
                      type="text" 
                      [value]="usp.icon || 'pi pi-shield'"
                      readonly 
                      class="flex-1 min-w-0 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono font-bold select-none cursor-default truncate" />

                    <!-- Action Button to Open Icon Picker Modal -->
                    <button 
                      type="button" 
                      (click)="openIconPicker(idx)"
                      class="px-3.5 py-2.5 bg-slate-800 hover:bg-[#E30019] text-white font-bold text-xs rounded-xl border border-slate-700 hover:border-red-500 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md">
                      <i class="pi pi-palette text-amber-400 text-sm"></i>
                      <span>Chọn Icon</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">Tiêu Đề Cam Kết *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="usp.title" 
                    placeholder="VD: Giao Hàng 2H"
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-bold" />
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">Mô Tả Ngắn *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="usp.description" 
                    placeholder="VD: Nội thành TP.HCM & Hà Nội"
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-red-500" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-3 border-t border-slate-800">
            <button 
              (click)="saveUsps()"
              class="px-6 py-2.5 bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2">
              <i class="pi pi-save text-sm"></i>
              <span>Lưu Cấu Hình USPs</span>
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 3: CẤU HÌNH CỤM SẢN PHẨM (PRODUCT SHELVES) -->
      <div *ngIf="activeTab() === 'SHELVES'" class="space-y-4">
        <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>📑 Cấu Hình Cụm Sản Phẩm Chuyên Sâu (Product Shelves)</span>
              </h3>
              <p class="text-xs text-slate-400 mt-1">Tạo không giới hạn các cụm sản phẩm có kèm bộ lọc nhanh theo thương hiệu ngoài Trang chủ</p>
            </div>

            <button 
              (click)="openAddShelfModal()"
              class="px-4 py-2 bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2">
              <i class="pi pi-plus text-xs"></i>
              <span>+ Thêm Cụm Sản Phẩm</span>
            </button>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div *ngFor="let shf of builderService.shelves()" class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-xl">{{ shf.icon }}</span>
                  <h4 class="text-sm font-black text-white uppercase">{{ shf.title }}</h4>
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-400">
                  <span>Danh mục: <strong class="text-amber-400">{{ shf.categorySlug }}</strong></span>
                  <span>•</span>
                  <span>Thẻ lọc nhanh: <strong class="text-slate-300">{{ shf.subFilters.join(', ') }}</strong></span>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <button 
                  (click)="builderService.toggleShelfActive(shf.id)"
                  [ngClass]="{
                    'bg-emerald-950 text-emerald-400 border-emerald-500/50': shf.active,
                    'bg-red-950 text-red-400 border-red-500/50': !shf.active
                  }"
                  class="px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer">
                  {{ shf.active ? '🟢 Hiển thị' : '🔴 Ẩn' }}
                </button>

                <button 
                  (click)="builderService.deleteShelf(shf.id)"
                  class="px-3 py-1 bg-red-950 hover:bg-red-900 text-red-300 font-bold text-xs rounded-xl border border-red-800 transition-all cursor-pointer">
                  Xóa Cụm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: THƯƠNG HIỆU & BLOG SHOWCASE TOGGLES -->
      <div *ngIf="activeTab() === 'BLOGS_BRANDS'" class="space-y-6">
        <!-- Brands Showcase Section -->
        <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>🏢 Bật / Tắt Thương Hiệu Đồng Hành Hiển Thị Trang Chủ</span>
            </h3>
            <p class="text-xs text-slate-400 mt-1">Tích chọn các hãng công nghệ hiển thị ngoài dải Brand Showcase</p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div *ngFor="let b of builderService.brands()" class="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <span class="font-black text-xs text-white uppercase tracking-wider">{{ b.name }}</span>
              <button 
                (click)="builderService.toggleBrandHomepage(b.id)"
                [ngClass]="{
                  'bg-emerald-950 text-emerald-400 border-emerald-500/50': b.showOnHomepage,
                  'bg-slate-950 text-slate-500 border-slate-800': !b.showOnHomepage
                }"
                class="px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer">
                {{ b.showOnHomepage ? '🟢 Hiện' : '🔴 Ẩn' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Tech Blog Articles Section -->
        <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>📰 Bật / Tắt Bài Viết Blog Hiển Thị Ngoài Trang Chủ</span>
            </h3>
            <p class="text-xs text-slate-400 mt-1">Chọn các bài viết đánh giá công nghệ xuất hiện ngoài khối Tech Blog</p>
          </div>

          <div class="space-y-3">
            <div *ngFor="let art of builderService.blogs()" class="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <img [src]="art.image" class="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 class="text-xs font-bold text-white line-clamp-1">{{ art.title }}</h4>
                  <span class="text-[10px] text-amber-400 font-bold uppercase">{{ art.category }} • {{ art.date }}</span>
                </div>
              </div>

              <button 
                (click)="builderService.toggleBlogHomepage(art.id)"
                [ngClass]="{
                  'bg-emerald-950 text-emerald-400 border-emerald-500/50': art.showOnHomepage,
                  'bg-slate-950 text-slate-500 border-slate-800': !art.showOnHomepage
                }"
                class="px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0">
                {{ art.showOnHomepage ? '🟢 Hiện Trang Chủ' : '🔴 Ẩn Trang Chủ' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL THÊM CỤM SẢN PHẨM MỚI -->
      <div *ngIf="showAddShelfModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl text-slate-100">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>+ Thêm Cụm Sản Phẩm Mới (Shelf)</span>
            </h3>
            <button (click)="showAddShelfModal.set(false)" class="text-slate-400 hover:text-white cursor-pointer">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-300 uppercase mb-1">Tiêu Đề Cụm Sản Phẩm *</label>
              <input 
                type="text" 
                [(ngModel)]="newShelfData.title" 
                placeholder="VD: LAPTOP GAMING CAO CẤP..." 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-red-500" />
            </div>

            <div>
              <label class="block font-bold text-slate-300 uppercase mb-1">Danh Mục Chính (Category Slug) *</label>
              <select 
                [(ngModel)]="newShelfData.categorySlug" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-red-500 cursor-pointer">
                <option *ngFor="let cat of categories()" [value]="cat.slug">{{ cat.name }} ({{ cat.slug }})</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-300 uppercase mb-1">Icon Biểu Tượng</label>
              <input 
                type="text" 
                [(ngModel)]="newShelfData.icon" 
                placeholder="VD: 💻 hoặc 🖥️..." 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-red-500" />
            </div>

            <div>
              <label class="block font-bold text-slate-300 uppercase mb-1">Các Thẻ Lọc Nhanh (Phân cách bởi dấu phẩy)</label>
              <input 
                type="text" 
                [(ngModel)]="newShelfSubFiltersInput" 
                placeholder="VD: Tất cả, Asus ROG, MSI, Acer Predator..." 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-red-500" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button (click)="showAddShelfModal.set(false)" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer">Hủy</button>
            <button (click)="submitCreateShelf()" class="px-5 py-2 bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg">Thêm Cụm SP</button>
          </div>
        </div>
      </div>

      <!-- MODAL BỘ CHỌN ICON TRỰC QUAN DÀNH CHO USPs -->
      <div *ngIf="showIconPicker()" class="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl relative flex flex-col overflow-hidden text-slate-200">
          
          <!-- Sticky Header -->
          <div class="p-5 border-b border-slate-800 bg-[#111827] shrink-0 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-red-600/30">
                  <i class="pi pi-palette"></i>
                </div>
                <div>
                  <h3 class="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span>Bộ Chọn Icon Trực Quan (USPs Bar)</span>
                  </h3>
                  <p class="text-xs text-slate-400">Chọn trực quan Emoji hoặc Icon Class cho Cam kết dịch vụ mà không cần gõ tay thủ công</p>
                </div>
              </div>

              <button 
                (click)="showIconPicker.set(false)" 
                class="text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Search Input -->
            <div class="relative">
              <input 
                type="text" 
                [(ngModel)]="iconSearchQuery"
                placeholder="Tìm kiếm icon (giao hang, bao hanh, tra gop, doi tra, truck, shield, bolt...)..." 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-bold" />
              <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
            </div>
          </div>

          <!-- Icon Options Grid Body -->
          <div class="p-5 flex-grow overflow-y-auto custom-scrollbar bg-slate-950 space-y-4">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button 
                *ngFor="let iconOpt of filteredUspIcons()"
                type="button"
                (click)="selectIconForActiveUsp(iconOpt.value)"
                [class.bg-[#E30019]]="activeUspIndex() !== null && editableUsps[activeUspIndex()!]?.icon === iconOpt.value"
                [class.text-white]="activeUspIndex() !== null && editableUsps[activeUspIndex()!]?.icon === iconOpt.value"
                [class.border-red-500]="activeUspIndex() !== null && editableUsps[activeUspIndex()!]?.icon === iconOpt.value"
                [class.shadow-lg]="activeUspIndex() !== null && editableUsps[activeUspIndex()!]?.icon === iconOpt.value"
                [class.bg-slate-900]="activeUspIndex() === null || editableUsps[activeUspIndex()!]?.icon !== iconOpt.value"
                [class.text-slate-300]="activeUspIndex() === null || editableUsps[activeUspIndex()!]?.icon !== iconOpt.value"
                [class.border-slate-800]="activeUspIndex() === null || editableUsps[activeUspIndex()!]?.icon !== iconOpt.value"
                class="p-3.5 border rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-red-500 hover:bg-slate-800/80 transition-all cursor-pointer group text-center">
                
                <div class="text-3xl text-amber-400 group-hover:scale-110 transition-transform flex items-center justify-center h-10 font-bold">
                  <i *ngIf="isIconClass(iconOpt.value)" [class]="iconOpt.value"></i>
                  <span *ngIf="!isIconClass(iconOpt.value)">{{ iconOpt.value }}</span>
                </div>

                <div class="space-y-0.5 min-w-0 w-full">
                  <div class="text-xs font-bold text-white truncate">{{ iconOpt.label }}</div>
                  <div class="text-[10px] font-mono text-slate-400 truncate opacity-80">{{ iconOpt.value }}</div>
                </div>
              </button>
            </div>

            <!-- Empty Search State -->
            <div *ngIf="filteredUspIcons().length === 0" class="py-12 text-center text-slate-400 space-y-2">
              <i class="pi pi-search text-3xl opacity-40"></i>
              <p class="text-xs font-bold">Không tìm thấy icon nào khớp với từ khóa "{{ iconSearchQuery }}"</p>
            </div>
          </div>

          <!-- Sticky Footer -->
          <div class="p-4 border-t border-slate-800 bg-[#111827] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2 text-slate-400 font-medium w-full sm:w-auto">
              <span class="shrink-0">Gõ mã tùy chỉnh:</span>
              <input 
                type="text" 
                #customInput
                placeholder="VD: ⚡ hoặc pi pi-bolt" 
                class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono flex-1 sm:w-44 focus:outline-none focus:border-red-500" />
              <button 
                type="button" 
                (click)="customInput.value && selectIconForActiveUsp(customInput.value)" 
                class="px-3 py-1.5 bg-slate-800 hover:bg-[#E30019] text-white font-bold rounded-xl transition-colors cursor-pointer shrink-0 border border-slate-700">
                Áp dụng
              </button>
            </div>

            <button 
              type="button" 
              (click)="showIconPicker.set(false)" 
              class="px-5 py-2 font-bold text-xs text-white bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer transition-all border border-slate-700 w-full sm:w-auto">
              Đóng / Hủy
            </button>
          </div>

        </div>
      </div>

    </div>
  `
})
export class AdminHomepageBuilderComponent implements OnInit {
  activeTab = signal<'LAYOUT' | 'USPS' | 'SHELVES' | 'BLOGS_BRANDS'>('LAYOUT');
  toastMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  showAddShelfModal = signal(false);
  showIconPicker = signal(false);
  activeUspIndex = signal<number | null>(null);
  iconSearchQuery = '';

  categories = signal<Category[]>([]);
  editableUsps: UspItem[] = [];

  uspPresetIcons = [
    // Emoji Trust Signals
    { value: '🚚', label: 'Giao Hàng Thần Tốc 2H', group: 'Emoji', keywords: ['giao hang', 'truck', '2h', 'van chuyen', 'giao'] },
    { value: '🛡️', label: 'Bảo Hành 1 Đổi 1', group: 'Emoji', keywords: ['bao hanh', 'shield', '1 doi 1', 'chinh hang', 'chat luong'] },
    { value: '💳', label: 'Trả Góp 0% Lãi Suất', group: 'Emoji', keywords: ['tra gop', 'card', '0%', 'ngan hang', 'tin dung'] },
    { value: '🔄', label: '30 Ngày Đổi Trả', group: 'Emoji', keywords: ['doi tra', 'sync', '30 ngay', 'loi nha san xuat'] },
    { value: '⚡', label: 'Giao Thần Tốc Siêu Bão', group: 'Emoji', keywords: ['than toc', 'flash', 'sieu toc', 'set'] },
    { value: '🎁', label: 'Quà Tặng Hấp Dẫn', group: 'Emoji', keywords: ['qua tang', 'gift', 'khuyen mai', 'qua'] },
    { value: '🚀', label: 'Hỏa Tốc Toàn Quốc', group: 'Emoji', keywords: ['hoa toc', 'rocket', 'toan quoc', 'ten lua'] },
    { value: '💎', label: 'Chính Hãng 100%', group: 'Emoji', keywords: ['chinh hang', 'diamond', 'premium', 'kim cuong'] },
    { value: '👑', label: 'Đặc Quyền VIP', group: 'Emoji', keywords: ['vip', 'crown', 'vuong mien', 'premium'] },
    { value: '🔥', label: 'Giá Sốc Mỗi Ngày', group: 'Emoji', keywords: ['gia soc', 'fire', 'hot sale', 'lua'] },
    { value: '🎧', label: 'Hỗ Trợ 24/7', group: 'Emoji', keywords: ['ho tro', 'support', 'headset', 'tai nghe'] },
    { value: '💻', label: 'Laptop Official Store', group: 'Emoji', keywords: ['laptop', 'pc', 'official', 'may tinh'] },
    { value: '🏆', label: 'Thương Hiệu Top 1', group: 'Emoji', keywords: ['top 1', 'cup', 'trophy', 'giai thuong'] },
    { value: '⚙️', label: 'Kỹ Thuật Chuyên Nghiệp', group: 'Emoji', keywords: ['ky thuat', 'gear', 'lap rap', 'banh xe'] },

    // Class Icons (PrimeIcons & FontAwesome)
    { value: 'pi pi-truck', label: 'Truck Fast (PI)', group: 'Class', keywords: ['truck', 'giao hang', 'pi'] },
    { value: 'pi pi-shield', label: 'Shield Protection (PI)', group: 'Class', keywords: ['shield', 'bao hanh', 'pi'] },
    { value: 'pi pi-credit-card', label: 'Credit Card (PI)', group: 'Class', keywords: ['card', 'tra gop', 'pi'] },
    { value: 'pi pi-sync', label: 'Sync / Repeat (PI)', group: 'Class', keywords: ['sync', 'doi tra', 'pi'] },
    { value: 'pi pi-bolt', label: 'Flash Bolt (PI)', group: 'Class', keywords: ['bolt', 'sieu toc', 'pi'] },
    { value: 'pi pi-gift', label: 'Gift Box (PI)', group: 'Class', keywords: ['gift', 'qua tang', 'pi'] },
    { value: 'pi pi-star', label: 'Star Rating (PI)', group: 'Class', keywords: ['star', 'danh gia', 'pi'] },
    { value: 'pi pi-verified', label: 'Verified Badge (PI)', group: 'Class', keywords: ['check', 'verified', 'pi'] },
    { value: 'fa-solid fa-truck-fast', label: 'Truck Express (FA)', group: 'Class', keywords: ['truck', 'giao hang', 'fa'] },
    { value: 'fa-solid fa-shield-halved', label: 'Shield Halved (FA)', group: 'Class', keywords: ['shield', 'bao hanh', 'fa'] },
    { value: 'fa-solid fa-credit-card', label: 'Credit Card (FA)', group: 'Class', keywords: ['card', 'tra gop', 'fa'] },
    { value: 'fa-solid fa-rotate-left', label: 'Rotate 30 Days (FA)', group: 'Class', keywords: ['rotate', 'doi tra', 'fa'] },
    { value: 'fa-solid fa-box-open', label: 'Box Open (FA)', group: 'Class', keywords: ['box', 'dong goi', 'fa'] },
    { value: 'fa-solid fa-award', label: 'Award Trophy (FA)', group: 'Class', keywords: ['award', 'uy tin', 'fa'] }
  ];

  newShelfData = {
    title: '',
    categorySlug: 'laptop-gaming',
    icon: '💻'
  };
  newShelfSubFiltersInput = 'Tất cả, Asus ROG, MSI, Acer Predator';

  sortedBlocks = computed(() => {
    return [...this.builderService.blocks()].sort((a, b) => a.order - b.order);
  });

  constructor(
    public builderService: HomepageBuilderService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.editableUsps = JSON.parse(JSON.stringify(this.builderService.usps()));
    this.productService.getCategories().subscribe(res => this.categories.set(res));

    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        const tab = params['tab'].toUpperCase();
        if (tab === 'USPS' || tab === 'SHELVES' || tab === 'BLOGS_BRANDS' || tab === 'LAYOUT') {
          this.activeTab.set(tab as any);
        }
      }
    });
  }

  filteredUspIcons(): any[] {
    const q = this.iconSearchQuery.toLowerCase().trim();
    if (!q) return this.uspPresetIcons;
    return this.uspPresetIcons.filter(it => 
      it.label.toLowerCase().includes(q) || 
      it.value.toLowerCase().includes(q) ||
      it.keywords.some((k: string) => k.toLowerCase().includes(q))
    );
  }

  openIconPicker(index: number): void {
    this.activeUspIndex.set(index);
    this.iconSearchQuery = '';
    this.showIconPicker.set(true);
  }

  selectIconForActiveUsp(iconValue: string): void {
    const idx = this.activeUspIndex();
    if (idx !== null && this.editableUsps[idx]) {
      this.editableUsps[idx].icon = iconValue;
    }
    this.showIconPicker.set(false);
  }

  isIconClass(icon?: string): boolean {
    if (!icon) return false;
    return icon.startsWith('pi ') || icon.startsWith('fa-') || icon.includes('pi-') || icon.includes('fa-');
  }

  saveUsps(): void {
    this.builderService.saveUsps(this.editableUsps);
    this.showToast('success', 'Lưu cấu hình Thanh Cam Kết Dịch Vụ (USPs) thành công!');
  }

  resetDefaultLayout(): void {
    this.builderService.saveBlocks([...this.builderService.defaultBlocks]);
    this.showToast('success', 'Đã khôi phục thứ tự các khối mặc định!');
  }

  navigateBlockConfig(blk: HomepageBlock): void {
    if (blk.type === 'HERO_SLIDER') {
      this.router.navigate(['/admin/banners']);
    } else if (blk.type === 'FLASH_SALE') {
      this.router.navigate(['/admin/flash-sale']);
    } else if (blk.type === 'USP_BAR') {
      this.activeTab.set('USPS');
    } else if (blk.type === 'CATEGORY_SHELF') {
      this.activeTab.set('SHELVES');
    } else if (blk.type === 'TECH_BLOG' || blk.type === 'BRAND_SHOWCASE') {
      this.activeTab.set('BLOGS_BRANDS');
    } else {
      this.showToast('success', `Đang xem cấu hình khối ${blk.name}`);
    }
  }

  openAddShelfModal(): void {
    this.newShelfData = {
      title: '',
      categorySlug: this.categories().length > 0 ? this.categories()[0].slug : 'laptop-gaming',
      icon: '📦'
    };
    this.newShelfSubFiltersInput = 'Tất cả, Asus, MSI, Acer';
    this.showAddShelfModal.set(true);
  }

  submitCreateShelf(): void {
    if (!this.newShelfData.title.trim()) {
      this.showToast('error', 'Vui lòng nhập tiêu đề cụm sản phẩm!');
      return;
    }

    const filters = this.newShelfSubFiltersInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

    this.builderService.addShelf({
      title: this.newShelfData.title.trim(),
      categorySlug: this.newShelfData.categorySlug,
      icon: this.newShelfData.icon || '📦',
      subFilters: filters.length > 0 ? filters : ['Tất cả']
    });

    this.showAddShelfModal.set(false);
    this.showToast('success', 'Thêm cụm sản phẩm mới thành công!');
  }

  private showToast(type: 'success' | 'error', text: string): void {
    this.toastMessage.set({ type, text });
    setTimeout(() => this.toastMessage.set(null), 3000);
  }
}

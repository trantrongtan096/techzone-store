import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ProductService } from '../../../services/product.service';
import { ImageCompressorUtil } from '../../../utils/image-compressor.util';

import { AdminHeaderComponent } from '../../../components/admin-header/admin-header.component';

@Component({
  selector: 'app-admin-banner-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminHeaderComponent],
  template: `
    <!-- Toast Notification -->
    <div *ngIf="toastMessage()" 
      [class.bg-emerald-600]="toastMessage()?.type === 'success'" 
      [class.bg-red-600]="toastMessage()?.type === 'error'" 
      class="fixed top-6 left-1/2 -translate-x-1/2 text-white px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-fade-in border border-white/20 backdrop-blur-md pointer-events-none">
      <i [class]="toastMessage()?.type === 'success' ? 'pi pi-check-circle text-xl' : 'pi pi-exclamation-triangle text-xl'"></i>
      <span class="text-xs font-bold">{{ toastMessage()?.text }}</span>
    </div>

    <div class="space-y-6 animate-fade-in">
      <!-- Standardized Admin Header Component -->
      <app-admin-header 
        title="Quản Lý Banner & Ads"
        subtitle="Cấu hình Banner trượt Hero Slider, Banner Phụ và 2 Banner dán 2 bên mép (Floating Sticky)"
        icon="pi pi-images"
        badge="CMS Banners"
        [breadcrumbs]="[{ label: 'Homepage Builder', url: '/admin/homepage-builder' }, { label: 'Banner Slider' }]">
        
        <button 
          (click)="openModal()"
          class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer">
          <i class="pi pi-plus"></i>
          <span>Thêm Banner Mới</span>
        </button>
      </app-admin-header>

      <!-- Filters Pill Bar -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        <button 
          (click)="filterPosition.set('ALL')" 
          [class.bg-[#E30019]]="filterPosition() === 'ALL'"
          [class.text-white]="filterPosition() === 'ALL'"
          [class.bg-slate-900]="filterPosition() !== 'ALL'"
          [class.text-slate-400]="filterPosition() !== 'ALL'"
          class="px-4 py-2 rounded-xl border border-slate-800 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer">
          Tất Cả Banner ({{ banners().length }})
        </button>

        <button 
          (click)="filterPosition.set('FLOATING')" 
          [class.bg-[#E30019]]="filterPosition() === 'FLOATING'"
          [class.text-white]="filterPosition() === 'FLOATING'"
          [class.bg-slate-900]="filterPosition() !== 'FLOATING'"
          [class.text-slate-400]="filterPosition() !== 'FLOATING'"
          class="px-4 py-2 rounded-xl border border-slate-800 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5">
          <span>🎯 Floating Sticky (2 Bên Mép)</span>
        </button>

        <button 
          (click)="filterPosition.set('HERO_SLIDER')" 
          [class.bg-[#E30019]]="filterPosition() === 'HERO_SLIDER'"
          [class.text-white]="filterPosition() === 'HERO_SLIDER'"
          [class.bg-slate-900]="filterPosition() !== 'HERO_SLIDER'"
          [class.text-slate-400]="filterPosition() !== 'HERO_SLIDER'"
          class="px-4 py-2 rounded-xl border border-slate-800 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer">
          🖼️ Hero Slider Chính
        </button>

        <button 
          (click)="filterPosition.set('HERO_SIDE')" 
          [class.bg-[#E30019]]="filterPosition() === 'HERO_SIDE'"
          [class.text-white]="filterPosition() === 'HERO_SIDE'"
          [class.bg-slate-900]="filterPosition() !== 'HERO_SIDE'"
          [class.text-slate-400]="filterPosition() !== 'HERO_SIDE'"
          class="px-4 py-2 rounded-xl border border-slate-800 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer">
          📌 Banner Phụ Bên Phải
        </button>
      </div>

      <!-- Banners Table -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 text-[11px]">
              <tr>
                <th class="p-4">Xem Trước Ảnh</th>
                <th class="p-4">Tiêu Đề & Đường Link Target</th>
                <th class="p-4">Vị Trí Display</th>
                <th class="p-4 text-center">Chế Độ Text</th>
                <th class="p-4 text-center">Độ Ưu Tiên</th>
                <th class="p-4 text-center">Trạng Thái</th>
                <th class="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-semibold text-slate-200">
              <tr *ngFor="let b of filteredBanners()" class="hover:bg-slate-800/40 transition-colors">
                <!-- Preview Image -->
                <td class="p-4">
                  <div class="w-32 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xs relative flex items-center justify-center">
                    <img [src]="b.imageUrl" [alt]="b.title" class="max-h-full max-w-full object-cover" />
                  </div>
                </td>

                <!-- Title & Target URL -->
                <td class="p-4 max-w-xs">
                  <div class="font-bold text-white text-sm">{{ b.title }}</div>
                  <div class="text-[11px] font-mono text-slate-400 truncate mt-1 flex items-center gap-1">
                    <i class="pi pi-link text-slate-500"></i>
                    <span class="font-bold text-red-400">{{ b.targetUrl || 'Không gắn link (chỉ xem)' }}</span>
                  </div>
                </td>

                <!-- Position Badge -->
                <td class="p-4">
                  <span 
                    [ngClass]="{
                      'bg-purple-950/80 text-purple-400 border-purple-500/40': b.position === 'FLOATING_LEFT' || b.position === 'FLOATING_RIGHT',
                      'bg-blue-950/80 text-blue-400 border-blue-500/40': b.position === 'HERO_SLIDER',
                      'bg-amber-950/80 text-amber-400 border-amber-500/40': b.position === 'HERO_SIDE_TOP' || b.position === 'HERO_SIDE_BOTTOM'
                    }"
                    class="px-3 py-1 rounded-xl border font-bold text-[11px] whitespace-nowrap inline-flex items-center gap-1.5">
                    <i class="pi pi-tag text-xs"></i>
                    <span>{{ getPositionLabel(b.position) }}</span>
                  </span>
                </td>

                <!-- Text Overlay Mode Badge -->
                <td class="p-4 text-center">
                  <span 
                    [ngClass]="b.showOverlay ? 'bg-amber-950/80 text-amber-400 border-amber-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'"
                    class="px-2.5 py-1 rounded-lg text-[10px] font-bold border">
                    {{ b.showOverlay ? '⚙️ Chữ đè' : '🎨 Ảnh sạch' }}
                  </span>
                </td>

                <!-- Priority Index -->
                <td class="p-4 text-center">
                  <span class="bg-slate-900 border border-slate-800 font-bold px-2.5 py-1 rounded-lg text-amber-400 font-mono">
                    #{{ b.priorityIndex || 1 }}
                  </span>
                </td>

                <!-- Active Toggle Switch -->
                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button 
                      type="button" 
                      (click)="toggleActive(b)"
                      [class.bg-emerald-600]="b.isActive !== false"
                      [class.bg-slate-700]="b.isActive === false"
                      class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                      <span 
                        [class.translate-x-4]="b.isActive !== false"
                        [class.translate-x-0]="b.isActive === false"
                        class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                    <span class="text-xs font-bold" [class.text-emerald-400]="b.isActive !== false" [class.text-slate-500]="b.isActive === false">
                      {{ b.isActive !== false ? 'Hiển thị' : 'Ẩn' }}
                    </span>
                  </div>
                </td>

                <!-- Action Buttons -->
                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button 
                      (click)="openModal(b)"
                      class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-blue-600/30 hover:border-blue-500 text-blue-400 border border-slate-700 flex items-center justify-center transition-all cursor-pointer">
                      <i class="pi pi-pencil text-xs"></i>
                    </button>
                    <button 
                      (click)="openDeleteModal(b)"
                      class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-red-600/30 hover:border-red-500 text-red-400 border border-slate-700 flex items-center justify-center transition-all cursor-pointer">
                      <i class="pi pi-trash text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredBanners().length === 0">
                <td colspan="7" class="p-8 text-center text-slate-500">Chưa có Banner nào thuộc danh mục này. Hãy bấm "Thêm Banner Mới".</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- BANNER MODAL WITH SMART TOGGLE -->
      <div *ngIf="showModal()" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative max-h-[85vh] flex flex-col text-slate-100">
          
          <!-- STICKY MODAL HEADER -->
          <div class="flex items-center justify-between border-b border-slate-800 px-4 py-3 shrink-0 bg-[#111827]">
            <h3 class="text-sm font-black text-white uppercase tracking-wider">
              {{ editingBannerId() ? 'Chỉnh Sửa Banner' : 'Tạo Banner Mới' }}
            </h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-white cursor-pointer p-1">
              <i class="pi pi-times text-sm"></i>
            </button>
          </div>

          <!-- SCROLLABLE FORM BODY -->
          <form (ngSubmit)="saveBanner()" id="bannerForm" class="flex-1 overflow-y-auto px-4 py-3 text-xs space-y-2.5 min-h-0">
            <!-- HÀNG 1 (Nhóm Nội dung Chữ): Cấu trúc 60/40 -->
            <div class="grid grid-cols-1 sm:grid-cols-10 gap-2.5">
              <!-- Cột trái (60%): TIÊU ĐỀ BANNER -->
              <div class="sm:col-span-6">
                <label class="block font-bold uppercase text-slate-400 mb-1">Tiêu Đề Banner *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.title" 
                  name="title" 
                  required 
                  placeholder="VD: Laptop Gaming MSI..." 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-bold" />
              </div>

              <!-- Cột phải (40%): NHÃN NỔI BẬT -->
              <div class="sm:col-span-4">
                <label class="block font-bold uppercase text-slate-400 mb-1">🏷️ Nhãn Nổi Bật (Badge)</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.subtitle" 
                  name="subtitle" 
                  placeholder="VD: 🔥 DEAL HOT MỖI NGÀY..." 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-bold text-xs" />
              </div>
            </div>

            <!-- HÀNG 2 (Nhóm Cấu hình Hệ thống): Full Width -->
            <div>
              <label class="block font-bold uppercase text-slate-400 mb-1">Vị Trí Hiển Thị *</label>
              <select 
                [(ngModel)]="formData.position" 
                name="position" 
                required
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-red-500 cursor-pointer font-bold">
                <option value="HERO_SLIDER">🖼️ Hero Carousel Slider (16:9)</option>
                <option value="HERO_SIDE_TOP">📌 Card Phụ Trên Bên Phải</option>
                <option value="HERO_SIDE_BOTTOM">📌 Card Phụ Dưới Bên Phải</option>
                <option value="FLOATING_LEFT">🎯 Floating Banner TRÁI (Dán mép)</option>
                <option value="FLOATING_RIGHT">🎯 Floating Banner PHẢI (Dán mép)</option>
              </select>
            </div>

            <!-- HÀNG 3: Box màu vàng khuyên dùng ảnh -->
            <div class="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-500/40 rounded-xl px-3 py-1.5 font-medium flex items-center gap-1.5">
              <span>{{ getDimensionHint(formData.position) }}</span>
            </div>

            <!-- UPLOAD BLOCK WITH 2 TABS & LIVE PREVIEW -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2">
              <!-- Tabs Selector -->
              <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span class="font-black uppercase text-white text-[10px]">Hình Ảnh Banner *</span>
                
                <div class="flex bg-slate-950 p-0.5 rounded-lg text-[9px] font-bold border border-slate-800">
                  <button 
                    type="button" 
                    (click)="uploadTab.set('FILE')" 
                    [ngClass]="{
                      'bg-[#E30019] text-white font-bold shadow-xs': uploadTab() === 'FILE',
                      'text-slate-400 hover:text-white': uploadTab() !== 'FILE'
                    }"
                    class="px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1">
                    <i class="pi pi-upload text-[9px] text-white"></i> Tải Từ Máy
                  </button>
                  
                  <button 
                    type="button" 
                    (click)="uploadTab.set('URL')" 
                    [ngClass]="{
                      'bg-[#E30019] text-white font-bold shadow-xs': uploadTab() === 'URL',
                      'text-slate-400 hover:text-white': uploadTab() !== 'URL'
                    }"
                    class="px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1">
                    <i class="pi pi-link text-[9px] text-white"></i> Link URL Ngoài
                  </button>
                </div>
              </div>

              <!-- Tab 1: Upload File from Computer -->
              <div *ngIf="uploadTab() === 'FILE'">
                <button 
                  type="button" 
                  (click)="bannerFileInput.click()" 
                  class="w-full bg-slate-950 border border-dashed border-slate-800 hover:border-red-500 text-slate-300 font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs text-xs">
                  <i class="pi pi-cloud-upload text-red-500"></i>
                  <span>{{ loadingUpload() ? 'Đang nén & tải ảnh lên...' : '📁 Chọn file ảnh từ máy tính' }}</span>
                </button>
                <input type="file" #bannerFileInput (change)="onFilePicked($event)" accept="image/*" class="hidden" />
              </div>

              <!-- Tab 2: Input URL FIRST, then Action Button -->
              <div *ngIf="uploadTab() === 'URL'" class="flex items-center gap-2">
                <input 
                  type="text" 
                  [(ngModel)]="formData.imageUrl" 
                  name="imageUrl" 
                  placeholder="Dán link ảnh (VD: https://cdn.hstatic.net/...)" 
                  class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 font-mono text-[10px] text-white placeholder-slate-500 focus:outline-none focus:border-red-500" />

                <button 
                  type="button" 
                  (click)="uploadUrlCloudinary()" 
                  [disabled]="!formData.imageUrl || loadingUpload()"
                  class="bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-white font-bold px-3 py-1 rounded-xl flex items-center gap-1 shrink-0 cursor-pointer transition-all shadow-xs text-[10px]">
                  <i class="pi pi-bolt text-amber-400"></i>
                  <span>{{ loadingUpload() ? 'Đang bốc...' : '⚡ Bốc về Cloudinary' }}</span>
                </button>
              </div>

              <!-- LIVE UNCROPPED FULL IMAGE PREVIEW BOX -->
              <div class="space-y-1">
                <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Xem trước trọn vẹn 100% ({{ getAspectRatioLabel(formData.position) }}):</span>
                  <span *ngIf="formData.imageUrl" class="text-emerald-400 font-mono text-[9px] font-bold">✓ Ready</span>
                </div>
                
                <div [ngClass]="getAspectBoxClass(formData.position)">
                  <img 
                    *ngIf="formData.imageUrl; else noPreview" 
                    [src]="formData.imageUrl" 
                    (error)="onPreviewError($event)"
                    class="max-w-full max-h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105" />
                  <ng-template #noPreview>
                    <div class="text-center p-2 text-slate-500">
                      <i class="pi pi-image text-xl mb-0.5 text-slate-600"></i>
                      <div class="text-[9px] font-bold">Chưa có hình ảnh</div>
                    </div>
                  </ng-template>
                </div>
              </div>
            </div>

            <!-- SMART TOGGLE: SHOW OVERLAY TEXT ON IMAGE -->
            <div class="bg-amber-950/40 border border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <label class="block font-black uppercase text-amber-300 text-[10px]">⚙️ Smart Toggle: Chữ Đè Lên Ảnh (Overlay Text)</label>
                <p class="text-[9px] text-slate-400">Tắt nếu ảnh đã thiết kế sẵn chữ (Marketing Graphic). Bật nếu dùng ảnh thô chưa có chữ.</p>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button 
                  type="button" 
                  (click)="formData.showOverlay = !formData.showOverlay"
                  [class.bg-amber-500]="formData.showOverlay"
                  [class.bg-slate-700]="!formData.showOverlay"
                  class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-xs">
                  <span 
                    [class.translate-x-5]="formData.showOverlay"
                    [class.translate-x-0]="!formData.showOverlay"
                    class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
                <span class="text-xs font-bold" [class.text-amber-400]="formData.showOverlay" [class.text-slate-500]="!formData.showOverlay">
                  {{ formData.showOverlay ? '🟢 Bật chữ đè' : '🎨 Ảnh thô sạch' }}
                </span>
              </div>
            </div>

            <!-- TARGET LINK BUILDER (SEO SLUGS) -->
            <div class="space-y-2 bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <div class="flex items-center justify-between">
                <label class="block font-black uppercase text-white text-[10px]">🎯 Bộ Dựng Link Tự Động (Target Link Builder)</label>
                <span class="text-[9px] font-bold text-red-400 bg-red-950/80 border border-red-500/40 px-1.5 py-0.5 rounded-md">
                  SEO Slugs
                </span>
              </div>

              <!-- Mode Selector -->
              <div class="grid grid-cols-3 gap-1.5 text-[9px] font-bold">
                <button 
                  type="button" 
                  (click)="linkBuilderMode.set('CATEGORY')" 
                  [class.bg-[#E30019]]="linkBuilderMode() === 'CATEGORY'"
                  [class.text-white]="linkBuilderMode() === 'CATEGORY'"
                  [class.bg-slate-950]="linkBuilderMode() !== 'CATEGORY'"
                  [class.text-slate-400]="linkBuilderMode() !== 'CATEGORY'"
                  class="p-1.5 rounded-lg border border-slate-800 text-center transition-all cursor-pointer shadow-xs">
                  📁 Danh Mục (Slug)
                </button>

                <button 
                  type="button" 
                  (click)="linkBuilderMode.set('PRODUCT')" 
                  [class.bg-[#E30019]]="linkBuilderMode() === 'PRODUCT'"
                  [class.text-white]="linkBuilderMode() === 'PRODUCT'"
                  [class.bg-slate-950]="linkBuilderMode() !== 'PRODUCT'"
                  [class.text-slate-400]="linkBuilderMode() !== 'PRODUCT'"
                  class="p-1.5 rounded-lg border border-slate-800 text-center transition-all cursor-pointer shadow-xs">
                  📦 Chi Tiết SP
                </button>

                <button 
                  type="button" 
                  (click)="linkBuilderMode.set('CUSTOM')" 
                  [class.bg-[#E30019]]="linkBuilderMode() === 'CUSTOM'"
                  [class.text-white]="linkBuilderMode() === 'CUSTOM'"
                  [class.bg-slate-950]="linkBuilderMode() !== 'CUSTOM'"
                  [class.text-slate-400]="linkBuilderMode() !== 'CUSTOM'"
                  class="p-1.5 rounded-lg border border-slate-800 text-center transition-all cursor-pointer shadow-xs">
                  ✏️ Link Tùy Chỉnh
                </button>
              </div>

              <!-- Option 1: Category Link Selector -->
              <div *ngIf="linkBuilderMode() === 'CATEGORY'">
                <label class="block font-bold text-slate-400 text-[9px] mb-1">Chọn Danh Mục Sản Phẩm (SEO Slug):</label>
                <select 
                  (change)="onCategoryLinkSelect($event)" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-white font-bold text-xs focus:outline-none focus:border-red-500 cursor-pointer">
                  <option value="">-- Chọn danh mục cần chuyển hướng --</option>
                  <option *ngFor="let cat of categoryList()" [value]="cat.slug || getSlugFromName(cat.name)">
                    📁 {{ cat.name }} (/products?category={{ cat.slug || getSlugFromName(cat.name) }})
                  </option>
                </select>
              </div>

              <!-- Option 2: Product Link Selector -->
              <div *ngIf="linkBuilderMode() === 'PRODUCT'">
                <label class="block font-bold text-slate-400 text-[9px] mb-1">Chọn Sản Phẩm Cụ Thể (Product Slug):</label>
                <select 
                  (change)="onProductLinkSelect($event)" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-white font-bold text-xs focus:outline-none focus:border-red-500 cursor-pointer">
                  <option value="">-- Chọn sản phẩm cụ thể --</option>
                  <option *ngFor="let p of productList()" [value]="p.slug">
                    📦 {{ p.name }} (/products/{{ p.slug }})
                  </option>
                </select>
              </div>

              <!-- DISPLAY READONLY CODE BADGE FOR CATEGORY/PRODUCT MODE -->
              <div *ngIf="linkBuilderMode() !== 'CUSTOM'" class="pt-0.5 flex items-center gap-1.5 text-[10px]">
                <span class="font-bold text-slate-400">🔗 Link tự động sinh:</span>
                <code class="bg-red-950/80 text-red-400 font-mono font-bold px-2 py-0.5 rounded-md border border-red-500/40 truncate max-w-full">
                  {{ formData.targetUrl || 'Chưa chọn' }}
                </code>
              </div>

              <!-- CUSTOM MANUAL INPUT BOX ONLY FOR CUSTOM MODE -->
              <div *ngIf="linkBuilderMode() === 'CUSTOM'" class="pt-0.5">
                <label class="block font-bold text-slate-400 text-[9px] mb-1">Nhập Link Tùy Chỉnh:</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.targetUrl" 
                  (blur)="normalizeTargetUrl()"
                  name="targetUrl" 
                  placeholder="/products?category=laptop-gaming" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-red-400 font-mono text-[11px] font-bold focus:outline-none focus:border-red-500" />
              </div>
            </div>

            <!-- Priority & Status Toggle Switch Row -->
            <div class="grid grid-cols-2 gap-3 items-center bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <div>
                <label class="block font-bold uppercase text-slate-400 mb-1">Độ Ưu Tiên (Priority)</label>
                <input 
                  type="number" 
                  [(ngModel)]="formData.priorityIndex" 
                  name="priorityIndex" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-white font-bold focus:outline-none focus:border-red-500 font-mono" />
              </div>

              <div class="flex flex-col justify-center">
                <label class="block font-bold uppercase text-slate-400 mb-1">Trạng Thái Banner</label>
                <div class="flex items-center gap-2 pt-0.5">
                  <button 
                    type="button" 
                    (click)="formData.isActive = !formData.isActive"
                    [class.bg-emerald-600]="formData.isActive"
                    [class.bg-slate-700]="!formData.isActive"
                    class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-xs">
                    <span 
                      [class.translate-x-5]="formData.isActive"
                      [class.translate-x-0]="!formData.isActive"
                      class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                  </button>
                  <span class="text-xs font-bold" [class.text-emerald-400]="formData.isActive" [class.text-slate-500]="!formData.isActive">
                    {{ formData.isActive ? '🟢 Hiển thị' : '⚪ Đang ẩn' }}
                  </span>
                </div>
              </div>
            </div>
          </form>

          <!-- STICKY ACTION FOOTER -->
          <div class="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-slate-800 shrink-0 bg-[#111827]">
            <button type="button" (click)="closeModal()" class="px-4 py-1.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 text-xs">Hủy bỏ</button>
            <button 
              type="submit" 
              form="bannerForm"
              [disabled]="loadingSave() || loadingUpload()"
              class="px-5 py-1.5 rounded-xl font-bold text-white bg-[#E30019] hover:bg-red-700 flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/30 text-xs">
              <i class="pi pi-spin pi-spinner" *ngIf="loadingSave()"></i>
              <span>{{ editingBannerId() ? 'Cập Nhật Banner' : 'Tạo Banner Mới' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="deleteModalBanner()" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative p-6 space-y-4 text-slate-100">
          <div class="flex items-center gap-3 text-red-500">
            <div class="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center shrink-0">
              <i class="pi pi-exclamation-triangle text-xl"></i>
            </div>
            <div>
              <h3 class="text-sm font-black uppercase tracking-wider text-white">Xác nhận xóa Banner</h3>
              <p class="text-[11px] text-slate-400">Hành động này không thể hoàn tác</p>
            </div>
          </div>

          <p class="text-xs text-slate-300">
            Bạn có chắc chắn muốn xóa Banner <strong class="text-white font-bold">"{{ deleteModalBanner()?.title }}"</strong>?
          </p>

          <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button (click)="deleteModalBanner.set(null)" class="px-4 py-2 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 text-xs">Hủy</button>
            <button (click)="confirmDelete()" class="px-5 py-2.5 rounded-xl font-bold text-white bg-[#E30019] hover:bg-red-700 text-xs cursor-pointer shadow-md shadow-red-600/30">
              Xóa Vĩnh Viễn
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminBannerListComponent implements OnInit {
  banners = signal<any[]>([]);
  filterPosition = signal<string>('ALL');

  categoryList = signal<any[]>([]);
  productList = signal<any[]>([]);

  showModal = signal(false);
  uploadTab = signal<'FILE' | 'URL'>('FILE');
  linkBuilderMode = signal<'CATEGORY' | 'PRODUCT' | 'CUSTOM'>('CATEGORY');
  editingBannerId = signal<number | null>(null);
  deleteModalBanner = signal<any | null>(null);

  loadingSave = signal(false);
  loadingUpload = signal(false);
  toastMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  formData: any = {
    title: '',
    subtitle: '',
    imageUrl: '',
    targetUrl: '',
    position: 'HERO_SLIDER',
    priorityIndex: 1,
    isActive: true,
    showOverlay: false
  };

  filteredBanners = computed(() => {
    const pos = this.filterPosition();
    const list = this.banners();
    if (pos === 'ALL') return list;
    if (pos === 'FLOATING') return list.filter(b => b.position === 'FLOATING_LEFT' || b.position === 'FLOATING_RIGHT');
    if (pos === 'HERO_SIDE') return list.filter(b => b.position === 'HERO_SIDE_TOP' || b.position === 'HERO_SIDE_BOTTOM');
    return list.filter(b => b.position === pos);
  });

  constructor(
    private adminService: AdminService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadBanners();
    this.loadCategoryAndProductLists();
  }

  loadCategoryAndProductLists(): void {
    this.productService.getCategories().subscribe({
      next: (res) => this.categoryList.set(res),
      error: () => {}
    });

    this.productService.getFeaturedProducts().subscribe({
      next: (res) => this.productList.set(res),
      error: () => {}
    });
  }

  showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  loadBanners(): void {
    this.adminService.getAllBanners().subscribe({
      next: (res) => this.banners.set(res),
      error: () => this.showToast('Lỗi khi tải danh sách Banner!', 'error')
    });
  }

  getPositionLabel(pos: string): string {
    switch (pos) {
      case 'HERO_SLIDER': return 'Hero Slider Chính';
      case 'HERO_SIDE_TOP': return 'Card Phụ Trên (Bên Phải)';
      case 'HERO_SIDE_BOTTOM': return 'Card Phụ Dưới (Bên Phải)';
      case 'FLOATING_LEFT': return '🎯 Floating TRÁI (Sticky)';
      case 'FLOATING_RIGHT': return '🎯 Floating PHẢI (Sticky)';
      default: return pos;
    }
  }

  getDimensionHint(pos: string): string {
    switch (pos) {
      case 'HERO_SLIDER':
        return '💡 Khuyên dùng ảnh ngang tỷ lệ 16:9 (1200 × 450px), dung lượng < 300KB';
      case 'HERO_SIDE_TOP':
      case 'HERO_SIDE_BOTTOM':
        return '💡 Khuyên dùng ảnh hình chữ nhật 2:1 (600 × 300px), dung lượng < 200KB';
      case 'FLOATING_LEFT':
      case 'FLOATING_RIGHT':
        return '💡 Khuyên dùng ảnh đứng dọc dán mép (160 × 600px), dung lượng < 200KB';
      default:
        return '💡 Khuyên dùng ảnh đã qua tối ưu nén WebP để hiển thị mượt nhất';
    }
  }

  getAspectRatioLabel(pos: string): string {
    switch (pos) {
      case 'HERO_SLIDER': return '16:9 Ngang';
      case 'HERO_SIDE_TOP':
      case 'HERO_SIDE_BOTTOM': return '2:1 Chữ Nhật';
      case 'FLOATING_LEFT':
      case 'FLOATING_RIGHT': return 'Đứng Dọc Mép Màn Hình';
      default: return 'Tỷ lệ chuẩn';
    }
  }

  getAspectBoxClass(pos: string): string {
    switch (pos) {
      case 'HERO_SLIDER':
        return 'w-full h-32 flex items-center justify-center bg-slate-900/5 rounded-xl border border-slate-200 overflow-hidden relative p-1 shadow-inner group';
      case 'HERO_SIDE_TOP':
      case 'HERO_SIDE_BOTTOM':
        return 'w-full h-28 flex items-center justify-center bg-slate-900/5 rounded-xl border border-slate-200 overflow-hidden relative p-1 shadow-inner group';
      case 'FLOATING_LEFT':
      case 'FLOATING_RIGHT':
        return 'w-24 h-36 flex items-center justify-center bg-slate-900/5 rounded-xl border border-slate-200 overflow-hidden relative p-1 shadow-inner group mx-auto';
      default:
        return 'w-full h-32 flex items-center justify-center bg-slate-900/5 rounded-xl border border-slate-200 overflow-hidden relative p-1 shadow-inner group';
    }
  }

  getSlugFromName(name: string): string {
    if (!name) return '';
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  onCategoryLinkSelect(event: any): void {
    const slug = event.target.value;
    if (slug) {
      this.formData.targetUrl = `/products?category=${slug}`;
    }
  }

  onProductLinkSelect(event: any): void {
    const slug = event.target.value;
    if (slug) {
      this.formData.targetUrl = `/products/${slug}`;
    }
  }

  normalizeTargetUrl(): void {
    if (!this.formData.targetUrl) return;
    let url = this.formData.targetUrl.trim();
    if (url && !url.startsWith('/') && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = '/' + url;
    }
    this.formData.targetUrl = url;
  }

  onPreviewError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500';
  }

  openModal(banner?: any): void {
    if (banner) {
      this.editingBannerId.set(banner.id);
      this.formData = { ...banner, subtitle: banner.subtitle || '', showOverlay: banner.showOverlay || false };
      this.uploadTab.set('URL');
      this.linkBuilderMode.set('CUSTOM');
    } else {
      this.editingBannerId.set(null);
      this.formData = {
        title: '',
        subtitle: '',
        imageUrl: '',
        targetUrl: '',
        position: 'HERO_SLIDER',
        priorityIndex: 1,
        isActive: true,
        showOverlay: false
      };
      this.uploadTab.set('FILE');
      this.linkBuilderMode.set('CATEGORY');
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingBannerId.set(null);
  }

  async onFilePicked(event: any): Promise<void> {
    const file = event.target?.files?.[0];
    if (!file) return;

    try {
      this.loadingUpload.set(true);
      const compressed = await ImageCompressorUtil.compressImage(file);
      this.adminService.uploadImageToCloudinary(compressed, 'banners').subscribe({
        next: (res) => {
          this.formData.imageUrl = res.url;
          this.loadingUpload.set(false);
          this.showToast('Đã tải ảnh Banner lên Cloudinary thành công!');
        },
        error: () => {
          this.loadingUpload.set(false);
          this.showToast('Lỗi tải ảnh lên Cloudinary!', 'error');
        }
      });
    } catch (e) {
      this.loadingUpload.set(false);
    }
  }

  uploadUrlCloudinary(): void {
    const url = this.formData.imageUrl;
    if (!url) return;

    this.loadingUpload.set(true);
    this.adminService.uploadUrlToCloudinary(url, 'banners').subscribe({
      next: (res) => {
        this.formData.imageUrl = res.url;
        this.loadingUpload.set(false);
        this.showToast('Bốc ảnh về Cloudinary thành công!');
      },
      error: () => {
        this.loadingUpload.set(false);
        this.showToast('Không thể bốc ảnh từ URL này!', 'error');
      }
    });
  }

  toggleActive(banner: any): void {
    banner.isActive = !banner.isActive;
    this.adminService.toggleBannerActive(banner.id).subscribe({
      next: () => this.showToast(`Đã ${banner.isActive ? 'hiển thị' : 'ẩn'} banner "${banner.title}"!`),
      error: () => {
        banner.isActive = !banner.isActive;
        this.showToast('Lỗi khi đổi trạng thái banner!', 'error');
      }
    });
  }

  saveBanner(): void {
    this.normalizeTargetUrl();

    if (!this.formData.title || !this.formData.imageUrl || !this.formData.position) {
      alert('Vui lòng điền tiêu đề, hình ảnh và vị trí banner!');
      return;
    }

    this.loadingSave.set(true);
    const id = this.editingBannerId();

    if (id) {
      this.adminService.updateBanner(id, this.formData).subscribe({
        next: () => {
          this.loadingSave.set(false);
          this.closeModal();
          this.showToast('Cập nhật Banner thành công!');
          this.loadBanners();
        },
        error: () => {
          this.loadingSave.set(false);
          this.showToast('Lỗi khi cập nhật Banner!', 'error');
        }
      });
    } else {
      this.adminService.createBanner(this.formData).subscribe({
        next: () => {
          this.loadingSave.set(false);
          this.closeModal();
          this.showToast('Tạo Banner mới thành công!');
          this.loadBanners();
        },
        error: () => {
          this.loadingSave.set(false);
          this.showToast('Lỗi khi tạo Banner mới!', 'error');
        }
      });
    }
  }

  openDeleteModal(banner: any): void {
    this.deleteModalBanner.set(banner);
  }

  confirmDelete(): void {
    const b = this.deleteModalBanner();
    if (!b) return;

    this.adminService.deleteBanner(b.id).subscribe({
      next: () => {
        this.deleteModalBanner.set(null);
        this.showToast(`Đã xóa Banner "${b.title}" thành công!`);
        this.loadBanners();
      },
      error: () => {
        this.deleteModalBanner.set(null);
        this.showToast('Lỗi khi xóa Banner!', 'error');
      }
    });
  }
}

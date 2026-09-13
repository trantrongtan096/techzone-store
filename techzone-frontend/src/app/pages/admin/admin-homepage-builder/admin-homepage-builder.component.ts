import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HomepageBuilderService, HomepageBlock, UspItem, ProductShelf, BlogArticle, BrandItem } from '../../../services/homepage-builder.service';
import { ProductService } from '../../../services/product.service';
import { ArticleService } from '../../../services/article.service';
import { Brand, Category } from '../../../models/product.model';
import { Article, HomepageArticleItem } from '../../../models/article.model';

import { AdminHeaderComponent } from '../../../components/admin-header/admin-header.component';
import { resolveCategoryIcon } from '../../../components/icon-picker/category-icon-registry';

@Component({
  selector: 'app-admin-homepage-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminHeaderComponent],
  template: `
    <div class="flex flex-col gap-4 text-slate-100">
      
      <!-- Standardized Admin Header Component -->
      <app-admin-header 
        title="Quản Lý Trang Chủ (Homepage Builder)"
        subtitle="Tùy biến sắp xếp thứ tự khối, bật/tắt hiển thị, cụm sản phẩm shelves và cam kết dịch vụ real-time"
        icon="pi pi-palette"
        [badge]="activeShelvesBadge()"
        [breadcrumbs]="[{ label: 'Homepage Builder' }]">
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
            
            <button
              type="button"
              (click)="openRestoreDefaultConfirm()"
              [disabled]="blockReorderBusy()"
              class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all border border-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
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
                <tr
                  *ngFor="let blk of sortedBlocks(); let idx = index"
                  draggable="true"
                  (dragstart)="onBlockDragStart($event, blk.id)"
                  (dragover)="onBlockDragOver($event)"
                  (drop)="onBlockDrop($event, blk.id)"
                  (dragend)="onBlockDragEnd()"
                  [ngClass]="{
                    'opacity-50 bg-slate-800/60': draggedBlockId() === blk.id,
                    'hover:bg-slate-800/40': draggedBlockId() !== blk.id
                  }"
                  class="transition-colors">
                  <td class="p-3 text-center">
                    <span class="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 font-mono font-black text-amber-400 flex items-center justify-center mx-auto">
                      {{ idx + 1 }}
                    </span>
                  </td>
                  <td class="p-3 font-bold text-white">
                    <span class="inline-flex items-center gap-2">
                      <i class="pi pi-bars text-slate-500 cursor-grab" title="Kéo để đổi thứ tự"></i>
                      <span>{{ blk.name }}</span>
                    </span>
                  </td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                      {{ blk.type }}
                    </span>
                  </td>
                  <td class="p-3 text-center">
                    <button 
                      (click)="toggleBlockActive(blk.id)"
                      [disabled]="blockReorderBusy()"
                      [ngClass]="{
                        'bg-emerald-500/15 border-emerald-500/50': isBlockEffectivelyActive(blk),
                        'bg-slate-950 border-slate-800': !isBlockEffectivelyActive(blk)
                      }"
                      [title]="isBlockEffectivelyActive(blk) ? 'Đang hiển thị trên trang chủ' : 'Đang ẩn khỏi trang chủ'"
                      class="h-8 px-2.5 rounded-full border text-[11px] font-black transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                      <span
                        [ngClass]="{
                          'bg-emerald-500 justify-end': isBlockEffectivelyActive(blk),
                          'bg-slate-700 justify-start': !isBlockEffectivelyActive(blk)
                        }"
                        class="w-9 h-5 rounded-full p-0.5 flex transition-all">
                        <span class="w-4 h-4 rounded-full bg-white shadow-sm"></span>
                      </span>
                      <span [class]="isBlockEffectivelyActive(blk) ? 'text-emerald-300' : 'text-slate-400'">{{ isBlockEffectivelyActive(blk) ? 'ON' : 'OFF' }}</span>
                    </button>
                  </td>
                  <td class="p-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button 
                        (click)="moveBlockOrder(blk.id, 'UP')"
                        [disabled]="idx === 0 || blockReorderBusy()"
                        class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-slate-800 text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700">
                        <i class="pi pi-arrow-up text-xs"></i>
                      </button>

                      <button 
                        (click)="moveBlockOrder(blk.id, 'DOWN')"
                        [disabled]="idx === sortedBlocks().length - 1 || blockReorderBusy()"
                        class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-slate-800 text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700">
                        <i class="pi pi-arrow-down text-xs"></i>
                      </button>
                    </div>
                  </td>
                  <td class="p-3 text-center">
                    <button 
                      (click)="navigateBlockConfig(blk)"
                      [disabled]="blockReorderBusy()"
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

      <!-- TAB 3: CẤU HÌNH CỤM SẢN PHẨM (PRODUCT SHELVES ENGINE) -->
      <div *ngIf="activeTab() === 'SHELVES'" class="space-y-4">
        <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h3 class="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i class="pi pi-tags text-blue-400 text-lg"></i>
                <span>Trình Quản Lý Cụm Sản Phẩm (Product Shelves Engine)</span>
              </h3>
              <p class="text-xs text-slate-400 mt-1">Điều khiển thứ tự, bộ lọc thương hiệu, giới hạn hiển thị & kiểu sắp xếp cho từng cụm sản phẩm trang chủ</p>
            </div>

            <button 
              (click)="openAddShelfModal()"
              class="px-4 py-2.5 bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2 shrink-0">
              <i class="pi pi-plus text-xs"></i>
              <span>Thêm Cụm Sản Phẩm Mới</span>
            </button>
          </div>

          <!-- Product Shelves List Container -->
          <div class="space-y-4">
            <div 
              *ngFor="let shf of builderService.shelves(); let idx = index" 
              draggable="true"
              (dragstart)="onShelfDragStart($event, shf.id)"
              (dragover)="onShelfDragOver($event)"
              (drop)="onShelfDrop($event, shf.id)"
              (dragend)="onShelfDragEnd()"
              [ngClass]="{
                'opacity-50 scale-[0.99] border-red-500/70': draggedShelfId() === shf.id,
                'hover:border-slate-700': draggedShelfId() !== shf.id
              }"
              class="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all shadow-md">
              
              <!-- Left Info Section: Drag/Order Handle + Title + Metadata + Filter Chips -->
              <div class="space-y-2.5 flex-1 min-w-0">
                <!-- Top Row: Drag Handle + Order Badge + Icon + Title -->
                <div class="flex items-center gap-3">
                  <!-- Move Order Controls (Up / Down + Order Index Badge) -->
                  <div
                    title="Kéo để đổi thứ tự"
                    class="flex items-center gap-1 shrink-0 bg-slate-950 p-1 rounded-xl border border-slate-800 cursor-grab active:cursor-grabbing select-none">
                    <span class="w-6 h-6 rounded-lg bg-slate-900 text-slate-500 flex items-center justify-center text-[10px]">
                      <i class="pi pi-bars"></i>
                    </span>
                    <button 
                      (click)="builderService.moveShelfOrder(shf.id, 'UP')"
                      [disabled]="idx === 0"
                      [class.opacity-30]="idx === 0"
                      class="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] transition-colors cursor-pointer disabled:cursor-not-allowed">
                      <i class="pi pi-chevron-up"></i>
                    </button>
                    
                    <span class="px-2 font-mono font-black text-amber-400 text-xs">#{{ idx + 1 }}</span>

                    <button 
                      (click)="builderService.moveShelfOrder(shf.id, 'DOWN')"
                      [disabled]="idx === builderService.shelves().length - 1"
                      [class.opacity-30]="idx === builderService.shelves().length - 1"
                      class="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] transition-colors cursor-pointer disabled:cursor-not-allowed">
                      <i class="pi pi-chevron-down"></i>
                    </button>
                  </div>

                  <!-- Shelf Icon & Title -->
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg shrink-0 shadow-inner">
                      <i [class]="shelfCategoryIcon(shf)"></i>
                    </span>
                    <h4 class="text-sm font-black text-white uppercase tracking-wide truncate">{{ shf.title }}</h4>
                  </div>
                </div>

                <!-- Metadata Row: Category, Limit, SortType -->
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-medium">
                  <div class="flex items-center gap-1.5">
                    <i class="pi pi-folder text-amber-400 text-xs"></i>
                    <span>Danh mục: <strong class="text-slate-200 font-bold bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800/80">{{ shelfCategoryName(shf) }}</strong></span>
                  </div>

                  <span class="text-slate-700">•</span>

                  <div class="flex items-center gap-1.5">
                    <i class="pi pi-list text-blue-400 text-xs"></i>
                    <span>Hiển thị: <strong class="text-slate-200 font-bold font-mono">{{ shf.limit || 5 }} sản phẩm</strong></span>
                  </div>

                  <span class="text-slate-700">•</span>

                  <div class="flex items-center gap-1.5">
                    <i class="pi pi-sort-amount-down text-emerald-400 text-xs"></i>
                    <span>Sắp xếp: <strong class="text-slate-200 font-bold">{{ getSortTypeLabel(shf.sortType) }}</strong></span>
                  </div>
                </div>

                <!-- Sub-Filter Chips Pill Badges -->
                <div *ngIf="shf.subFilters && shf.subFilters.length > 0" class="flex flex-wrap items-center gap-1.5 pt-1">
                  <span class="text-[11px] text-slate-500 font-bold uppercase tracking-wider mr-1">Thẻ lọc:</span>
                  <span 
                    *ngFor="let chip of shf.subFilters" 
                    class="px-2.5 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-bold shadow-xs">
                    {{ chip }}
                  </span>
                </div>
              </div>

              <!-- Right Action Controls Row: Preview, Edit, Toggle Switch, Delete -->
              <div class="flex items-center gap-2 shrink-0 self-end lg:self-center">
                
                <!-- Xem trước Button -->
                <button 
                  type="button"
                  (click)="openPreviewShelfModal(shf)"
                  class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs">
                  <i class="pi pi-eye text-amber-400 text-xs"></i>
                  <span>Xem trước</span>
                </button>

                <!-- Sửa Button -->
                <button 
                  type="button"
                  (click)="openEditShelfModal(shf)"
                  class="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 text-white font-bold text-xs rounded-xl border border-slate-700 hover:border-blue-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs">
                  <i class="pi pi-pencil text-blue-400 text-xs"></i>
                  <span>Sửa</span>
                </button>

                <!-- Modern ON/OFF Toggle Switch -->
                <button 
                  type="button"
                  (click)="toggleShelfActive(shf.id)"
                  [disabled]="blockReorderBusy()"
                  [ngClass]="{
                    'bg-emerald-500/15 border-emerald-500/50': shf.active,
                    'bg-slate-950 border-slate-800': !shf.active
                  }"
                  [title]="shf.active ? 'Đang hiển thị trên trang chủ' : 'Đang ẩn khỏi trang chủ'"
                  class="h-8 px-2.5 rounded-full border text-[11px] font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed">
                  <span
                    [ngClass]="{
                      'bg-emerald-500 justify-end': shf.active,
                      'bg-slate-700 justify-start': !shf.active
                    }"
                    class="w-9 h-5 rounded-full p-0.5 flex transition-all">
                    <span class="w-4 h-4 rounded-full bg-white shadow-sm"></span>
                  </span>
                  <span [class]="shf.active ? 'text-emerald-300' : 'text-slate-400'">{{ shf.active ? 'ON' : 'OFF' }}</span>
                </button>

                <!-- Xóa Button (Red Outline Icon Button) -->
                <button 
                  type="button"
                  (click)="promptDeleteShelf(shf)"
                  title="Xóa cụm sản phẩm này"
                  class="w-8 h-8 rounded-xl bg-slate-950 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/40 flex items-center justify-center transition-all cursor-pointer">
                  <i class="pi pi-trash text-xs"></i>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: THUONG HIEU & BLOG SHOWCASE -->
      <div *ngIf="activeTab() === 'BLOGS_BRANDS'" class="space-y-6">
        <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div class="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
            <div>
              <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i class="pi pi-building text-amber-400"></i>
                <span>Thương Hiệu Đồng Hành</span>
              </h3>
              <p class="text-xs text-slate-400 mt-1">{{ visibleBrandCount() }}/{{ builderService.brands().length }} đang hiển thị • giới hạn {{ brandLimit }} logo</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              <div class="relative">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input [(ngModel)]="brandSearchQuery" placeholder="Tìm thương hiệu..." class="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500" />
              </div>
              <button (click)="setAllBrands(true)" class="px-3 py-2 bg-slate-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all">Hiện tất cả</button>
              <button (click)="setAllBrands(false)" class="px-3 py-2 bg-slate-800 hover:bg-red-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all">Ẩn tất cả</button>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
            <label class="text-xs font-bold text-slate-300 uppercase">Giới hạn hiển thị:</label>
            <input type="number" min="1" max="24" [(ngModel)]="brandLimit" (change)="saveBrandLimit()" class="w-20 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-red-500" />
            <span class="text-[11px] text-slate-500">Homepage lấy theo thứ tự từ trên xuống.</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div *ngFor="let b of filteredBrands(); let idx = index" draggable="true" (dragstart)="onBrandDragStart($event, b.id)" (dragover)="onGenericDragOver($event)" (drop)="onBrandDrop($event, b.id)" (dragend)="onBrandDragEnd()" [class.opacity-50]="draggedBrandId() === b.id" class="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition-all">
              <div class="min-w-0 flex items-center gap-2">
                <i class="pi pi-bars text-slate-500 cursor-grab" title="Kéo để đổi thứ tự"></i>
                <span class="text-amber-400 font-black text-xs">#{{ b.displayOrder || idx + 1 }}</span>
                <span class="font-black text-xs text-white uppercase tracking-wider truncate">{{ b.name }}</span>
              </div>
              <button (click)="toggleBrand(b.id)" [ngClass]="{ 'bg-emerald-500/15 border-emerald-500/50': b.showOnHomepage, 'bg-slate-950 border-slate-800': !b.showOnHomepage }" class="h-7 px-2 rounded-full border text-[10px] font-black transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0">
                <span [class]="b.showOnHomepage ? 'w-2 h-2 rounded-full bg-emerald-400' : 'w-2 h-2 rounded-full bg-slate-600'"></span>
                <span [class]="b.showOnHomepage ? 'text-emerald-300' : 'text-slate-400'">{{ b.showOnHomepage ? 'Hiện' : 'Ẩn' }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div class="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
            <div>
              <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i class="pi pi-newspaper text-slate-300"></i>
                <span>Tin Tức Công Nghệ</span>
              </h3>
              <p class="text-xs text-slate-400 mt-1">Đang hiển thị {{ visibleBlogCount() }}/{{ blogLimit }} bài • {{ blogMode === 'MANUAL' ? 'chọn thủ công' : 'tự động lấy bài mới nhất' }}</p>
            </div>

            <div *ngIf="blogMode === 'MANUAL'" class="flex flex-col sm:flex-row gap-2">
              <div class="relative">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input [(ngModel)]="blogSearchQuery" placeholder="Tìm bài viết..." class="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500" />
              </div>
              <select [(ngModel)]="blogCategoryFilter" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500">
                <option value="Tất cả">Tất cả chuyên mục</option>
                <option *ngFor="let category of blogCategories()" [value]="category">{{ category }}</option>
              </select>
              <button type="button" (click)="openAddBlogModal()" class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl border border-red-500 transition-all inline-flex items-center gap-1.5">
                <i class="pi pi-plus text-[10px]"></i>
                Thêm bài viết
              </button>
              <button (click)="setAllBlogs(true)" class="px-3 py-2 bg-slate-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all">Hiện tất cả</button>
              <button (click)="setAllBlogs(false)" class="px-3 py-2 bg-slate-800 hover:bg-red-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all">Ẩn tất cả</button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
            <div>
              <div class="text-xs font-bold text-slate-300 uppercase mb-2">Chế độ hiển thị</div>
              <div class="flex flex-wrap gap-2">
                <button (click)="setBlogMode('MANUAL')" [ngClass]="blogMode === 'MANUAL' ? 'border-red-500 bg-red-500/10 text-white' : 'border-slate-700 bg-slate-900 text-slate-400'" class="px-3 py-2 rounded-xl border text-xs font-bold transition-all">● Thủ công</button>
                <button (click)="setBlogMode('AUTO_LATEST')" [ngClass]="blogMode === 'AUTO_LATEST' ? 'border-red-500 bg-red-500/10 text-white' : 'border-slate-700 bg-slate-900 text-slate-400'" class="px-3 py-2 rounded-xl border text-xs font-bold transition-all">○ Tự động lấy bài mới nhất</button>
              </div>
            </div>

            <div *ngIf="blogMode === 'AUTO_LATEST'" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label class="text-xs font-bold text-slate-300 uppercase">Số bài
                <input type="number" min="1" max="12" [(ngModel)]="blogLimit" (change)="saveBlogSettings()" class="block mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-red-500" />
              </label>
              <label class="text-xs font-bold text-slate-300 uppercase">Chuyên mục
                <select [(ngModel)]="blogAutoCategory" (change)="saveBlogSettings()" class="block mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500">
                  <option value="Tất cả">Tất cả</option>
                  <option *ngFor="let category of blogCategories()" [value]="category">{{ category }}</option>
                </select>
              </label>
              <label class="text-xs font-bold text-slate-300 uppercase">Sắp xếp
                <select [(ngModel)]="blogAutoSort" (change)="saveBlogSettings()" class="block mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500">
                  <option value="NEWEST">Mới nhất</option>
                  <option value="MOST_VIEWED">Nhiều lượt xem</option>
                  <option value="FEATURED">Bài nổi bật</option>
                </select>
              </label>
              <label class="sm:col-span-3 flex items-center gap-2 text-xs font-bold text-slate-300">
                <input type="checkbox" checked disabled class="accent-red-600" />
                Chỉ lấy bài đã xuất bản
              </label>
            </div>

            <div *ngIf="blogMode === 'MANUAL'" class="flex items-center text-xs text-slate-400">
              Kéo thả để đổi thứ tự. Toggle từng bài để quyết định bài nào xuất hiện ngoài trang chủ.
            </div>
          </div>

          <div *ngIf="blogMode === 'MANUAL'" class="space-y-3">
            <div *ngFor="let art of filteredBlogs(); let idx = index" draggable="true" (dragstart)="onBlogDragStart($event, art.id)" (dragover)="onGenericDragOver($event)" (drop)="onBlogDrop($event, art.id)" (dragend)="onBlogDragEnd()" [class.opacity-50]="draggedBlogId() === art.id" class="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-4 hover:border-slate-700 transition-all">
              <div class="flex items-center gap-3 min-w-0">
                <i class="pi pi-bars text-slate-500 cursor-grab" title="Kéo để đổi thứ tự"></i>
                <span class="text-amber-400 font-black text-xs w-8">#{{ art.displayOrder || idx + 1 }}</span>
                <img [src]="art.image" class="w-12 h-12 rounded-xl object-cover" />
                <div class="min-w-0">
                  <h4 class="text-xs font-bold text-white line-clamp-1">{{ art.title }}</h4>
                  <span class="text-[10px] text-amber-400 font-bold uppercase">{{ art.category }} • {{ art.date }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button type="button" (click)="previewBlog(art)" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700">Xem trước</button>
                <button (click)="toggleBlog(art.id)" [ngClass]="{ 'bg-emerald-500/15 border-emerald-500/50': art.showOnHomepage, 'bg-slate-950 border-slate-800': !art.showOnHomepage }" class="h-8 px-3 rounded-full text-xs font-black border transition-all cursor-pointer shrink-0 inline-flex items-center gap-1.5">
                  <span [class]="art.showOnHomepage ? 'w-2 h-2 rounded-full bg-emerald-400' : 'w-2 h-2 rounded-full bg-slate-600'"></span>
                  <span [class]="art.showOnHomepage ? 'text-emerald-300' : 'text-slate-400'">{{ art.showOnHomepage ? 'Hiện' : 'Ẩn' }}</span>
                </button>
                <button type="button" (click)="removeBlogFromManualList(art.id)" title="Bỏ khỏi danh sách homepage, không xóa bài viết gốc" class="h-8 w-8 rounded-full bg-slate-950 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-500/60 transition-all inline-flex items-center justify-center">
                  <i class="pi pi-trash text-xs"></i>
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="blogMode === 'AUTO_LATEST'" class="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
            Chế độ tự động sẽ lấy các bài đã xuất bản theo cấu hình ở trên. Danh sách thủ công, drag/drop và toggle từng bài được ẩn để tránh nhầm lẫn.
          </div>
        </div>
      </div>

      <!-- MODAL CHỌN BÀI VIẾT HOMEPAGE -->
      <div *ngIf="showAddBlogModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl text-slate-100 flex flex-col overflow-hidden">
          <div class="flex items-start justify-between gap-4 border-b border-slate-800 p-5 bg-[#111827] shrink-0">
            <div>
              <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i class="pi pi-plus text-red-500"></i>
                <span>Chọn bài viết</span>
              </h3>
              <p class="text-xs text-slate-400 mt-1">Chọn bài viết hiển thị ngoài trang chủ. Bài đã có trong danh sách sẽ không được thêm trùng.</p>
            </div>
            <button type="button" (click)="closeAddBlogModal()" class="text-slate-400 hover:text-white cursor-pointer">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
              <div class="relative">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input [(ngModel)]="blogPickerSearchQuery" placeholder="Tìm theo tiêu đề bài viết..." class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500" />
              </div>
              <select [(ngModel)]="blogPickerCategoryFilter" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
                <option value="Tất cả">Tất cả chuyên mục</option>
                <option *ngFor="let category of blogCategories()" [value]="category">{{ category }}</option>
              </select>
              <select [(ngModel)]="blogPickerSort" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
                <option value="NEWEST">Mới nhất</option>
                <option value="OLDEST">Cũ nhất</option>
                <option value="AZ">A → Z</option>
                <option value="ZA">Z → A</option>
              </select>
            </div>

            <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <span class="text-xs font-bold text-slate-300">Đã chọn: {{ selectedBlogIds().length }} bài</span>
              <span class="text-[11px] text-slate-500">Chỉ chọn được bài đã xuất bản và chưa nằm trong Manual List.</span>
            </div>

            <div *ngIf="addingBlogs()" class="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-center text-xs text-slate-400">
              Đang tải bài viết...
            </div>

            <div *ngIf="!addingBlogs()" class="space-y-3">
              <button
                *ngFor="let art of selectableBlogs()"
                type="button"
                (click)="toggleSelectedBlog(art.id)"
                [ngClass]="selectedBlogIds().includes(art.id) ? 'border-red-500 bg-red-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700'"
                class="w-full p-3 rounded-2xl border flex items-center gap-3 text-left transition-all">
                <span [ngClass]="selectedBlogIds().includes(art.id) ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-950 border-slate-700 text-transparent'" class="w-5 h-5 rounded-md border inline-flex items-center justify-center text-[10px] font-black shrink-0">
                  ✓
                </span>
                <img [src]="art.image" class="w-14 h-14 rounded-xl object-cover bg-slate-800 shrink-0" />
                <div class="min-w-0 flex-1">
                  <h4 class="text-sm font-bold text-white line-clamp-1">{{ art.title }}</h4>
                  <p class="text-[11px] text-amber-400 font-bold uppercase mt-1">{{ art.category }} • {{ art.date }}</p>
                </div>
                <span class="hidden sm:inline-flex px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-black">PUBLISHED</span>
              </button>

              <div *ngIf="selectableBlogs().length === 0" class="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-center text-xs text-slate-400">
                Không tìm thấy bài viết phù hợp.
              </div>
            </div>
          </div>

          <div class="border-t border-slate-800 p-4 bg-[#111827] shrink-0 flex flex-col sm:flex-row sm:justify-end gap-2">
            <button type="button" (click)="closeAddBlogModal()" class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all">
              Hủy
            </button>
            <button
              type="button"
              (click)="submitSelectedBlogs()"
              [disabled]="selectedBlogIds().length === 0 || addingBlogs()"
              class="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-all">
              {{ addingBlogs() ? 'ĐANG THÊM...' : selectedBlogIds().length ? 'Thêm ' + selectedBlogIds().length + ' bài viết' : 'Thêm bài viết' }}
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL THÊM CỤM SẢN PHẨM MỚI -->
      <div *ngIf="showAddShelfModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl text-slate-100 flex flex-col overflow-hidden">
          <div class="flex items-center justify-between border-b border-slate-800 p-5 bg-[#111827] shrink-0">
            <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-plus text-xs text-red-500"></i>
              <span>Thêm Cụm Sản Phẩm Mới (Shelf)</span>
            </h3>
            <button (click)="showAddShelfModal.set(false)" class="text-slate-400 hover:text-white cursor-pointer">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="space-y-4 text-xs p-5 overflow-y-auto custom-scrollbar flex-1">
            <div>
              <label class="block font-bold text-slate-300 uppercase mb-1">Tiêu Đề Cụm Sản Phẩm *</label>
              <input 
                type="text" 
                [(ngModel)]="newShelfData.title" 
                (ngModelChange)="clearShelfError('title')"
                placeholder="VD: LAPTOP GAMING CAO CẤP..." 
                [class.border-red-500]="shelfErrors()['title']"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-red-500" />
              <p *ngIf="shelfErrors()['title']" class="mt-1 text-[11px] text-red-400 font-semibold">{{ shelfErrors()['title'] }}</p>
            </div>

            <div>
              <label class="block font-bold text-slate-300 uppercase mb-1">Danh Mục *</label>
              <select 
                [(ngModel)]="newShelfData.categorySlug" 
                (ngModelChange)="onShelfCategoryChange(newShelfData)"
                [class.border-red-500]="shelfErrors()['category']"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-red-500 cursor-pointer">
                <option *ngFor="let cat of categories()" [value]="cat.slug">{{ cat.name }}</option>
              </select>
              <div class="mt-2 text-[11px] font-semibold">
                <p *ngIf="selectedShelfCategory(newShelfData) && selectedShelfProductCount() > 0" class="text-slate-400">
                  <span class="text-white">{{ selectedShelfCategory(newShelfData)?.name }}</span>
                  <span class="mx-1">•</span>{{ selectedShelfProductCount() }} sản phẩm khả dụng
                  <span class="mx-1">•</span>{{ shelfBrands().length }} thương hiệu
                </p>
                <p *ngIf="!shelfBrandsLoading() && selectedShelfCategory(newShelfData) && selectedShelfProductCount() === 0" class="text-amber-400">
                  Danh mục này hiện chưa có sản phẩm.
                </p>
                <p *ngIf="shelfErrors()['category']" class="mt-1 text-red-400">{{ shelfErrors()['category'] }}</p>
              </div>
            </div>

            <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-red-400 flex items-center justify-center">
                <i [class]="shelfCategoryIcon(newShelfData)" class="text-lg"></i>
              </div>
              <div>
                <div class="text-[11px] font-bold uppercase text-slate-400">Icon Shelf</div>
                <div class="text-xs font-semibold text-slate-200">Tự động lấy từ icon của danh mục.</div>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-300 uppercase mb-2">Thẻ lọc nhanh</label>
              <div *ngIf="shelfBrands().length > 8" class="relative mb-2">
                <input [(ngModel)]="shelfBrandSearchQuery" type="text" placeholder="Tìm thương hiệu..."
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-red-500" />
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              </div>
              <p *ngIf="shelfBrandsLoading()" class="text-slate-400 font-semibold">Đang tải thương hiệu...</p>
              <p *ngIf="shelfBrandLoadError()" class="text-red-400 font-semibold">{{ shelfBrandLoadError() }}</p>
              <div *ngIf="!shelfBrandsLoading()" class="flex flex-wrap gap-2 max-h-44 overflow-y-auto custom-scrollbar">
                <label *ngFor="let brand of filteredShelfBrands()" class="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 cursor-pointer hover:border-red-500 transition-all select-none"
                  [class.bg-red-950]="newShelfData.brandIds.includes(brand.id)"
                  [class.border-red-500]="newShelfData.brandIds.includes(brand.id)">
                  <input type="checkbox" [checked]="newShelfData.brandIds.includes(brand.id)"
                    (change)="toggleShelfBrand(newShelfData, brand.id)" class="accent-red-600 pointer-events-none" />
                  <span>{{ brand.name }}</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">{{ brand.productCount || 0 }}</span>
                </label>
              </div>
              <p class="mt-2 text-slate-400">
                Đã chọn {{ newShelfData.brandIds.length }} thương hiệu. Tab "Tất cả" được tự động thêm.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label class="block font-bold text-slate-300 uppercase">Số sản phẩm hiển thị *
                <input type="number" min="1" max="20" step="1" [(ngModel)]="newShelfData.limit"
                  [class.border-red-500]="shelfErrors()['limit']"
                  class="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500" />
                <span *ngIf="shelfErrors()['limit']" class="block mt-1 text-[11px] text-red-400 normal-case">{{ shelfErrors()['limit'] }}</span>
              </label>
              <label class="block font-bold text-slate-300 uppercase">Sắp xếp sản phẩm
                <select [(ngModel)]="newShelfData.sortType"
                  [class.border-red-500]="shelfErrors()['sortType']"
                  class="mt-1 w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500">
                  <option value="BEST_SELLER">Bán chạy nhất</option><option value="NEWEST">Mới nhất</option>
                  <option value="PRICE_ASC">Giá tăng dần</option><option value="PRICE_DESC">Giá giảm dần</option>
                  <option value="DISCOUNT">Giảm giá nhiều nhất</option>
                </select>
                <span *ngIf="shelfErrors()['sortType']" class="block mt-1 text-[11px] text-red-400 normal-case">{{ shelfErrors()['sortType'] }}</span>
              </label>
            </div>
            <label class="flex items-center gap-2"><input type="checkbox" [(ngModel)]="newShelfData.showViewAll" class="accent-red-600" /> Hiển thị nút "Xem tất cả"</label>

            <div>
              <div class="font-bold text-slate-300 uppercase mb-2">Trạng thái</div>
              <label class="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="radio" name="newShelfActive" [(ngModel)]="newShelfData.active" [value]="true" class="accent-red-600" />
                <span>Hiển thị ngay</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="newShelfActive" [(ngModel)]="newShelfData.active" [value]="false" class="accent-red-600" />
                <span>Lưu nhưng chưa hiển thị</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-2 p-5 border-t border-slate-800 bg-[#111827] shrink-0">
            <button (click)="showAddShelfModal.set(false)" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer">Hủy</button>
            <button (click)="submitCreateShelf()" [disabled]="shelfSubmitting() || shelfBrandsLoading() || selectedShelfProductCount() === 0"
              class="px-5 py-2 bg-[#E30019] hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed shadow-lg">
              {{ shelfSubmitting() ? 'ĐANG TẠO...' : 'Thêm Cụm SP' }}
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL SỬA CỤM SẢN PHẨM (EDIT SHELF MODAL) -->
      <div *ngIf="showEditShelfModal() && editingShelf" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl text-slate-100 flex flex-col overflow-hidden">
          <div class="flex items-center justify-between border-b border-slate-800 p-5 bg-[#111827] shrink-0">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                <i class="pi pi-pencil"></i>
              </div>
              <h3 class="text-sm font-black text-white uppercase tracking-wider">Chỉnh Sửa Cụm Sản Phẩm (Shelf Engine)</h3>
            </div>
            <button (click)="showEditShelfModal.set(false)" class="text-slate-400 hover:text-white cursor-pointer w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="space-y-4 text-xs p-5 overflow-y-auto custom-scrollbar flex-1">
            <!-- Title -->
            <div>
              <label class="block font-bold text-slate-300 uppercase mb-1">Tiêu Đề Cụm Sản Phẩm *</label>
              <input 
                type="text" 
                [(ngModel)]="editingShelf.title" 
                (ngModelChange)="clearShelfError('title')"
                placeholder="VD: LAPTOP GAMING & BĂNG THÔNG CAO..." 
                [class.border-red-500]="shelfErrors()['title']"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-red-500" />
              <p *ngIf="shelfErrors()['title']" class="mt-1 text-[11px] text-red-400 font-semibold">{{ shelfErrors()['title'] }}</p>
            </div>

            <!-- Category & Icon Grid -->
            <div class="grid grid-cols-1 gap-3">
              <div>
                <label class="block font-bold text-slate-300 uppercase mb-1">Danh Mục Chính *</label>
                <select 
                  [(ngModel)]="editingShelf.categorySlug" 
                  (ngModelChange)="onShelfCategoryChange(editingShelf)"
                  [class.border-red-500]="shelfErrors()['category']"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-red-500 cursor-pointer">
                  <option *ngFor="let cat of categories()" [value]="cat.slug">{{ cat.name }}</option>
                </select>
                <div class="mt-2 text-[11px] font-semibold">
                  <p *ngIf="selectedShelfCategory(editingShelf) && selectedShelfProductCount() > 0" class="text-slate-400">
                    <span class="text-white">{{ selectedShelfCategory(editingShelf)?.name }}</span>
                    <span class="mx-1">•</span>{{ selectedShelfProductCount() }} sản phẩm khả dụng
                    <span class="mx-1">•</span>{{ shelfBrands().length }} thương hiệu
                  </p>
                  <p *ngIf="!shelfBrandsLoading() && selectedShelfCategory(editingShelf) && selectedShelfProductCount() === 0" class="text-amber-400">
                    Danh mục này hiện chưa có sản phẩm.
                  </p>
                  <p *ngIf="shelfErrors()['category']" class="mt-1 text-red-400">{{ shelfErrors()['category'] }}</p>
                </div>
              </div>

              <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-red-400 flex items-center justify-center">
                  <i [class]="shelfCategoryIcon(editingShelf)" class="text-lg"></i>
                </div>
                <div>
                  <div class="text-[11px] font-bold uppercase text-slate-400">Icon Shelf</div>
                  <div class="text-xs font-semibold text-slate-200">Tự động lấy từ icon của danh mục.</div>
                </div>
              </div>
            </div>

            <!-- Limit & SortType Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-300 uppercase mb-1">Giới Hạn Số Lượng *</label>
                <input type="number" min="1" max="20" step="1" [(ngModel)]="editingShelf.limit"
                  [class.border-red-500]="shelfErrors()['limit']"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-red-500" />
                <p *ngIf="shelfErrors()['limit']" class="mt-1 text-[11px] text-red-400 font-semibold">{{ shelfErrors()['limit'] }}</p>
              </div>

              <div>
                <label class="block font-bold text-slate-300 uppercase mb-1">Kiểu Sắp Xếp *</label>
                <select 
                  [(ngModel)]="editingShelf.sortType" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-red-500 cursor-pointer">
                  <option value="BEST_SELLER">🔥 Bán chạy nhất</option>
                  <option value="NEWEST">✨ Mới nhất</option>
                  <option value="DISCOUNT">⚡ Giảm giá nhiều nhất</option>
                  <option value="PRICE_ASC">💵 Giá tăng dần</option>
                  <option value="PRICE_DESC">💎 Giá giảm dần</option>
                </select>
                <p *ngIf="shelfErrors()['sortType']" class="mt-1 text-[11px] text-red-400 font-semibold">{{ shelfErrors()['sortType'] }}</p>
              </div>
            </div>

            <!-- Sub Filters -->
            <div>
              <label class="block font-bold text-slate-300 uppercase mb-2">Thẻ lọc nhanh</label>
              <div *ngIf="shelfBrands().length > 8" class="relative mb-2">
                <input [(ngModel)]="shelfBrandSearchQuery" type="text" placeholder="Tìm thương hiệu..."
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none focus:border-red-500" />
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              </div>
              <p *ngIf="shelfBrandsLoading()" class="text-slate-400 font-semibold">Đang tải thương hiệu...</p>
              <p *ngIf="shelfBrandLoadError()" class="text-red-400 font-semibold">{{ shelfBrandLoadError() }}</p>
              <div *ngIf="!shelfBrandsLoading()" class="flex flex-wrap gap-2 max-h-44 overflow-y-auto custom-scrollbar">
                <label *ngFor="let brand of filteredShelfBrands()" class="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 cursor-pointer hover:border-red-500 transition-all select-none"
                  [class.bg-red-950]="editingShelf.brandIds?.includes(brand.id)"
                  [class.border-red-500]="editingShelf.brandIds?.includes(brand.id)">
                  <input type="checkbox" [checked]="editingShelf.brandIds?.includes(brand.id)"
                    (change)="toggleShelfBrand(editingShelf, brand.id)" class="accent-red-600 pointer-events-none" />
                  <span>{{ brand.name }}</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">{{ brand.productCount || 0 }}</span>
                </label>
              </div>
              <p class="mt-2 text-slate-400">
                Đã chọn {{ editingShelf.brandIds?.length || 0 }} thương hiệu. Tab "Tất cả" được tự động thêm.
              </p>
            </div>

            <div>
              <div class="font-bold text-slate-300 uppercase mb-2">Trạng thái</div>
              <label class="flex items-center gap-2 mb-2 cursor-pointer text-xs text-slate-300">
                <input type="radio" name="editShelfActive" [(ngModel)]="editingShelf.active" [value]="true" class="accent-red-600" />
                <span>Hiển thị ngay</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input type="radio" name="editShelfActive" [(ngModel)]="editingShelf.active" [value]="false" class="accent-red-600" />
                <span>Lưu nhưng chưa hiển thị</span>
              </label>
            </div>
            <!-- Checkboxes Toggles -->
            <div class="flex items-center gap-6 pt-1">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                <input type="checkbox" [(ngModel)]="editingShelf.showTabs" class="rounded accent-red-500 w-4 h-4 cursor-pointer" />
                <span>Hiển thị Thẻ Lọc Nhanh</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                <input type="checkbox" [(ngModel)]="editingShelf.showViewAll" class="rounded accent-red-500 w-4 h-4 cursor-pointer" />
                <span>Hiển thị Nút "Xem Tất Cả >"</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-2 p-5 border-t border-slate-800 bg-[#111827] shrink-0">
            <button (click)="showEditShelfModal.set(false)" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer">Hủy</button>
            <button (click)="submitEditShelf()" [disabled]="shelfSubmitting() || shelfBrandsLoading() || selectedShelfProductCount() === 0"
              class="px-5 py-2 bg-[#E30019] hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed shadow-lg">
              {{ shelfSubmitting() ? 'ĐANG LƯU...' : 'Lưu Cập Nhật' }}
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL PREVIEW CỤM SẢN PHẨM (LIVE HOMEPAGE PREVIEW) -->
      <div *ngIf="showPreviewShelfModal() && previewingShelf" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-fade-in">
        <div class="bg-[#0F172A] border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl p-5 sm:p-6 space-y-6 shadow-2xl text-slate-100 overflow-y-auto custom-scrollbar">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-lg font-bold">
                <i class="pi pi-eye"></i>
              </div>
              <div>
                <h3 class="text-base font-black text-white uppercase tracking-wider">Xem Trước Giao Diện Cụm Sản Phẩm (Live Preview)</h3>
                <p class="text-xs text-slate-400">Mô phỏng 100% cách cụm sản phẩm hiển thị trên trang chủ cửa hàng TechZone</p>
              </div>
            </div>
            
            <button (click)="showPreviewShelfModal.set(false)" class="text-slate-400 hover:text-white cursor-pointer w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Live Homepage Shelf Component Mockup Container -->
          <div class="bg-[#111827] border border-slate-800 rounded-3xl p-5 space-y-5 shadow-2xl">
            <!-- Shelf Top Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div class="flex items-center gap-2.5">
                <span class="text-2xl">
                  <i [class]="shelfCategoryIcon(previewingShelf)"></i>
                </span>
                <h3 class="text-lg font-black text-white uppercase tracking-wider">{{ previewingShelf.title }}</h3>
              </div>

              <!-- Filter Tabs Mockup -->
              <div *ngIf="previewingShelf.showTabs !== false" class="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                <span 
                  *ngFor="let tab of previewShelfTabs(previewingShelf); let tIdx = index"
                  [class.bg-[#E30019]]="tIdx === 0"
                  [class.text-white]="tIdx === 0"
                  [class.bg-slate-900]="tIdx !== 0"
                  [class.text-slate-400]="tIdx !== 0"
                  class="px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap border border-slate-800 cursor-pointer">
                  {{ tab }}
                </span>
              </div>
            </div>

            <!-- Product Grid Mockup -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div *ngFor="let i of [1,2,3,4, previewingShelf.limit && previewingShelf.limit >= 5 ? 5 : 4]" class="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-3 flex flex-col justify-between group hover:border-red-500/50 transition-all">
                <div class="relative bg-slate-900 rounded-xl p-3 flex items-center justify-center h-32">
                  <div class="text-4xl opacity-50 group-hover:scale-110 transition-transform">💻</div>
                  <span class="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white font-black text-[10px] rounded-lg shadow-sm">-15%</span>
                </div>

                <div class="space-y-1">
                  <div class="text-[10px] text-amber-400 font-bold uppercase">TECHZONE OFFICIAL</div>
                  <div class="text-xs font-bold text-white line-clamp-2 leading-tight">Laptop Gaming High Performance Core i7 RTX 4060 #{{ i }}</div>
                  <div class="pt-1 flex items-baseline gap-1.5">
                    <span class="text-xs font-black text-red-500 font-mono">24.990.000đ</span>
                    <span class="text-[10px] text-slate-500 line-through font-mono">28.990.000đ</span>
                  </div>
                </div>

                <button class="w-full py-1.5 bg-slate-900 hover:bg-[#E30019] text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all border border-slate-800 hover:border-red-500 flex items-center justify-center gap-1.5 cursor-pointer">
                  <i class="pi pi-shopping-cart text-xs"></i>
                  <span>Thêm giỏ hàng</span>
                </button>
              </div>
            </div>

            <!-- Shelf Footer View All Button -->
            <div *ngIf="previewingShelf.showViewAll !== false" class="text-center pt-2">
              <span class="inline-flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 cursor-pointer bg-slate-900 border border-slate-800 px-5 py-2 rounded-xl">
                <span>Xem Tất Cả Sản Phẩm {{ previewingShelf.title }}</span>
                <i class="pi pi-arrow-right text-xs"></i>
              </span>
            </div>
          </div>

          <div class="flex justify-end pt-2 border-t border-slate-800">
            <button (click)="showPreviewShelfModal.set(false)" class="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer">Đóng Xem Trước</button>
          </div>
        </div>
      </div>

      <!-- MODAL XÁC NHẬN XÓA CỤM SẢN PHẨM (DELETE CONFIRMATION MODAL) -->
      <div *ngIf="showDeleteConfirmModal() && shelfToDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl text-slate-100">
          <div class="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div class="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center text-lg font-bold shrink-0">
              <i class="pi pi-exclamation-triangle"></i>
            </div>
            <div>
              <h3 class="text-sm font-black text-white uppercase tracking-wider">Xác Nhận Xóa Cụm Sản Phẩm</h3>
              <p class="text-xs text-slate-400">Hành động này không thể hoàn tác!</p>
            </div>
          </div>

          <div class="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <div class="text-[11px] font-bold text-slate-400 uppercase">Cụm sẽ bị xóa:</div>
            <div class="text-sm font-black text-white flex items-center gap-2">
              <span class="text-xl">
                <i [class]="shelfCategoryIcon(shelfToDelete)"></i>
              </span>
              <span>{{ shelfToDelete.title }}</span>
            </div>
            <div class="text-xs text-slate-400">Danh mục: <strong class="text-amber-400">{{ shelfCategoryName(shelfToDelete) }}</strong></div>
          </div>

          <p class="text-xs text-slate-300 leading-relaxed">
            Bạn có chắc chắn muốn xóa cụm sản phẩm này khỏi trang chủ? Khối hiển thị tương ứng trên Homepage Builder cũng sẽ bị gỡ bỏ.
          </p>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button 
              (click)="showDeleteConfirmModal.set(false)" 
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all border border-slate-700">
              Hủy
            </button>
            <button 
              (click)="confirmDeleteShelf()" 
              class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-red-600/30 transition-all">
              <i class="pi pi-trash text-xs mr-1"></i>
              Xác Nhận Xóa
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL XÁC NHẬN KHÔI PHỤC LAYOUT MẶC ĐỊNH -->
      <div *ngIf="showRestoreDefaultConfirm()" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl text-slate-100">
          <div class="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-lg font-bold shrink-0">
              <i class="pi pi-refresh"></i>
            </div>
            <div>
              <h3 class="text-sm font-black text-white uppercase tracking-wider">Khôi phục layout mặc định?</h3>
              <p class="text-xs text-slate-400">Thứ tự và trạng thái các khối trang chủ sẽ quay về mặc định.</p>
            </div>
          </div>

          <p class="text-xs text-slate-300 leading-relaxed">
            Các cấu hình nội dung như banner, USP, shelf, thương hiệu và bài viết vẫn được giữ nguyên. Chỉ bảng thứ tự khối trang chủ được reset.
          </p>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              (click)="showRestoreDefaultConfirm.set(false)"
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all border border-slate-700">
              Hủy
            </button>
            <button
              type="button"
              (click)="confirmRestoreDefaultLayout()"
              [disabled]="blockReorderBusy()"
              class="px-5 py-2 bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="pi pi-refresh text-xs mr-1"></i>
              Khôi Phục
            </button>
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
  showEditShelfModal = signal(false);
  showPreviewShelfModal = signal(false);
  showDeleteConfirmModal = signal(false);
  showRestoreDefaultConfirm = signal(false);
  showAddBlogModal = signal(false);
  addingBlogs = signal(false);
  blockReorderBusy = signal(false);
  draggedBlockId = signal<string | null>(null);

  editingShelf: ProductShelf | null = null;
  editingShelfSubFiltersInput = '';
  previewingShelf: ProductShelf | null = null;
  shelfToDelete: ProductShelf | null = null;

  showIconPicker = signal(false);
  activeUspIndex = signal<number | null>(null);
  iconSearchQuery = '';
  draggedShelfId = signal<string | null>(null);

  categories = signal<Category[]>([]);
  editableUsps: UspItem[] = [];
  shelfBrands = signal<Brand[]>([]);
  shelfBrandsLoading = signal(false);
  shelfBrandLoadError = signal('');
  shelfBrandSearchQuery = '';
  shelfSubmitting = signal(false);
  shelfErrors = signal<Record<string, string>>({});
  brandSearchQuery = '';
  brandLimit = this.builderService.brandSettings().limit;
  blogSearchQuery = '';
  blogCategoryFilter = 'Tất cả';
  blogMode = this.builderService.blogSettings().mode;
  blogLimit = this.builderService.blogSettings().limit;
  blogAutoCategory = this.builderService.blogSettings().category;
  blogAutoSort = this.builderService.blogSettings().sortType;
  blogPickerSearchQuery = '';
  blogPickerCategoryFilter = 'Tất cả';
  blogPickerSort: 'NEWEST' | 'OLDEST' | 'AZ' | 'ZA' = 'NEWEST';
  selectedBlogIds = signal<number[]>([]);
  availablePublishedBlogs = signal<BlogArticle[]>([]);
  homepageArticleItems = signal<HomepageArticleItem[]>([]);
  draggedBrandId = signal<string | null>(null);
  draggedBlogId = signal<number | null>(null);

  activeShelvesBadge = computed(() => {
    const shelfBlocks = this.builderService.blocks().filter(block => block.type === 'CATEGORY_SHELF');
    const shelves = this.builderService.shelves();
    const total = shelfBlocks.length;
    const active = shelfBlocks.filter(block => {
      const shelf = shelves.find(item => item.id === block.shelfId);
      return block.active && shelf?.active !== false;
    }).length;
    return `Homepage đang hiển thị ${active}/${total} shelves`;
  });

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
    brandIds: [] as number[], limit: 5,
    sortType: 'BEST_SELLER' as ProductShelf['sortType'], showViewAll: true, active: true
  };

  sortedBlocks = computed(() => {
    return [...this.builderService.blocks()].sort((a, b) => a.order - b.order);
  });

  isBlockEffectivelyActive(block: HomepageBlock): boolean {
    if (block.type !== 'CATEGORY_SHELF') return block.active;
    const shelf = this.builderService.shelves().find(item => item.id === block.shelfId);
    return block.active && shelf?.active !== false;
  }

  constructor(
    public builderService: HomepageBuilderService,
    private productService: ProductService,
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.editableUsps = JSON.parse(JSON.stringify(this.builderService.usps()));
    this.productService.getCategories().subscribe(res => {
      this.categories.set(res);
      if (res.length > 0) {
        this.newShelfData.categorySlug = res[0].slug;
        this.loadShelfBrandsForCategory(this.newShelfData.categorySlug);
      }
    });

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
    this.openRestoreDefaultConfirm();
  }

  openRestoreDefaultConfirm(): void {
    this.showRestoreDefaultConfirm.set(true);
  }

  confirmRestoreDefaultLayout(): void {
    this.runBlockMutation(() => {
      this.builderService.saveBlocks([...this.builderService.defaultBlocks]);
      this.showRestoreDefaultConfirm.set(false);
      this.showToast('success', 'Đã khôi phục layout mặc định thành công!');
    });
  }

  toggleBlockActive(id: string): void {
    this.runBlockMutation(() => {
      this.builderService.toggleBlockActive(id);
      this.showToast('success', 'Đã lưu trạng thái hiển thị khối');
    });
  }

  toggleShelfActive(id: string): void {
    this.runBlockMutation(() => {
      this.builderService.toggleShelfActive(id);
      this.showToast('success', 'Đã lưu trạng thái hiển thị cụm sản phẩm');
    });
  }

  moveBlockOrder(id: string, direction: 'UP' | 'DOWN'): void {
    this.runBlockMutation(() => {
      this.builderService.moveBlockOrder(id, direction);
      this.showToast('success', 'Đã lưu thứ tự khối trang chủ');
    });
  }

  onBlockDragStart(event: DragEvent, blockId: string): void {
    if (this.blockReorderBusy()) {
      event.preventDefault();
      return;
    }
    this.draggedBlockId.set(blockId);
    event.dataTransfer?.setData('text/plain', blockId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onBlockDragOver(event: DragEvent): void {
    if (this.blockReorderBusy()) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onBlockDrop(event: DragEvent, targetBlockId: string): void {
    event.preventDefault();
    const sourceBlockId = event.dataTransfer?.getData('text/plain') || this.draggedBlockId();
    this.draggedBlockId.set(null);
    if (!sourceBlockId || sourceBlockId === targetBlockId || this.blockReorderBusy()) return;

    this.runBlockMutation(() => {
      this.builderService.reorderBlock(sourceBlockId, targetBlockId);
      this.showToast('success', 'Đã lưu thứ tự khối trang chủ');
    });
  }

  onBlockDragEnd(): void {
    this.draggedBlockId.set(null);
  }

  private runBlockMutation(action: () => void): void {
    if (this.blockReorderBusy()) return;
    this.blockReorderBusy.set(true);
    try {
      action();
    } finally {
      setTimeout(() => this.blockReorderBusy.set(false), 350);
    }
  }

  navigateBlockConfig(blk: HomepageBlock): void {
    if (blk.type === 'HERO_SLIDER') {
      this.router.navigate(['/admin/banners']);
    } else if (blk.type === 'FLASH_SALE') {
      this.router.navigate(['/admin/flash-sale']);
    } else if (blk.type === 'USP_BAR') {
      this.navigateHomepageTab('USPS');
    } else if (blk.type === 'CATEGORY_SHELF') {
      this.navigateHomepageTab('SHELVES');
    } else if (blk.type === 'TECH_BLOG' || blk.type === 'BRAND_SHOWCASE') {
      this.navigateHomepageTab('BLOGS_BRANDS');
    } else {
      this.showToast('success', `Đang xem cấu hình khối ${blk.name}`);
    }
  }

  navigateHomepageTab(tab: 'LAYOUT' | 'USPS' | 'SHELVES' | 'BLOGS_BRANDS'): void {
    this.activeTab.set(tab);
    this.router.navigate(['/admin/homepage-builder'], {
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  getSortTypeLabel(sortType?: string): string {
    switch (sortType) {
      case 'BEST_SELLER':
      case 'BEST_SELLING': return 'Bán chạy nhất';
      case 'NEWEST': return 'Mới nhất';
      case 'PRICE_ASC': return 'Giá tăng dần';
      case 'PRICE_DESC': return 'Giá giảm dần';
      case 'DISCOUNT':
      case 'BIGGEST_DISCOUNT': return 'Giảm giá nhiều nhất';
      default: return 'Bán chạy nhất';
    }
  }

  toggleShelfBrand(shelf: { brandIds?: number[] }, id: number): void {
    const ids = shelf.brandIds || [];
    shelf.brandIds = ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id];
  }

  shelfBrandNames(ids: number[]): string[] {
    return this.shelfBrands().filter(b => ids.includes(b.id)).map(b => b.name);
  }

  selectedShelfCategory(shelf: { categorySlug: string }): Category | undefined {
    return this.categories().find(c => c.slug === shelf.categorySlug || String(c.id) === shelf.categorySlug);
  }

  shelfCategoryName(shelf: { categorySlug: string }): string {
    return this.selectedShelfCategory(shelf)?.name || shelf.categorySlug;
  }

  selectedShelfProductCount(): number {
    return this.shelfBrands().reduce((sum, brand) => sum + (brand.productCount || 0), 0);
  }

  filteredShelfBrands(): Brand[] {
    const q = this.shelfBrandSearchQuery.trim().toLowerCase();
    const brands = this.shelfBrands();
    if (!q) return brands;
    return brands.filter(brand => brand.name.toLowerCase().includes(q));
  }

  onShelfCategoryChange(shelf: { categorySlug: string; icon?: string; brandIds?: number[] }): void {
    shelf.brandIds = [];
    this.shelfBrandSearchQuery = '';
    this.clearShelfError('category');
    this.loadShelfBrandsForCategory(shelf.categorySlug);
  }

  shelfCategoryIcon(shelf: { categorySlug: string }): string {
    const category = this.selectedShelfCategory(shelf);
    return resolveCategoryIcon(category?.icon, category?.name, category?.slug);
  }

  onShelfDragStart(event: DragEvent, shelfId: string): void {
    this.draggedShelfId.set(shelfId);
    event.dataTransfer?.setData('text/plain', shelfId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onShelfDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onShelfDrop(event: DragEvent, targetShelfId: string): void {
    event.preventDefault();
    const sourceShelfId = event.dataTransfer?.getData('text/plain') || this.draggedShelfId();
    this.draggedShelfId.set(null);
    if (!sourceShelfId || sourceShelfId === targetShelfId) return;
    this.builderService.reorderShelf(sourceShelfId, targetShelfId);
    this.showToast('success', 'Đã cập nhật thứ tự cụm sản phẩm');
  }

  onShelfDragEnd(): void {
    this.draggedShelfId.set(null);
  }

  loadShelfBrandsForCategory(categorySlug: string, targetShelf?: { brandIds?: number[] }, legacyBrandNames: string[] = []): void {
    const category = this.categories().find(c => c.slug === categorySlug || String(c.id) === categorySlug);
    this.shelfBrands.set([]);
    this.shelfBrandLoadError.set('');
    if (!category) return;

    this.shelfBrandsLoading.set(true);
    this.productService.getBrandsByCategory(category.id).subscribe({
      next: brands => {
        const availableBrands = brands.filter(brand => (brand.productCount || 0) > 0);
        this.shelfBrands.set(availableBrands);
        if (targetShelf) {
          const availableIds = new Set(availableBrands.map(brand => brand.id));
          const existingIds = targetShelf.brandIds || [];
          const migratedIds = legacyBrandNames.length
            ? availableBrands
                .filter(brand => legacyBrandNames.some(name => name.toLowerCase() === brand.name.toLowerCase()))
                .map(brand => brand.id)
            : [];
          targetShelf.brandIds = [...new Set([...existingIds.filter(id => availableIds.has(id)), ...migratedIds])];
        }
        this.shelfBrandsLoading.set(false);
      },
      error: () => {
        this.shelfBrandLoadError.set('Không thể tải danh sách thương hiệu. Vui lòng thử lại.');
        this.shelfBrandsLoading.set(false);
      }
    });
  }

  clearShelfError(field: string): void {
    const errors = { ...this.shelfErrors() };
    delete errors[field];
    this.shelfErrors.set(errors);
  }

  validateShelf(shelf: { title?: string; categorySlug: string; limit?: number; sortType?: string }): boolean {
    const errors: Record<string, string> = {};
    if (!shelf.title?.trim()) {
      errors['title'] = 'Tiêu đề cụm sản phẩm là bắt buộc.';
    }
    if (!this.selectedShelfCategory(shelf)) {
      errors['category'] = 'Vui lòng chọn danh mục.';
    } else if (!this.shelfBrandsLoading() && !this.shelfBrandLoadError() && this.selectedShelfProductCount() === 0) {
      errors['category'] = 'Danh mục này chưa có sản phẩm.';
    }
    if (!Number.isInteger(Number(shelf.limit)) || Number(shelf.limit) < 1 || Number(shelf.limit) > 20) {
      errors['limit'] = 'Số sản phẩm hiển thị phải từ 1 đến 20.';
    }
    const validSortTypes = ['BEST_SELLER', 'BEST_SELLING', 'NEWEST', 'PRICE_ASC', 'PRICE_DESC', 'DISCOUNT', 'BIGGEST_DISCOUNT'];
    if (!shelf.sortType || !validSortTypes.includes(shelf.sortType)) {
      errors['sortType'] = 'Vui lòng chọn kiểu sắp xếp hợp lệ.';
    }

    this.shelfErrors.set(errors);
    if (Object.keys(errors).length > 0) {
      return false;
    }
    return true;
  }

  openAddShelfModal(): void {
    this.newShelfData = {
      title: '',
      categorySlug: this.categories().length > 0 ? this.categories()[0].slug : 'laptop-gaming',
      brandIds: [], limit: 5,
      sortType: 'BEST_SELLER', showViewAll: true, active: true
    };
    this.shelfErrors.set({});
    this.shelfSubmitting.set(false);
    this.loadShelfBrandsForCategory(this.newShelfData.categorySlug);

    this.showAddShelfModal.set(true);
  }

  submitCreateShelf(): void {
    if (!this.validateShelf(this.newShelfData)) return;
    const filters = this.shelfBrandNames(this.newShelfData.brandIds);

    this.shelfSubmitting.set(true);
    this.builderService.addShelf({
      title: this.newShelfData.title.trim(),
      categorySlug: this.newShelfData.categorySlug,
      subFilters: filters,
      brandIds: [...this.newShelfData.brandIds],
      limit: Number(this.newShelfData.limit),
      sortType: this.newShelfData.sortType,
      showTabs: true,
      showViewAll: this.newShelfData.showViewAll,
      active: this.newShelfData.active
    });

    this.shelfSubmitting.set(false);
    this.showAddShelfModal.set(false);
    this.showToast('success', 'Đã tạo cụm sản phẩm thành công');
  }

  openEditShelfModal(shelf: ProductShelf): void {
    this.editingShelf = JSON.parse(JSON.stringify(shelf));
    if (this.editingShelf) {
      if (!this.editingShelf.limit) this.editingShelf.limit = 5;
      if (!this.editingShelf.sortType) this.editingShelf.sortType = 'BEST_SELLER';
      if (this.editingShelf.showTabs === undefined) this.editingShelf.showTabs = true;
      if (this.editingShelf.showViewAll === undefined) this.editingShelf.showViewAll = true;
      this.shelfErrors.set({});
      this.shelfSubmitting.set(false);
      const legacyNames = (this.editingShelf.subFilters || []).filter(name => name !== 'Tất cả');
      this.loadShelfBrandsForCategory(this.editingShelf.categorySlug, this.editingShelf, legacyNames);
      if (!this.editingShelf.brandIds) {
        this.editingShelf.brandIds = [];
      }
    }
    this.showEditShelfModal.set(true);
  }

  submitEditShelf(): void {
    if (!this.editingShelf) return;
    if (!this.validateShelf(this.editingShelf)) return;
    this.editingShelf.subFilters = this.shelfBrandNames(this.editingShelf.brandIds || []);
    this.editingShelf.limit = Number(this.editingShelf.limit);

    this.shelfSubmitting.set(true);
    this.builderService.updateShelf(this.editingShelf);
    this.shelfSubmitting.set(false);
    this.showEditShelfModal.set(false);
    this.showToast('success', 'Cập nhật cấu hình Cụm sản phẩm thành công!');
  }

  previewShelfTabs(shelf: ProductShelf): string[] {
    return ['Tất cả', ...(shelf.brandIds !== undefined ? this.shelfBrandNames(shelf.brandIds) : shelf.subFilters.filter(name => name !== 'Tất cả'))];
  }

  openPreviewShelfModal(shelf: ProductShelf): void {
    this.previewingShelf = shelf;
    this.showPreviewShelfModal.set(true);
  }

  promptDeleteShelf(shelf: ProductShelf): void {
    this.shelfToDelete = shelf;
    this.showDeleteConfirmModal.set(true);
  }

  confirmDeleteShelf(): void {
    if (this.shelfToDelete) {
      const title = this.shelfToDelete.title;
      this.builderService.deleteShelf(this.shelfToDelete.id);
      this.showToast('success', `Đã xóa cụm sản phẩm "${title}" thành công!`);
      this.shelfToDelete = null;
    }
    this.showDeleteConfirmModal.set(false);
  }

  visibleBrandCount(): number {
    return this.builderService.brands().filter(brand => brand.showOnHomepage).length;
  }

  filteredBrands(): BrandItem[] {
    const q = this.brandSearchQuery.trim().toLowerCase();
    return [...this.builderService.brands()]
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .filter(brand => !q || brand.name.toLowerCase().includes(q));
  }

  toggleBrand(id: string): void {
    this.builderService.toggleBrandHomepage(id);
    this.showToast('success', 'Đã lưu trạng thái thương hiệu');
  }

  setAllBrands(visible: boolean): void {
    this.builderService.setAllBrandsHomepage(visible);
    this.showToast('success', visible ? 'Đã bật tất cả thương hiệu' : 'Đã ẩn tất cả thương hiệu');
  }

  saveBrandLimit(): void {
    this.brandLimit = Math.min(24, Math.max(1, Number(this.brandLimit) || 8));
    this.builderService.saveBrandSettings({ limit: this.brandLimit });
    this.showToast('success', 'Đã lưu giới hạn thương hiệu');
  }

  onBrandDragStart(event: DragEvent, id: string): void {
    this.draggedBrandId.set(id);
    event.dataTransfer?.setData('text/plain', id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onBrandDrop(event: DragEvent, targetId: string): void {
    event.preventDefault();
    const sourceId = event.dataTransfer?.getData('text/plain') || this.draggedBrandId();
    this.draggedBrandId.set(null);
    if (!sourceId || sourceId === targetId) return;
    this.builderService.reorderBrand(sourceId, targetId);
    this.showToast('success', 'Đã lưu thứ tự thương hiệu');
  }

  onBrandDragEnd(): void {
    this.draggedBrandId.set(null);
  }

  visibleBlogCount(): number {
    return this.builderService.blogs()
      .filter(blog => blog.inManualList !== false && blog.showOnHomepage && this.isBlogPublished(blog))
      .length;
  }

  blogCategories(): string[] {
    const categories = [
      ...this.builderService.blogs().map(blog => blog.category),
      ...this.availablePublishedBlogs().map(blog => blog.category)
    ].filter(Boolean);
    return [...new Set(categories)];
  }

  filteredBlogs(): BlogArticle[] {
    const q = this.blogSearchQuery.trim().toLowerCase();
    return [...this.builderService.blogs()]
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .filter(blog => blog.inManualList !== false)
      .filter(blog => this.blogCategoryFilter === 'Tất cả' || blog.category === this.blogCategoryFilter)
      .filter(blog => !q || blog.title.toLowerCase().includes(q) || blog.category.toLowerCase().includes(q));
  }

  toggleBlog(id: number): void {
    const item = this.builderService.blogs().find(blog => blog.id === id);
    if (!item?.homepageItemId) return;
    this.articleService.toggleHomepageArticleItem(item.homepageItemId).subscribe({
      next: () => {
        this.loadHomepageArticleItems();
        this.showToast('success', 'Đã lưu trạng thái bài viết');
      },
      error: () => this.showToast('error', 'Không thể lưu trạng thái bài viết.')
    });
  }

  setAllBlogs(visible: boolean): void {
    const targets = this.builderService.blogs().filter(blog => blog.homepageItemId && blog.showOnHomepage !== visible);
    if (!targets.length) return;
    this.addingBlogs.set(true);
    let remaining = targets.length;
    targets.forEach(blog => {
      this.articleService.toggleHomepageArticleItem(blog.homepageItemId!).subscribe({
        next: () => {
          remaining--;
          if (remaining === 0) {
            this.addingBlogs.set(false);
            this.loadHomepageArticleItems();
            this.showToast('success', visible ? 'Đã bật tất cả bài viết' : 'Đã ẩn tất cả bài viết');
          }
        },
        error: () => {
          remaining--;
          if (remaining === 0) {
            this.addingBlogs.set(false);
            this.loadHomepageArticleItems();
            this.showToast('error', 'Một số bài viết chưa cập nhật được.');
          }
        }
      });
    });
  }

  openAddBlogModal(): void {
    this.blogPickerSearchQuery = '';
    this.blogPickerCategoryFilter = 'Tất cả';
    this.blogPickerSort = 'NEWEST';
    this.selectedBlogIds.set([]);
    this.showAddBlogModal.set(true);
    this.loadPublishedArticlesForPicker();
  }

  closeAddBlogModal(): void {
    if (this.addingBlogs()) return;
    this.showAddBlogModal.set(false);
    this.selectedBlogIds.set([]);
  }

  selectableBlogs(): BlogArticle[] {
    const query = this.blogPickerSearchQuery.trim().toLowerCase();
    const selectedManualIds = new Set(
      this.builderService.blogs()
        .filter(blog => blog.inManualList !== false)
        .map(blog => blog.id)
    );

    const source = this.availablePublishedBlogs().length ? this.availablePublishedBlogs() : this.builderService.blogs();
    return [...source]
      .filter(blog => this.isBlogPublished(blog))
      .filter(blog => !selectedManualIds.has(blog.id))
      .filter(blog => this.blogPickerCategoryFilter === 'Tất cả' || blog.category === this.blogPickerCategoryFilter)
      .filter(blog => !query || blog.title.toLowerCase().includes(query))
      .sort((a, b) => {
        switch (this.blogPickerSort) {
          case 'OLDEST':
            return this.parseBlogDate(a.date).getTime() - this.parseBlogDate(b.date).getTime();
          case 'AZ':
            return a.title.localeCompare(b.title, 'vi');
          case 'ZA':
            return b.title.localeCompare(a.title, 'vi');
          case 'NEWEST':
          default:
            return this.parseBlogDate(b.date).getTime() - this.parseBlogDate(a.date).getTime();
        }
      });
  }

  toggleSelectedBlog(id: number): void {
    const selected = this.selectedBlogIds();
    this.selectedBlogIds.set(
      selected.includes(id)
        ? selected.filter(item => item !== id)
        : [...selected, id]
    );
  }

  submitSelectedBlogs(): void {
    const ids = this.selectedBlogIds();
    if (!ids.length || this.addingBlogs()) return;

    this.addingBlogs.set(true);
    this.articleService.addHomepageArticleItems(ids).subscribe({
      next: items => {
        this.applyHomepageArticleItems(items);
        this.showAddBlogModal.set(false);
        this.selectedBlogIds.set([]);
        this.addingBlogs.set(false);
        this.showToast('success', 'Đã thêm bài viết vào trang chủ.');
      },
      error: err => {
        this.addingBlogs.set(false);
        this.showToast('error', err?.error?.message || err?.error || 'Không thể thêm bài viết. Vui lòng thử lại.');
      }
    });
  }

  removeBlogFromManualList(id: number): void {
    const item = this.builderService.blogs().find(blog => blog.id === id);
    if (!item?.homepageItemId) return;
    this.articleService.deleteHomepageArticleItem(item.homepageItemId).subscribe({
      next: () => {
        this.loadHomepageArticleItems();
        this.showToast('success', 'Đã bỏ bài viết khỏi danh sách trang chủ');
      },
      error: () => this.showToast('error', 'Không thể bỏ bài viết khỏi trang chủ.')
    });
  }

  private loadPublishedArticlesForPicker(): void {
    this.addingBlogs.set(true);
    this.articleService.getAdminArticles(0, 100, '', null, 'PUBLISHED').subscribe({
      next: res => {
        this.availablePublishedBlogs.set((res.content || []).map(article => this.articleToBlogItem(article)));
        this.addingBlogs.set(false);
      },
      error: () => {
        this.availablePublishedBlogs.set([]);
        this.addingBlogs.set(false);
        this.showToast('error', 'Không thể tải danh sách bài viết đã xuất bản.');
      }
    });
  }

  private articleToBlogItem(article: Article): BlogArticle {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      category: article.category?.name || 'Tin công nghệ',
      date: this.formatArticleDate(article.publishedAt || article.updatedAt || article.createdAt),
      image: article.thumbnail || 'assets/placeholder-product.svg',
      summary: article.excerpt || '',
      readTime: '3 phút đọc',
      showOnHomepage: true,
      inManualList: false,
      status: 'PUBLISHED'
    };
  }

  private homepageItemToBlogItem(item: HomepageArticleItem): BlogArticle {
    const article = item.article;
    return {
      ...this.articleToBlogItem(article),
      homepageItemId: item.id,
      showOnHomepage: item.active,
      displayOrder: item.displayOrder,
      inManualList: true,
      status: article.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
      published: article.status === 'PUBLISHED'
    };
  }

  private loadHomepageArticleItems(): void {
    this.articleService.getHomepageArticleItems().subscribe({
      next: items => this.applyHomepageArticleItems(items),
      error: () => this.showToast('error', 'Không thể tải danh sách bài viết trang chủ.')
    });
  }

  private applyHomepageArticleItems(items: HomepageArticleItem[]): void {
    this.homepageArticleItems.set(items || []);
    this.builderService.blogs.set((items || []).map(item => this.homepageItemToBlogItem(item)));
  }

  private formatArticleDate(value?: string): string {
    if (!value) return new Date().toLocaleDateString('vi-VN');
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('vi-VN');
  }

  setBlogMode(mode: 'MANUAL' | 'AUTO_LATEST'): void {
    this.blogMode = mode;
    this.saveBlogSettings();
  }

  saveBlogSettings(): void {
    this.blogLimit = Math.min(12, Math.max(1, Number(this.blogLimit) || 4));
    this.builderService.saveBlogSettings({
      mode: this.blogMode,
      limit: this.blogLimit,
      category: this.blogAutoCategory,
      sortType: this.blogAutoSort
    });
    this.showToast('success', 'Đã lưu cấu hình tin tức');
  }

  onBlogDragStart(event: DragEvent, id: number): void {
    this.draggedBlogId.set(id);
    event.dataTransfer?.setData('text/plain', String(id));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onBlogDrop(event: DragEvent, targetId: number): void {
    event.preventDefault();
    const sourceId = Number(event.dataTransfer?.getData('text/plain') || this.draggedBlogId());
    this.draggedBlogId.set(null);
    if (!sourceId || sourceId === targetId) return;
    const list = [...this.builderService.blogs()].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const sourceIndex = list.findIndex(blog => blog.id === sourceId);
    const targetIndex = list.findIndex(blog => blog.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;
    const [moved] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, moved);
    const ids = list.map(blog => blog.homepageItemId).filter((id): id is number => !!id);
    this.articleService.reorderHomepageArticleItems(ids).subscribe({
      next: items => {
        this.applyHomepageArticleItems(items);
        this.showToast('success', 'Đã lưu thứ tự bài viết');
      },
      error: () => this.showToast('error', 'Không thể lưu thứ tự bài viết.')
    });
  }

  private isBlogPublished(blog: BlogArticle): boolean {
    if (blog.published === false) return false;
    return !blog.status || blog.status === 'PUBLISHED';
  }

  private parseBlogDate(date: string): Date {
    const [day, month, year] = date.split('/').map(Number);
    return new Date(year || 1970, (month || 1) - 1, day || 1);
  }

  onBlogDragEnd(): void {
    this.draggedBlogId.set(null);
  }

  onGenericDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  previewBlog(article: BlogArticle): void {
    if (article.slug) {
      window.open(`/tin-tuc/${article.slug}`, '_blank');
      return;
    }
    this.showToast('success', `Xem trước: ${article.title}`);
  }

  private showToast(type: 'success' | 'error', text: string): void {
    this.toastMessage.set({ type, text });
    setTimeout(() => this.toastMessage.set(null), 3000);
  }
}

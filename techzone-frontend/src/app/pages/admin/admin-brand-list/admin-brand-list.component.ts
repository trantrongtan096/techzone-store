import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

import { AdminHeaderComponent } from '../../../components/admin-header/admin-header.component';

@Component({
  selector: 'app-admin-brand-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminHeaderComponent],
  template: `
    <!-- Toast Notification Banner (Fixed Top-Center - Absolutely Zero Layout Shift) -->
    <div *ngIf="toastMessage()" 
      [class.bg-emerald-600]="toastMessage()?.type === 'success'" 
      [class.bg-red-600]="toastMessage()?.type === 'error'" 
      class="fixed top-6 left-1/2 -translate-x-1/2 text-white px-6 py-3.5 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 animate-fade-in border border-white/20 backdrop-blur-md pointer-events-none">
      <i [class]="toastMessage()?.type === 'success' ? 'pi pi-check-circle text-xl' : 'pi pi-exclamation-triangle text-xl'"></i>
      <span class="text-xs font-bold">{{ toastMessage()?.text }}</span>
    </div>

    <div class="space-y-6 animate-fade-in relative">
      <!-- Standardized Admin Header Component -->
      <app-admin-header 
        title="Quản Lý Thương Hiệu"
        subtitle="Quản lý các logo hãng sản xuất hardware, link website, hãng nổi bật & thứ tự hiển thị"
        icon="pi pi-briefcase"
        badge="Brand Registry"
        [breadcrumbs]="[{ label: 'Quản lý Thương hiệu' }]">
        
        <button 
          (click)="openModal()"
          class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer">
          <i class="pi pi-plus"></i>
          <span>Thêm Thương Hiệu Mới</span>
        </button>
      </app-admin-header>

      <!-- Toolbar -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative flex-grow max-w-md w-full">
          <input 
            type="text" 
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Tìm thương hiệu theo tên, slug..." 
            class="bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl py-2 pl-10 pr-8 text-xs w-full focus:outline-none focus:border-red-500 transition-all font-medium" />
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
          <button 
            *ngIf="searchQuery()" 
            (click)="searchQuery.set('')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer">
            <i class="pi pi-times-circle"></i>
          </button>
        </div>

        <div class="text-xs text-slate-400 font-bold shrink-0 flex items-center justify-end gap-3 self-center">
          <span class="text-slate-400 text-[11px] font-normal hidden md:inline-flex items-center gap-1.5">
            <i class="pi pi-info-circle text-red-500"></i>
            Kéo biểu tượng <span class="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded-md border border-slate-800 inline-flex items-center shadow-2xs"><i class="pi pi-bars text-[10px]"></i></span> để đổi thứ tự
          </span>
          <span class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 font-bold">
            Tổng: <span class="text-red-400 font-black text-sm">{{ filteredBrands().length }}</span> thương hiệu
          </span>
        </div>
      </div>

      <!-- Brands Table with Drag & Drop -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 text-[11px]">
              <tr>
                <th class="py-3 pl-6 pr-3 w-16 text-center">Kéo</th>
                <th class="px-3 py-3 w-10 text-center">
                  <input 
                    type="checkbox" 
                    [checked]="isAllSelected()" 
                    (change)="toggleSelectAll()"
                    class="w-4 h-4 accent-red-600 rounded cursor-pointer" />
                </th>
                <th class="p-4 w-20">Logo</th>
                <th class="p-4">Tên Thương Hiệu</th>
                <th class="p-4">Slug / Website</th>
                <th class="p-4 text-center">Sản Phẩm</th>
                <th class="p-4 text-center">Nổi Bật ⭐</th>
                <th class="p-4 text-center">Trạng Thái</th>
                <th class="p-4 text-center">Thứ Tự</th>
                <th class="p-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-semibold text-slate-200">
              <tr 
                *ngFor="let b of filteredBrands(); let i = index" 
                draggable="true"
                (dragstart)="onDragStart($event, i)"
                (dragover)="onDragOver($event, i)"
                (drop)="onDrop($event, i)"
                (dragend)="onDragEnd()"
                [class.opacity-40]="draggedIndex === i"
                [class.bg-red-950]="draggedIndex === i"
                [class.border-2]="draggedIndex === i"
                [class.border-dashed]="draggedIndex === i"
                [class.border-red-500]="draggedIndex === i"
                [class.border-t-4]="dragOverIndex === i && draggedIndex !== i"
                [class.border-t-red-500]="dragOverIndex === i && draggedIndex !== i"
                [class.bg-slate-800]="dragOverIndex === i && draggedIndex !== i"
                [class.shadow-lg]="dragOverIndex === i && draggedIndex !== i"
                class="hover:bg-slate-800/40 transition-all duration-150 relative">
                
                <!-- Drag Grip -->
                <td class="py-3 pl-6 pr-3 text-center cursor-grab active:cursor-grabbing text-slate-500 hover:text-red-400 transition-colors">
                  <div class="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-800 transition-all" title="Kéo thả để thay đổi vị trí">
                    <i class="pi pi-bars text-base font-bold"></i>
                  </div>
                </td>

                <!-- Checkbox -->
                <td class="px-3 py-3 text-center">
                  <input 
                    type="checkbox" 
                    [checked]="isSelected(b.id)" 
                    (change)="toggleSelection(b.id)"
                    class="w-4 h-4 accent-red-600 rounded cursor-pointer" />
                </td>

                <!-- Logo / Fallback Avatar -->
                <td class="p-4">
                  <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1.5 overflow-hidden shadow-xs relative group">
                    <img 
                      *ngIf="b.logoUrl && !logoErrorMap[b.id]" 
                      [src]="b.logoUrl" 
                      [alt]="b.name" 
                      (error)="onLogoError(b.id)"
                      class="w-full h-full object-contain" />

                    <!-- Fallback Avatar Initials -->
                    <div *ngIf="!b.logoUrl || logoErrorMap[b.id]" class="w-full h-full rounded-lg bg-gradient-to-br from-red-600 to-rose-800 text-white font-black text-xs flex items-center justify-center tracking-wider">
                      {{ getInitials(b.name) }}
                    </div>
                  </div>
                </td>

                <!-- Name & Description -->
                <td class="p-4">
                  <span class="block font-black text-white text-sm uppercase tracking-wider">{{ b.name }}</span>
                  <span class="block text-[11px] text-slate-400 font-medium truncate max-w-xs">{{ b.description || 'Chưa có mô tả' }}</span>
                </td>

                <!-- Slug & Website Link -->
                <td class="p-4 font-mono">
                  <span class="block text-slate-300 font-bold text-[11px]">{{ b.slug }}</span>
                  <a 
                    *ngIf="b.websiteUrl" 
                    [href]="b.websiteUrl" 
                    target="_blank" 
                    class="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline text-[10px] font-medium mt-0.5">
                    <span>{{ b.websiteUrl }}</span>
                    <i class="pi pi-external-link text-[9px]"></i>
                  </a>
                  <span *ngIf="!b.websiteUrl" class="text-slate-500 text-[10px] italic">Chưa có link website</span>
                </td>

                <!-- Product Counter & Smart Shortcut -->
                <td class="p-4 text-center">
                  <button 
                    (click)="goToProducts(b.id)"
                    class="inline-flex items-center gap-1 bg-red-950/80 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 hover:border-red-600 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shadow-2xs group"
                    title="Bấm để lọc danh sách sản phẩm thuộc hãng này">
                    <i class="pi pi-box text-xs"></i>
                    <span>{{ b.productCount || 0 }} SP</span>
                  </button>
                </td>

                <!-- Featured Toggle (Star ⭐) -->
                <td class="p-4 text-center">
                  <button 
                    (click)="toggleFeatured(b)"
                    [class]="b.isFeatured ? 'bg-amber-950/80 text-amber-400 border-amber-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'"
                    class="w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer hover:scale-110 shadow-2xs mx-auto"
                    [title]="b.isFeatured ? 'Đang là Hãng Nổi Bật ngoài trang chủ (Bấm để hủy)' : 'Bấm để đánh dấu Hãng Nổi Bật'">
                    <i [class]="b.isFeatured ? 'pi pi-star-fill text-amber-400 text-base' : 'pi pi-star text-slate-500 text-base'"></i>
                  </button>
                </td>

                <!-- Status Toggle -->
                <td class="p-4 text-center">
                  <button 
                    (click)="toggleActive(b)"
                    [class]="(b.isActive !== false) ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'"
                    class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none cursor-pointer p-0.5">
                    <span 
                      [class]="(b.isActive !== false) ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white'"
                      class="inline-block w-5 h-5 transform rounded-full transition-transform shadow-sm"></span>
                  </button>
                  <span class="block text-[10px] font-bold mt-1" [class]="(b.isActive !== false) ? 'text-emerald-400' : 'text-slate-500'">
                    {{ (b.isActive !== false) ? 'Hiển thị' : 'Ẩn' }}
                  </span>
                </td>

                <!-- Priority / Reorder Buttons -->
                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-1 font-mono font-bold text-amber-400">
                    <button 
                      [disabled]="i === 0"
                      (click)="moveUp(i)"
                      class="w-6 h-6 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer flex items-center justify-center">
                      <i class="pi pi-chevron-up text-[10px]"></i>
                    </button>
                    <span class="min-w-[24px]">#{{ i + 1 }}</span>
                    <button 
                      [disabled]="i === filteredBrands().length - 1"
                      (click)="moveDown(i)"
                      class="w-6 h-6 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer flex items-center justify-center">
                      <i class="pi pi-chevron-down text-[10px]"></i>
                    </button>
                  </div>
                </td>

                <!-- Actions -->
                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button 
                      (click)="openModal(b)"
                      class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600/30 hover:border-blue-500 text-blue-400 border border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                      title="Chỉnh sửa">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button 
                      (click)="deleteBrand(b.id, b.name)"
                      class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-600/30 hover:border-red-500 text-red-400 border border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                      title="Xóa thương hiệu">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredBrands().length === 0">
                <td colspan="10" class="p-8 text-center text-slate-500">Không tìm thấy thương hiệu nào phù hợp.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Floating Bulk Action Bar -->
      <div *ngIf="selectedBrandIds().length > 0" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white rounded-2xl px-6 py-4 shadow-2xl z-50 flex items-center gap-6 animate-slide-up">
        <div class="text-xs font-bold text-slate-300">
          Đang chọn: <span class="text-red-400 font-black text-sm">{{ selectedBrandIds().length }}</span> thương hiệu
        </div>
        <div class="h-4 w-px bg-slate-800"></div>
        <div class="flex items-center gap-2">
          <button (click)="bulkDelete()" class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1">
            <i class="pi pi-trash"></i> Xóa hàng loạt
          </button>
        </div>
      </div>

      <!-- Spacer -->
      <div class="h-24" *ngIf="selectedBrandIds().length > 0"></div>

      <!-- ADD / EDIT BRAND MODAL FORM -->
      <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-lg max-h-[85vh] shadow-2xl relative flex flex-col overflow-hidden text-slate-100">
          
          <!-- Sticky Header -->
          <div class="p-5 border-b border-slate-800 bg-[#111827] shrink-0 flex items-center justify-between">
            <div>
              <h3 class="text-base font-black text-white uppercase tracking-wider">{{ editId() ? 'Sửa Thương Hiệu' : 'Thêm Thương Hiệu Mới' }}</h3>
              <p class="text-xs text-slate-400">Điền thông tin logo, website và cấu hình hiển thị thương hiệu</p>
            </div>

            <button (click)="showModal.set(false)" class="text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Scrollable Form Container -->
          <form (ngSubmit)="saveBrand()" class="flex flex-col flex-grow overflow-hidden">
            <div class="p-5 flex-grow overflow-y-auto custom-scrollbar space-y-4">
              
              <!-- Brand Name Input -->
              <div>
                <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Tên Hãng (Brand) *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.name" 
                  (ngModelChange)="onNameChange()"
                  name="name" 
                  required 
                  placeholder="VD: GIGABYTE AORUS" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-bold" />
              </div>

              <!-- Auto Slug Input -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-bold uppercase text-slate-400">Slug (URL-friendly)</label>
                  <span class="text-[10px] text-slate-500 italic">Tự động sinh từ tên</span>
                </div>
                <input 
                  type="text" 
                  [(ngModel)]="formData.slug" 
                  (ngModelChange)="onSlugChange()"
                  name="slug" 
                  placeholder="VD: gigabyte-aorus" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-amber-400 focus:outline-none focus:border-red-500" />
              </div>

              <!-- Official Website URL -->
              <div>
                <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Trang Chủ Chính Thức Hãng (Website URL)</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.websiteUrl" 
                  name="websiteUrl" 
                  placeholder="https://rog.asus.com" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono" />
              </div>

              <!-- Logo Upload & Live Preview Box -->
              <div class="space-y-2">
                <label class="block text-xs font-bold uppercase text-slate-400">Logo Hãng (Tải file / SVG / URL)</label>

                <!-- Inputs -->
                <div class="flex items-center gap-2">
                  <input 
                    type="text" 
                    [(ngModel)]="formData.logoUrl" 
                    name="logoUrl" 
                    placeholder="Dán URL ảnh hoặc chuỗi Base64/SVG..." 
                    class="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono" />

                  <!-- Upload File Button -->
                  <label class="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0">
                    <i class="pi pi-upload text-amber-400"></i>
                    <span>Tải File</span>
                    <input type="file" accept="image/*,.svg" (change)="onFileUpload($event)" class="hidden" />
                  </label>
                </div>

                <!-- LIVE PREVIEW BOX WITH LIGHT/DARK CONTRAST TOGGLE -->
                <div class="border border-slate-800 rounded-2xl p-3 bg-slate-900 space-y-2">
                  <div class="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span class="flex items-center gap-1"><i class="pi pi-eye text-red-500"></i> Xem Trước Trực Quan (Live Preview):</span>
                    
                    <!-- Contrast Toggle Switch -->
                    <div class="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-[10px]">
                      <button 
                        type="button" 
                        (click)="previewBgDark = false" 
                        [class]="!previewBgDark ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'"
                        class="px-2 py-0.5 rounded cursor-pointer">
                        Nền Sáng ☀️
                      </button>
                      <button 
                        type="button" 
                        (click)="previewBgDark = true" 
                        [class]="previewBgDark ? 'bg-slate-900 text-white shadow-xs font-bold' : 'text-slate-500'"
                        class="px-2 py-0.5 rounded cursor-pointer">
                        Nền Tối 🌙
                      </button>
                    </div>
                  </div>

                  <div 
                    [class]="previewBgDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'"
                    class="h-20 rounded-xl border flex items-center justify-center p-3 transition-colors relative overflow-hidden shadow-inner">
                    <img 
                      *ngIf="formData.logoUrl" 
                      [src]="formData.logoUrl" 
                      alt="Preview" 
                      class="max-h-full max-w-full object-contain" />

                    <!-- Fallback Avatar Preview -->
                    <div *ngIf="!formData.logoUrl" class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-800 text-white font-black text-sm flex items-center justify-center tracking-wider shadow-md">
                      {{ getInitials(formData.name) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description Input -->
              <div>
                <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Mô Tả / Slogan Hãng</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.description" 
                  name="description" 
                  placeholder="VD: Republic of Gamers" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500" />
              </div>

              <!-- Options: Active & Featured Toggles -->
              <div class="grid grid-cols-2 gap-3 pt-1">
                <!-- Active Toggle -->
                <div class="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
                  <div>
                    <span class="block text-xs font-bold text-white">Hiển Thị</span>
                    <span class="block text-[9px] text-slate-400">Bật/tắt ngoài web</span>
                  </div>
                  <button 
                    type="button"
                    (click)="formData.isActive = !formData.isActive"
                    [class]="formData.isActive ? 'bg-emerald-600' : 'bg-slate-700'"
                    class="relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none cursor-pointer p-0.5">
                    <span 
                      [class]="formData.isActive ? 'translate-x-4 bg-white' : 'translate-x-0 bg-white'"
                      class="inline-block w-4 h-4 transform rounded-full transition-transform shadow-sm"></span>
                  </button>
                </div>

                <!-- Featured Toggle -->
                <div class="flex items-center justify-between bg-amber-950/40 border border-amber-500/40 p-2.5 rounded-xl">
                  <div>
                    <span class="block text-xs font-bold text-amber-300 flex items-center gap-1">⭐ Nổi Bật</span>
                    <span class="block text-[9px] text-slate-400">Ưu tiên Trang Chủ</span>
                  </div>
                  <button 
                    type="button"
                    (click)="formData.isFeatured = !formData.isFeatured"
                    [class]="formData.isFeatured ? 'bg-amber-500' : 'bg-slate-700'"
                    class="relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none cursor-pointer p-0.5">
                    <span 
                      [class]="formData.isFeatured ? 'translate-x-4 bg-white' : 'translate-x-0 bg-white'"
                      class="inline-block w-4 h-4 transform rounded-full transition-transform shadow-sm"></span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Sticky Footer (Fixed at bottom with proper padding & backdrop) -->
            <div class="p-4 border-t border-slate-800 bg-[#111827] flex items-center justify-end gap-2 shrink-0">
              <button 
                type="button" 
                (click)="showModal.set(false)" 
                class="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer">
                Hủy
              </button>
              <button 
                type="submit" 
                class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-red-600/30">
                LƯU THƯƠNG HIỆU
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Custom Bulk Delete Confirmation Modal -->
      <div *ngIf="showDeleteConfirmModal()" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative p-6 space-y-4 text-slate-100">
          <div class="flex items-center gap-3 text-red-500">
            <div class="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center shrink-0">
              <i class="pi pi-exclamation-triangle text-xl"></i>
            </div>
            <div>
              <h3 class="text-sm font-black uppercase tracking-wider text-white">Xác nhận xóa</h3>
              <p class="text-[11px] text-slate-400">Hành động này không thể hoàn tác</p>
            </div>
          </div>

          <p class="text-xs text-slate-300">
            Bạn có chắc chắn muốn xóa <strong class="text-white font-bold">{{ selectedBrandIds().length }}</strong> thương hiệu đã chọn? Các hãng đang có sản phẩm sẽ được tự động bỏ qua để bảo vệ dữ liệu.
          </p>

          <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button (click)="showDeleteConfirmModal.set(false)" class="px-4 py-2 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 text-xs">Hủy</button>
            <button (click)="confirmBulkDelete()" class="px-5 py-2.5 rounded-xl font-bold text-white bg-[#E30019] hover:bg-red-700 text-xs cursor-pointer shadow-md shadow-red-600/30">
              Xóa Vĩnh Viễn
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminBrandListComponent implements OnInit {
  brands = signal<any[]>([]);
  showModal = signal(false);
  editId = signal<number | null>(null);

  formData = { 
    name: '', 
    slug: '', 
    logoUrl: '', 
    websiteUrl: '', 
    description: '', 
    priority: 1, 
    isActive: true, 
    isFeatured: false 
  };
  isSlugCustomized = false;
  previewBgDark = false;
  logoErrorMap: { [id: number]: boolean } = {};

  searchQuery = signal('');
  selectedBrandIds = signal<number[]>([]);
  showDeleteConfirmModal = signal(false);
  toastMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  // Drag & Drop State
  draggedIndex: number | null = null;
  dragOverIndex: number | null = null;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.adminService.getAllBrands().subscribe({
      next: (res) => {
        this.brands.set(res);
        this.selectedBrandIds.set([]);
      },
      error: () => {}
    });
  }

  filteredBrands = computed(() => {
    let list = this.brands();
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(b => 
        b.name.toLowerCase().includes(q) || 
        (b.slug && b.slug.toLowerCase().includes(q))
      );
    }
    return list;
  });

  getInitials(name: string): string {
    if (!name || !name.trim()) return 'BR';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  onLogoError(id: number): void {
    this.logoErrorMap[id] = true;
  }

  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.formData.logoUrl = e.target.result;
        this.showToast('Đã tải lên logo thương hiệu thành công!');
      };
      reader.readAsDataURL(file);
    }
  }

  // Slug Generator
  toSlug(input: string): string {
    if (!input || !input.trim()) return '';
    let str = input.trim().replace(/đ/g, 'd').replace(/Đ/g, 'D');
    const normalized = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalized
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  onNameChange(): void {
    if (!this.isSlugCustomized) {
      this.formData.slug = this.toSlug(this.formData.name);
    }
  }

  onSlugChange(): void {
    this.isSlugCustomized = true;
  }

  // Smart Shortcut to Products
  goToProducts(brandId: number): void {
    this.router.navigate(['/admin/products'], { queryParams: { brandId } });
  }

  // Toggles
  toggleActive(b: any): void {
    const newStatus = !(b.isActive !== false);
    b.isActive = newStatus;
    this.adminService.toggleBrandActive(b.id).subscribe({
      next: () => this.showToast(`Đã ${newStatus ? 'hiển thị' : 'ẩn'} thương hiệu "${b.name}"!`),
      error: () => {
        b.isActive = !newStatus;
        this.showToast('Lỗi khi cập nhật trạng thái!', 'error');
      }
    });
  }

  toggleFeatured(b: any): void {
    const newStatus = !(b.isFeatured !== false);
    b.isFeatured = newStatus;
    this.adminService.toggleBrandFeatured(b.id).subscribe({
      next: () => this.showToast(`Đã ${newStatus ? 'đánh dấu' : 'bỏ'} Hãng Nổi Bật "${b.name}"!`),
      error: () => {
        b.isFeatured = !newStatus;
        this.showToast('Lỗi khi cập nhật Hãng Nổi Bật!', 'error');
      }
    });
  }

  // Drag & Drop Handling
  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverIndex = index;
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    if (this.draggedIndex !== null && this.draggedIndex !== dropIndex) {
      const list = [...this.brands()];
      const [movedItem] = list.splice(this.draggedIndex, 1);
      list.splice(dropIndex, 0, movedItem);
      
      this.brands.set(list);
      this.saveReorder();
    }
    this.onDragEnd();
  }

  onDragEnd(): void {
    this.draggedIndex = null;
    this.dragOverIndex = null;
  }

  moveUp(index: number): void {
    if (index > 0) {
      const list = [...this.brands()];
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      this.brands.set(list);
      this.saveReorder();
    }
  }

  moveDown(index: number): void {
    const list = [...this.brands()];
    if (index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      this.brands.set(list);
      this.saveReorder();
    }
  }

  saveReorder(): void {
    const ids = this.brands().map(b => b.id);
    this.adminService.reorderBrands(ids).subscribe({
      next: () => this.showToast('Đã cập nhật thứ tự ưu tiên thương hiệu!'),
      error: () => this.showToast('Lỗi khi lưu thứ tự ưu tiên!', 'error')
    });
  }

  // Selection Checkbox Logic
  isAllSelected(): boolean {
    const list = this.filteredBrands();
    return list.length > 0 && list.every(b => this.selectedBrandIds().includes(b.id));
  }

  toggleSelectAll(): void {
    const list = this.filteredBrands();
    if (this.isAllSelected()) {
      this.selectedBrandIds.update(ids => ids.filter(id => !list.some(b => b.id === id)));
    } else {
      this.selectedBrandIds.update(ids => {
        const newIds = [...ids];
        list.forEach(b => {
          if (!newIds.includes(b.id)) newIds.push(b.id);
        });
        return newIds;
      });
    }
  }

  toggleSelection(id: number): void {
    this.selectedBrandIds.update(ids => 
      ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
    );
  }

  isSelected(id: number): boolean {
    return this.selectedBrandIds().includes(id);
  }

  // Modal Open/Save/Delete
  openModal(b?: any): void {
    if (b) {
      this.editId.set(b.id);
      this.formData = { 
        name: b.name, 
        slug: b.slug || '', 
        logoUrl: b.logoUrl || '', 
        websiteUrl: b.websiteUrl || '', 
        description: b.description || '',
        priority: b.priority || 1,
        isActive: b.isActive !== false,
        isFeatured: b.isFeatured === true
      };
      this.isSlugCustomized = true;
    } else {
      this.editId.set(null);
      this.formData = { 
        name: '', 
        slug: '', 
        logoUrl: '', 
        websiteUrl: '', 
        description: '',
        priority: this.brands().length + 1,
        isActive: true,
        isFeatured: false
      };
      this.isSlugCustomized = false;
    }
    this.previewBgDark = false;
    this.showModal.set(true);
  }

  saveBrand(): void {
    if (!this.formData.name.trim()) return;

    if (!this.formData.slug.trim()) {
      this.formData.slug = this.toSlug(this.formData.name);
    }

    if (this.editId()) {
      this.adminService.updateBrand(this.editId()!, this.formData).subscribe({
        next: () => {
          this.showModal.set(false);
          this.showToast('Đã lưu thương hiệu thành công!');
          this.loadBrands();
        },
        error: () => this.showToast('Lỗi khi lưu thương hiệu!', 'error')
      });
    } else {
      this.adminService.createBrand(this.formData).subscribe({
        next: () => {
          this.showModal.set(false);
          this.showToast('Đã tạo thương hiệu thành công!');
          this.loadBrands();
        },
        error: () => this.showToast('Lỗi khi tạo thương hiệu!', 'error')
      });
    }
  }

  deleteBrand(id: number, name: string): void {
    if (confirm(`Bạn có chắc muốn xóa thương hiệu "${name}"?`)) {
      this.adminService.deleteBrand(id).subscribe({
        next: () => {
          this.showToast('Đã xóa thương hiệu thành công!');
          this.loadBrands();
        },
        error: (err) => {
          let errMsg = 'Không thể xóa thương hiệu này vì vẫn còn sản phẩm đang thuộc hãng!';
          if (err.error && typeof err.error === 'string') {
            errMsg = err.error;
          }
          this.showToast(errMsg, 'error');
        }
      });
    }
  }

  bulkDelete(): void {
    this.showDeleteConfirmModal.set(true);
  }

  confirmBulkDelete(): void {
    const ids = this.selectedBrandIds();
    this.showDeleteConfirmModal.set(false);

    this.adminService.bulkDeleteBrands(ids).subscribe({
      next: (res: any) => {
        if (res && res.skippedCount > 0) {
          this.showToast(`Đã xóa ${res.deletedCount} thương hiệu. Bỏ qua ${res.skippedCount} hãng đang có sản phẩm!`, 'error');
        } else {
          this.showToast(`Đã xóa vĩnh viễn cả ${res.deletedCount} thương hiệu!`);
        }
        this.loadBrands();
      },
      error: () => {
        this.showToast('Lỗi khi xóa hàng loạt thương hiệu!', 'error');
      }
    });
  }

  showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}

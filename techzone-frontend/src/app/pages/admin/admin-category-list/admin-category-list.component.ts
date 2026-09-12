import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../../services/admin.service';

import { AdminHeaderComponent } from '../../../components/admin-header/admin-header.component';

export interface IconOption {
  class: string;
  name: string;
  provider: 'fa' | 'pi';
  category?: 'pc' | 'gear' | 'general';
  keywords?: string[];
}

@Component({
  selector: 'app-admin-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminHeaderComponent],
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
        title="Quản Lý Danh Mục"
        subtitle="Thêm, sửa, chọn Icon JSON động, Upload SVG Logo tùy chỉnh & sắp xếp vị trí hiển thị"
        icon="pi pi-th-large"
        badge="Category Engine"
        [breadcrumbs]="[{ label: 'Quản lý Danh mục' }]">

        <button
          (click)="openModal()"
          class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer">
          <i class="pi pi-plus"></i>
          <span>Thêm Danh Mục Mới</span>
        </button>
      </app-admin-header>

      <!-- Toolbar -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative flex-grow max-w-md w-full">
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Tìm danh mục theo tên, slug..."
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
            Tổng: <span class="text-red-400 font-black text-sm">{{ filteredCategories().length }}</span> danh mục
          </span>
        </div>
      </div>

      <!-- Categories Table with Drag & Drop -->
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
                <th class="p-4 w-16">Icon / SVG</th>
                <th class="p-4">Tên Danh Mục</th>
                <th class="p-4">Slug (URL)</th>
                <th class="p-4 text-center">Trạng Thái</th>
                <th class="p-4 text-center">Menu</th>
                <th class="p-4 text-center">Trang Chủ</th>
                <th class="p-4 text-center">Thứ Tự</th>
                <th class="p-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-semibold text-slate-200">
              <tr
                *ngFor="let cat of filteredCategories(); let i = index"
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
                    [checked]="isSelected(cat.id)"
                    (change)="toggleSelection(cat.id)"
                    class="w-4 h-4 accent-red-600 rounded cursor-pointer" />
                </td>

                <!-- Icon / SVG Image Preview -->
                <td class="p-4">
                  <div class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-red-400 text-base shadow-xs overflow-hidden">
                    <img *ngIf="isImageUrl(cat.icon)" [src]="cat.icon" class="w-6 h-6 object-contain" [alt]="cat.name" />
                    <i *ngIf="!isImageUrl(cat.icon)" [class]="cat.icon || 'pi pi-tag'"></i>
                  </div>
                </td>

                <!-- Name -->
                <td class="p-4 font-bold text-white text-sm">
                  {{ cat.name }}
                </td>

                <!-- Slug -->
                <td class="p-4 font-mono text-slate-400">
                  <span class="bg-slate-900 text-slate-300 px-2 py-1 rounded-md text-[11px] border border-slate-800">
                    {{ cat.slug }}
                  </span>
                </td>

                <!-- Status Toggle -->
                <td class="p-4 text-center">
                  <button
                    (click)="toggleActive(cat)"
                    [class]="(cat.isActive !== false) ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'"
                    class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none cursor-pointer p-0.5">
                    <span
                      [class]="(cat.isActive !== false) ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white'"
                      class="inline-block w-5 h-5 transform rounded-full transition-transform shadow-sm"></span>
                  </button>
                  <span class="block text-[10px] font-bold mt-1" [class]="(cat.isActive !== false) ? 'text-emerald-400' : 'text-slate-500'">
                    {{ (cat.isActive !== false) ? 'Hiển thị' : 'Ẩn' }}
                  </span>
                </td>

                <!-- Navbar Toggle -->
                <td class="p-4 text-center">
                  <button
                    (click)="toggleCategoryFlag(cat, 'showInNavbar')"
                    [class]="cat.showInNavbar === true ? 'bg-[#E30019] text-white' : 'bg-slate-700 text-slate-400'"
                    class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none cursor-pointer p-0.5">
                    <span
                      [class]="cat.showInNavbar === true ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white'"
                      class="inline-block w-5 h-5 transform rounded-full transition-transform shadow-sm"></span>
                  </button>
                  <span class="block text-[10px] font-bold mt-1" [class]="cat.showInNavbar === true ? 'text-red-400' : 'text-slate-500'">
                    {{ cat.showInNavbar === true ? 'Hiện menu' : 'Ẩn menu' }}
                  </span>
                </td>

                <!-- Homepage Toggle -->
                <td class="p-4 text-center">
                  <button
                    (click)="toggleCategoryFlag(cat, 'showOnHomepage')"
                    [class]="cat.showOnHomepage === true ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-400'"
                    class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none cursor-pointer p-0.5">
                    <span
                      [class]="cat.showOnHomepage === true ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white'"
                      class="inline-block w-5 h-5 transform rounded-full transition-transform shadow-sm"></span>
                  </button>
                  <span class="block text-[10px] font-bold mt-1" [class]="cat.showOnHomepage === true ? 'text-amber-400' : 'text-slate-500'">
                    {{ cat.showOnHomepage === true ? 'Hiện home' : 'Ẩn home' }}
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
                      [disabled]="i === filteredCategories().length - 1"
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
                      (click)="openModal(cat)"
                      class="w-8 h-8 rounded-lg bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Chỉnh sửa">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button
                      (click)="deleteCategory(cat.id, cat.name)"
                      class="w-8 h-8 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Xóa danh mục">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredCategories().length === 0">
                <td colspan="10" class="p-8 text-center text-slate-400">Không tìm thấy danh mục nào phù hợp.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Floating Bulk Action Bar -->
      <div *ngIf="selectedCategoryIds().length > 0" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white rounded-2xl px-6 py-4 shadow-2xl z-50 flex items-center gap-6 animate-slide-up">
        <div class="text-xs font-bold text-slate-300">
          Đang chọn: <span class="text-red-500 font-black text-sm">{{ selectedCategoryIds().length }}</span> danh mục
        </div>
        <div class="h-4 w-px bg-slate-800"></div>
        <div class="flex items-center gap-2">
          <button (click)="bulkDelete()" class="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1">
            <i class="pi pi-trash"></i> Xóa hàng loạt
          </button>
        </div>
      </div>

      <!-- Spacer -->
      <div class="h-24" *ngIf="selectedCategoryIds().length > 0"></div>

      <!-- ADD/EDIT MODAL FORM -->
      <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4 text-slate-100">
          <button (click)="showModal.set(false)" class="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center transition-colors cursor-pointer border border-slate-800">
            <i class="pi pi-times"></i>
          </button>

          <h3 class="text-lg font-black text-white uppercase tracking-wider">{{ editId() ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới' }}</h3>

          <form (ngSubmit)="saveCategory()" class="space-y-4">
            <!-- Name Input -->
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Tên Danh Mục *</label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                (ngModelChange)="onNameChange()"
                name="name"
                required
                placeholder="VD: Laptop Gaming"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-bold" />
            </div>

            <!-- Slug Input with Auto-Generate -->
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
                placeholder="VD: laptop-gaming"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-amber-400 focus:outline-none focus:border-red-500" />
            </div>

            <!-- Icon Selector with Preview & Icon Picker Modal Trigger -->
            <div>
              <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Icon / Logo SVG Danh Mục</label>
              <div class="flex items-center gap-2">
                <!-- Preview Box -->
                <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-red-400 text-lg shadow-xs shrink-0 overflow-hidden">
                  <img *ngIf="isImageUrl(formData.icon)" [src]="formData.icon" class="w-6 h-6 object-contain" alt="Icon Preview" />
                  <i *ngIf="!isImageUrl(formData.icon)" [class]="formData.icon || 'fa-solid fa-tag'"></i>
                </div>

                <!-- Input -->
                <input
                  type="text"
                  [(ngModel)]="formData.icon"
                  name="icon"
                  placeholder="VD: fa-solid fa-laptop hoặc https://.../logo.svg"
                  class="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono" />

                <!-- Icon Picker Trigger -->
                <button
                  type="button"
                  (click)="showIconPicker.set(true)"
                  class="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0">
                  <i class="fa-solid fa-icons text-amber-400"></i>
                  <span>Chọn / Upload</span>
                </button>
              </div>
            </div>

            <!-- Active Status Toggle Switch -->
            <div class="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <div>
                <span class="block text-xs font-bold text-white">Trạng thái hiển thị</span>
                <span class="block text-[10px] text-slate-400">Bật để danh mục có thể dùng trong hệ thống</span>
              </div>
              <button
                type="button"
                (click)="formData.isActive = !formData.isActive"
                [class]="(formData.isActive !== false) ? 'bg-emerald-600' : 'bg-slate-700'"
                class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none cursor-pointer p-0.5">
                <span
                  [class]="(formData.isActive !== false) ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white'"
                  class="inline-block w-5 h-5 transform rounded-full transition-transform shadow-sm"></span>
              </button>
            </div>

            <!-- Display Scope Toggles -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <div>
                  <span class="block text-xs font-bold text-white">Hiện trên menu</span>
                  <span class="block text-[10px] text-slate-400">Thanh menu đỏ phía trên</span>
                </div>
                <button
                  type="button"
                  (click)="formData.showInNavbar = !formData.showInNavbar"
                  [class]="formData.showInNavbar === true ? 'bg-[#E30019]' : 'bg-slate-700'"
                  class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none cursor-pointer p-0.5">
                  <span
                    [class]="formData.showInNavbar === true ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white'"
                    class="inline-block w-5 h-5 transform rounded-full transition-transform shadow-sm"></span>
                </button>
              </div>

              <div class="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <div>
                  <span class="block text-xs font-bold text-white">Hiện trang chủ</span>
                  <span class="block text-[10px] text-slate-400">Khu danh mục nổi bật</span>
                </div>
                <button
                  type="button"
                  (click)="formData.showOnHomepage = !formData.showOnHomepage"
                  [class]="formData.showOnHomepage === true ? 'bg-amber-500' : 'bg-slate-700'"
                  class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none cursor-pointer p-0.5">
                  <span
                    [class]="formData.showOnHomepage === true ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white'"
                    class="inline-block w-5 h-5 transform rounded-full transition-transform shadow-sm"></span>
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                (click)="showModal.set(false)"
                class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                Hủy bỏ
              </button>
              <button
                type="submit"
                [disabled]="loadingSave()"
                class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer">
                <i class="pi pi-spin pi-spinner" *ngIf="loadingSave()"></i>
                <span>{{ loadingSave() ? 'Đang lưu...' : 'Lưu Danh Mục' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ICON PICKER & SVG UPLOAD MODAL -->
      <div *ngIf="showIconPicker()" class="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl relative flex flex-col overflow-hidden text-slate-200">

          <!-- Sticky Header -->
          <div class="p-5 border-b border-slate-800 bg-[#111827] shrink-0 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <i class="fa-solid fa-icons text-red-500"></i>
                  <span>Bộ Chọn Icon JSON & Upload SVG Logo Tùy Chỉnh</span>
                </h3>
                <p class="text-xs text-slate-400">Chọn Icon từ dữ liệu JSON động hoặc tự tải lên logo thương hiệu SVG</p>
              </div>

              <button
                (click)="showIconPicker.set(false)"
                class="text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Search & Filter Tab Controls -->
            <div class="flex flex-col sm:flex-row items-center gap-2.5">
              <div class="relative flex-grow w-full" *ngIf="activeTab !== 'upload'">
                <input
                  type="text"
                  [(ngModel)]="iconSearchQuery"
                  placeholder="Tìm kiếm trong 2,000+ icon (laptop, pc, mouse, rog, msi...)..."
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-medium" />
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              </div>

              <!-- Filter Tabs -->
              <div class="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl shrink-0 text-[11px] font-bold overflow-x-auto max-w-full">
                <button
                  (click)="activeTab = 'all'; iconProviderFilter = 'all'"
                  [class]="activeTab === 'all' && iconProviderFilter === 'all' ? 'bg-[#E30019] text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'"
                  class="px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap">
                  Tất cả ({{ allIcons.length }})
                </button>
                <button
                  (click)="activeTab = 'all'; iconProviderFilter = 'fa'"
                  [class]="activeTab === 'all' && iconProviderFilter === 'fa' ? 'bg-[#E30019] text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'"
                  class="px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1">
                  <i class="fa-brands fa-font-awesome text-white"></i> FontAwesome
                </button>
                <button
                  (click)="activeTab = 'upload'"
                  [class]="activeTab === 'upload' ? 'bg-[#E30019] text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'"
                  class="px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1">
                  <i class="fa-solid fa-upload text-white"></i> Upload SVG / Logo
                </button>
              </div>
            </div>
          </div>

          <!-- Tab Content Container -->
          <div class="p-5 flex-grow overflow-y-auto custom-scrollbar bg-slate-950">

            <!-- TAB 1 & 2: ICON GRID (JSON DYNAMIC) -->
            <div *ngIf="activeTab !== 'upload'" class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              <button
                *ngFor="let iconOpt of filteredIcons()"
                type="button"
                (click)="selectIcon(iconOpt.class)"
                [class.bg-[#E30019]]="formData.icon === iconOpt.class"
                [class.text-white]="formData.icon === iconOpt.class"
                [class.border-red-500]="formData.icon === iconOpt.class"
                [class.shadow-lg]="formData.icon === iconOpt.class"
                [class.bg-slate-900]="formData.icon !== iconOpt.class"
                [class.text-slate-300]="formData.icon !== iconOpt.class"
                [class.border-slate-800]="formData.icon !== iconOpt.class"
                class="p-3 border rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group h-20 relative">

                <span
                  [class]="iconOpt.provider === 'fa' ? 'bg-blue-950 text-blue-400 border border-blue-500/30' : 'bg-red-950 text-red-400 border border-red-500/30'"
                  class="absolute top-1 right-1 text-[8px] font-black uppercase px-1 rounded">
                  {{ iconOpt.provider }}
                </span>

                <i [class]="iconOpt.class" class="text-2xl transition-transform group-hover:scale-110"></i>

                <span class="text-[9px] font-medium truncate w-full text-center tracking-tighter opacity-80">
                  {{ iconOpt.name }}
                </span>
              </button>
            </div>

            <!-- TAB 3: CUSTOM UPLOAD SVG / IMAGE LOGO -->
            <div *ngIf="activeTab === 'upload'" class="space-y-5 max-w-md mx-auto py-2">
              <div class="bg-white border-2 border-dashed border-slate-300 hover:border-red-500 rounded-2xl p-6 text-center space-y-3 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
                  (change)="onSvgFileUpload($event)"
                  class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />

                <div class="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto text-xl">
                  <i class="fa-solid fa-cloud-arrow-up"></i>
                </div>

                <div>
                  <h4 class="text-xs font-bold text-slate-800">Tải lên file SVG hoặc Ảnh Logo</h4>
                  <p class="text-[11px] text-slate-400 mt-0.5">Hỗ trợ định dạng .SVG, .PNG, .JPG, .WEBP (tự chuyển sang Base64 Data URL)</p>
                </div>
              </div>

              <!-- OR enter Image URL -->
              <div class="relative">
                <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
                <div class="relative flex justify-center text-[10px] uppercase font-bold text-slate-400"><span class="bg-slate-50 px-2">Hoặc nhập URL Logo trực tiếp</span></div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Đường dẫn URL Logo SVG / Ảnh</label>
                <input
                  type="text"
                  [(ngModel)]="customSvgUrl"
                  placeholder="https://rog.asus.com/logo.svg hoặc /assets/logos/msi.svg"
                  class="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono" />
                <button
                  type="button"
                  (click)="applyCustomSvgUrl()"
                  class="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer">
                  Sử dụng URL Logo Này
                </button>
              </div>

              <!-- Preview Uploaded SVG/Logo -->
              <div *ngIf="isImageUrl(formData.icon)" class="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 p-2 overflow-hidden">
                  <img [src]="formData.icon" class="w-full h-full object-contain" alt="Uploaded Preview" />
                </div>
                <div>
                  <span class="block text-xs font-bold text-emerald-600">Đã chọn Logo tùy chỉnh thành công!</span>
                  <span class="block text-[10px] font-mono text-slate-400 truncate max-w-xs">{{ formData.icon }}</span>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="activeTab !== 'upload' && filteredIcons().length === 0" class="py-12 text-center text-slate-400 space-y-2">
              <i class="fa-solid fa-magnifying-glass text-3xl opacity-40"></i>
              <p class="text-xs font-bold">Không tìm thấy icon nào với từ khóa "{{ iconSearchQuery }}"</p>
            </div>
          </div>

          <!-- Sticky Footer -->
          <div class="p-4 border-t border-slate-100 bg-white shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-3 text-slate-500 font-medium w-full sm:w-auto">
              <span>Đang chọn:</span>
              <div class="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg font-mono text-slate-800 font-bold max-w-xs truncate">
                <img *ngIf="isImageUrl(formData.icon)" [src]="formData.icon" class="w-4 h-4 object-contain" alt="Selected Icon" />
                <i *ngIf="!isImageUrl(formData.icon)" [class]="formData.icon || 'fa-solid fa-tag'" class="text-red-600"></i>
                <span class="truncate">{{ formData.icon || 'Chưa chọn' }}</span>
              </div>

              <a
                href="https://fontawesome.com/search?o=r&m=free"
                target="_blank"
                class="text-blue-600 hover:underline text-[11px] font-bold flex items-center gap-1 ml-auto sm:ml-2">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Tra cứu 2,000+ Icon FontAwesome
              </a>
            </div>

            <button
              type="button"
              (click)="showIconPicker.set(false)"
              class="px-5 py-2 font-bold text-xs text-white bg-slate-800 hover:bg-slate-900 rounded-xl cursor-pointer shadow-md transition-all w-full sm:w-auto">
              Đồng Ý / Đóng
            </button>
          </div>

        </div>
      </div>

      <!-- Custom Bulk Delete Confirmation Modal -->
      <div *ngIf="showDeleteConfirmModal()" class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
        <div class="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative p-6 space-y-4">
          <div class="flex items-center gap-3 text-[#E30019]">
            <i class="pi pi-exclamation-triangle text-2xl"></i>
            <h3 class="text-sm font-black uppercase tracking-wider text-slate-800">Xác nhận xóa hàng loạt</h3>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed font-medium">
            Bạn có chắc chắn muốn xóa vĩnh viễn <strong class="text-slate-800 font-bold">{{ selectedCategoryIds().length }}</strong> danh mục đã chọn? Thao tác này không thể hoàn tác. Các danh mục đang có sản phẩm sẽ được tự động bỏ qua để bảo vệ dữ liệu.
          </p>
          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              (click)="showDeleteConfirmModal.set(false)"
              class="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:text-slate-800 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer text-xs">
              Hủy bỏ
            </button>
            <button
              (click)="confirmBulkDelete()"
              class="px-4 py-2.5 rounded-xl font-bold text-white bg-[#E30019] hover:bg-red-700 transition-all cursor-pointer text-xs">
              Xác nhận Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminCategoryListComponent implements OnInit {
  categories = signal<any[]>([]);
  showModal = signal(false);
  showIconPicker = signal(false);
  editId = signal<number | null>(null);

  formData = {
    name: '',
    slug: '',
    icon: 'fa-solid fa-laptop',
    priority: 1,
    isActive: true,
    showInNavbar: false,
    showOnHomepage: false
  };
  isSlugCustomized = false;

  searchQuery = signal('');
  iconSearchQuery = '';
  iconProviderFilter: 'all' | 'fa' | 'pi' = 'all';
  activeTab: 'all' | 'upload' = 'all';
  customSvgUrl = '';

  selectedCategoryIds = signal<number[]>([]);
  showDeleteConfirmModal = signal(false);
  loadingSave = signal(false);
  toastMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  // Drag & Drop State
  draggedIndex: number | null = null;
  dragOverIndex: number | null = null;

  // Built-in Icon Collection (FontAwesome 6 + PrimeIcons)
  allIcons: IconOption[] = [
    { class: 'fa-solid fa-laptop', name: 'Laptop', provider: 'fa', category: 'pc', keywords: ['laptop', 'may tinh'] },
    { class: 'fa-solid fa-laptop-code', name: 'Laptop Lập Trình', provider: 'fa', category: 'pc', keywords: ['code', 'developer'] },
    { class: 'fa-solid fa-desktop', name: 'Màn Hình PC', provider: 'fa', category: 'pc', keywords: ['desktop', 'monitor', 'pc'] },
    { class: 'fa-solid fa-computer', name: 'Cây PC / Case', provider: 'fa', category: 'pc', keywords: ['case', 'pc', 'vo may'] },
    { class: 'fa-solid fa-computer-mouse', name: 'Chuột Máy Tính', provider: 'fa', category: 'gear', keywords: ['chuot', 'mouse'] },
    { class: 'fa-solid fa-keyboard', name: 'Bàn Phím Cơ', provider: 'fa', category: 'gear', keywords: ['ban phim', 'keyboard'] },
    { class: 'fa-solid fa-headphones', name: 'Tai Nghe', provider: 'fa', category: 'gear', keywords: ['tai nghe', 'headphones'] },
    { class: 'fa-solid fa-headset', name: 'Tai Nghe Gaming', provider: 'fa', category: 'gear', keywords: ['headset', 'mic'] },
    { class: 'fa-solid fa-gamepad', name: 'Tay Cầm Game', provider: 'fa', category: 'gear', keywords: ['tay cam', 'gamepad'] },
    { class: 'fa-solid fa-microchip', name: 'CPU / Chip VXL', provider: 'fa', category: 'pc', keywords: ['cpu', 'chip'] },
    { class: 'fa-solid fa-memory', name: 'Bộ Nhớ RAM', provider: 'fa', category: 'pc', keywords: ['ram', 'bo nho'] },
    { class: 'fa-solid fa-hard-drive', name: 'Ổ Cứng SSD / HDD', provider: 'fa', category: 'pc', keywords: ['ssd', 'hdd'] },
    { class: 'fa-solid fa-fan', name: 'Quạt Tản Nhiệt', provider: 'fa', category: 'pc', keywords: ['quat', 'fan', 'tan nhiet'] },
    { class: 'fa-solid fa-power-off', name: 'Nguồn PSU', provider: 'fa', category: 'pc', keywords: ['nguon', 'psu'] },
    { class: 'fa-solid fa-droplet', name: 'Tản Nhiệt Nước', provider: 'fa', category: 'pc', keywords: ['tan nhiet nuoc', 'aio'] },
    { class: 'fa-solid fa-mobile-screen-button', name: 'Điện Thoại Mobile', provider: 'fa', category: 'general', keywords: ['mobile', 'phone'] },
    { class: 'fa-solid fa-tablet-screen-button', name: 'Máy Tính Bảng', provider: 'fa', category: 'general', keywords: ['tablet', 'ipad'] },
    { class: 'fa-solid fa-print', name: 'Máy In', provider: 'fa', category: 'general', keywords: ['may in', 'printer'] },
    { class: 'fa-solid fa-tv', name: 'Tivi / Monitor', provider: 'fa', category: 'pc', keywords: ['tv', 'tivi'] },
    { class: 'fa-solid fa-plug', name: 'Dây Cáp / Nguồn', provider: 'fa', category: 'gear', keywords: ['cap', 'plug'] },
    { class: 'fa-solid fa-vr-cardboard', name: 'Kính VR', provider: 'fa', category: 'gear', keywords: ['vr', 'kinh vr'] },
    { class: 'fa-solid fa-charging-station', name: 'Sạc / Hub', provider: 'fa', category: 'gear', keywords: ['sac', 'hub'] },
    { class: 'fa-solid fa-wifi', name: 'Wifi Router', provider: 'fa', category: 'general', keywords: ['wifi', 'router'] },
    { class: 'fa-solid fa-network-wired', name: 'Cáp Mạng LAN', provider: 'fa', category: 'general', keywords: ['lan', 'cap mang'] },
    { class: 'fa-solid fa-compact-disc', name: 'Đĩa CD / DVD', provider: 'fa', category: 'gear', keywords: ['dia', 'cd'] },
    { class: 'fa-solid fa-sd-card', name: 'Thẻ Nhớ SD', provider: 'fa', category: 'gear', keywords: ['the nho', 'sd'] },
    { class: 'fa-solid fa-sim-card', name: 'Sim 4G / 5G', provider: 'fa', category: 'general', keywords: ['sim'] },
    { class: 'fa-solid fa-database', name: 'Máy Chủ Server', provider: 'fa', category: 'pc', keywords: ['server', "may chu"] },
    { class: 'fa-solid fa-camera', name: 'Webcam / Camera', provider: 'fa', category: 'gear', keywords: ['camera', 'webcam'] },
    { class: 'fa-solid fa-microphone', name: 'Microphone Streamer', provider: 'fa', category: 'gear', keywords: ['mic', 'micro'] },
    { class: 'fa-solid fa-ghost', name: 'Bóng Ma Gaming', provider: 'fa', category: 'gear', keywords: ['ghost', 'gaming'] },
    { class: 'fa-solid fa-dragon', name: 'Rồng Gaming', provider: 'fa', category: 'gear', keywords: ['dragon', 'msi'] },
    { class: 'fa-solid fa-trophy', name: 'Cúp / Giải Thưởng', provider: 'fa', category: 'general', keywords: ['cup', 'top'] },
    { class: 'fa-solid fa-crown', name: 'Vương Miện Premium', provider: 'fa', category: 'general', keywords: ['crown', 'vip'] },
    { class: 'fa-solid fa-bolt', name: 'Flash Sale', provider: 'fa', category: 'general', keywords: ['sale', 'bolt'] },
    { class: 'fa-solid fa-box-open', name: 'Hộp Hàng', provider: 'fa', category: 'general', keywords: ['box', 'hop'] },
    { class: 'fa-solid fa-fire', name: 'Hot Sale', provider: 'fa', category: 'general', keywords: ['hot', 'fire'] },
    { class: 'fa-solid fa-shield-halved', name: 'Bảo Hành', provider: 'fa', category: 'general', keywords: ['bao hanh'] },
    { class: 'fa-solid fa-sliders', name: 'Cấu Hình', provider: 'fa', category: 'general', keywords: ['config'] },
    { class: 'fa-solid fa-tag', name: 'Thẻ Khuyến Mãi', provider: 'fa', category: 'general', keywords: ['tag'] },
    { class: 'fa-solid fa-truck-fast', name: 'Giao Hàng Nhanh', provider: 'fa', category: 'general', keywords: ['giao hang'] },
    { class: 'fa-solid fa-cart-shopping', name: 'Giỏ Hàng', provider: 'fa', category: 'general', keywords: ['cart'] },
    { class: 'fa-brands fa-apple', name: 'Apple / macOS', provider: 'fa', category: 'pc', keywords: ['apple', 'mac'] },
    { class: 'fa-brands fa-windows', name: 'Windows', provider: 'fa', category: 'pc', keywords: ['windows', 'pc'] },
    { class: 'fa-brands fa-android', name: 'Android', provider: 'fa', category: 'general', keywords: ['android'] },
    { class: 'fa-brands fa-playstation', name: 'PlayStation', provider: 'fa', category: 'gear', keywords: ['ps5', 'sony'] },
    { class: 'fa-brands fa-xbox', name: 'Xbox Gaming', provider: 'fa', category: 'gear', keywords: ['xbox'] },
    { class: 'fa-brands fa-bluetooth', name: 'Bluetooth', provider: 'fa', category: 'gear', keywords: ['bluetooth'] },
    { class: 'fa-brands fa-usb', name: 'USB Type-C', provider: 'fa', category: 'gear', keywords: ['usb'] },
    { class: 'pi pi-desktop', name: 'Desktop (PI)', provider: 'pi', category: 'pc', keywords: ['desktop'] },
    { class: 'pi pi-laptop', name: 'Laptop (PI)', provider: 'pi', category: 'pc', keywords: ['laptop'] },
    { class: 'pi pi-mobile', name: 'Mobile (PI)', provider: 'pi', category: 'general', keywords: ['mobile'] },
    { class: 'pi pi-tablet', name: 'Tablet (PI)', provider: 'pi', category: 'general', keywords: ['tablet'] },
    { class: 'pi pi-headphones', name: 'Headphones (PI)', provider: 'pi', category: 'gear', keywords: ['headphones'] },
    { class: 'pi pi-print', name: 'Print (PI)', provider: 'pi', category: 'general', keywords: ['print'] },
    { class: 'pi pi-camera', name: 'Camera (PI)', provider: 'pi', category: 'general', keywords: ['camera'] },
    { class: 'pi pi-server', name: 'Server (PI)', provider: 'pi', category: 'pc', keywords: ['server'] },
    { class: 'pi pi-tag', name: 'Tag (PI)', provider: 'pi', category: 'general', keywords: ['tag'] },
    { class: 'pi pi-box', name: 'Box (PI)', provider: 'pi', category: 'general', keywords: ['box'] }
  ];

  constructor(
    private adminService: AdminService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadJsonIcons();
  }

  loadJsonIcons(): void {
    this.http.get<IconOption[]>('assets/data/fontawesome-icons.json').subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          this.allIcons = res;
        }
      },
      error: () => {
        // Keep built-in collection on error
      }
    });
  }

  loadCategories(): void {
    this.adminService.getAllCategories().subscribe({
      next: (res) => {
        this.categories.set(res);
        this.selectedCategoryIds.set([]);
      },
      error: () => {}
    });
  }

  filteredCategories = computed(() => {
    let list = this.categories();
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.slug && c.slug.toLowerCase().includes(q))
      );
    }
    return list;
  });

  filteredIcons(): IconOption[] {
    let list = this.allIcons;

    if (this.iconProviderFilter !== 'all') {
      list = list.filter(icon => icon.provider === this.iconProviderFilter);
    }

    const q = this.iconSearchQuery ? this.iconSearchQuery.trim().toLowerCase() : '';
    if (q) {
      list = list.filter(icon =>
        icon.name.toLowerCase().includes(q) ||
        icon.class.toLowerCase().includes(q) ||
        (icon.keywords && icon.keywords.some(k => k.toLowerCase().includes(q)))
      );
    }

    return list;
  }

  selectIcon(iconClass: string): void {
    this.formData.icon = iconClass;
    this.showIconPicker.set(false);
  }

  isImageUrl(icon?: string): boolean {
    if (!icon) return false;
    const str = icon.trim();
    return str.startsWith('http://') ||
           str.startsWith('https://') ||
           str.startsWith('data:image/') ||
           str.startsWith('/') ||
           str.startsWith('assets/') ||
           /\.(svg|png|jpg|jpeg|webp)$/i.test(str);
  }

  onSvgFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.formData.icon = e.target.result;
        this.showToast('Đã tải lên logo SVG/Ảnh thành công!');
        this.showIconPicker.set(false);
      };
      reader.readAsDataURL(file);
    }
  }

  applyCustomSvgUrl(): void {
    if (this.customSvgUrl && this.customSvgUrl.trim()) {
      this.formData.icon = this.customSvgUrl.trim();
      this.showToast('Đã áp dụng URL Logo thành công!');
      this.showIconPicker.set(false);
    }
  }

  // Slug Generation Logic
  toSlug(input: string): string {
    if (!input || !input.trim()) return '';
    let str = input.trim();
    str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
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

  // Active Status Toggle
  toggleActive(cat: any): void {
    const newStatus = !(cat.isActive !== false);
    cat.isActive = newStatus;
    this.adminService.toggleCategoryActive(cat.id).subscribe({
      next: () => {
        this.showToast(`Đã ${newStatus ? 'hiển thị' : 'ẩn'} danh mục "${cat.name}"!`);
      },
      error: () => {
        cat.isActive = !newStatus; // Revert on failure
        this.showToast('Lỗi khi cập nhật trạng thái danh mục!', 'error');
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
      const list = [...this.categories()];
      const [movedItem] = list.splice(this.draggedIndex, 1);
      list.splice(dropIndex, 0, movedItem);

      this.categories.set(list);
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
      const list = [...this.categories()];
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      this.categories.set(list);
      this.saveReorder();
    }
  }

  moveDown(index: number): void {
    const list = [...this.categories()];
    if (index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      this.categories.set(list);
      this.saveReorder();
    }
  }

  saveReorder(): void {
    const ids = this.categories().map(c => c.id);
    this.adminService.reorderCategories(ids).subscribe({
      next: () => {
        this.showToast('Đã cập nhật thứ tự ưu tiên!');
      },
      error: () => {
        this.showToast('Lỗi khi lưu thứ tự ưu tiên!', 'error');
      }
    });
  }

  // Selection Checkbox Logic
  isAllSelected(): boolean {
    const list = this.filteredCategories();
    return list.length > 0 && list.every(c => this.selectedCategoryIds().includes(c.id));
  }

  toggleSelectAll(): void {
    const list = this.filteredCategories();
    if (this.isAllSelected()) {
      this.selectedCategoryIds.update(ids => ids.filter(id => !list.some(c => c.id === id)));
    } else {
      this.selectedCategoryIds.update(ids => {
        const newIds = [...ids];
        list.forEach(c => {
          if (!newIds.includes(c.id)) newIds.push(c.id);
        });
        return newIds;
      });
    }
  }

  toggleSelection(id: number): void {
    this.selectedCategoryIds.update(ids =>
      ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
    );
  }

  isSelected(id: number): boolean {
    return this.selectedCategoryIds().includes(id);
  }

  // Modal Open/Save/Delete
  openModal(cat?: any): void {
    if (cat) {
      this.editId.set(cat.id);
      this.formData = {
        name: cat.name,
        slug: cat.slug || '',
        icon: cat.icon || 'fa-solid fa-tag',
        priority: cat.priority || 1,
        isActive: cat.isActive !== false,
        showInNavbar: cat.showInNavbar === true,
        showOnHomepage: cat.showOnHomepage === true
      };
      this.isSlugCustomized = true;
    } else {
      this.editId.set(null);
      this.formData = {
        name: '',
        slug: '',
        icon: 'fa-solid fa-laptop',
        priority: this.categories().length + 1,
        isActive: true,
        showInNavbar: false,
        showOnHomepage: false
      };
      this.isSlugCustomized = false;
    }
    this.showModal.set(true);
  }

  saveCategory(): void {
    if (!this.formData.name.trim()) return;

    if (!this.formData.slug.trim()) {
      this.formData.slug = this.toSlug(this.formData.name);
    }

    this.loadingSave.set(true);
    if (this.editId()) {
      this.adminService.updateCategory(this.editId()!, this.formData).subscribe({
        next: () => {
          this.loadingSave.set(false);
          this.showModal.set(false);
          this.showToast('Đã lưu danh mục thành công!');
          this.loadCategories();
        },
        error: () => {
          this.loadingSave.set(false);
          this.showToast('Lỗi khi lưu danh mục!', 'error');
        }
      });
    } else {
      this.adminService.createCategory(this.formData).subscribe({
        next: () => {
          this.loadingSave.set(false);
          this.showModal.set(false);
          this.showToast('Đã tạo danh mục thành công!');
          this.loadCategories();
        },
        error: () => {
          this.loadingSave.set(false);
          this.showToast('Lỗi khi tạo danh mục!', 'error');
        }
      });
    }
  }

  toggleCategoryFlag(cat: any, field: 'showInNavbar' | 'showOnHomepage'): void {
    const previous = cat[field] === true;
    cat[field] = !previous;
    this.adminService.updateCategory(cat.id, {
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      priority: cat.priority,
      isActive: cat.isActive !== false,
      showInNavbar: cat.showInNavbar === true,
      showOnHomepage: cat.showOnHomepage === true
    }).subscribe({
      next: () => {
        const label = field === 'showInNavbar' ? 'menu chính' : 'trang chủ';
        this.showToast(`Đã cập nhật hiển thị ${label} cho "${cat.name}"!`);
      },
      error: () => {
        cat[field] = previous;
        this.showToast('Lỗi khi cập nhật hiển thị danh mục!', 'error');
      }
    });
  }

  deleteCategory(id: number, name: string): void {
    if (confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) {
      this.adminService.deleteCategory(id).subscribe({
        next: () => {
          this.showToast('Đã xóa danh mục thành công!');
          this.loadCategories();
        },
        error: (err) => {
          let errMsg = 'Không thể xóa danh mục này vì vẫn còn sản phẩm!';
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
    const ids = this.selectedCategoryIds();
    this.showDeleteConfirmModal.set(false);

    this.adminService.bulkDeleteCategories(ids).subscribe({
      next: (res: any) => {
        if (res && res.skippedCount > 0) {
          this.showToast(`Đã xóa ${res.deletedCount} danh mục. Bỏ qua ${res.skippedCount} danh mục đang có sản phẩm!`, 'error');
        } else {
          this.showToast(`Đã xóa vĩnh viễn cả ${res.deletedCount} danh mục!`);
        }
        this.loadCategories();
      },
      error: () => {
        this.showToast('Lỗi khi xóa hàng loạt danh mục!', 'error');
      }
    });
  }

  showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 3000);
  }
}

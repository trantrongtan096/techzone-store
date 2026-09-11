import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ProductService } from '../../../services/product.service';
import { Category, Brand } from '../../../models/product.model';

import { AdminHeaderComponent } from '../../../components/admin-header/admin-header.component';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminHeaderComponent],
  template: `
    <!-- Toast Notification Banner (Fixed Top-Center - Absolutely Zero Layout Shift) -->
    <div *ngIf="toastMessage()" 
      [class.bg-emerald-600]="toastMessage()?.type === 'success'" 
      [class.bg-red-600]="toastMessage()?.type === 'error'" 
      class="fixed top-6 left-1/2 -translate-x-1/2 text-white px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-fade-in border border-white/20 backdrop-blur-md pointer-events-none">
      <i [class]="toastMessage()?.type === 'success' ? 'pi pi-check-circle text-xl' : 'pi pi-exclamation-triangle text-xl'"></i>
      <span class="text-xs font-bold">{{ toastMessage()?.text }}</span>
    </div>

    <div class="space-y-6 animate-fade-in relative">
      <!-- Standardized Admin Header Component -->
      <app-admin-header 
        title="Quản Lý Sản Phẩm"
        subtitle="Danh sách toàn bộ sản phẩm linh kiện & Laptop trong hệ thống cửa hàng TechZone"
        icon="pi pi-box"
        badge="Catalog Engine"
        [breadcrumbs]="[{ label: 'Quản lý Sản phẩm' }]">
        
        <button 
          (click)="showImportModal.set(true)"
          class="bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-slate-800 shadow-xs">
          <i class="pi pi-file-excel text-emerald-400"></i>
          <span>Nhập từ CSV</span>
        </button>

        <a 
          routerLink="/admin/products/new"
          class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer">
          <i class="pi pi-plus"></i>
          <span>Thêm Sản Phẩm Mới</span>
        </a>
      </app-admin-header>

      <!-- Search & Advanced Filter Bar -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xl">
        <!-- Search Box -->
        <div class="relative flex-1 min-w-[200px]">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (input)="onSearchInput()"
            placeholder="Tìm kiếm theo tên, SKU, Hãng, Danh mục..."
            class="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-red-500 font-medium" />
          <i class="pi pi-search absolute left-3 top-2.5 text-slate-500 text-xs"></i>
        </div>

        <!-- Dropdowns filters inline -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0">
          <!-- Category Filter -->
          <select 
            [ngModel]="selectedCategoryId()" 
            (ngModelChange)="onCategoryFilterChange($event)"
            class="bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-2.5 text-xs focus:outline-none focus:border-red-500 cursor-pointer font-medium">
            <option [ngValue]="null">Tất cả Danh mục</option>
            <option *ngFor="let cat of categories()" [ngValue]="cat.id">{{ cat.name }}</option>
          </select>

          <!-- Brand Filter -->
          <select 
            [ngModel]="selectedBrandId()" 
            (ngModelChange)="onBrandFilterChange($event)"
            class="bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-2.5 text-xs focus:outline-none focus:border-red-500 cursor-pointer font-medium">
            <option [ngValue]="null">Tất cả Thương hiệu</option>
            <option *ngFor="let b of brands()" [ngValue]="b.id">{{ b.name }}</option>
          </select>

          <!-- Status Filter -->
          <select 
            [ngModel]="selectedStatus()" 
            (ngModelChange)="selectedStatus.set($event); currentPage.set(0)"
            class="bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-2.5 text-xs focus:outline-none focus:border-red-500 cursor-pointer font-medium">
            <option value="">Tất cả Trạng thái</option>
            <option value="active">Đang bán (Active)</option>
            <option value="inactive">Đang ẩn (Inactive)</option>
            <option value="in_stock">Còn hàng (> 0)</option>
            <option value="out_of_stock">Hết hàng (= 0)</option>
            <option value="flash_sale">⚡ Flash Sale</option>
          </select>
        </div>

        <!-- Summary Badge aligned right -->
        <div class="text-xs text-slate-400 font-bold shrink-0 flex items-center justify-end gap-1.5 self-center">
          <span class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 font-bold">
            Tổng: <span class="text-red-400 font-black text-sm">{{ totalElements() }}</span> SP
          </span>
        </div>
      </div>

      <!-- Main Product Table -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 text-[11px]">
              <tr>
                <th class="p-4 w-10 text-center">
                  <input 
                    type="checkbox" 
                    [checked]="isAllSelected()" 
                    (change)="toggleSelectAll()" 
                    class="w-4 h-4 accent-red-600 rounded cursor-pointer" />
                </th>
                <th class="p-4">Ảnh</th>
                <th class="p-4">Sản Phẩm & SKU</th>
                <th class="p-4">Danh Mục</th>
                <th class="p-4">Thương Hiệu</th>
                <th class="p-4">Giá Bán</th>
                <th class="p-4 text-center">Tồn Kho</th>
                <th class="p-4 text-center">Trạng Thái</th>
                <th class="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-semibold text-slate-200">
              <tr *ngFor="let p of paginatedProducts()" class="hover:bg-slate-800/40 transition-colors">
                <!-- Checkbox -->
                <td class="p-4 text-center">
                  <input 
                    type="checkbox" 
                    [checked]="isSelected(p.id)" 
                    (change)="toggleSelection(p.id)" 
                    class="w-4 h-4 accent-red-600 rounded cursor-pointer" />
                </td>

                <!-- Thumbnail -->
                <td class="p-4">
                  <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xs flex items-center justify-center shrink-0">
                    <img [src]="p.thumbnail" [alt]="p.name" loading="lazy" class="w-full h-full object-cover" />
                  </div>
                </td>

                <!-- Name & SKU -->
                <td class="p-4 min-w-[260px] max-w-md">
                  <div class="font-bold text-white hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                    {{ p.name }}
                  </div>
                  <div class="text-[10px] font-mono text-slate-400 mt-1 font-medium truncate" [title]="'SKU: ' + (p.sku || 'N/A')">
                    SKU: {{ p.sku || 'N/A' }}
                  </div>
                  <div *ngIf="p.isFeatured || p.isFlashSale" class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span *ngIf="p.isFeatured" class="bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[9px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap shrink-0 inline-flex items-center gap-1">
                      <i class="pi pi-star-fill text-[8px] text-amber-400"></i> Nổi bật
                    </span>
                    <span *ngIf="p.isFlashSale" class="bg-red-950/80 text-red-400 border border-red-500/40 text-[9px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap shrink-0 inline-flex items-center gap-1">
                      ⚡ Flash Sale
                    </span>
                  </div>
                </td>

                <!-- Category -->
                <td class="p-4">
                  <span class="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap inline-block shrink-0">
                    {{ p.category?.name || 'N/A' }}
                  </span>
                </td>

                <!-- Brand -->
                <td class="p-4 font-bold text-slate-300 whitespace-nowrap">
                  {{ p.brand?.name || 'N/A' }}
                </td>

                <!-- Price -->
                <td class="p-4 whitespace-nowrap">
                  <div class="font-black text-red-400 text-xs font-mono">
                    {{ (p.promotionPrice || p.originalPrice) | number:'1.0-0' }}đ
                  </div>
                  <div *ngIf="p.promotionPrice" class="text-[10px] text-slate-500 line-through font-mono">
                    {{ p.originalPrice | number:'1.0-0' }}đ
                  </div>
                </td>

                <!-- Stock -->
                <td class="p-4 text-center whitespace-nowrap font-mono">
                  <span 
                    [ngClass]="p.stockQuantity > 0 ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' : 'bg-red-950/80 text-red-400 border-red-500/40'"
                    class="px-2.5 py-1 rounded-xl border font-bold text-[11px] whitespace-nowrap inline-block shrink-0">
                    {{ p.stockQuantity || 0 }} cái
                  </span>
                </td>

                <!-- Active Toggle Switch -->
                <td class="p-4 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-2">
                    <button 
                      type="button" 
                      (click)="toggleProductActive(p)"
                      [class.bg-emerald-600]="p.isActive !== false"
                      [class.bg-slate-700]="p.isActive === false"
                      class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                      [title]="p.isActive !== false ? 'Click để ẨN sản phẩm' : 'Click để BÁN sản phẩm'">
                      <span 
                        [class.translate-x-4]="p.isActive !== false"
                        [class.translate-x-0]="p.isActive === false"
                        class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                    <span class="text-xs font-bold whitespace-nowrap" [class.text-emerald-400]="p.isActive !== false" [class.text-slate-500]="p.isActive === false">
                      {{ p.isActive !== false ? 'Đang bán' : 'Đang ẩn' }}
                    </span>
                  </div>
                </td>

                <!-- Action Buttons -->
                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <a 
                      [routerLink]="['/admin/products/edit', p.id]"
                      class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-blue-600/30 hover:border-blue-500 text-blue-400 border border-slate-700 flex items-center justify-center transition-all cursor-pointer"
                      title="Chỉnh sửa sản phẩm">
                      <i class="pi pi-pencil text-xs"></i>
                    </a>
                    <button 
                      (click)="openSingleDeleteModal(p)"
                      class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-red-600/30 hover:border-red-500 text-red-400 border border-slate-700 flex items-center justify-center transition-all cursor-pointer"
                      title="Xóa sản phẩm này">
                      <i class="pi pi-trash text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="paginatedProducts().length === 0">
                <td colspan="9" class="p-8 text-center text-slate-500">Không tìm thấy sản phẩm nào khớp với bộ lọc.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div>
          Hiển thị <strong>{{ paginatedProducts().length }}</strong> / <strong>{{ totalElements() }}</strong> sản phẩm
        </div>

        <div class="flex items-center gap-1.5" *ngIf="totalPages() > 1">
          <button 
            [disabled]="currentPage() === 0" 
            (click)="goToPage(currentPage() - 1)"
            class="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:hover:bg-slate-900 font-bold cursor-pointer">
            <i class="pi pi-chevron-left"></i>
          </button>
          
          <ng-container *ngFor="let page of getPagesArray()">
            <button 
              *ngIf="page === 0 || page === totalPages() - 1 || (page >= currentPage() - 2 && page <= currentPage() + 2)"
              (click)="goToPage(page)"
              [class.bg-[#E30019]]="currentPage() === page"
              [class.text-white]="currentPage() === page"
              [class.border-red-500]="currentPage() === page"
              [class.bg-slate-900]="currentPage() !== page"
              [class.text-slate-400]="currentPage() !== page"
              class="w-8 h-8 rounded-lg border border-slate-800 transition-colors font-bold cursor-pointer">
              {{ page + 1 }}
            </button>
            <span *ngIf="page === 1 && currentPage() > 3" class="px-1 text-slate-500">...</span>
            <span *ngIf="page === totalPages() - 2 && currentPage() < totalPages() - 4" class="px-1 text-slate-500">...</span>
          </ng-container>

          <button 
            [disabled]="currentPage() === totalPages() - 1" 
            (click)="goToPage(currentPage() + 1)"
            class="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:hover:bg-slate-900 font-bold cursor-pointer">
            <i class="pi pi-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Bulk Action Bar -->
      <div *ngIf="selectedProductIds().length > 0" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white rounded-2xl px-6 py-4 shadow-2xl z-50 flex items-center gap-6 animate-slide-up">
        <div class="text-xs font-bold">
          Đang chọn: <span class="text-amber-400 font-black text-sm">{{ selectedProductIds().length }}</span> sản phẩm
        </div>
        <div class="h-6 w-px bg-slate-800"></div>
        <div class="flex items-center gap-2">
          <!-- Bulk Active -->
          <button (click)="bulkUpdateActive(true)" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer">
            Hiện hàng loạt
          </button>
          
          <!-- Bulk Inactive -->
          <button (click)="bulkUpdateActive(false)" class="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-slate-700">
            Ẩn hàng loạt
          </button>

          <!-- Bulk Flash Sale -->
          <button (click)="bulkUpdateFlashSale()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1">
            ⚡ Flash Sale
          </button>
          
          <!-- Bulk Delete -->
          <button (click)="bulkDelete()" class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1">
            <i class="pi pi-trash"></i> Xóa hàng loạt
          </button>
        </div>
      </div>

      <!-- CSV Import Modal -->
      <div *ngIf="showImportModal()" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] text-slate-100">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 class="text-sm font-black text-white uppercase tracking-wider">Nhập sản phẩm từ file CSV</h3>
            <button (click)="closeImportModal()" class="text-slate-400 hover:text-white cursor-pointer">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Scrollable Body -->
          <div class="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
            <p class="leading-relaxed">
              Bạn có thể thêm nhanh hàng loạt sản phẩm bằng tệp CSV. Hệ thống hỗ trợ tự động nhận diện/tạo danh mục và thương hiệu nếu chưa tồn tại.
            </p>

            <!-- Instructions Card -->
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div class="flex items-center justify-between">
                <div class="font-bold text-slate-200">Định dạng file CSV chuẩn:</div>
                <a 
                  href="data:text/csv;charset=utf-8,Name%2CSKU%2CCategory%2CBrand%2COriginalPrice%2CPromotionPrice%2CStockQuantity%2CThumbnail%2CDescription%2CSpecsJson%2CSubImages%0ALaptop%20ASUS%20ROG%20Strix%2CROG-G16-001%2CLaptop%2CASUS%2C44990000%2C39990000%2C15%2Chttps%3A%2F%2Fimages.unsplash.com%2Fphoto-1603302576837-37561b2e2302%3Fw%3D500%2CLaptop%20gaming%20%C4%91%E1%BB%89nh%20cao%2C%22%7B%22%22CPU%22%22%3A%22%22i7%22%22%2C%22%22RAM%22%22%3A%22%2216GB%22%22%7D%22%2Chttps%3A%2F%2Fimages.unsplash.com%2Fphoto-1593642632823-8f785ba67e45%3Fw%3D500%3Bhttps%3A%2F%2Fimages.unsplash.com%2Fphoto-1588872657578-7efd1f1555ed%3Fw%3D500"
                  download="sample_products.csv"
                  class="text-red-400 hover:underline font-bold text-[11px] flex items-center gap-1">
                  <i class="pi pi-download"></i> Tải file mẫu (.csv)
                </a>
              </div>
              <code class="block bg-slate-950 text-slate-200 p-2.5 rounded-lg font-mono overflow-x-auto text-[10px] whitespace-nowrap border border-slate-800">
                Name,SKU,Category,Brand,OriginalPrice,PromotionPrice,StockQuantity,Thumbnail,Description,SpecsJson,SubImages
              </code>
              <ul class="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li><strong class="text-slate-300">SpecsJson</strong>: Định dạng JSON hợp lệ (ví dụ: <code class="bg-slate-950 text-amber-400 px-1 rounded border border-slate-800">&#123;"CPU":"i7"&#125;</code>)</li>
                <li><strong class="text-slate-300">SubImages</strong>: Các đường dẫn ngăn cách nhau bằng dấu chấm phẩy <code class="bg-slate-950 text-amber-400 px-1 rounded border border-slate-800">;</code></li>
              </ul>
            </div>

            <!-- File Chooser -->
            <div *ngIf="!selectedFile(); else fileSelectedView"
              (click)="fileInput.click()"
              class="border-2 border-dashed border-slate-800 hover:border-red-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950 hover:bg-slate-900 transition-all gap-2 relative">
              <input type="file" (change)="onFileSelected($event)" accept=".csv" class="hidden" #fileInput />
              <i class="pi pi-cloud-upload text-3xl text-slate-500"></i>
              <div class="font-bold text-white">Click để chọn file CSV...</div>
              <div class="text-[10px] text-slate-400">Hoặc kéo thả file vào đây</div>
            </div>

            <ng-template #fileSelectedView>
              <div class="border border-slate-800 rounded-xl p-4 flex items-center justify-between bg-slate-950 shadow-xs">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-lg font-black">
                    <i class="pi pi-file"></i>
                  </div>
                  <div>
                    <div class="font-bold text-white text-xs">{{ selectedFile()?.name }}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Kích thước: {{ (selectedFile()!.size / 1024) | number:'1.0-1' }} KB</div>
                  </div>
                </div>
                <button 
                  type="button"
                  (click)="removeSelectedFile()"
                  class="w-8 h-8 rounded-lg bg-slate-900 hover:bg-red-600/30 text-red-400 hover:text-white border border-slate-800 flex items-center justify-center transition-all cursor-pointer"
                  title="Hủy chọn file">
                  <i class="pi pi-trash text-xs"></i>
                </button>
              </div>
            </ng-template>

            <!-- Error Alert -->
            <div *ngIf="importErrorMessage()" class="bg-red-950/80 border border-red-500/40 text-red-400 rounded-xl p-3.5 font-medium leading-relaxed whitespace-pre-wrap flex gap-2">
              <i class="pi pi-exclamation-triangle text-base shrink-0 mt-0.5"></i>
              <span>{{ importErrorMessage() }}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-[#111827]">
            <button 
              (click)="closeImportModal()" 
              [disabled]="loadingImport()"
              class="px-4 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
              Hủy bỏ
            </button>
            <button 
              (click)="onStartImport()" 
              [disabled]="!selectedFile() || loadingImport()"
              class="px-5 py-2.5 rounded-xl font-bold text-white bg-[#E30019] hover:bg-red-700 transition-all cursor-pointer flex items-center gap-2">
              <i class="pi pi-spin pi-spinner" *ngIf="loadingImport()"></i>
              <span>{{ loadingImport() ? 'Đang nhập...' : 'Bắt đầu Nhập' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Spacer -->
      <div class="h-24" *ngIf="selectedProductIds().length > 0"></div>

      <!-- Single Product Delete Modal -->
      <div *ngIf="singleDeleteProduct()" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative p-6 space-y-4 text-slate-100">
          <div class="flex items-center gap-3 text-red-500">
            <div class="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center shrink-0">
              <i class="pi pi-exclamation-triangle text-xl"></i>
            </div>
            <div>
              <h3 class="text-sm font-black uppercase tracking-wider text-white">Xác nhận xóa sản phẩm</h3>
              <p class="text-[11px] text-slate-400">Hành động này không thể hoàn tác</p>
            </div>
          </div>

          <!-- Product Card Preview -->
          <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <img [src]="singleDeleteProduct()?.thumbnail" [alt]="singleDeleteProduct()?.name" class="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0" />
            <div class="min-w-0">
              <div class="text-xs font-bold text-white truncate">{{ singleDeleteProduct()?.name }}</div>
              <div class="text-[10px] font-mono text-slate-400">SKU: {{ singleDeleteProduct()?.sku || 'N/A' }}</div>
              <div class="text-xs font-black text-red-400 font-mono mt-0.5">{{ (singleDeleteProduct()?.promotionPrice || singleDeleteProduct()?.originalPrice) | number:'1.0-0' }}đ</div>
            </div>
          </div>

          <p class="text-xs text-slate-300 leading-relaxed font-medium">
            Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này? Các sản phẩm đã từng phát sinh đơn hàng sẽ tự động được giữ lại để bảo vệ lịch sử giao dịch.
          </p>

          <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button 
              (click)="singleDeleteProduct.set(null)"
              class="px-4 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer text-xs">
              Hủy bỏ
            </button>
            <button 
              (click)="confirmSingleDelete()"
              [disabled]="loadingDelete()"
              class="px-5 py-2.5 rounded-xl font-bold text-white bg-[#E30019] hover:bg-red-700 transition-all cursor-pointer text-xs flex items-center gap-2 shadow-lg shadow-red-600/30">
              <i class="pi pi-spin pi-spinner" *ngIf="loadingDelete()"></i>
              <span>{{ loadingDelete() ? 'Đang xóa...' : 'Xác nhận Xóa' }}</span>
            </button>
          </div>
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
              <h3 class="text-sm font-black uppercase tracking-wider text-white">Xác nhận xóa hàng loạt</h3>
              <p class="text-[11px] text-slate-400">Thao tác này sẽ áp dụng cho {{ selectedProductIds().length }} sản phẩm đã chọn</p>
            </div>
          </div>

          <p class="text-xs text-slate-300 leading-relaxed font-medium">
            Bạn có chắc chắn muốn xóa vĩnh viễn <strong class="text-white font-bold">{{ selectedProductIds().length }}</strong> sản phẩm đã chọn? Thao tác này không thể hoàn tác. Các sản phẩm đã bán sẽ tự động được giữ lại để bảo vệ lịch sử giao dịch.
          </p>

          <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button 
              (click)="showDeleteConfirmModal.set(false)"
              class="px-4 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer text-xs">
              Hủy bỏ
            </button>
            <button 
              (click)="confirmBulkDelete()"
              class="px-5 py-2.5 rounded-xl font-bold text-white bg-[#E30019] hover:bg-red-700 transition-all cursor-pointer text-xs shadow-lg shadow-red-600/30">
              Xác nhận Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminProductListComponent implements OnInit {
  rawProducts = signal<any[]>([]);
  currentPage = signal<number>(0);
  pageSize = 10;

  searchQuery = '';
  selectedCategoryId = signal<number | null>(null);
  selectedBrandId = signal<number | null>(null);
  selectedStatus = signal<string>('');

  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);

  selectedProductIds = signal<number[]>([]);
  
  // Single product delete modal state
  singleDeleteProduct = signal<any | null>(null);
  loadingDelete = signal<boolean>(false);

  toastMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  // CSV Import States
  showImportModal = signal(false);
  selectedFile = signal<File | null>(null);
  loadingImport = signal(false);
  importErrorMessage = signal<string | null>(null);

  // Custom Delete Confirm States
  showDeleteConfirmModal = signal(false);

  // Computed signal for instantaneous 0ms filtering
  filteredProducts = computed(() => {
    let list = this.rawProducts();
    const q = this.searchQuery ? this.searchQuery.trim().toLowerCase() : '';
    const catId = this.selectedCategoryId();
    const bId = this.selectedBrandId();
    const st = this.selectedStatus();

    return list.filter(p => {
      // Category filter
      if (catId) {
        if (!p.category || p.category.id !== catId) return false;
      }

      // Brand filter
      if (bId) {
        if (!p.brand || p.brand.id !== bId) return false;
      }

      // Status filter
      if (st) {
        if (st === 'active' && p.isActive === false) return false;
        if (st === 'inactive' && p.isActive !== false) return false;
        if (st === 'in_stock' && (p.stockQuantity || 0) <= 0) return false;
        if (st === 'out_of_stock' && (p.stockQuantity || 0) > 0) return false;
        if (st === 'flash_sale' && !p.isFlashSale) return false;
      }

      // Search query filter (matches Name, SKU, Brand name, Category name)
      if (q) {
        const nameMatch = p.name && p.name.toLowerCase().includes(q);
        const skuMatch = p.sku && p.sku.toLowerCase().includes(q);
        const brandMatch = p.brand && p.brand.name && p.brand.name.toLowerCase().includes(q);
        const catMatch = p.category && p.category.name && p.category.name.toLowerCase().includes(q);
        if (!nameMatch && !skuMatch && !brandMatch && !catMatch) return false;
      }

      return true;
    });
  });

  // Computed total elements & total pages
  totalElements = computed(() => this.filteredProducts().length);
  totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.pageSize));

  // Computed page slice for current page
  paginatedProducts = computed(() => {
    const list = this.filteredProducts();
    const start = this.currentPage() * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  constructor(
    private adminService: AdminService,
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check Toast query params
    this.route.queryParams.subscribe(params => {
      if (params['success'] === 'created') {
        this.showToast('Thêm sản phẩm mới thành công!');
      } else if (params['success'] === 'updated') {
        this.showToast('Cập nhật thông tin sản phẩm thành công!');
      }
    });

    // Load metadata
    this.productService.getCategories().subscribe(res => this.categories.set(res));
    this.productService.getBrands().subscribe(res => this.brands.set(res));
    
    this.loadProducts();
  }

  showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  loadProducts(): void {
    // Fetch all products (up to 500) for client-side instant filtering
    this.adminService.getAllProducts(0, 500).subscribe({
      next: (res) => {
        let items: any[] = [];
        if (Array.isArray(res)) {
          items = res;
        } else if (res && Array.isArray(res.content)) {
          items = res.content;
        }
        this.rawProducts.set(items);
        this.selectedProductIds.set([]);
      },
      error: (err) => {
        console.error('Error loading admin products:', err);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(0);
  }

  onCategoryFilterChange(val: any): void {
    const num = (val === null || val === 'null' || val === '' || val === undefined) ? null : Number(val);
    this.selectedCategoryId.set(isNaN(num as number) ? null : num);
    this.currentPage.set(0);
  }

  onBrandFilterChange(val: any): void {
    const num = (val === null || val === 'null' || val === '' || val === undefined) ? null : Number(val);
    this.selectedBrandId.set(isNaN(num as number) ? null : num);
    this.currentPage.set(0);
  }

  onSearchInput(): void {
    this.currentPage.set(0);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  getPagesArray(): number[] {
    const total = this.totalPages();
    const arr = [];
    for (let i = 0; i < total; i++) {
      arr.push(i);
    }
    return arr;
  }

  // Toggle Switch for Product Active status
  toggleProductActive(p: any): void {
    const newStatus = !(p.isActive !== false);
    // Optimistic UI update
    p.isActive = newStatus;
    const statusText = newStatus ? 'Đang bán' : 'Đang ẩn';
    
    this.adminService.bulkUpdateProducts({
      ids: [p.id],
      isActive: newStatus
    }).subscribe({
      next: () => {
        this.showToast(`Đã chuyển sản phẩm "${p.name}" sang ${statusText}!`);
      },
      error: () => {
        // Fallback to single toggle endpoint
        this.adminService.toggleActiveProduct(p.id).subscribe({
          next: () => {
            this.showToast(`Đã chuyển sản phẩm "${p.name}" sang ${statusText}!`);
          },
          error: (err) => {
            console.error('Lỗi khi cập nhật trạng thái:', err);
            p.isActive = !newStatus;
            this.showToast('Lỗi khi đổi trạng thái sản phẩm!', 'error');
          }
        });
      }
    });
  }

  // Checkbox functions
  isSelected(id: number): boolean {
    return this.selectedProductIds().includes(id);
  }

  toggleSelection(id: number): void {
    const current = this.selectedProductIds();
    if (current.includes(id)) {
      this.selectedProductIds.set(current.filter(x => x !== id));
    } else {
      this.selectedProductIds.set([...current, id]);
    }
  }

  isAllSelected(): boolean {
    const list = this.paginatedProducts();
    if (list.length === 0) return false;
    return list.every(p => this.selectedProductIds().includes(p.id));
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      const currentIds = this.paginatedProducts().map(p => p.id);
      this.selectedProductIds.set(this.selectedProductIds().filter(id => !currentIds.includes(id)));
    } else {
      const currentIds = this.paginatedProducts().map(p => p.id);
      const merged = Array.from(new Set([...this.selectedProductIds(), ...currentIds]));
      this.selectedProductIds.set(merged);
    }
  }

  // Open Single Delete Modal
  openSingleDeleteModal(p: any): void {
    this.singleDeleteProduct.set(p);
  }

  confirmSingleDelete(): void {
    const p = this.singleDeleteProduct();
    if (!p) return;

    this.loadingDelete.set(true);

    this.adminService.deleteProduct(p.id).subscribe({
      next: () => {
        this.loadingDelete.set(false);
        this.singleDeleteProduct.set(null);
        this.showToast(`Đã xóa sản phẩm "${p.name}" thành công!`);
        this.loadProducts();
      },
      error: (err) => {
        this.loadingDelete.set(false);
        this.singleDeleteProduct.set(null);
        let errMsg = 'Không thể xóa sản phẩm này vì đã phát sinh đơn hàng!';
        if (err.error) {
          if (typeof err.error === 'string') {
            errMsg = err.error;
          } else if (err.error.message) {
            errMsg = err.error.message;
          }
        }
        this.showToast(errMsg, 'error');
      }
    });
  }

  // Bulk operations
  bulkUpdateActive(isActive: boolean): void {
    const ids = this.selectedProductIds();
    if (confirm(`Bạn muốn ${isActive ? 'hiện' : 'ẩn'} ${ids.length} sản phẩm đã chọn?`)) {
      this.adminService.bulkUpdateProducts({ ids, isActive }).subscribe({
        next: () => {
          this.showToast(`Đã ${isActive ? 'hiện' : 'ẩn'} ${ids.length} sản phẩm thành công!`);
          this.loadProducts();
        },
        error: () => this.showToast('Lỗi khi cập nhật trạng thái hàng loạt!', 'error')
      });
    }
  }

  bulkUpdateFlashSale(): void {
    const ids = this.selectedProductIds();
    const hours = prompt("Hẹn giờ Flash Sale kết thúc sau bao nhiêu giờ (VD: 24)?", "24");
    if (!hours) return;
    const hoursNum = parseInt(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      alert("Số giờ không hợp lệ!");
      return;
    }
    
    const targetDate = new Date(Date.now() + hoursNum * 3600 * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const isoString = `${targetDate.getFullYear()}-${pad(targetDate.getMonth()+1)}-${pad(targetDate.getDate())}T${pad(targetDate.getHours())}:${pad(targetDate.getMinutes())}:${pad(targetDate.getSeconds())}`;

    this.adminService.bulkUpdateProducts({
      ids,
      isFlashSale: true,
      flashSaleEndTime: isoString
    }).subscribe({
      next: () => {
        this.showToast(`Đã cài đặt Flash Sale cho ${ids.length} sản phẩm!`);
        this.loadProducts();
      },
      error: () => this.showToast('Lỗi khi kích hoạt Flash Sale hàng loạt!', 'error')
    });
  }

  bulkDelete(): void {
    this.showDeleteConfirmModal.set(true);
  }

  confirmBulkDelete(): void {
    const ids = this.selectedProductIds();
    this.showDeleteConfirmModal.set(false);
    
    this.adminService.bulkDeleteProducts(ids).subscribe({
      next: (res: any) => {
        if (res && res.skippedCount > 0) {
          this.showToast(`Đã xóa ${res.deletedCount} SP. Bỏ qua ${res.skippedCount} SP đã có trong đơn hàng của khách!`, 'error');
        } else {
          this.showToast(`Đã xóa vĩnh viễn cả ${res.deletedCount} sản phẩm!`);
        }
        this.loadProducts();
      },
      error: (err) => {
        let errMsg = 'Lỗi khi xóa hàng loạt!';
        if (err.error) {
          if (typeof err.error === 'string') {
            errMsg = err.error;
          } else if (err.error.message) {
            errMsg = err.error.message;
          }
        }
        this.showToast(errMsg, 'error');
      }
    });
  }

  // CSV Import Handlers
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        this.importErrorMessage.set('Chỉ chấp nhận tệp tin định dạng CSV (.csv)');
        this.selectedFile.set(null);
        return;
      }
      this.selectedFile.set(file);
      this.importErrorMessage.set(null);
    }
  }

  closeImportModal(): void {
    this.showImportModal.set(false);
    this.selectedFile.set(null);
    this.importErrorMessage.set(null);
    this.loadingImport.set(false);
  }

  onStartImport(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.loadingImport.set(true);
    this.importErrorMessage.set(null);

    this.adminService.importProducts(file).subscribe({
      next: (count) => {
        this.showToast(`Nhập thành công hàng loạt ${count} sản phẩm vào TechZone!`);
        this.closeImportModal();
        this.loadProducts();
      },
      error: (err) => {
        this.loadingImport.set(false);
        console.error('Lỗi nhập CSV:', err);
        const errMsg = err.error || 'Đã xảy ra lỗi không xác định khi nhập CSV!';
        this.importErrorMessage.set(errMsg);
      }
    });
  }

  removeSelectedFile(): void {
    this.selectedFile.set(null);
    this.importErrorMessage.set(null);
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

import { AdminHeaderComponent } from '../../../components/admin-header/admin-header.component';

@Component({
  selector: 'app-admin-flash-sale',
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
        title="Quản Lý Chiến Dịch Flash Sale"
        subtitle="Cấu hình thời gian đếm ngược Countdown Timer & danh sách sản phẩm giá sốc ngoài Trang chủ"
        icon="pi pi-bolt"
        badge="Flash Deals"
        [breadcrumbs]="[{ label: 'Homepage Builder', url: '/admin/homepage-builder' }, { label: 'Flash Sale' }]">
        
        <button 
          (click)="openModal()"
          class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer">
          <i class="pi pi-bolt"></i>
          <span>Tạo Chiến Dịch Mới</span>
        </button>
      </app-admin-header>

      <!-- Campaign List -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 text-[11px]">
              <tr>
                <th class="p-4">Tên Chiến Dịch</th>
                <th class="p-4">Thời Gian Bắt Đầu & Kết Thúc</th>
                <th class="p-4 text-center">Số Sản Phẩm</th>
                <th class="p-4 text-center">Trạng Thái</th>
                <th class="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-semibold text-slate-200">
              <tr *ngFor="let c of campaigns()" class="hover:bg-slate-800/40 transition-colors">
                <td class="p-4">
                  <div class="font-bold text-white text-sm flex items-center gap-2">
                    <span class="text-amber-400">⚡</span>
                    <span>{{ c.title }}</span>
                  </div>
                </td>

                <td class="p-4 font-mono text-slate-400">
                  <div>TỪ: <span class="font-bold text-slate-200">{{ c.startTime | date:'dd/MM/yyyy HH:mm' }}</span></div>
                  <div>ĐẾN: <span class="font-bold text-red-400">{{ c.endTime | date:'dd/MM/yyyy HH:mm' }}</span></div>
                </td>

                <td class="p-4 text-center">
                  <span class="bg-red-950/80 text-red-400 font-bold border border-red-500/40 px-3 py-1 rounded-xl">
                    {{ c.items?.length || 0 }} SP
                  </span>
                </td>

                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button 
                      type="button" 
                      (click)="toggleActive(c)"
                      [class.bg-emerald-600]="c.isActive !== false"
                      [class.bg-slate-700]="c.isActive === false"
                      class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                      <span 
                        [class.translate-x-4]="c.isActive !== false"
                        [class.translate-x-0]="c.isActive === false"
                        class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                    <span class="text-xs font-bold" [class.text-emerald-400]="c.isActive !== false" [class.text-slate-500]="c.isActive === false">
                      {{ c.isActive !== false ? 'Kích hoạt' : 'Tạm dừng' }}
                    </span>
                  </div>
                </td>

                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button 
                      (click)="openModal(c)"
                      class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-blue-600/30 hover:border-blue-500 text-blue-400 border border-slate-700 flex items-center justify-center transition-all cursor-pointer">
                      <i class="pi pi-pencil text-xs"></i>
                    </button>
                    <button 
                      (click)="deleteCampaign(c)"
                      class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-red-600/30 hover:border-red-500 text-red-400 border border-slate-700 flex items-center justify-center transition-all cursor-pointer">
                      <i class="pi pi-trash text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="campaigns().length === 0">
                <td colspan="5" class="p-8 text-center text-slate-500">Chưa có chiến dịch Flash Sale nào. Bấm "Tạo Chiến Dịch Mới" ở trên.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Campaign Modal -->
      <div *ngIf="showModal()" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative flex flex-col text-slate-100 max-h-[85vh]">
          
          <!-- Modal Header (Fixed Top) -->
          <div class="p-5 border-b border-slate-800 bg-[#111827] shrink-0 flex items-center justify-between">
            <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span class="text-amber-400 text-base">⚡</span>
              <span>{{ editingCampaignId() ? 'Chỉnh Sửa Chiến Dịch Flash Sale' : 'Tạo Chiến Dịch Flash Sale Mới' }}</span>
            </h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center transition-colors cursor-pointer border border-slate-800">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Modal Scrollable Content (Single Scrollbar) -->
          <form (ngSubmit)="saveCampaign()" class="p-5 space-y-5 text-xs overflow-y-auto custom-scrollbar flex-1">
            <!-- Title -->
            <div>
              <label class="block font-bold uppercase text-slate-400 mb-1 text-xs">Tên Chiến Dịch *</label>
              <input 
                type="text" 
                [(ngModel)]="formData.title" 
                name="title" 
                required 
                placeholder="VD: Flash Sale Siêu Bão Cuối Tuần..." 
                class="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-red-500" />
            </div>

            <!-- Start Time & End Time -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold uppercase text-slate-400 mb-1 text-xs">Thời Gian Bắt Đầu *</label>
                <input 
                  type="datetime-local" 
                  [(ngModel)]="formData.startTime" 
                  name="startTime" 
                  required 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono [color-scheme:dark]" />
              </div>

              <div>
                <label class="block font-bold uppercase text-slate-400 mb-1 text-xs">Thời Gian Kết Thúc *</label>
                <input 
                  type="datetime-local" 
                  [(ngModel)]="formData.endTime" 
                  name="endTime" 
                  required 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono [color-scheme:dark]" />
              </div>
            </div>

            <!-- Flash Sale Items Section -->
            <div class="space-y-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <label class="block font-black uppercase text-xs text-white tracking-wider">Danh Sách Sản Phẩm Giá Sốc</label>
                  <span class="text-[11px] text-slate-400 font-medium">Đã chọn: <strong class="text-red-400 font-mono">{{ selectedItems().length }}</strong> sản phẩm</span>
                </div>
                <button 
                  type="button" 
                  (click)="openProductSelector()" 
                  class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/30 transition-all border border-red-500/40">
                  <i class="pi pi-plus"></i> Chọn sản phẩm từ Kho
                </button>
              </div>

              <!-- Selected Items Container (No inner scrollbar to prevent double scrollbars) -->
              <div class="space-y-3 pt-1">
                <div *ngFor="let item of selectedItems(); let idx = index" class="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-md hover:border-slate-700 transition-all">
                  <!-- Header Row: Image, Name, Original Price & Remove Button -->
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        <img [src]="item.thumbnail" [alt]="item.name" class="max-h-full max-w-full object-contain" />
                      </div>
                      <div class="min-w-0">
                        <div class="font-bold text-white text-xs truncate" [title]="item.name">{{ item.name }}</div>
                        <div class="flex items-center gap-2 mt-0.5">
                          <span class="text-[10px] text-slate-400">Giá niêm yết: <strong class="font-mono text-slate-300">{{ item.originalPrice | number:'1.0-0' }}đ</strong></span>
                          <span *ngIf="item.flashSalePrice && item.originalPrice > item.flashSalePrice" class="text-[9px] font-black text-red-400 bg-red-950/80 border border-red-500/40 px-1.5 py-0.2 rounded font-mono">
                            -{{ getDiscountPercent(item.originalPrice, item.flashSalePrice) }}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      (click)="removeItem(idx)" 
                      class="text-slate-500 hover:text-red-400 w-8 h-8 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0" 
                      title="Xóa sản phẩm khỏi chiến dịch">
                      <i class="pi pi-trash text-xs"></i>
                    </button>
                  </div>

                  <!-- Config Inputs Grid: Flash Sale Price & Quantity Limit -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                    <!-- 1. Giá Flash Sale Input (With Spinners Hidden & pr-14 Padding) -->
                    <div>
                      <label class="block text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1 flex items-center justify-between">
                        <span>🔥 Giá Flash Sale (VNĐ) *</span>
                        <span *ngIf="item.flashSalePrice" class="text-[9px] text-slate-400 font-mono font-normal">
                          {{ item.flashSalePrice | number:'1.0-0' }}đ
                        </span>
                      </label>
                      <div class="relative">
                        <input 
                          type="number" 
                          [(ngModel)]="item.flashSalePrice" 
                          [name]="'fs_price_' + idx" 
                          required
                          placeholder="VD: 34990000" 
                          class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-14 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-red-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold font-mono text-slate-400 pointer-events-none select-none">VND</span>
                      </div>
                    </div>

                    <!-- 2. Số lượng suất bán Input (With Spinners Hidden & pr-12 Padding) -->
                    <div>
                      <label class="block text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center justify-between">
                        <span>⚡ Số Lượng Suất Bán *</span>
                        <span class="text-[9px] text-slate-400 font-mono font-normal">Giới hạn suất</span>
                      </label>
                      <div class="relative">
                        <input 
                          type="number" 
                          [(ngModel)]="item.quantityLimit" 
                          [name]="'fs_limit_' + idx" 
                          required
                          min="1"
                          placeholder="VD: 10" 
                          class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-12 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-red-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold font-mono text-slate-400 pointer-events-none select-none">Suất</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Rich Empty State -->
                <div *ngIf="selectedItems().length === 0" class="text-center py-8 px-4 text-slate-400 bg-slate-950/60 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-2.5">
                  <div class="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-2xl shadow-inner">
                    <i class="pi pi-box"></i>
                  </div>
                  <div class="space-y-0.5">
                    <p class="text-xs font-bold text-slate-300">Chưa chọn sản phẩm nào cho chiến dịch Flash Sale này</p>
                    <p class="text-[11px] text-slate-500">Bấm nút bên dưới để chọn các sản phẩm giảm giá sốc từ kho hàng</p>
                  </div>
                  <button 
                    type="button" 
                    (click)="openProductSelector()" 
                    class="mt-1 bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-600/30">
                    <i class="pi pi-plus text-xs"></i> Chọn sản phẩm ngay
                  </button>
                </div>
              </div>
            </div>

            <!-- Submit Button Inside Form (Will be displayed cleanly) -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button type="button" (click)="closeModal()" class="px-4 py-2 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">Hủy</button>
              <button 
                type="submit" 
                [disabled]="loadingSave()"
                class="px-5 py-2.5 rounded-xl font-bold text-white bg-[#E30019] hover:bg-red-700 shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all">
                <i class="pi pi-spin pi-spinner" *ngIf="loadingSave()"></i>
                <span>Lưu Chiến Dịch</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Product Selector Sub-Modal -->
      <div *ngIf="showProductSelector()" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative flex flex-col text-slate-100 max-h-[85vh]">
          
          <!-- Header (Fixed Top) -->
          <div class="p-5 border-b border-slate-800 bg-[#111827] shrink-0 flex items-center justify-between">
            <div>
              <h4 class="text-xs font-black uppercase tracking-wider text-white">Chọn Sản Phẩm Vào Flash Sale</h4>
              <p class="text-[11px] text-slate-400 mt-0.5">Bấm nút chọn để thêm/bỏ sản phẩm trong chiến dịch</p>
            </div>
            <button (click)="showProductSelector.set(false)" class="text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center transition-colors cursor-pointer border border-slate-800">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Search Bar (High-Contrast Placeholder) -->
          <div class="p-4 border-b border-slate-800/60 bg-slate-900/50 shrink-0">
            <div class="relative">
              <input 
                type="text" 
                [(ngModel)]="searchProductQuery" 
                placeholder="Tìm kiếm sản phẩm theo tên, mã linh kiện..."
                class="w-full bg-slate-950 border border-slate-700 text-white placeholder-slate-400 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-red-500 transition-all" />
              <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            </div>
          </div>

          <!-- Product List (Single Scrollbar) -->
          <div class="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2.5">
            <div 
              *ngFor="let p of availableProducts()" 
              (click)="toggleProductSelection(p, $event)"
              class="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-3 cursor-pointer transition-all shadow-2xs">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                  <img [src]="p.thumbnail" [alt]="p.name" class="max-h-full max-w-full object-contain" />
                </div>
                <div class="min-w-0">
                  <div class="font-bold text-white text-xs truncate" [title]="p.name">{{ p.name }}</div>
                  <div class="text-[11px] font-mono font-bold text-red-400 mt-0.5">
                    {{ (p.promotionPrice || p.originalPrice) | number:'1.0-0' }}đ
                    <span *ngIf="p.promotionPrice && p.originalPrice > p.promotionPrice" class="text-[10px] text-slate-500 line-through ml-1 font-normal">
                      {{ p.originalPrice | number:'1.0-0' }}đ
                    </span>
                  </div>
                </div>
              </div>

              <!-- Selection Button (High-Contrast Red, whitespace-nowrap, Dynamic Feedback State) -->
              <button 
                type="button"
                (click)="toggleProductSelection(p, $event)"
                [ngClass]="isProductSelected(p.id) 
                  ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/50 hover:bg-red-950/90 hover:text-red-400 hover:border-red-500/50' 
                  : 'bg-[#E30019] hover:bg-red-700 text-white shadow-md shadow-red-600/30 border-red-500/40'"
                class="text-xs font-bold border px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer">
                <i [class]="isProductSelected(p.id) ? 'pi pi-check-circle' : 'pi pi-plus'"></i>
                <span>{{ isProductSelected(p.id) ? 'Đã chọn' : 'Chọn' }}</span>
              </button>
            </div>

            <div *ngIf="availableProducts().length === 0" class="text-center py-8 text-slate-500">
              Không tìm thấy sản phẩm nào khớp với "{{ searchProductQuery }}".
            </div>
          </div>

          <!-- Sub-Modal Footer -->
          <div class="p-4 border-t border-slate-800 bg-slate-900 shrink-0 flex items-center justify-between text-xs">
            <span class="text-slate-400 font-bold">Đã chọn: <strong class="text-red-400 font-mono text-sm">{{ selectedItems().length }}</strong> sản phẩm</span>
            <button 
              type="button" 
              (click)="showProductSelector.set(false)" 
              class="bg-[#E30019] hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-red-600/30">
              Xác Nhận ({{ selectedItems().length }})
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminFlashSaleComponent implements OnInit {
  campaigns = signal<any[]>([]);
  allProducts = signal<any[]>([]);

  showModal = signal(false);
  editingCampaignId = signal<number | null>(null);
  showProductSelector = signal(false);
  searchProductQuery = '';

  selectedItems = signal<any[]>([]);
  loadingSave = signal(false);
  toastMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  formData: any = {
    title: '',
    startTime: '',
    endTime: '',
    isActive: true
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCampaigns();
    this.adminService.getAllProducts(0, 500).subscribe(res => {
      this.allProducts.set(Array.isArray(res) ? res : (res?.content || []));
    });
  }

  availableProducts(): any[] {
    const q = this.searchProductQuery.toLowerCase().trim();
    return this.allProducts().filter(p => !q || p.name?.toLowerCase().includes(q));
  }

  getDiscountPercent(originalPrice: number, flashPrice: number): number {
    if (!originalPrice || !flashPrice || originalPrice <= flashPrice) return 0;
    return Math.round(((originalPrice - flashPrice) / originalPrice) * 100);
  }

  showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  loadCampaigns(): void {
    this.adminService.getAllFlashSaleCampaigns().subscribe({
      next: (res) => this.campaigns.set(res),
      error: () => this.showToast('Lỗi khi tải danh sách chiến dịch Flash Sale!', 'error')
    });
  }

  openModal(campaign?: any): void {
    if (campaign) {
      this.editingCampaignId.set(campaign.id);
      this.formData = {
        title: campaign.title,
        startTime: campaign.startTime ? campaign.startTime.substring(0, 16) : '',
        endTime: campaign.endTime ? campaign.endTime.substring(0, 16) : '',
        isActive: campaign.isActive !== false
      };
      const items = (campaign.items || []).map((it: any) => ({
        productId: it.product?.id,
        name: it.product?.name,
        thumbnail: it.product?.thumbnail,
        originalPrice: it.product?.originalPrice,
        flashSalePrice: it.flashSalePrice,
        quantityLimit: it.quantityLimit || 10
      }));
      this.selectedItems.set(items);
    } else {
      this.editingCampaignId.set(null);
      this.formData = {
        title: '',
        startTime: '',
        endTime: '',
        isActive: true
      };
      this.selectedItems.set([]);
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  openProductSelector(): void {
    this.showProductSelector.set(true);
  }

  isProductSelected(productId: number): boolean {
    return this.selectedItems().some(it => it.productId === productId);
  }

  toggleProductSelection(p: any, event?: Event): void {
    if (event) event.stopPropagation();
    const list = [...this.selectedItems()];
    const index = list.findIndex(it => it.productId === p.id);
    
    if (index >= 0) {
      list.splice(index, 1);
      this.selectedItems.set(list);
    } else {
      const flashPrice = p.promotionPrice ? Math.round(p.promotionPrice * 0.9) : Math.round(p.originalPrice * 0.8);
      list.push({
        productId: p.id,
        name: p.name,
        thumbnail: p.thumbnail,
        originalPrice: p.originalPrice,
        flashSalePrice: flashPrice,
        quantityLimit: 10
      });
      this.selectedItems.set(list);
    }
  }

  selectProduct(p: any): void {
    this.toggleProductSelection(p);
  }

  removeItem(idx: number): void {
    this.selectedItems.set(this.selectedItems().filter((_, i) => i !== idx));
  }

  toggleActive(campaign: any): void {
    campaign.isActive = !campaign.isActive;
    this.adminService.toggleFlashSaleActive(campaign.id).subscribe({
      next: () => this.showToast(`Đã ${campaign.isActive ? 'kích hoạt' : 'tạm dừng'} chiến dịch Flash Sale!`),
      error: () => {
        campaign.isActive = !campaign.isActive;
        this.showToast('Lỗi khi đổi trạng thái!', 'error');
      }
    });
  }

  saveCampaign(): void {
    if (!this.formData.title || !this.formData.startTime || !this.formData.endTime) {
      alert('Vui lòng điền tiêu đề và thời gian chiến dịch!');
      return;
    }

    this.loadingSave.set(true);

    const pad = (v: string) => v.length === 16 ? v + ':00' : v;

    const payload = {
      title: this.formData.title,
      startTime: pad(this.formData.startTime),
      endTime: pad(this.formData.endTime),
      isActive: this.formData.isActive,
      items: this.selectedItems().map(it => ({
        productId: it.productId,
        flashSalePrice: Number(it.flashSalePrice),
        quantityLimit: Number(it.quantityLimit)
      }))
    };

    const id = this.editingCampaignId();
    if (id) {
      this.adminService.updateFlashSaleCampaign(id, payload).subscribe({
        next: () => {
          this.loadingSave.set(false);
          this.closeModal();
          this.showToast('Cập nhật chiến dịch Flash Sale thành công!');
          this.loadCampaigns();
        },
        error: () => {
          this.loadingSave.set(false);
          this.showToast('Lỗi khi cập nhật chiến dịch Flash Sale!', 'error');
        }
      });
    } else {
      this.adminService.createFlashSaleCampaign(payload).subscribe({
        next: () => {
          this.loadingSave.set(false);
          this.closeModal();
          this.showToast('Tạo chiến dịch Flash Sale mới thành công!');
          this.loadCampaigns();
        },
        error: () => {
          this.loadingSave.set(false);
          this.showToast('Lỗi khi tạo chiến dịch Flash Sale!', 'error');
        }
      });
    }
  }

  deleteCampaign(c: any): void {
    if (confirm(`Bạn có chắc muốn xóa chiến dịch "${c.title}"?`)) {
      this.adminService.deleteFlashSaleCampaign(c.id).subscribe({
        next: () => {
          this.showToast(`Đã xóa chiến dịch "${c.title}"!`);
          this.loadCampaigns();
        },
        error: () => this.showToast('Lỗi khi xóa chiến dịch Flash Sale!', 'error')
      });
    }
  }
}

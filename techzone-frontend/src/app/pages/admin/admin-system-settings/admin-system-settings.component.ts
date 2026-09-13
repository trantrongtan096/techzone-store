import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-system-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule],
  template: `
    <!-- Toast Notification -->
    <div *ngIf="toastMessage()" 
      [class.bg-emerald-600]="toastMessage()?.type === 'success'" 
      [class.bg-red-600]="toastMessage()?.type === 'error'" 
      class="fixed top-6 left-1/2 -translate-x-1/2 text-white px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-fade-in border border-white/20 backdrop-blur-md pointer-events-none">
      <i [class]="toastMessage()?.type === 'success' ? 'pi pi-check-circle text-xl' : 'pi pi-exclamation-triangle text-xl'"></i>
      <span class="text-xs font-bold">{{ toastMessage()?.text }}</span>
    </div>

    <div class="space-y-5 animate-fade-in text-slate-100">
      <!-- Title & Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 class="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span>⚙️ Cấu Hình Hệ Thống & Showrooms</span>
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">Quản lý danh sách Chi nhánh Showroom, Hotline tổng đài & Trang tĩnh CMS</p>
        </div>
      </div>

      <!-- STANDARDIZED DARK MODE NAVIGATION TABS -->
      <div class="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button 
          (click)="activeTab.set('SHOWROOMS')"
          [ngClass]="{
            'bg-[#E30019] text-white font-black shadow-lg border-red-500': activeTab() === 'SHOWROOMS',
            'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800': activeTab() !== 'SHOWROOMS'
          }"
          class="px-4 py-2.5 rounded-xl text-xs transition-all border flex items-center gap-2 whitespace-nowrap cursor-pointer">
          <i class="pi pi-building text-white"></i>
          <span>🏢 Chi Nhánh Showroom ({{ showrooms().length }})</span>
        </button>

        <button 
          (click)="activeTab.set('CONTACT')"
          [ngClass]="{
            'bg-[#E30019] text-white font-black shadow-lg border-red-500': activeTab() === 'CONTACT',
            'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800': activeTab() !== 'CONTACT'
          }"
          class="px-4 py-2.5 rounded-xl text-xs transition-all border flex items-center gap-2 whitespace-nowrap cursor-pointer">
          <i class="pi pi-phone text-white"></i>
          <span>📞 Hotline & Mạng Xã Hội</span>
        </button>

        <button 
          (click)="activeTab.set('CMS')"
          [ngClass]="{
            'bg-[#E30019] text-white font-black shadow-lg border-red-500': activeTab() === 'CMS',
            'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800': activeTab() !== 'CMS'
          }"
          class="px-4 py-2.5 rounded-xl text-xs transition-all border flex items-center gap-2 whitespace-nowrap cursor-pointer">
          <i class="pi pi-file-edit text-white"></i>
          <span>📄 Trang Tĩnh CMS (Bảo Hành & Trả Góp)</span>
        </button>
      </div>

      <!-- TAB 1: SHOWROOMS -->
      <div *ngIf="activeTab() === 'SHOWROOMS'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-black text-white uppercase tracking-wider">Danh Sách Chi Nhánh Cửa Hàng</h3>
          <button 
            (click)="openShowroomModal()"
            class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg">
            <i class="pi pi-plus text-xs"></i> Thêm Chi Nhánh Mới
          </button>
        </div>

        <div class="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <th class="p-4">Tên Chi Nhánh</th>
                <th class="p-4">Địa Chỉ</th>
                <th class="p-4">Số Điện Thoại</th>
                <th class="p-4 text-center">Trạng Thái</th>
                <th class="p-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-200 font-semibold">
              <tr *ngFor="let s of showrooms()" class="hover:bg-slate-800/40 transition-colors">
                <td class="p-4 font-bold text-white">{{ s.name }}</td>
                <td class="p-4 text-slate-300">{{ s.address }}</td>
                <td class="p-4 font-mono font-bold text-amber-400">{{ s.phone || 'N/A' }}</td>
                <td class="p-4 text-center">
                  <span 
                    [ngClass]="{
                      'bg-emerald-950 text-emerald-400 border-emerald-500/50': s.isActive !== false,
                      'bg-red-950 text-red-400 border-red-500/50': s.isActive === false
                    }"
                    class="px-3 py-1 rounded-xl font-bold border text-[11px]">
                    {{ s.isActive !== false ? '🟢 Hoạt động' : '🔴 Tạm đóng' }}
                  </span>
                </td>
                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button (click)="openShowroomModal(s)" class="w-8 h-8 rounded-xl bg-slate-800 text-amber-400 hover:bg-slate-700 flex items-center justify-center border border-slate-700 cursor-pointer">
                      <i class="pi pi-pencil text-xs"></i>
                    </button>
                    <button (click)="deleteShowroom(s)" class="w-8 h-8 rounded-xl bg-red-950 text-red-400 hover:bg-red-900 flex items-center justify-center border border-red-800 cursor-pointer">
                      <i class="pi pi-trash text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: HOTLINE & SOCIAL LINKS -->
      <div *ngIf="activeTab() === 'CONTACT'" class="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <h3 class="text-sm font-black text-white uppercase tracking-wider">Thông Tin Hotline & Mạng Xã Hội Hệ Thống</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div>
            <label class="block font-bold uppercase text-slate-400 mb-1">Hotline Tổng Đài</label>
            <input type="text" [(ngModel)]="settings['HOTLINE']" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono font-bold text-red-500 focus:outline-none focus:border-red-500" />
          </div>

          <div>
            <label class="block font-bold uppercase text-slate-400 mb-1">Giờ Mở Cửa Hệ Thống</label>
            <input type="text" [(ngModel)]="settings['WORKING_HOURS']" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500" />
          </div>

          <div>
            <label class="block font-bold uppercase text-slate-400 mb-1">Email Hỗ Trợ CSKH</label>
            <input type="text" [(ngModel)]="settings['EMAIL_SUPPORT']" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-white focus:outline-none focus:border-red-500" />
          </div>

          <div>
            <label class="block font-bold uppercase text-slate-400 mb-1">Link Fanpage Facebook</label>
            <input type="text" [(ngModel)]="settings['FACEBOOK_URL']" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-blue-400 focus:outline-none focus:border-red-500" />
          </div>

          <div>
            <label class="block font-bold uppercase text-slate-400 mb-1">Link Kênh Youtube</label>
            <input type="text" [(ngModel)]="settings['YOUTUBE_URL']" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-red-400 focus:outline-none focus:border-red-500" />
          </div>

          <div>
            <label class="block font-bold uppercase text-slate-400 mb-1">Link TikTok Shop</label>
            <input type="text" [(ngModel)]="settings['TIKTOK_URL']" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-white focus:outline-none focus:border-red-500" />
          </div>
        </div>

        <div class="flex justify-end border-t border-slate-800 pt-4">
          <button (click)="saveSettings()" class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg cursor-pointer">
            Lưu Thay Đổi Thông Tin
          </button>
        </div>
      </div>

      <!-- TAB 3: CMS POLICY PAGES -->
      <div *ngIf="activeTab() === 'CMS'" class="space-y-6">
        <!-- Warranty Policy -->
        <div class="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <h3 class="text-sm font-black text-white uppercase tracking-wider">📄 Trang "Chính Sách Bảo Hành TechZone"</h3>
          <p-editor [(ngModel)]="settings['WARRANTY_POLICY_HTML']" [style]="{height:'200px'}"></p-editor>
        </div>

        <!-- Installment Guide -->
        <div class="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <h3 class="text-sm font-black text-white uppercase tracking-wider">📄 Trang "Hướng Dẫn Mua Hàng Trả Góp 0%"</h3>
          <p-editor [(ngModel)]="settings['INSTALLMENT_GUIDE_HTML']" [style]="{height:'200px'}"></p-editor>
        </div>

        <div class="flex justify-end">
          <button (click)="saveSettings()" class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg cursor-pointer">
            Lưu Nội Dung Các Trang CMS
          </button>
        </div>
      </div>

      <!-- Showroom Modal -->
      <div *ngIf="showShowroomModal()" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 text-slate-100">
          <h3 class="text-sm font-black text-white uppercase border-b border-slate-800 pb-3">
            {{ editingShowroomId() ? 'Chỉnh Sửa Showroom' : 'Thêm Showroom Mới' }}
          </h3>

          <form (ngSubmit)="saveShowroom()" class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-400 mb-1 uppercase">Tên Chi Nhánh *</label>
              <input type="text" [(ngModel)]="showroomForm.name" name="name" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-red-500" />
            </div>

            <div>
              <label class="block font-bold text-slate-400 mb-1 uppercase">Địa Chỉ *</label>
              <input type="text" [(ngModel)]="showroomForm.address" name="address" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500" />
            </div>

            <div>
              <label class="block font-bold text-slate-400 mb-1 uppercase">Số Điện Thoại</label>
              <input type="text" [(ngModel)]="showroomForm.phone" name="phone" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-amber-400 font-bold focus:outline-none focus:border-red-500" />
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button type="button" (click)="showShowroomModal.set(false)" class="px-4 py-2 font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl">Hủy</button>
              <button type="submit" class="px-5 py-2 font-bold text-white bg-[#E30019] rounded-xl shadow-lg">Lưu Chi Nhánh</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminSystemSettingsComponent implements OnInit {
  activeTab = signal<'SHOWROOMS' | 'CONTACT' | 'CMS'>('SHOWROOMS');
  showrooms = signal<any[]>([]);
  settings: Record<string, string> = {};

  showShowroomModal = signal(false);
  editingShowroomId = signal<number | null>(null);

  toastMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  showroomForm: any = {
    name: '',
    address: '',
    phone: '',
    priorityIndex: 1,
    isActive: true
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadShowrooms();
    this.loadSettings();
  }

  showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  loadShowrooms(): void {
    this.adminService.getAllShowrooms().subscribe({
      next: (res) => this.showrooms.set(res),
      error: () => this.showToast('Lỗi khi tải danh sách Showroom!', 'error')
    });
  }

  loadSettings(): void {
    this.adminService.getSystemSettings().subscribe({
      next: (res) => this.settings = res,
      error: () => this.showToast('Lỗi khi tải cấu hình hệ thống!', 'error')
    });
  }

  saveSettings(): void {
    this.adminService.updateSystemSettings(this.settings).subscribe({
      next: (res) => {
        this.settings = res;
        this.showToast('Lưu thông tin cấu hình hệ thống thành công!');
      },
      error: () => this.showToast('Lỗi khi lưu cấu hình!', 'error')
    });
  }

  openShowroomModal(showroom?: any): void {
    if (showroom) {
      this.editingShowroomId.set(showroom.id);
      this.showroomForm = { ...showroom };
    } else {
      this.editingShowroomId.set(null);
      this.showroomForm = { name: '', address: '', phone: '', priorityIndex: 1, isActive: true };
    }
    this.showShowroomModal.set(true);
  }

  saveShowroom(): void {
    const id = this.editingShowroomId();
    if (id) {
      this.adminService.updateShowroom(id, this.showroomForm).subscribe({
        next: () => {
          this.showShowroomModal.set(false);
          this.showToast('Cập nhật Showroom thành công!');
          this.loadShowrooms();
        },
        error: () => this.showToast('Lỗi khi cập nhật Showroom!', 'error')
      });
    } else {
      this.adminService.createShowroom(this.showroomForm).subscribe({
        next: () => {
          this.showShowroomModal.set(false);
          this.showToast('Thêm Showroom mới thành công!');
          this.loadShowrooms();
        },
        error: () => this.showToast('Lỗi khi thêm Showroom!', 'error')
      });
    }
  }

  deleteShowroom(s: any): void {
    if (confirm(`Xóa chi nhánh "${s.name}"?`)) {
      this.adminService.deleteShowroom(s.id).subscribe({
        next: () => {
          this.showToast('Đã xóa Showroom!');
          this.loadShowrooms();
        },
        error: () => this.showToast('Lỗi khi xóa Showroom!', 'error')
      });
    }
  }
}

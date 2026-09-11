import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomRoute, RouteManagementService } from '../../../services/route-management.service';

@Component({
  selector: 'app-admin-route-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6 animate-fade-in text-slate-100">
      <!-- Title Bar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono">Quản Lý Đường Dẫn Hệ Thống</h2>
            <span class="bg-amber-950/80 text-amber-400 border border-amber-500/40 text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
              <i class="pi pi-crown text-amber-400"></i> Super Admin Only
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">Xem danh sách, cấu hình và thêm mới các đường dẫn tùy chỉnh (Custom Routes) vào hệ thống</p>
        </div>

        <button 
          (click)="showAddModal.set(true)"
          class="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer">
          <i class="pi pi-plus-circle text-sm"></i>
          <span>THÊM ĐƯỜNG DẪN MỚI</span>
        </button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl">
        <div class="relative flex-1 max-w-md">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Tìm theo Tên hoặc Đường dẫn URL..."
            class="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-amber-500" />
          <i class="pi pi-search absolute left-3 top-2.5 text-slate-500 text-sm"></i>
        </div>

        <div class="text-xs text-slate-400 font-bold">
          Tổng số: <span class="text-amber-400 font-mono font-black">{{ filteredRoutes().length }}</span> đường dẫn
        </div>
      </div>

      <!-- Routes Table -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 text-[11px]">
              <tr>
                <th class="p-4">Biểu Tượng</th>
                <th class="p-4">Tên Đường Dẫn</th>
                <th class="p-4">URL Path</th>
                <th class="p-4">Vị Trí Hợp Lệ</th>
                <th class="p-4">Quyền Yêu Cầu</th>
                <th class="p-4">Trạng Thái</th>
                <th class="p-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-semibold text-slate-200">
              <tr *ngFor="let r of filteredRoutes()" class="hover:bg-slate-800/40 transition-colors">
                <!-- Icon -->
                <td class="p-4">
                  <div class="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 text-base">
                    <i [class]="r.icon || 'pi pi-link'"></i>
                  </div>
                </td>

                <!-- Name & Type -->
                <td class="p-4">
                  <div class="font-bold text-white text-sm flex items-center gap-2">
                    {{ r.name }}
                    <span *ngIf="r.isSystem" class="text-[9px] font-extrabold uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">Mặc định</span>
                    <span *ngIf="!r.isSystem" class="text-[9px] font-extrabold uppercase bg-amber-950/80 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/40">Tùy chỉnh</span>
                  </div>
                </td>

                <!-- URL Path -->
                <td class="p-4">
                  <span class="font-mono text-amber-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg font-bold">
                    {{ r.path }}
                  </span>
                </td>

                <!-- Target -->
                <td class="p-4">
                  <span class="text-slate-300 font-semibold flex items-center gap-1.5">
                    <i [class]="r.target === 'ADMIN_SIDEBAR' ? 'pi pi-shield text-red-500' : 'pi pi-globe text-blue-400'"></i>
                    {{ r.target === 'ADMIN_SIDEBAR' ? 'Sidebar Admin' : 'Header Client' }}
                  </span>
                </td>

                <!-- Required Role Badge -->
                <td class="p-4">
                  <span 
                    [ngClass]="{
                      'bg-amber-950/80 text-amber-400 border-amber-500/40': r.role === 'ROLE_SUPER_ADMIN',
                      'bg-red-950/80 text-red-400 border-red-500/40': r.role === 'ROLE_ADMIN',
                      'bg-slate-800 text-slate-300 border-slate-700': r.role === 'ROLE_USER'
                    }"
                    class="px-2.5 py-1 rounded-lg border font-bold text-[10px] uppercase inline-flex items-center gap-1">
                    <i *ngIf="r.role === 'ROLE_SUPER_ADMIN'" class="pi pi-crown text-[10px]"></i>
                    {{ r.role }}
                  </span>
                </td>

                <!-- Active Status Toggle -->
                <td class="p-4">
                  <button 
                    (click)="toggleActive(r.id)"
                    [ngClass]="r.active ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'"
                    class="px-3 py-1 rounded-full border text-[10px] font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer">
                    <span class="w-1.5 h-1.5 rounded-full" [ngClass]="r.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'"></span>
                    {{ r.active ? 'Kích Hoạt' : 'Đã Ẩn' }}
                  </button>
                </td>

                <!-- Actions -->
                <td class="p-4 text-center">
                  <button 
                    *ngIf="!r.isSystem" 
                    (click)="deleteRoute(r.id, r.name)"
                    [ngClass]="confirmDeleteId() === r.id ? 'bg-red-600 text-white w-max px-2.5 gap-1' : 'bg-slate-800 hover:bg-red-600/30 text-red-400 border border-slate-700 w-8'"
                    class="h-8 rounded-lg flex items-center justify-center transition-all duration-300 mx-auto cursor-pointer text-[10px] font-bold"
                    [title]="confirmDeleteId() === r.id ? 'Bấm thêm lần nữa để xóa' : 'Xóa đường dẫn tùy chỉnh'">
                    <i [class]="confirmDeleteId() === r.id ? 'pi pi-exclamation-triangle pointer-events-none' : 'pi pi-trash pointer-events-none'"></i>
                    <span *ngIf="confirmDeleteId() === r.id">XÓA?</span>
                  </button>
                  <span *ngIf="r.isSystem" class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mặc định</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ADD NEW ROUTE MODAL -->
      <div *ngIf="showAddModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div class="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <i class="pi pi-sitemap text-base"></i>
              </div>
              <h3 class="text-lg font-black text-white uppercase tracking-wide">Thêm Đường Dẫn Tùy Chỉnh Mới</h3>
            </div>
            <button 
              (click)="closeModal()" 
              class="text-slate-400 hover:text-white transition-colors w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Modal Form -->
          <form (ngSubmit)="onSaveNewRoute()" class="space-y-4 text-xs">
            <div>
              <label class="block text-slate-300 font-bold mb-1 uppercase tracking-wider">Tên Đường Dẫn / Menu *</label>
              <input 
                type="text" 
                [(ngModel)]="newRouteName" 
                name="routeName" 
                required
                placeholder="Ví dụ: Báo Cáo Doanh Thu, Khuyến Mãi Flash Sale..."
                class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs" />
            </div>

            <div>
              <label class="block text-slate-300 font-bold mb-1 uppercase tracking-wider">Đường Dẫn URL (Path) *</label>
              <input 
                type="text" 
                [(ngModel)]="newRoutePath" 
                name="routePath" 
                required
                placeholder="Ví dụ: /admin/analytics hoặc /promotions"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-300 font-bold mb-1 uppercase tracking-wider">Icon Biểu Tượng</label>
                <select 
                  [(ngModel)]="newRouteIcon" 
                  name="routeIcon"
                  class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 text-xs cursor-pointer">
                  <option value="pi pi-chart-line">📈 pi pi-chart-line (Biểu đồ)</option>
                  <option value="pi pi-bolt">⚡ pi pi-bolt (Flash Sale)</option>
                  <option value="pi pi-cog">⚙️ pi pi-cog (Cấu hình)</option>
                  <option value="pi pi-gift">🎁 pi pi-gift (Ưu đãi)</option>
                  <option value="pi pi-star">⭐ pi pi-star (Nổi bật)</option>
                  <option value="pi pi-link">🔗 pi pi-link (Liên kết)</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-300 font-bold mb-1 uppercase tracking-wider">Quyền Yêu Cầu *</label>
                <select 
                  [(ngModel)]="newRouteRole" 
                  name="routeRole"
                  class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-amber-500 text-xs cursor-pointer">
                  <option value="ROLE_SUPER_ADMIN">👑 ROLE_SUPER_ADMIN</option>
                  <option value="ROLE_ADMIN">🛡️ ROLE_ADMIN</option>
                  <option value="ROLE_USER">👤 ROLE_USER</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-slate-300 font-bold mb-1 uppercase tracking-wider">Vị Trí Hiển Thị</label>
              <select 
                [(ngModel)]="newRouteTarget" 
                name="routeTarget"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 text-xs cursor-pointer">
                <option value="ADMIN_SIDEBAR">🖥️ Sidebar Admin Dashboard</option>
                <option value="CLIENT_HEADER">🌐 Navigation Header Client</option>
              </select>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button 
                type="button" 
                (click)="closeModal()"
                class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl transition-colors">
                Hủy
              </button>

              <button 
                type="submit" 
                class="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-50 font-black px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all">
                LƯU ĐƯỜNG DẪN MỚI
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminRouteListComponent implements OnInit {
  searchQuery = '';
  showAddModal = signal(false);

  confirmDeleteId = signal<string | null>(null);

  newRouteName = '';
  newRoutePath = '';
  newRouteIcon = 'pi pi-link';
  newRouteRole: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN' = 'ROLE_SUPER_ADMIN';
  newRouteTarget: 'ADMIN_SIDEBAR' | 'CLIENT_HEADER' = 'ADMIN_SIDEBAR';

  constructor(public routeService: RouteManagementService) {}

  ngOnInit(): void {
    this.routeService.loadRoutes();
  }

  filteredRoutes(): CustomRoute[] {
    const list = this.routeService.routes();
    if (!this.searchQuery.trim()) {
      return list;
    }
    const q = this.searchQuery.toLowerCase();
    return list.filter(r => r.name.toLowerCase().includes(q) || r.path.toLowerCase().includes(q));
  }

  toggleActive(id: string): void {
    this.routeService.toggleRouteActive(id);
  }

  deleteRoute(id: string, name: string): void {
    if (this.confirmDeleteId() === id) {
      this.routeService.deleteCustomRoute(id);
      this.confirmDeleteId.set(null);
    } else {
      this.confirmDeleteId.set(id);
      setTimeout(() => {
        if (this.confirmDeleteId() === id) {
          this.confirmDeleteId.set(null);
        }
      }, 3000);
    }
  }

  closeModal(): void {
    this.showAddModal.set(false);
    this.resetForm();
  }

  onSaveNewRoute(): void {
    if (!this.newRouteName.trim() || !this.newRoutePath.trim()) {
      alert('Vui lòng nhập Tên đường dẫn và URL Path!');
      return;
    }

    let formattedPath = this.newRoutePath.trim();
    if (!formattedPath.startsWith('/')) {
      formattedPath = '/' + formattedPath;
    }

    this.routeService.addCustomRoute({
      name: this.newRouteName.trim(),
      path: formattedPath,
      icon: this.newRouteIcon,
      role: this.newRouteRole,
      target: this.newRouteTarget
    });

    this.closeModal();
    alert(`Đã thêm thành công đường dẫn "${this.newRouteName}"!`);
  }

  private resetForm(): void {
    this.newRouteName = '';
    this.newRoutePath = '';
    this.newRouteIcon = 'pi pi-link';
    this.newRouteRole = 'ROLE_SUPER_ADMIN';
    this.newRouteTarget = 'ADMIN_SIDEBAR';
  }
}

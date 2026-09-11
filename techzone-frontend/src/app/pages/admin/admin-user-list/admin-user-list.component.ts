import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Title Bar -->
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-2xl font-black text-white uppercase tracking-wide">Quản Lý Phân Quyền & Đường Dẫn Hệ Thống</h2>
            <span class="bg-amber-950 text-amber-400 border border-amber-500/40 text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
              <i class="pi pi-crown"></i> Super Admin Only
            </span>
          </div>
          <p class="text-xs text-slate-400">Xem danh sách người dùng, thay đổi vai trò (Role) và giám sát quyền truy cập các đường dẫn hệ thống</p>
        </div>
      </div>

      <!-- Route Matrix Control Box for Super Admin -->
      <div class="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-lg">
        <div class="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2.5">
          <i class="pi pi-sitemap text-sm"></i>
          <span>Danh Sách Đường Dẫn Hệ Thống & Ma Trận Phân Quyền (Route Matrix)</span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-[11px]">
          <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
            <div class="font-mono text-slate-300 font-bold truncate">/admin/dashboard</div>
            <div class="text-[10px] text-red-400 font-semibold mt-0.5">ROLE_ADMIN +</div>
          </div>
          <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
            <div class="font-mono text-slate-300 font-bold truncate">/admin/products</div>
            <div class="text-[10px] text-red-400 font-semibold mt-0.5">ROLE_ADMIN +</div>
          </div>
          <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
            <div class="font-mono text-slate-300 font-bold truncate">/admin/orders</div>
            <div class="text-[10px] text-red-400 font-semibold mt-0.5">ROLE_ADMIN +</div>
          </div>
          <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
            <div class="font-mono text-slate-300 font-bold truncate">/admin/categories</div>
            <div class="text-[10px] text-red-400 font-semibold mt-0.5">ROLE_ADMIN +</div>
          </div>
          <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
            <div class="font-mono text-slate-300 font-bold truncate">/admin/brands</div>
            <div class="text-[10px] text-red-400 font-semibold mt-0.5">ROLE_ADMIN +</div>
          </div>
          <div class="bg-amber-950/60 border border-amber-500/40 rounded-xl p-2.5 shadow-md">
            <div class="font-mono text-amber-300 font-bold truncate">/admin/users</div>
            <div class="text-[10px] text-amber-400 font-bold mt-0.5 flex items-center gap-1">
              <i class="pi pi-crown text-[9px]"></i> SUPER_ADMIN
            </div>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Tìm theo Tên hoặc Email..."
            class="w-full bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-amber-500" />
          <i class="pi pi-search absolute left-3 top-2.5 text-slate-500 text-sm"></i>
        </div>

        <div class="text-xs text-slate-400 font-bold">
          Tổng số: <span class="text-amber-400 font-mono">{{ filteredUsers().length }}</span> người dùng
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-950/60 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th class="p-4">Họ Và Tên</th>
                <th class="p-4">Email</th>
                <th class="p-4">Số Điện Thoại</th>
                <th class="p-4">Địa Chỉ</th>
                <th class="p-4">Quyền Hiện Tại (Role)</th>
                <th class="p-4 text-center">Phân Quyền Mới</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-xs">
              <tr *ngFor="let u of filteredUsers()" class="hover:bg-slate-800/40 transition-colors">
                <!-- Name -->
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div 
                      [ngClass]="{
                        'bg-amber-500/20 text-amber-400 border-amber-500/40': u.role === 'ROLE_SUPER_ADMIN',
                        'bg-red-600/20 text-red-400 border-red-500/40': u.role === 'ROLE_ADMIN',
                        'bg-slate-800 text-slate-300 border-slate-700': u.role === 'ROLE_USER'
                      }"
                      class="w-9 h-9 rounded-full border flex items-center justify-center font-bold text-sm">
                      {{ u.fullName?.charAt(0) || 'U' }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-100 text-sm">{{ u.fullName }}</div>
                      <div class="text-[10px] text-slate-500 font-mono">ID: #{{ u.id }}</div>
                    </div>
                  </div>
                </td>

                <!-- Email -->
                <td class="p-4 font-mono text-slate-300 font-semibold">{{ u.email }}</td>

                <!-- Phone -->
                <td class="p-4 font-mono text-slate-400">{{ u.phone || 'Chưa cập nhật' }}</td>

                <!-- Address -->
                <td class="p-4 text-slate-400 truncate max-w-xs">{{ u.address || 'Chưa cập nhật' }}</td>

                <!-- Current Role Badge -->
                <td class="p-4">
                  <span 
                    [ngClass]="{
                      'bg-amber-950/80 text-amber-400 border-amber-500/40': u.role === 'ROLE_SUPER_ADMIN',
                      'bg-red-950/80 text-red-400 border-red-500/40': u.role === 'ROLE_ADMIN',
                      'bg-slate-800/80 text-slate-300 border-slate-700': u.role === 'ROLE_USER'
                    }"
                    class="px-2.5 py-1 rounded-lg border font-bold text-[10px] uppercase inline-flex items-center gap-1">
                    <i *ngIf="u.role === 'ROLE_SUPER_ADMIN'" class="pi pi-crown text-[10px]"></i>
                    {{ u.role }}
                  </span>
                </td>

                <!-- Update Role Dropdown -->
                <td class="p-4 text-center">
                  <select 
                    [ngModel]="u.role"
                    (ngModelChange)="onRoleChange(u.id, u.fullName, $event)"
                    class="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer">
                    <option value="ROLE_USER">👤 ROLE_USER (Khách hàng)</option>
                    <option value="ROLE_ADMIN">🛡️ ROLE_ADMIN (Quản trị viên)</option>
                    <option value="ROLE_SUPER_ADMIN">👑 ROLE_SUPER_ADMIN (Tối cao)</option>
                  </select>
                </td>
              </tr>

              <tr *ngIf="filteredUsers().length === 0">
                <td colspan="6" class="p-8 text-center text-slate-500">Không tìm thấy người dùng nào.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminUserListComponent implements OnInit {
  users = signal<any[]>([]);
  searchQuery = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (res) => this.users.set(res),
      error: () => {}
    });
  }

  filteredUsers(): any[] {
    if (!this.searchQuery.trim()) {
      return this.users();
    }
    const q = this.searchQuery.toLowerCase();
    return this.users().filter(u => u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }

  onRoleChange(userId: number, fullName: string, newRole: string): void {
    if (confirm(`Bạn có chắc chắn muốn phân quyền "${newRole}" cho tài khoản "${fullName}"?`)) {
      this.adminService.updateUserRole(userId, newRole).subscribe({
        next: () => this.loadUsers(),
        error: () => alert('Lỗi khi phân quyền tài khoản!')
      });
    } else {
      this.loadUsers(); // Reset select dropdown if canceled
    }
  }
}

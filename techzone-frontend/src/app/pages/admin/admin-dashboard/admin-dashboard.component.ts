import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, DashboardStats } from '../../../services/admin.service';

import { AdminHeaderComponent } from '../../../components/admin-header/admin-header.component';

export interface MonthlyChartItem {
  month: string;
  fullMonth: string;
  monthIndex: number;
  revenue: number;
  orders: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminHeaderComponent],
  template: `
    <div class="space-y-6 animate-fade-in text-slate-100">
      <!-- Standardized Admin Header Component -->
      <app-admin-header 
        title="Tổng Quan System Dashboard"
        subtitle="Báo cáo hiệu số kinh doanh và thống kê thời gian thực của TechZone Store"
        icon="pi pi-chart-bar"
        badge="Analytics Live"
        [breadcrumbs]="[{ label: 'Dashboard' }]">
        
        <a 
          routerLink="/admin/orders"
          class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer">
          <i class="pi pi-shopping-bag"></i>
          <span>Xem Đơn Hàng Mới</span>
        </a>
      </app-admin-header>

      <!-- STAT CARDS GRID -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Revenue Card -->
        <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-red-500/50 shadow-xl transition-all">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tổng Doanh Thu</span>
              <span class="text-xl font-black text-red-500 mt-1 block">
                {{ (stats().totalRevenue || 0) | number:'1.0-0' }}đ
              </span>
              <span class="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <i class="pi pi-arrow-up-right text-[10px]"></i> Thống kê thực tế từ DB
              </span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 text-xl group-hover:scale-110 transition-transform shadow-inner">
              <i class="pi pi-dollar"></i>
            </div>
          </div>
        </div>

        <!-- Orders Card -->
        <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/50 shadow-xl transition-all">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tổng Đơn Hàng</span>
              <span class="text-xl font-black text-blue-400 mt-1 block">
                {{ stats().totalOrders || 0 }} đơn
              </span>
              <span class="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <i class="pi pi-arrow-up-right text-[10px]"></i> Đơn đã tạo trong hệ thống
              </span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xl group-hover:scale-110 transition-transform shadow-inner">
              <i class="pi pi-shopping-bag"></i>
            </div>
          </div>
        </div>

        <!-- Products Card -->
        <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/50 shadow-xl transition-all">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tổng Sản Phẩm</span>
              <span class="text-xl font-black text-emerald-400 mt-1 block">
                {{ stats().totalProducts || 0 }} mã
              </span>
              <span class="text-[10px] font-bold text-slate-400 mt-1 block">
                Đang kinh doanh
              </span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl group-hover:scale-110 transition-transform shadow-inner">
              <i class="pi pi-box"></i>
            </div>
          </div>
        </div>

        <!-- Users Card -->
        <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-purple-500/50 shadow-xl transition-all">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">Khách Hàng</span>
              <span class="text-xl font-black text-purple-400 mt-1 block">
                {{ stats().totalUsers || 0 }} tài khoản
              </span>
              <span class="text-[10px] font-bold text-purple-400 flex items-center gap-1 mt-1">
                <i class="pi pi-user-plus text-[10px]"></i> Đã đăng ký
              </span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl group-hover:scale-110 transition-transform shadow-inner">
              <i class="pi pi-users"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- MIDDLE SECTION: DYNAMIC 12-MONTH REVENUE CHART & LOW STOCK ALERT -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- SVG Interactive 12-Month Bar Chart (2 cols) -->
        <div class="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative">
          
          <!-- Chart Header & Unit Badge -->
          <div class="flex items-center justify-between mb-4 z-10">
            <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-chart-line text-red-500"></i>
              BIỂU ĐỒ THỐNG KÊ DOANH THU NĂM 2026 (T1 - T12)
            </h3>
            <span class="text-[10px] font-bold text-slate-300 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg">
              Đơn vị: VNĐ (Triệu đ)
            </span>
          </div>

          <!-- Chart Area Container with Y-Axis Gridlines & 12 Month Bars -->
          <div class="h-60 relative flex items-end justify-between gap-1.5 pt-10 px-2 border-b border-slate-800 pb-2">
            
            <!-- Horizontal Y-Axis Gridlines -->
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7 pt-10 px-2">
              <div class="border-b border-dashed border-slate-800/80 w-full"></div>
              <div class="border-b border-dashed border-slate-800/80 w-full"></div>
              <div class="border-b border-dashed border-slate-800/80 w-full"></div>
              <div class="border-b border-dashed border-slate-800/80 w-full"></div>
            </div>

            <!-- 12 Month Bars (T1 -> T12) -->
            <div *ngFor="let item of monthlyData()" class="flex-1 h-full flex flex-col justify-end items-center gap-1.5 group relative cursor-pointer z-10">
              
              <!-- Floating Tooltip Box on Hover -->
              <div class="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-1.5 shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 whitespace-nowrap text-center scale-90 group-hover:scale-100">
                <span class="block text-[11px] font-black text-amber-400">{{ item.fullMonth }}</span>
                <span class="block text-[10px] font-bold text-white">{{ item.revenue | number:'1.0-0' }}đ - {{ item.orders }} đơn hàng</span>
              </div>

              <!-- Top Revenue Label (Formatted as 4.59 Tr or 0 Tr) -->
              <div [class]="item.revenue > 0 ? 'text-red-400 font-black' : 'text-slate-500 font-bold'" class="text-[9px] group-hover:text-red-400 transition-colors">
                {{ formatShortRevenue(item.revenue) }}
              </div>

              <!-- Bar Element (rounded-t-xl with Dynamic Height Ratio) -->
              <div 
                [style.height.%]="getBarHeightPercentage(item.revenue)" 
                [class]="item.revenue > 0 ? 'bg-gradient-to-t from-red-600 via-rose-500 to-amber-400 shadow-sm border border-red-500' : 'bg-slate-900 border border-slate-800 group-hover:bg-slate-800'"
                class="w-full rounded-t-xl transition-all duration-300 min-h-[8px]"></div>

              <!-- Month Label (T1 -> T12) -->
              <span [class]="item.revenue > 0 ? 'text-red-400 font-black' : 'text-slate-500 font-bold'" class="text-[10px] group-hover:text-red-400 transition-colors">{{ item.month }}</span>
            </div>

          </div>
        </div>

        <!-- Low Stock Alert Widget (1 col) -->
        <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
            <h3 class="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-exclamation-triangle animate-bounce text-amber-400"></i>
              Cảnh Báo Hàng Sắp Hết
            </h3>
            <span class="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full">
              {{ lowStockProducts().length }} mã
            </span>
          </div>

          <div class="space-y-3 overflow-y-auto max-h-48 pr-1 custom-scrollbar">
            <div *ngFor="let p of lowStockProducts()" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-colors">
              <div class="flex items-center gap-2.5 min-w-0">
                <img [src]="p.thumbnail" [alt]="p.name" class="w-8 h-8 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0" />
                <div class="min-w-0">
                  <div class="text-xs font-bold text-white truncate">{{ p.name }}</div>
                  <div class="text-[10px] font-mono text-slate-400">SKU: {{ p.sku }}</div>
                </div>
              </div>
              <span class="text-xs font-mono font-bold text-red-400 shrink-0 ml-2">Còn {{ p.stockQuantity }} cái</span>
            </div>

            <div *ngIf="lowStockProducts().length === 0" class="text-center text-xs text-slate-500 py-6">
              Không có sản phẩm nào sắp hết hàng.
            </div>
          </div>

          <a routerLink="/admin/products" class="w-full mt-3 text-center text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 rounded-xl transition-colors block">
            Quản Lý Nhập Hàng <i class="pi pi-arrow-right text-[10px]"></i>
          </a>
        </div>
      </div>

      <!-- RECENT ORDERS TABLE -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <i class="pi pi-clock text-red-500"></i>
            Đơn Hàng Mới Nhất
          </h3>
          <a routerLink="/admin/orders" class="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1">
            Xem tất cả đơn hàng <i class="pi pi-arrow-right text-[10px]"></i>
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 text-[11px]">
              <tr>
                <th class="p-4">Mã Đơn</th>
                <th class="p-4">Khách Hàng</th>
                <th class="p-4">Số Điện Thoại</th>
                <th class="p-4">Tổng Tiền</th>
                <th class="p-4">Trạng Thái</th>
                <th class="p-4">Thanh Toán</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-semibold text-slate-200">
              <tr *ngFor="let order of recentOrders()" class="hover:bg-slate-800/40 transition-colors">
                <!-- Mã đơn -->
                <td class="p-4 font-mono font-bold text-red-400">#{{ order.orderCode }}</td>
                
                <!-- Khách hàng -->
                <td class="p-4 font-bold text-white">{{ order.customerName }}</td>
                
                <!-- SĐT -->
                <td class="p-4 text-slate-400 font-mono">{{ order.customerPhone }}</td>
                
                <!-- Tổng tiền -->
                <td class="p-4 font-black text-amber-400">{{ order.totalAmount | number:'1.0-0' }}đ</td>
                
                <!-- Trạng thái Badge -->
                <td class="p-4">
                  <span [class]="getStatusBadgeClass(order.orderStatus)" class="px-2.5 py-1 rounded-xl border font-bold text-[10px] inline-block shadow-2xs">
                    {{ getStatusBadgeLabel(order.orderStatus) }}
                  </span>
                </td>

                <!-- Thanh toán Badge -->
                <td class="p-4">
                  <span [class]="getPaymentBadgeClass(order.paymentMethod)" class="px-2.5 py-1 rounded-xl border font-bold text-[10px] uppercase inline-block shadow-2xs">
                    {{ getPaymentBadgeLabel(order.paymentMethod) }}
                  </span>
                </td>
              </tr>

              <tr *ngIf="recentOrders().length === 0">
                <td colspan="6" class="p-8 text-center text-slate-500">Chưa có đơn hàng nào trong hệ thống.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats = signal<DashboardStats>({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });
  recentOrders = signal<any[]>([]);
  allOrders = signal<any[]>([]);
  lowStockProducts = signal<any[]>([]);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (res) => this.stats.set(res),
      error: () => {}
    });

    this.adminService.getRecentOrders().subscribe({
      next: (res) => this.recentOrders.set(res),
      error: () => {}
    });

    this.adminService.getAllOrders().subscribe({
      next: (res) => this.allOrders.set(res || []),
      error: () => {}
    });

    this.adminService.getLowStockProducts().subscribe({
      next: (res) => this.lowStockProducts.set(res),
      error: () => {}
    });
  }

  // DYNAMIC 12-MONTH REVENUE CALCULATION SYNCHRONIZED WITH DB REAL DATA
  monthlyData = computed<MonthlyChartItem[]>(() => {
    const list = this.allOrders();
    const months: MonthlyChartItem[] = [];

    for (let i = 0; i < 12; i++) {
      const monthNum = i + 1;
      months.push({
        month: `T${monthNum}`,
        fullMonth: `Tháng ${monthNum}/2026`,
        monthIndex: i,
        revenue: 0,
        orders: 0
      });
    }

    // Aggregate real orders from DB by month of 2026
    list.forEach(o => {
      if (o.createdAt && o.orderStatus !== 'CANCELLED') {
        const d = new Date(o.createdAt);
        const mIdx = d.getMonth();
        if (mIdx >= 0 && mIdx < 12) {
          months[mIdx].revenue += (o.totalAmount || 0);
          months[mIdx].orders += 1;
        }
      }
    });

    return months;
  });

  // Calculate maximum monthly revenue for relative height scaling
  getMaxRevenue(): number {
    const data = this.monthlyData();
    const max = Math.max(...data.map(d => d.revenue), 0);
    return max > 0 ? max : 1;
  }

  getBarHeightPercentage(revenue: number): number {
    if (revenue <= 0) return 4; // Subtle 4% height placeholder for 0-revenue months
    const max = this.getMaxRevenue();
    return Math.max(Math.round((revenue / max) * 100), 12);
  }

  formatShortRevenue(revenue: number): string {
    if (revenue <= 0) return '0 Tr';
    const inMillions = revenue / 1000000;
    if (inMillions < 1) {
      return (revenue / 1000).toFixed(0) + 'k';
    }
    return inMillions.toFixed(2).replace(/\.00$/, '') + ' Tr';
  }

  // Status Badge Việt Hóa (Dark Gaming Style)
  getStatusBadgeLabel(status?: string): string {
    if (status === 'PENDING') return '🟡 Chờ Duyệt';
    if (status === 'CONFIRMED') return '🔵 Đã Duyệt';
    if (status === 'SHIPPING') return '🟣 Đang Giao';
    if (status === 'DELIVERED') return '🟢 Đã Giao Hàng';
    if (status === 'CANCELLED') return '🔴 Đã Hủy';
    return status || 'Mới';
  }

  getStatusBadgeClass(status?: string): string {
    if (status === 'PENDING') return 'bg-amber-950/80 text-amber-400 border-amber-500/40';
    if (status === 'CONFIRMED') return 'bg-blue-950/80 text-blue-400 border-blue-500/40';
    if (status === 'SHIPPING') return 'bg-indigo-950/80 text-indigo-400 border-indigo-500/40';
    if (status === 'DELIVERED') return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
    if (status === 'CANCELLED') return 'bg-red-950/80 text-red-400 border-red-500/40';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  }

  // Payment Badge Việt Hóa (Dark Gaming Style)
  getPaymentBadgeLabel(method?: string): string {
    if (!method) return '💵 COD';
    const m = method.toUpperCase();
    if (m === 'COD') return '💵 COD (Tiền mặt)';
    if (m === 'VNPAY' || m === 'QR_TRANSFER') return '💳 VNPAY / ATM';
    if (m === 'INSTALLMENT') return '💳 Trả góp 0%';
    return m;
  }

  getPaymentBadgeClass(method?: string): string {
    if (!method) return 'bg-amber-950/80 text-amber-400 border-amber-500/40';
    const m = method.toUpperCase();
    if (m === 'VNPAY' || m === 'QR_TRANSFER') return 'bg-blue-950/80 text-blue-400 border-blue-500/40';
    if (m === 'INSTALLMENT') return 'bg-purple-950/80 text-purple-400 border-purple-500/40';
    return 'bg-amber-950/80 text-amber-400 border-amber-500/40';
  }
}

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

import { AdminHeaderComponent } from '../../../components/admin-header/admin-header.component';

@Component({
  selector: 'app-admin-order-list',
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
        title="Quản Lý Đơn Hàng"
        subtitle="Theo dõi tiến trình đơn hàng, đối soát mốc thời gian, duyệt nhanh & in phiếu giao hàng / hóa đơn"
        icon="pi pi-shopping-bag"
        badge="Order Processing"
        [breadcrumbs]="[{ label: 'Quản lý Đơn hàng' }]">
      </app-admin-header>

      <!-- 1. STATUS PILLS BAR WITH BADGES -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar text-xs font-bold">
        <!-- ALL -->
        <button 
          (click)="activeStatusFilter.set('ALL')"
          [class]="activeStatusFilter() === 'ALL' ? 'bg-[#E30019] text-white shadow-md shadow-red-600/30' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'"
          class="px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer">
          <span>Tất Cả Đơn</span>
          <span [class]="activeStatusFilter() === 'ALL' ? 'bg-white text-red-600' : 'bg-slate-800 text-slate-300'" class="px-2 py-0.5 rounded-full text-[10px] font-black">
            {{ orders().length }}
          </span>
        </button>

        <!-- PENDING (Chờ duyệt 🟡) -->
        <button 
          (click)="activeStatusFilter.set('PENDING')"
          [class]="activeStatusFilter() === 'PENDING' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'"
          class="px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer">
          <span>🟡 Chờ Duyệt</span>
          <span [class]="activeStatusFilter() === 'PENDING' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-amber-400'" class="px-2 py-0.5 rounded-full text-[10px] font-black">
            {{ countByStatus('PENDING') }}
          </span>
        </button>

        <!-- CONFIRMED (Đã duyệt 🔵) -->
        <button 
          (click)="activeStatusFilter.set('CONFIRMED')"
          [class]="activeStatusFilter() === 'CONFIRMED' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'"
          class="px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer">
          <span>🔵 Đã Duyệt</span>
          <span [class]="activeStatusFilter() === 'CONFIRMED' ? 'bg-white text-blue-600' : 'bg-slate-800 text-blue-400'" class="px-2 py-0.5 rounded-full text-[10px] font-black">
            {{ countByStatus('CONFIRMED') }}
          </span>
        </button>

        <!-- SHIPPING (Đang giao 🟣) -->
        <button 
          (click)="activeStatusFilter.set('SHIPPING')"
          [class]="activeStatusFilter() === 'SHIPPING' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'"
          class="px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer">
          <span>🟣 Đang Giao</span>
          <span [class]="activeStatusFilter() === 'SHIPPING' ? 'bg-white text-indigo-600' : 'bg-slate-800 text-indigo-400'" class="px-2 py-0.5 rounded-full text-[10px] font-black">
            {{ countByStatus('SHIPPING') }}
          </span>
        </button>

        <!-- DELIVERED (Đã giao 🟢) -->
        <button 
          (click)="activeStatusFilter.set('DELIVERED')"
          [class]="activeStatusFilter() === 'DELIVERED' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'"
          class="px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer">
          <span>🟢 Đã Giao Hàng</span>
          <span [class]="activeStatusFilter() === 'DELIVERED' ? 'bg-white text-emerald-600' : 'bg-slate-800 text-emerald-400'" class="px-2 py-0.5 rounded-full text-[10px] font-black">
            {{ countByStatus('DELIVERED') }}
          </span>
        </button>

        <!-- CANCELLED (Đã hủy 🔴) -->
        <button 
          (click)="activeStatusFilter.set('CANCELLED')"
          [class]="activeStatusFilter() === 'CANCELLED' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'"
          class="px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer">
          <span>🔴 Đã Hủy</span>
          <span [class]="activeStatusFilter() === 'CANCELLED' ? 'bg-white text-rose-600' : 'bg-slate-800 text-rose-400'" class="px-2 py-0.5 rounded-full text-[10px] font-black">
            {{ countByStatus('CANCELLED') }}
          </span>
        </button>
      </div>

      <!-- 2. TOOLBAR & ADVANCED FILTERS WITH CUSTOMIZED DROPDOWNS & DATE PICKER -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div class="flex flex-col md:flex-row items-center justify-between gap-3">
          <!-- Multi-Search Input -->
          <div class="relative flex-grow max-w-md w-full">
            <input 
              type="text" 
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Tìm theo Mã đơn (#TZ-...), Tên khách, Số điện thoại..." 
              class="bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl py-2 pl-10 pr-8 text-xs w-full focus:outline-none focus:border-red-500 transition-all font-medium" />
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
            <button 
              *ngIf="searchQuery()" 
              (click)="searchQuery.set('')"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer">
              <i class="pi pi-times-circle"></i>
            </button>
          </div>

          <!-- Filter Dropdowns (Styled Modern Selects) -->
          <div class="flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap sm:flex-nowrap">
            
            <!-- Payment Filter Dropdown -->
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400 font-bold text-xs shrink-0 flex items-center gap-1">
                <i class="pi pi-credit-card text-slate-500"></i> Thanh toán:
              </span>
              <select 
                [ngModel]="paymentFilter()"
                (ngModelChange)="paymentFilter.set($event)"
                class="bg-slate-950 border border-slate-800 text-white font-bold text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-red-500 transition-all">
                <option value="ALL">Tất cả hình thức</option>
                <option value="COD">💵 COD (Tiền mặt)</option>
                <option value="VNPAY">💳 VNPAY / ATM</option>
                <option value="INSTALLMENT">💳 Trả góp 0%</option>
              </select>
            </div>

            <!-- Date Range Filter Dropdown -->
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400 font-bold text-xs shrink-0 flex items-center gap-1">
                <i class="pi pi-calendar text-slate-500"></i> Thời gian:
              </span>
              <select 
                [ngModel]="dateFilter()"
                (ngModelChange)="onDateFilterChange($event)"
                class="bg-slate-950 border border-slate-800 text-white font-bold text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-red-500 transition-all">
                <option value="ALL">🗓️ Tất cả thời gian</option>
                <option value="TODAY">📍 Hôm nay</option>
                <option value="YESTERDAY">⏮️ Hôm qua (Đối soát)</option>
                <option value="LAST_7_DAYS">⚡ 7 ngày qua</option>
                <option value="LAST_30_DAYS">📅 30 ngày qua</option>
                <option value="THIS_MONTH">📊 {{ currentMonthLabel }}</option>
                <option value="LAST_MONTH">📆 {{ lastMonthLabel }}</option>
                <option value="CUSTOM">🗓️ 📅 Tùy chỉnh ngày...</option>
              </select>
            </div>

            <!-- Clear All Filters Button -->
            <button 
              *ngIf="hasActiveFilters()" 
              (click)="resetAllFilters()"
              class="bg-red-950/80 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0">
              <i class="pi pi-filter-slash text-xs"></i>
              <span>Xóa lọc</span>
            </button>

            <!-- Counter Badge -->
            <span class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-bold text-xs shrink-0 ml-auto sm:ml-0">
              Khớp: <span class="text-red-400 font-black text-sm">{{ filteredOrders().length }}</span> đơn
            </span>
          </div>
        </div>

        <!-- CUSTOM DATE RANGE INPUT BAR -->
        <div *ngIf="dateFilter() === 'CUSTOM'" class="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-300 w-full sm:w-auto">
            <i class="pi pi-calendar-plus text-red-500 text-sm"></i>
            <span>Khoảng ngày tùy chỉnh:</span>
          </div>

          <div class="flex items-center gap-2 text-xs w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <!-- Start Date -->
            <div class="flex items-center gap-1">
              <span class="text-slate-400 font-medium text-[11px]">Từ:</span>
              <input 
                type="date" 
                [ngModel]="startDate()" 
                (ngModelChange)="startDate.set($event)"
                class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-red-500" />
            </div>

            <!-- Arrow ➔ -->
            <span class="text-red-500 font-bold text-sm hidden sm:inline">➔</span>

            <!-- End Date -->
            <div class="flex items-center gap-1">
              <span class="text-slate-400 font-medium text-[11px]">Đến:</span>
              <input 
                type="date" 
                [ngModel]="endDate()" 
                (ngModelChange)="endDate.set($event)"
                class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-red-500" />
            </div>

            <!-- Clear Custom Date Button -->
            <button 
              (click)="resetCustomDate()" 
              class="w-7 h-7 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
              title="Đặt lại ngày">
              <i class="pi pi-times text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 3. ORDERS DATA TABLE -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 text-[11px]">
              <tr>
                <th class="py-3 pl-6 pr-3 w-32">Mã Đơn</th>
                <th class="p-4">Khách Hàng</th>
                <th class="p-4">Ngày Đặt</th>
                <th class="p-4">Tổng Tiền</th>
                <th class="p-4">Thanh Toán</th>
                <th class="p-4 text-center">Trạng Thái</th>
                <th class="p-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-semibold text-slate-200">
              <tr *ngFor="let order of filteredOrders()" class="hover:bg-slate-800/40 transition-colors">
                
                <!-- Mã Đơn -->
                <td class="py-3 pl-6 pr-3 font-mono">
                  <span class="font-black text-red-400 text-sm tracking-tight block">#{{ order.orderCode }}</span>
                  <span class="text-[10px] text-slate-500 font-sans font-medium">ID: {{ order.id }}</span>
                </td>

                <!-- Khách Hàng & SĐT -->
                <td class="p-4">
                  <span class="font-bold text-white text-sm block">{{ order.customerName }}</span>
                  <span class="text-slate-400 font-mono font-medium flex items-center gap-1 text-[11px] mt-0.5">
                    <i class="pi pi-phone text-[10px] text-slate-500"></i> {{ order.customerPhone }}
                  </span>
                </td>

                <!-- Ngày Đặt -->
                <td class="p-4 font-medium text-slate-300">
                  <span class="block font-bold text-white text-[11px]">{{ order.createdAt | date:'dd/MM/yyyy' }}</span>
                  <span class="text-[10px] text-slate-500 font-mono">{{ order.createdAt | date:'HH:mm' }}</span>
                </td>

                <!-- Tổng Tiền + Số Lượng Sản Phẩm -->
                <td class="p-4">
                  <span class="font-black text-white text-sm block font-mono">{{ order.totalAmount | number:'1.0-0' }}đ</span>
                  <span class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md mt-0.5">
                    <i class="pi pi-box text-[9px] text-slate-400"></i> ({{ getItemCount(order) }} Sản phẩm)
                  </span>
                </td>

                <!-- Thanh Toán -->
                <td class="p-4">
                  <div class="space-y-1">
                    <!-- Method Pill -->
                    <span [class]="getPaymentMethodClass(order.paymentMethod)" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase">
                      {{ getPaymentMethodLabel(order.paymentMethod) }}
                    </span>
                    
                    <!-- Payment Status -->
                    <span [class]="order.paymentStatus === 'PAID' ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40' : 'text-amber-400 bg-amber-950/80 border-amber-500/40'" class="block text-[10px] font-bold px-2 py-0.5 rounded-md border w-fit">
                      {{ order.paymentStatus === 'PAID' ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán' }}
                    </span>
                  </div>
                </td>

                <!-- Trạng Thái Badge Dropdown -->
                <td class="p-4 text-center">
                  <div class="inline-block relative">
                    <select 
                      [ngModel]="order.orderStatus"
                      (ngModelChange)="onStatusChange(order.id, $event)"
                      [class]="getStatusSelectClass(order.orderStatus)"
                      class="text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer border transition-all appearance-none pr-7">
                      <option value="PENDING">🟡 Chờ Duyệt</option>
                      <option value="CONFIRMED">🔵 Đã Duyệt</option>
                      <option value="SHIPPING">🟣 Đang Giao</option>
                      <option value="DELIVERED">🟢 Đã Giao Hàng</option>
                      <option value="CANCELLED">🔴 Đã Hủy</option>
                    </select>
                    <i class="pi pi-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none opacity-70"></i>
                  </div>
                </td>

                <!-- Action Buttons -->
                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    
                    <!-- Quick Transition Button -->
                    <button 
                      *ngIf="order.orderStatus === 'PENDING'"
                      (click)="onStatusChange(order.id, 'CONFIRMED')"
                      class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1"
                      title="Duyệt đơn ngay">
                      <i class="pi pi-check text-[10px]"></i> Duyệt
                    </button>

                    <button 
                      *ngIf="order.orderStatus === 'CONFIRMED'"
                      (click)="onStatusChange(order.id, 'SHIPPING')"
                      class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1"
                      title="Chuyển sang giao hàng">
                      <i class="pi pi-truck text-[10px]"></i> Giao Hàng
                    </button>

                    <button 
                      *ngIf="order.orderStatus === 'SHIPPING'"
                      (click)="onStatusChange(order.id, 'DELIVERED', 'PAID')"
                      class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1"
                      title="Xác nhận hoàn thành giao hàng">
                      <i class="pi pi-check-circle text-[10px]"></i> Hoàn Thành
                    </button>

                    <!-- View Detail Button 👁️ -->
                    <button 
                      (click)="selectedOrder.set(order)"
                      class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer"
                      title="Xem chi tiết đơn hàng">
                      <i class="pi pi-eye text-sm"></i>
                    </button>

                    <!-- Print Invoice Button 🖨️ -->
                    <button 
                      (click)="printInvoice(order)"
                      class="w-8 h-8 rounded-xl bg-amber-950/80 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/40 font-bold flex items-center justify-center transition-colors cursor-pointer"
                      title="In Hóa Đơn / Phiếu Giao Hàng">
                      <i class="pi pi-print text-sm"></i>
                    </button>

                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredOrders().length === 0">
                <td colspan="7" class="p-8 text-center text-slate-500">Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. ORDER DETAIL MODAL DRAWER -->
      <div *ngIf="selectedOrder()" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl relative flex flex-col overflow-hidden text-slate-100">
          
          <!-- Modal Header -->
          <div class="p-5 border-b border-slate-800 bg-[#111827] shrink-0 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-red-500 uppercase tracking-widest">Chi Tiết Đơn Hàng</span>
                <span class="bg-red-950/80 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-md font-mono font-bold text-xs">#{{ selectedOrder().orderCode }}</span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Thời gian đặt: {{ selectedOrder().createdAt | date:'dd/MM/yyyy HH:mm:ss' }}</p>
            </div>

            <div class="flex items-center gap-2">
              <button 
                (click)="printInvoice(selectedOrder())"
                class="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-xs">
                <i class="pi pi-print text-xs"></i> In Hóa Đơn
              </button>
              <button 
                (click)="selectedOrder.set(null)"
                class="text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center transition-colors cursor-pointer border border-slate-800">
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>

          <!-- Modal Scrollable Content -->
          <div class="p-5 flex-grow overflow-y-auto custom-scrollbar space-y-5">
            
            <!-- Shipping Step Progress Tracker -->
            <div class="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <span class="text-xs font-black text-white uppercase tracking-wider block">Tiến Trình Đơn Hàng:</span>
              
              <div class="flex items-center justify-between text-xs font-bold">
                <!-- Step 1: Đặt hàng -->
                <div class="flex flex-col items-center gap-1 text-emerald-400">
                  <div class="w-8 h-8 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-sm shadow-xs">
                    <i class="pi pi-check"></i>
                  </div>
                  <span class="text-[10px]">Đặt Hàng</span>
                </div>

                <div [class]="selectedOrder().orderStatus !== 'PENDING' && selectedOrder().orderStatus !== 'CANCELLED' ? 'bg-emerald-500' : 'bg-slate-800'" class="flex-1 h-1 mx-2 transition-colors"></div>

                <!-- Step 2: Xác nhận -->
                <div [class]="selectedOrder().orderStatus !== 'PENDING' && selectedOrder().orderStatus !== 'CANCELLED' ? 'text-blue-400' : 'text-slate-500'" class="flex flex-col items-center gap-1">
                  <div [class]="selectedOrder().orderStatus !== 'PENDING' && selectedOrder().orderStatus !== 'CANCELLED' ? 'bg-blue-950/80 border-blue-500/40' : 'bg-slate-950 border-slate-800'" class="w-8 h-8 rounded-full border flex items-center justify-center text-sm shadow-xs">
                    <i class="pi pi-box"></i>
                  </div>
                  <span class="text-[10px]">Xác Nhận</span>
                </div>

                <div [class]="selectedOrder().orderStatus === 'SHIPPING' || selectedOrder().orderStatus === 'DELIVERED' ? 'bg-indigo-500' : 'bg-slate-800'" class="flex-1 h-1 mx-2 transition-colors"></div>

                <!-- Step 3: Đang giao -->
                <div [class]="selectedOrder().orderStatus === 'SHIPPING' || selectedOrder().orderStatus === 'DELIVERED' ? 'text-indigo-400' : 'text-slate-500'" class="flex flex-col items-center gap-1">
                  <div [class]="selectedOrder().orderStatus === 'SHIPPING' || selectedOrder().orderStatus === 'DELIVERED' ? 'bg-indigo-950/80 border-indigo-500/40' : 'bg-slate-950 border-slate-800'" class="w-8 h-8 rounded-full border flex items-center justify-center text-sm shadow-xs">
                    <i class="pi pi-truck"></i>
                  </div>
                  <span class="text-[10px]">Đang Giao</span>
                </div>

                <div [class]="selectedOrder().orderStatus === 'DELIVERED' ? 'bg-emerald-500' : 'bg-slate-800'" class="flex-1 h-1 mx-2 transition-colors"></div>

                <!-- Step 4: Hoàn thành -->
                <div [class]="selectedOrder().orderStatus === 'DELIVERED' ? 'text-emerald-400' : 'text-slate-500'" class="flex flex-col items-center gap-1">
                  <div [class]="selectedOrder().orderStatus === 'DELIVERED' ? 'bg-emerald-950/80 border-emerald-500/40' : 'bg-slate-950 border-slate-800'" class="w-8 h-8 rounded-full border flex items-center justify-center text-sm shadow-xs">
                    <i class="pi pi-verified"></i>
                  </div>
                  <span class="text-[10px]">Đã Giao</span>
                </div>
              </div>
            </div>

            <!-- Customer & Delivery Info Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <span class="text-slate-400 block font-bold uppercase text-[10px]">Khách hàng người nhận</span>
                <span class="font-bold text-white text-sm block mt-0.5">{{ selectedOrder().customerName }}</span>
              </div>
              <div>
                <span class="text-slate-400 block font-bold uppercase text-[10px]">Số điện thoại liên hệ</span>
                <span class="font-mono font-bold text-white text-sm block mt-0.5">{{ selectedOrder().customerPhone }}</span>
              </div>
              <div class="sm:col-span-2">
                <span class="text-slate-400 block font-bold uppercase text-[10px]">Địa chỉ giao nhận hàng</span>
                <span class="text-slate-200 font-medium block mt-0.5">{{ selectedOrder().shippingAddress }}</span>
              </div>
              <div *ngIf="selectedOrder().note" class="sm:col-span-2 bg-amber-950/60 border border-amber-500/40 p-2.5 rounded-xl text-amber-300">
                <span class="font-bold block text-[10px] uppercase">Ghi chú từ khách:</span>
                <span class="italic text-xs">{{ selectedOrder().note }}</span>
              </div>
            </div>

            <!-- Ordered Items List -->
            <div class="space-y-2">
              <span class="text-xs font-black uppercase tracking-wider text-slate-300 block">Sản Phẩm Đã Đặt:</span>
              <div class="space-y-2">
                <div *ngFor="let item of selectedOrder().items" class="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs shadow-2xs">
                  <div class="flex items-center gap-3">
                    <img [src]="item.product?.thumbnail || 'assets/placeholder.png'" [alt]="item.productName" class="w-12 h-12 object-contain rounded-xl bg-slate-900 border border-slate-800 p-1 shrink-0" />
                    <div>
                      <span class="font-bold text-white text-xs block line-clamp-1">{{ item.productName }}</span>
                      <span class="text-[11px] text-slate-400 font-mono">Đơn giá: {{ item.price | number:'1.0-0' }}đ &times; <strong class="text-red-400 font-black">{{ item.quantity }}</strong></span>
                    </div>
                  </div>
                  <div class="font-black text-white text-sm shrink-0 ml-2 font-mono">
                    {{ (item.price * item.quantity) | number:'1.0-0' }}đ
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer (Total Calculation) -->
          <div class="p-4 border-t border-slate-800 bg-slate-900 shrink-0 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase">Tổng Cộng Tiền Đơn Hàng</span>
            <span class="text-2xl font-black text-red-400 font-mono">{{ selectedOrder().totalAmount | number:'1.0-0' }}đ</span>
          </div>

        </div>
      </div>

      <!-- 5. PRINTABLE INVOICE MODAL (PHIẾU GIAO HÀNG / HÓA ĐƠN) -->
      <div *ngIf="printInvoiceOrder()" class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in print:bg-white print:static print:p-0 print:z-auto">
        <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl relative flex flex-col overflow-hidden text-slate-900 p-6 space-y-6 print:max-h-none print:shadow-none print:rounded-none print:p-0 print:border-none print:w-full print:static">
          
          <!-- Actions Bar (Non-printable) -->
          <div class="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
            <span class="font-black text-slate-800 text-sm uppercase flex items-center gap-1.5">
              <i class="pi pi-print text-amber-500"></i> Xem Trước Phiếu Giao Hàng & Hóa Đơn
            </span>
            <div class="flex items-center gap-2">
              <button 
                (click)="triggerPrint()" 
                class="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5">
                <i class="pi pi-print"></i> In Ngay (Print)
              </button>
              <button 
                (click)="printInvoiceOrder.set(null)" 
                class="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer">
                Đóng
              </button>
            </div>
          </div>

          <!-- Printable Area -->
          <div id="printable-invoice" class="p-6 bg-white space-y-6 border border-slate-200 rounded-xl overflow-y-auto">
            <!-- Header Logo & Store Info -->
            <div class="flex items-center justify-between border-b-2 border-red-600 pb-4">
              <div>
                <h1 class="text-2xl font-black text-red-600 tracking-wider">TECHZONE STORE</h1>
                <p class="text-[11px] text-slate-500 font-medium">Hệ thống bán lẻ máy tính & linh kiện phần cứng hàng đầu</p>
                <p class="text-[10px] text-slate-400 font-mono">Website: techzone.vn | Hotline: 1900 8888</p>
              </div>
              <div class="text-right">
                <h2 class="text-lg font-black uppercase text-slate-800">PHIẾU GIAO HÀNG</h2>
                <p class="font-mono text-xs font-bold text-red-600">#{{ printInvoiceOrder()?.orderCode }}</p>
                <p class="text-[10px] text-slate-400">Ngày in: {{ todayDate | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
            </div>

            <!-- Customer & Order Information -->
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div class="space-y-1">
                <span class="font-bold text-slate-800 uppercase block text-[10px]">Người Nhận Hàng:</span>
                <p class="font-bold text-slate-900 text-sm">{{ printInvoiceOrder()?.customerName }}</p>
                <p class="font-mono text-slate-600">SĐT: {{ printInvoiceOrder()?.customerPhone }}</p>
                <p class="text-slate-600">Địa chỉ: {{ printInvoiceOrder()?.shippingAddress }}</p>
              </div>

              <div class="space-y-1 text-right">
                <span class="font-bold text-slate-800 uppercase block text-[10px]">Thông Tin Đơn:</span>
                <p class="text-slate-600">Ngày đặt: {{ printInvoiceOrder()?.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                <p class="text-slate-600">Thanh toán: <strong class="uppercase font-mono text-slate-900">{{ printInvoiceOrder()?.paymentMethod }}</strong></p>
                <p class="text-slate-600">Trạng thái: <strong class="text-emerald-600">{{ printInvoiceOrder()?.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'THU TIỀN TẬN NƠI (COD)' }}</strong></p>
              </div>
            </div>

            <!-- Items Table -->
            <table class="w-full text-left border-collapse text-xs border border-slate-200">
              <thead>
                <tr class="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th class="p-2 border-r border-slate-200">STT</th>
                  <th class="p-2 border-r border-slate-200">Tên Sản Phẩm</th>
                  <th class="p-2 border-r border-slate-200 text-center">SL</th>
                  <th class="p-2 border-r border-slate-200 text-right">Đơn Giá</th>
                  <th class="p-2 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 font-medium">
                <tr *ngFor="let item of printInvoiceOrder()?.items; let idx = index">
                  <td class="p-2 border-r border-slate-200 font-mono text-center">{{ idx + 1 }}</td>
                  <td class="p-2 border-r border-slate-200 font-bold text-slate-800">{{ item.productName }}</td>
                  <td class="p-2 border-r border-slate-200 text-center font-mono font-bold">{{ item.quantity }}</td>
                  <td class="p-2 border-r border-slate-200 text-right font-mono">{{ item.price | number:'1.0-0' }}đ</td>
                  <td class="p-2 text-right font-mono font-bold text-slate-900">{{ (item.price * item.quantity) | number:'1.0-0' }}đ</td>
                </tr>
              </tbody>
            </table>

            <!-- Total Calculation Summary -->
            <div class="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <div class="text-[10px] text-slate-500 italic">
                Cảm ơn quý khách đã tin tưởng mua sắm tại TechZone Store!
              </div>
              <div class="text-right">
                <span class="font-bold text-slate-700">TỔNG CỘNG THANH TOÁN:</span>
                <span class="text-xl font-black text-red-600 font-mono block">{{ printInvoiceOrder()?.totalAmount | number:'1.0-0' }}đ</span>
              </div>
            </div>

            <!-- Signature Section -->
            <div class="grid grid-cols-2 text-center text-xs pt-8 border-t border-dashed border-slate-300">
              <div>
                <span class="font-bold block uppercase text-[10px]">Người Giao Hàng</span>
                <span class="text-[9px] text-slate-400 italic">(Ký và ghi rõ họ tên)</span>
              </div>
              <div>
                <span class="font-bold block uppercase text-[10px]">Người Nhận Hàng</span>
                <span class="text-[9px] text-slate-400 italic">(Ký và kiểm tra hàng)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminOrderListComponent implements OnInit {
  orders = signal<any[]>([]);
  activeStatusFilter = signal<string>('ALL');
  paymentFilter = signal<string>('ALL');
  dateFilter = signal<string>('ALL');
  startDate = signal<string>('');
  endDate = signal<string>('');
  searchQuery = signal<string>('');

  selectedOrder = signal<any | null>(null);
  printInvoiceOrder = signal<any | null>(null);
  toastMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  todayDate = new Date();

  currentMonthLabel = '';
  lastMonthLabel = '';

  constructor(private adminService: AdminService) {
    const now = new Date();
    const currM = String(now.getMonth() + 1).padStart(2, '0');
    this.currentMonthLabel = `Tháng này (T${currM}/${now.getFullYear()})`;

    const lastMDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastM = String(lastMDate.getMonth() + 1).padStart(2, '0');
    this.lastMonthLabel = `Tháng trước (T${lastM}/${lastMDate.getFullYear()})`;
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.adminService.getAllOrders().subscribe({
      next: (res) => this.orders.set(res || []),
      error: () => {}
    });
  }

  countByStatus(status: string): number {
    return this.orders().filter(o => o.orderStatus === status).length;
  }

  getItemCount(order: any): number {
    if (!order.items || order.items.length === 0) return 0;
    return order.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
  }

  onDateFilterChange(value: string): void {
    this.dateFilter.set(value);
    if (value !== 'CUSTOM') {
      this.startDate.set('');
      this.endDate.set('');
    }
  }

  resetCustomDate(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.dateFilter.set('ALL');
  }

  hasActiveFilters(): boolean {
    return (
      this.searchQuery().trim() !== '' ||
      this.paymentFilter() !== 'ALL' ||
      this.dateFilter() !== 'ALL' ||
      this.activeStatusFilter() !== 'ALL'
    );
  }

  resetAllFilters(): void {
    this.searchQuery.set('');
    this.paymentFilter.set('ALL');
    this.dateFilter.set('ALL');
    this.startDate.set('');
    this.endDate.set('');
    this.activeStatusFilter.set('ALL');
  }

  filteredOrders = computed(() => {
    let list = this.orders();

    // 1. Status Filter
    if (this.activeStatusFilter() !== 'ALL') {
      list = list.filter(o => o.orderStatus === this.activeStatusFilter());
    }

    // 2. Payment Method Filter
    if (this.paymentFilter() !== 'ALL') {
      const pm = this.paymentFilter();
      if (pm === 'COD') list = list.filter(o => o.paymentMethod === 'COD');
      else if (pm === 'VNPAY') list = list.filter(o => o.paymentMethod === 'VNPAY' || o.paymentMethod === 'QR_TRANSFER' || o.paymentMethod === 'ATM');
      else if (pm === 'INSTALLMENT') list = list.filter(o => o.paymentMethod === 'INSTALLMENT');
    }

    // 3. Date Range Filter (With All Presets + Custom Range)
    if (this.dateFilter() !== 'ALL') {
      const now = new Date();
      const df = this.dateFilter();

      list = list.filter(o => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);

        if (df === 'TODAY') {
          return d.toDateString() === now.toDateString();
        } else if (df === 'YESTERDAY') {
          const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          return d.toDateString() === yesterday.toDateString();
        } else if (df === 'LAST_7_DAYS') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return d >= sevenDaysAgo;
        } else if (df === 'LAST_30_DAYS') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return d >= thirtyDaysAgo;
        } else if (df === 'THIS_MONTH') {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        } else if (df === 'LAST_MONTH') {
          const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
        } else if (df === 'CUSTOM') {
          let matchStart = true;
          let matchEnd = true;

          if (this.startDate()) {
            const st = new Date(this.startDate() + 'T00:00:00');
            matchStart = d >= st;
          }
          if (this.endDate()) {
            const et = new Date(this.endDate() + 'T23:59:59');
            matchEnd = d <= et;
          }
          return matchStart && matchEnd;
        }
        return true;
      });
    }

    // 4. Multi-Search Query Filter
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(o => 
        (o.orderCode && o.orderCode.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.toLowerCase().includes(q))
      );
    }

    return list;
  });

  getPaymentMethodLabel(method?: string): string {
    if (!method) return 'COD';
    const m = method.toUpperCase();
    if (m === 'COD') return '💵 COD (Tiền mặt)';
    if (m === 'VNPAY' || m === 'QR_TRANSFER') return '💳 VNPAY / ATM';
    if (m === 'INSTALLMENT') return '💳 TRẢ GÓP 0%';
    return m;
  }

  getPaymentMethodClass(method?: string): string {
    if (!method) return 'bg-amber-50 text-amber-700 border-amber-200';
    const m = method.toUpperCase();
    if (m === 'VNPAY' || m === 'QR_TRANSFER') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (m === 'INSTALLMENT') return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  getStatusSelectClass(status?: string): string {
    if (status === 'PENDING') return 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100';
    if (status === 'CONFIRMED') return 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100';
    if (status === 'SHIPPING') return 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100';
    if (status === 'DELIVERED') return 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100';
    if (status === 'CANCELLED') return 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100';
    return 'bg-slate-50 text-slate-700 border-slate-300';
  }

  onStatusChange(orderId: number, newStatus: string, newPaymentStatus?: string): void {
    const payload: any = { orderStatus: newStatus };
    if (newPaymentStatus) {
      payload.paymentStatus = newPaymentStatus;
    }
    this.adminService.updateOrderStatus(orderId, payload).subscribe({
      next: () => {
        this.showToast('Đã cập nhật trạng thái đơn hàng thành công!');
        this.loadOrders();
      },
      error: () => this.showToast('Lỗi khi cập nhật trạng thái đơn hàng!', 'error')
    });
  }

  printInvoice(order: any): void {
    this.printInvoiceOrder.set(order);
  }

  triggerPrint(): void {
    window.print();
  }

  showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RouteManagementService } from '../../services/route-management.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-screen w-screen overflow-hidden bg-[#0F172A] text-slate-100 flex">
      <!-- SIDEBAR BG-[#111827] - Fixed 100vh height -->
      <aside class="w-64 h-screen bg-[#111827] border-r border-slate-800 flex flex-col justify-between shrink-0 z-30 overflow-hidden">
        <div class="flex flex-col h-full overflow-hidden">
          <!-- Logo Header -->
          <div class="p-5 border-b border-slate-800 flex items-center gap-3 shrink-0">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30">
              <i class="pi pi-shield text-white text-xl"></i>
            </div>
            <div>
              <span class="text-lg font-black tracking-wider text-white font-mono">TECH<span class="text-red-500">ZONE</span></span>
              <div class="flex items-center gap-1">
                <span 
                  *ngIf="isSuperAdmin()" 
                  class="text-[9px] font-black uppercase text-amber-400 bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <i class="pi pi-crown text-[9px]"></i> Super Admin
                </span>
                <span 
                  *ngIf="!isSuperAdmin()" 
                  class="text-[9px] font-bold uppercase text-red-400 bg-red-950/80 border border-red-500/30 px-1.5 py-0.5 rounded">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>

          <!-- Navigation Links (Independent Scrollbar inside Sidebar) -->
          <nav class="p-3 space-y-1 text-sm font-semibold flex-1 overflow-y-auto custom-scrollbar">
            <!-- Main Section Header -->
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4 pt-2 pb-1">Menu Quản Lý</div>

            <a routerLink="/admin/dashboard" title="Dashboard"
                routerLinkActive="bg-[#E30019]/20 text-white border-r-4 border-[#E30019] font-bold"
                class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all">
              <i class="pi pi-chart-bar text-base text-blue-400"></i>
              <span>Dashboard</span>
            </a>

            <a routerLink="/admin/products" title="Quản lý Sản phẩm"
                routerLinkActive="bg-[#E30019]/20 text-white border-r-4 border-[#E30019] font-bold"
                class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all">
              <i class="pi pi-box text-base text-emerald-400"></i>
              <span>Quản lý Sản phẩm</span>
            </a>

            <a routerLink="/admin/orders" title="Quản lý Đơn hàng"
                routerLinkActive="bg-[#E30019]/20 text-white border-r-4 border-[#E30019] font-bold"
                class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all">
              <i class="pi pi-shopping-bag text-base text-purple-400"></i>
              <span>Quản lý Đơn hàng</span>
            </a>

            <!-- GROUP: QUẢN LÝ TRANG CHỦ (HOMEPAGE BUILDER) -->
            <div class="pt-2 space-y-1 border-t border-slate-800/80">
              <div class="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-4 py-1 flex items-center gap-1.5">
                <i class="pi pi-palette text-[11px]"></i>
                <span>QUẢN LÝ TRANG CHỦ</span>
              </div>

              <a 
                routerLink="/admin/banners" title="Quản lý Banner Slider"
                routerLinkActive="bg-[#E30019]/20 text-white border-r-4 border-[#E30019] font-bold"
                class="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all text-xs pl-6">
                <i class="pi pi-images text-sm text-amber-400"></i>
                <span>Banner Slider & Ads</span>
              </a>

              <a 
                routerLink="/admin/flash-sale" title="Cấu hình Flash Sale"
                routerLinkActive="bg-[#E30019]/20 text-white border-r-4 border-[#E30019] font-bold"
                class="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all text-xs pl-6">
                <i class="pi pi-bolt text-sm text-red-500"></i>
                <span>Cấu hình Flash Sale</span>
              </a>

              <a 
                [routerLink]="['/admin/homepage-builder']" title="Sắp Xếp Thứ Tự Khối"
                [queryParams]="{ tab: 'LAYOUT' }"
                [ngClass]="{
                  'bg-[#E30019]/20 text-white border-r-4 border-[#E30019] font-bold': isHomepageBuilderTabActive('LAYOUT')
                }"
                class="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all text-xs pl-6">
                <i class="pi pi-sort-alt text-sm text-purple-400"></i>
                <span>Sắp Xếp Thứ Tự Khối</span>
              </a>

              <a 
                [routerLink]="['/admin/homepage-builder']" title="Thanh Cam Kết (USPs)"
                [queryParams]="{ tab: 'USPS' }"
                [ngClass]="{
                  'bg-[#E30019]/20 text-white border-r-4 border-[#E30019] font-bold': isHomepageBuilderTabActive('USPS')
                }"
                class="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all text-xs pl-6">
                <i class="pi pi-shield text-sm text-emerald-400"></i>
                <span>Thanh Cam Kết (USPs)</span>
              </a>

              <a 
                [routerLink]="['/admin/homepage-builder']" title="Cụm Sản Phẩm (Shelves)"
                [queryParams]="{ tab: 'SHELVES' }"
                [ngClass]="{
                  'bg-[#E30019]/20 text-white border-r-4 border-[#E30019] font-bold': isHomepageBuilderTabActive('SHELVES')
                }"
                class="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all text-xs pl-6">
                <i class="pi pi-tags text-sm text-blue-400"></i>
                <span>Cụm Sản Phẩm (Shelves)</span>
              </a>

              <a 
                [routerLink]="['/admin/homepage-builder']" title="Thương Hiệu & Tin Tức"
                [queryParams]="{ tab: 'BLOGS_BRANDS' }"
                [ngClass]="{
                  'bg-[#E30019]/20 text-white border-r-4 border-[#E30019] font-bold': isHomepageBuilderTabActive('BLOGS_BRANDS')
                }"
                class="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all text-xs pl-6">
                <i class="pi pi-building text-sm text-amber-400"></i>
                <span>Thương Hiệu & Tin Tức</span>
              </a>
            </div>

            <!-- Management Section -->
            <div class="pt-2 space-y-1 border-t border-slate-800/80">
              <a 
                routerLink="/admin/categories" title="Quản lý Danh mục SP"
                routerLinkActive="bg-[#E30019]/20 text-white border-r-4 border-[#E30019] font-bold"
                class="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all text-xs">
                <i class="pi pi-th-large text-sm text-slate-400"></i>
                <span>Quản lý Danh mục SP</span>
              </a>

              <a 
                routerLink="/admin/brands" title="Quản lý Thương hiệu"
                routerLinkActive="bg-[#E30019]/20 text-white border-r-4 border-[#E30019] font-bold"
                class="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all text-xs">
                <i class="pi pi-briefcase text-sm text-slate-400"></i>
                <span>Quản lý Thương hiệu</span>
              </a>
            </div>

            <!-- Super Admin Section Header -->
            <div *ngIf="isSuperAdmin()" class="pt-3 space-y-1 border-t border-slate-800/80">
              <div class="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-4 py-1 flex items-center gap-1">
                <i class="pi pi-crown text-[10px]"></i> Super Admin
              </div>

              <ng-container *ngFor="let r of routeService.routes()">
                <a 
                  *ngIf="r.active && r.target === 'ADMIN_SIDEBAR' && r.role === 'ROLE_SUPER_ADMIN'"
                  [routerLink]="r.path" 
                  routerLinkActive="bg-amber-500/20 text-amber-300 border-r-4 border-amber-500 font-bold"
                  class="flex items-center gap-3 px-4 py-2 rounded-xl text-amber-400/90 hover:text-amber-200 hover:bg-amber-950/30 transition-all text-xs">
                  <i [class]="r.icon || 'pi pi-link'" class="text-sm"></i>
                  <span>{{ r.name }}</span>
                </a>
              </ng-container>
            </div>
          </nav>

          <!-- Sidebar Bottom Footer (Fixed at bottom of sidebar) -->
          <div class="p-4 border-t border-slate-800 shrink-0 bg-[#111827]">
            <button 
              (click)="logout()"
              class="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/30 py-2.5 rounded-xl transition-all cursor-pointer shadow-md">
              <i class="pi pi-power-off text-sm"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT WRAPPER (h-screen overflow-hidden) -->
      <div class="flex-1 h-screen flex flex-col min-w-0 bg-[#0F172A] overflow-hidden">
        <!-- TOP NAVBAR (GLOBAL ADMIN HEADER) -->
        <header class="relative z-20 bg-[#111827] border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0 shadow-md">
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <h1 class="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <span>Hệ Thống Quản Trị TechZone</span>
              <span class="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full hidden sm:inline-block">
                🟢 Live Server
              </span>
            </h1>
          </div>

          <div class="flex items-center gap-4">
            <!-- Client Link Button -->
            <a 
              routerLink="/" 
              target="_blank"
              class="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer">
              <i class="pi pi-external-link text-xs text-amber-400"></i>
              <span>Cửa hàng Client</span>
            </a>

            <!-- User Info Badge -->
            <div class="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div 
                [ngClass]="isSuperAdmin() ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-red-600/20 border-red-500/50 text-red-400'"
                class="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shadow-sm">
                {{ authService.currentUser()?.fullName?.charAt(0) || 'A' }}
              </div>
              <div class="text-xs">
                <div class="font-bold text-white leading-tight">{{ authService.currentUser()?.fullName || 'Administrator' }}</div>
                <div 
                  [class.text-amber-400]="isSuperAdmin()"
                  [class.text-red-400]="!isSuperAdmin()"
                  class="text-[10px] font-extrabold uppercase tracking-wider">
                  {{ isSuperAdmin() ? '👑 Super Admin' : 'Administrator' }}
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- PAGE CONTENT CONTAINER (Independent Scrollbar inside main ONLY) -->
        <main class="px-6 pt-3 pb-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  constructor(
    public authService: AuthService,
    public routeService: RouteManagementService,
    private router: Router
  ) {}

  hasRole(role: string): boolean {
    const userRole = this.authService.currentUser()?.role;
    if (userRole === 'ROLE_SUPER_ADMIN') return true;
    return userRole === role;
  }

  isSuperAdmin(): boolean {
    return this.authService.currentUser()?.role === 'ROLE_SUPER_ADMIN';
  }

  isHomepageBuilderTabActive(tab: 'LAYOUT' | 'USPS' | 'SHELVES' | 'BLOGS_BRANDS'): boolean {
    const urlTree = this.router.parseUrl(this.router.url);
    const primary = urlTree.root.children['primary']?.segments
      .map(segment => segment.path)
      .join('/');
    if (primary !== 'admin/homepage-builder') return false;
    return (urlTree.queryParams['tab'] || 'LAYOUT') === tab;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/'], { replaceUrl: true });
  }
}

import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { RouteManagementService } from '../../services/route-management.service';
import { HomeService } from '../../services/home.service';
import { Category, Product } from '../../models/product.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 bg-[#E30019] text-white shadow-md w-full">
      <!-- Main Header -->
      <div class="max-w-[1200px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2 group shrink-0">
          <div class="w-9 h-9 rounded-xl bg-white text-[#E30019] flex items-center justify-center shadow font-black text-xl group-hover:scale-105 transition-transform">
            <i class="pi pi-bolt"></i>
          </div>
          <div>
            <span class="text-xl font-black tracking-wider text-white font-mono leading-none block">TECH<span class="text-yellow-300">ZONE</span></span>
            <span class="text-[9px] font-bold uppercase tracking-widest text-red-100 block">GEARVN STYLE STORE</span>
          </div>
        </a>

        <!-- Search Bar -->
        <div class="relative flex-1 max-w-xl hidden md:block">
          <div class="relative">
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              (keyup.enter)="onSearchSubmit()"
              placeholder="Bạn cần tìm gì? (VD: Laptop i9, RTX 4070...)" 
              class="w-full bg-white text-slate-900 placeholder-slate-400 rounded-xl py-2 pl-10 pr-24 text-xs focus:outline-none shadow" />
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <button 
              (click)="onSearchSubmit()"
              class="absolute right-1 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer">
              Tìm kiếm
            </button>
          </div>

          <!-- Quick Search Dropdown -->
          <div *ngIf="searchResults().length > 0" class="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 text-slate-900 animate-fade-in">
            <div 
              *ngFor="let p of searchResults()" 
              (click)="selectSearchResult(p.slug)"
              class="p-3 hover:bg-slate-50 flex items-center gap-3 cursor-pointer transition-colors">
              <img [src]="p.thumbnail" [alt]="p.name" class="w-10 h-10 object-cover rounded-lg bg-slate-100" />
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-slate-900 truncate">{{ p.name }}</div>
                <div class="text-[11px] font-black text-[#E30019]">
                  {{ (p.promotionPrice || p.originalPrice) | number:'1.0-0' }}đ
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Hotline -->
          <div class="hidden lg:flex items-center gap-2 text-white">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
              <i class="pi pi-phone"></i>
            </div>
            <div class="text-xs leading-tight">
              <span class="block text-red-100 text-[10px]">Hotline mua hàng</span>
              <span class="font-black text-white font-mono">{{ hotline() }}</span>
            </div>
          </div>

          <!-- Cart Icon -->
          <a routerLink="/cart" class="relative flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-xl transition-all group text-white">
            <div class="relative">
              <i class="pi pi-shopping-bag text-lg"></i>
              <span *ngIf="cartService.itemCount() > 0" class="absolute -top-2 -right-2 bg-yellow-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                {{ cartService.itemCount() }}
              </span>
            </div>
            <span class="text-xs font-bold hidden sm:inline text-white">Giỏ hàng</span>
          </a>

          <!-- User Account / Login Button -->
          <div class="relative">
            <button 
              *ngIf="!authService.currentUser()" 
              (click)="openAuthModal.emit()"
              class="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow transition-all cursor-pointer">
              <i class="pi pi-user text-xs"></i>
              <span>Đăng nhập</span>
            </button>

            <div *ngIf="authService.currentUser()" class="flex items-center gap-2">
              <a 
                *ngIf="authService.isAdmin()" 
                routerLink="/admin"
                [ngClass]="authService.isSuperAdmin() ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-900 text-[#E30019] hover:bg-slate-800 font-bold'"
                class="text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow">
                <i [class]="authService.isSuperAdmin() ? 'pi pi-crown' : 'pi pi-shield'"></i>
                <span class="hidden sm:inline">Trang Admin</span>
              </a>

              <div class="w-8 h-8 rounded-full bg-white text-[#E30019] font-black flex items-center justify-center text-xs shadow">
                {{ authService.currentUser()?.fullName?.charAt(0) }}
              </div>
              <span class="text-xs font-bold text-white hidden md:inline">{{ authService.currentUser()?.fullName }}</span>
              <button (click)="authService.logout()" class="text-red-100 hover:text-white text-xs p-1 cursor-pointer" title="Đăng xuất">
                <i class="pi pi-power-off"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Bar (Categories Mega Menu) -->
      <nav class="bg-[#c20015] border-t border-red-700/40 hidden md:block w-full overflow-x-auto no-scrollbar">
        <div class="max-w-[1200px] mx-auto px-4 flex items-center gap-6 text-xs font-bold py-2 text-white min-w-max">
          <a routerLink="/products" class="flex items-center gap-2 text-yellow-300 hover:text-white font-black tracking-wide">
            <i class="pi pi-bars text-sm"></i>
            DANH MỤC SẢN PHẨM
          </a>

          <a 
            *ngFor="let cat of categories()" 
            [routerLink]="['/products']" 
            [queryParams]="{ category: cat.slug || cat.id }"
            class="text-white hover:text-yellow-300 transition-colors flex items-center gap-1.5 whitespace-nowrap">
            <img *ngIf="isImageUrl(cat.icon)" [src]="cat.icon" class="w-4 h-4 object-contain brightness-0 invert" [alt]="cat.name" />
            <i *ngIf="!isImageUrl(cat.icon)" [class]="cat.icon || 'pi pi-tag'" class="text-red-200 text-xs"></i>
            {{ cat.name }}
          </a>

          <!-- Dynamic custom routes for client header -->
          <ng-container *ngFor="let r of routeService.routes()">
            <a 
              *ngIf="r.active && r.target === 'CLIENT_HEADER'" 
              [routerLink]="r.path"
              class="text-white hover:text-yellow-300 transition-colors flex items-center gap-1.5 whitespace-nowrap">
              <i [class]="r.icon || 'pi pi-link'" class="text-red-200 text-xs"></i>
              {{ r.name }}
            </a>
          </ng-container>
        </div>
      </nav>
    </header>
  `
})
export class HeaderComponent implements OnInit {
  @Output() openAuthModal = new EventEmitter<void>();
  categories = signal<Category[]>([]);
  hotline = signal<string>('1900.5301');
  searchQuery = '';
  searchResults = signal<Product[]>([]);

  constructor(
    public cartService: CartService,
    public authService: AuthService,
    public routeService: RouteManagementService,
    private productService: ProductService,
    private homeService: HomeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: () => {}
    });

    this.homeService.getSystemSettings().subscribe({
      next: (res) => {
        if (res && res['HOTLINE']) {
          this.hotline.set(res['HOTLINE']);
        }
      }
    });
  }

  onSearchInput(): void {
    if (this.searchQuery.trim().length > 1) {
      this.productService.quickSearch(this.searchQuery).subscribe({
        next: (items) => this.searchResults.set(items)
      });
    } else {
      this.searchResults.set([]);
    }
  }

  onSearchSubmit(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery } });
      this.searchResults.set([]);
    }
  }

  selectSearchResult(slug: string): void {
    this.searchQuery = '';
    this.searchResults.set([]);
    this.router.navigate(['/products', slug]);
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
}

import { Component, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { HomeService, Banner } from './services/home.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, AuthModalComponent],
  template: `
    <!-- ADMIN FULL SCREEN LAYOUT (No Header/Footer, No 1200px max-width) -->
    <div *ngIf="isAdminRoute(); else clientLayout" class="min-h-screen bg-[#0F172A] text-slate-100">
      <router-outlet></router-outlet>
    </div>

    <!-- CLIENT STOREFRONT LAYOUT -->
    <ng-template #clientLayout>
      <div class="min-h-screen flex flex-col justify-between bg-[#F4F4F4] text-slate-900 relative">
        <!-- DYNAMIC FLOATING STICKY BANNERS FROM BACKEND API (NO DARK BORDERS) -->
        <!-- Floating Left Banner -->
        <div 
          *ngIf="showSideBanners() && !isNearFooter() && floatingLeftBanner()" 
          class="fixed top-[125px] left-2 z-20 hidden xl:block animate-fade-in group transition-all duration-300">
          <div class="relative w-36 rounded-2xl overflow-hidden shadow-xl border-0 bg-transparent">
            <button 
              (click)="showSideBanners.set(false)" 
              class="absolute top-1 right-1 bg-slate-950/80 hover:bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center z-10 cursor-pointer transition-colors shadow">
              <i class="pi pi-times"></i>
            </button>
            <a [href]="floatingLeftBanner()?.targetUrl || '/products'" class="block">
              <img [src]="floatingLeftBanner()?.imageUrl" [alt]="floatingLeftBanner()?.title" class="w-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl" />
            </a>
          </div>
        </div>

        <!-- Floating Right Banner -->
        <div 
          *ngIf="showSideBanners() && !isNearFooter() && floatingRightBanner()" 
          class="fixed top-[125px] right-2 z-20 hidden xl:block animate-fade-in group transition-all duration-300">
          <div class="relative w-36 rounded-2xl overflow-hidden shadow-xl border-0 bg-transparent">
            <button 
              (click)="showSideBanners.set(false)" 
              class="absolute top-1 right-1 bg-slate-950/80 hover:bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center z-10 cursor-pointer transition-colors shadow">
              <i class="pi pi-times"></i>
            </button>
            <a [href]="floatingRightBanner()?.targetUrl || '/products'" class="block">
              <img [src]="floatingRightBanner()?.imageUrl" [alt]="floatingRightBanner()?.title" class="w-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl" />
            </a>
          </div>
        </div>

        <!-- FIXED HEADER (TOP-0 Z-50) -->
        <app-header (openAuthModal)="showAuthModal.set(true)"></app-header>
        
        <!-- MAIN CENTERED CONTENT CONTAINER WITH EXACT PADDING-TOP FOR FIXED HEADER -->
        <main class="flex-grow w-full max-w-[1200px] mx-auto px-4 py-4 pt-[115px]">
          <router-outlet></router-outlet>
        </main>

        <!-- WIDGET NÚT TƯ VẤN TẢI NỔI (FLOATING CONTACT & SCROLL TOP BUTTONS) -->
        <div *ngIf="!isAdminRoute()" class="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3 animate-fade-in">
          <!-- Zalo / Messenger Chat Widget -->
          <a 
            href="https://zalo.me" 
            target="_blank"
            rel="noopener noreferrer"
            title="Chat tư vấn Zalo 24/7" 
            class="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 relative group cursor-pointer border-2 border-white">
            <i class="pi pi-comments text-xl"></i>
            <span class="absolute right-14 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              💬 Chat tư vấn Zalo 24/7
            </span>
          </a>

          <!-- Hotline Call Button -->
          <a 
            href="tel:19001234" 
            title="Gọi Hotline tư vấn nhanh" 
            class="w-12 h-12 rounded-full bg-[#E30019] hover:bg-red-700 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 relative group cursor-pointer border-2 border-white animate-bounce">
            <i class="pi pi-[#E30019] pi-phone text-lg"></i>
            <span class="absolute right-14 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              📞 Hotline: 1900 1234
            </span>
          </a>

          <!-- Scroll to Top Button -->
          <button 
            *ngIf="showScrollTop()" 
            (click)="scrollToTop()" 
            title="Cuộn lên đầu trang" 
            class="w-11 h-11 rounded-full bg-slate-900 hover:bg-slate-950 text-white flex items-center justify-center shadow-xl transition-all hover:scale-110 border border-slate-700 cursor-pointer">
            <i class="pi pi-arrow-up text-sm font-bold"></i>
          </button>
        </div>

        <!-- FOOTER -->
        <app-footer></app-footer>

        <!-- AUTH MODAL -->
        <app-auth-modal *ngIf="showAuthModal()" (closeModal)="showAuthModal.set(false)"></app-auth-modal>
      </div>
    </ng-template>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  showAuthModal = signal(false);
  isAdminRoute = signal(false);

  // Side Sticky Floating Banners Signals
  floatingLeftBanner = signal<Banner | null>(null);
  floatingRightBanner = signal<Banner | null>(null);
  showSideBanners = signal(true);
  isNearFooter = signal(false);
  showScrollTop = signal(false);

  private routerSub?: Subscription;

  constructor(
    private router: Router,
    private homeService: HomeService
  ) {}

  ngOnInit(): void {
    // Detect Admin Routes
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isAdminRoute.set(e.urlAfterRedirects.startsWith('/admin'));
    });

    // Load Side Floating Banners from API
    this.homeService.getBannersByPosition('FLOATING_LEFT').subscribe(res => {
      if (res && res.length > 0) this.floatingLeftBanner.set(res[0]);
    });

    this.homeService.getBannersByPosition('FLOATING_RIGHT').subscribe(res => {
      if (res && res.length > 0) this.floatingRightBanner.set(res[0]);
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const totalHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    
    // Show Scroll to top when scrolled down > 300px
    this.showScrollTop.set(scrollPosition > 300);

    // Hide side banners if user is near the footer (bottom 400px)
    if (totalHeight - (scrollPosition + clientHeight) < 400) {
      this.isNearFooter.set(true);
    } else {
      this.isNearFooter.set(false);
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }
}

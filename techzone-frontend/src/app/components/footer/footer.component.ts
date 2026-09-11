import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-slate-950 border-t border-slate-800 text-slate-400 pt-12 pb-8 mt-16">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <!-- Brand Info -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
              <i class="pi pi-bolt"></i>
            </div>
            <span class="text-xl font-black text-white font-mono">TECH<span class="text-red-500">ZONE</span></span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed mb-4">
            Hệ thống showroom công nghệ chuyên cung cấp Laptop Gaming, PC Build chuyên nghiệp, Linh kiện & Gaming Gear chính hãng hàng đầu Việt Nam.
          </p>
          <div class="flex items-center gap-3">
            <a [href]="settings['FACEBOOK_URL'] || '#'" target="_blank" class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"><i class="pi pi-facebook"></i></a>
            <a [href]="settings['YOUTUBE_URL'] || '#'" target="_blank" class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"><i class="pi pi-youtube"></i></a>
            <a [href]="settings['TIKTOK_URL'] || '#'" target="_blank" class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"><i class="pi pi-tiktok"></i></a>
          </div>
        </div>

        <!-- Customer Service -->
        <div>
          <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-500 pl-2">Thông Tin Chăm Sóc Khách Hàng</h4>
          <ul class="space-y-2 text-xs">
            <li><a href="#" class="hover:text-red-400 transition-colors">Hướng dẫn mua hàng online</a></li>
            <li><a href="#" class="hover:text-red-400 transition-colors">Chính sách bảo hành 1 đổi 1</a></li>
            <li><a href="#" class="hover:text-red-400 transition-colors">Chính sách đổi trả trong 30 ngày</a></li>
            <li><a href="#" class="hover:text-red-400 transition-colors">Chính sách trả góp 0% lãi suất</a></li>
            <li><a href="#" class="hover:text-red-400 transition-colors">Hotline: <strong class="text-white font-mono">{{ settings['HOTLINE'] || '1900.5301' }}</strong></a></li>
          </ul>
        </div>

        <!-- System Store (Dynamic Showrooms) -->
        <div>
          <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-500 pl-2">Hệ Thống Showroom TechZone</h4>
          <ul class="space-y-2 text-xs">
            <li *ngFor="let s of showrooms(); let i = index">
              <strong class="text-slate-200">{{ s.name }}:</strong> {{ s.address }}
              <div *ngIf="s.phone" class="text-[10px] text-slate-500 font-mono">SĐT: {{ s.phone }}</div>
            </li>
            <li *ngIf="showrooms().length === 0">
              <strong class="text-slate-200">Showroom 1:</strong> 123 Hoàng Hoa Thám, P.6, Q.Bình Thạnh, TP.HCM
            </li>
            <li class="pt-2 text-red-400 font-semibold"><i class="pi pi-clock mr-1"></i> Mở cửa: {{ settings['WORKING_HOURS'] || '8:00 - 21:30 (Cả CN & Ngày lễ)' }}</li>
          </ul>
        </div>

        <!-- Payment & Guarantees -->
        <div>
          <h4 class="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-red-500 pl-2">Thanh Toán & Hỗ Trợ</h4>
          <p class="text-xs mb-3">Hỗ trợ đa dạng phương thức thanh toán an toàn:</p>
          <div class="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
            <span class="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">Tiền mặt / COD</span>
            <span class="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">Quét mã VietQR</span>
            <span class="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">Ví VNPay / ATM</span>
            <span class="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">Trả góp 0%</span>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-900 text-center text-xs text-slate-500">
        © 2026 TechZone E-Commerce Platform. Đã đăng ký bản quyền. Thiết kế đậm chất Gaming & Công nghệ đỉnh cao.
      </div>
    </footer>
  `
})
export class FooterComponent implements OnInit {
  showrooms = signal<any[]>([]);
  settings: Record<string, string> = {};

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.homeService.getActiveShowrooms().subscribe({
      next: (res) => this.showrooms.set(res),
      error: () => {}
    });

    this.homeService.getSystemSettings().subscribe({
      next: (res) => this.settings = res,
      error: () => {}
    });
  }
}

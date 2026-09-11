import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div class="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <!-- Close button -->
        <button 
          (click)="closeModal.emit()" 
          class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
          <i class="pi pi-times"></i>
        </button>

        <!-- Header tabs -->
        <div class="flex border-b border-slate-800 mb-6">
          <button 
            (click)="isLoginMode.set(true)"
            [class.border-red-500]="isLoginMode()"
            [class.text-white]="isLoginMode()"
            class="flex-1 py-3 text-center text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors">
            Đăng Nhập
          </button>
          <button 
            (click)="isLoginMode.set(false)"
            [class.border-red-500]="!isLoginMode()"
            [class.text-white]="!isLoginMode()"
            class="flex-1 py-3 text-center text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-colors">
            Đăng Ký Tài Khoản
          </button>
        </div>

        <!-- Alert Error Message -->
        <div *ngIf="errorMessage()" class="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <i class="pi pi-exclamation-circle text-base"></i>
          <span>{{ errorMessage() }}</span>
        </div>

        <!-- LOGIN FORM -->
        <form *ngIf="isLoginMode()" (ngSubmit)="onLogin()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              [(ngModel)]="loginEmail" 
              name="email" 
              required
              placeholder="user@techzone.vn"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Mật khẩu</label>
            <input 
              type="password" 
              [(ngModel)]="loginPassword" 
              name="password" 
              required
              placeholder="••••••••"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500" />
          </div>

          <div class="text-right">
            <a href="#" class="text-xs text-red-400 hover:underline">Quên mật khẩu?</a>
          </div>

          <button 
            type="submit" 
            [disabled]="loading()"
            class="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/30 transition-all text-sm">
            {{ loading() ? 'Đang xử lý...' : 'ĐĂNG NHẬP NGAY' }}
          </button>

          <div class="pt-2 text-center text-xs text-slate-400">
            Dùng thử tài khoản mặc định: <span class="font-mono text-red-400 font-bold">user&#64;techzone.vn</span> / <span class="font-mono text-red-400 font-bold">123456</span>
          </div>
        </form>

        <!-- REGISTER FORM -->
        <form *ngIf="!isLoginMode()" (ngSubmit)="onRegister()" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Họ và tên</label>
            <input 
              type="text" 
              [(ngModel)]="regName" 
              name="regName" 
              required
              placeholder="Nguyễn Văn A"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              [(ngModel)]="regEmail" 
              name="regEmail" 
              required
              placeholder="example@gmail.com"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Mật khẩu</label>
            <input 
              type="password" 
              [(ngModel)]="regPassword" 
              name="regPassword" 
              required
              placeholder="Tối thiểu 6 ký tự"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Số điện thoại</label>
            <input 
              type="text" 
              [(ngModel)]="regPhone" 
              name="regPhone" 
              placeholder="0988xxxxxx"
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500" />
          </div>

          <button 
            type="submit" 
            [disabled]="loading()"
            class="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/30 transition-all text-sm mt-2">
            {{ loading() ? 'Đang tạo tài khoản...' : 'TẠO TÀI KHOẢN MỚI' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class AuthModalComponent {
  @Output() closeModal = new EventEmitter<void>();

  isLoginMode = signal(true);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  loginEmail = '';
  loginPassword = '';

  regName = '';
  regEmail = '';
  regPassword = '';
  regPhone = '';

  constructor(private authService: AuthService) {}

  onLogin(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.authService.login({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: () => {
        this.loading.set(false);
        this.closeModal.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Email hoặc mật khẩu không chính xác');
      }
    });
  }

  onRegister(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.authService.register({
      fullName: this.regName,
      email: this.regEmail,
      password: this.regPassword,
      phone: this.regPhone
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.closeModal.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin');
      }
    });
  }
}

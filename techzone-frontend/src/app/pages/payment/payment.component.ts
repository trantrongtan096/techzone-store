import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { interval, Subscription, switchMap } from 'rxjs';
import { Order, PaymentTransaction } from '../../models/order.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="payment-page">
      <div class="payment-shell">
        <nav class="breadcrumb">
          <a routerLink="/">Trang chủ</a>
          <i class="pi pi-angle-right"></i>
          <span>Thanh toán VietQR</span>
        </nav>

        <section class="payment-card">
          <div class="payment-header">
            <div>
              <p>THANH TOÁN VIETQR</p>
              <h1>Quét mã để hoàn tất đơn hàng</h1>
            </div>
            <span [class.paid]="status() === 'PAID'" [class.failed]="status() === 'FAILED' || status() === 'EXPIRED'">
              {{ statusLabel() }}
            </span>
          </div>

          <div *ngIf="loading()" class="state-box">
            <i class="pi pi-spin pi-spinner"></i>
            Đang tải thông tin thanh toán...
          </div>

          <div *ngIf="!loading() && order()" class="payment-grid">
            <div class="qr-panel">
              <img *ngIf="payment()?.paymentUrl" [src]="payment()?.paymentUrl" alt="VietQR TechZone" />
              <div *ngIf="!payment()?.paymentUrl" class="qr-missing">
                <i class="pi pi-qrcode"></i>
                <strong>Chưa có mã QR</strong>
                <span>Backend cần cấu hình VIETQR_BANK_BIN và VIETQR_ACCOUNT_NO để sinh QR thật.</span>
              </div>
            </div>

            <div class="payment-info">
              <div>
                <span>Số tiền</span>
                <strong class="amount">{{ order()?.totalAmount | number:'1.0-0' }}đ</strong>
              </div>
              <div>
                <span>Nội dung chuyển khoản</span>
                <strong class="mono">{{ payment()?.reference || order()?.orderCode }}</strong>
              </div>
              <div>
                <span>Mã đơn hàng</span>
                <strong class="mono">{{ order()?.orderCode }}</strong>
              </div>
              <div>
                <span>Trạng thái</span>
                <strong>{{ statusLabel() }}</strong>
              </div>

              <div *ngIf="isDevHost()" class="dev-actions">
                <p>Demo đồ án</p>
                <button type="button" (click)="simulate('success')">Giả lập thành công</button>
                <button type="button" (click)="simulate('failed')">Giả lập thất bại</button>
                <button type="button" (click)="simulate('expired')">Giả lập hết hạn</button>
              </div>
            </div>
          </div>

          <div *ngIf="error()" class="state-box error">
            <i class="pi pi-exclamation-triangle"></i>
            {{ error() }}
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .payment-page { color: #0f172a; font-family: Arial, "Segoe UI", sans-serif; }
    .payment-shell { width: 100%; max-width: 980px; margin: 0 auto; }
    .breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; color: #64748b; font-size: 12px; }
    .breadcrumb a { color: #64748b; }
    .breadcrumb a:hover { color: #dc001b; }
    .breadcrumb .pi { font-size: 10px; }
    .payment-card { border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-shadow: 0 10px 30px #0f172a10; overflow: hidden; }
    .payment-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
    .payment-header p { margin: 0 0 4px; color: #dc001b; font-size: 12px; font-weight: 900; letter-spacing: .04em; }
    .payment-header h1 { margin: 0; font-size: 24px; line-height: 30px; font-weight: 900; }
    .payment-header > span { border-radius: 999px; background: #fef3c7; color: #b45309; padding: 8px 12px; font-size: 12px; font-weight: 900; white-space: nowrap; }
    .payment-header > span.paid { background: #dcfce7; color: #15803d; }
    .payment-header > span.failed { background: #fee2e2; color: #b91c1c; }
    .payment-grid { display: grid; grid-template-columns: 360px 1fr; gap: 24px; padding: 24px; }
    .qr-panel { display: grid; place-items: center; min-height: 360px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; }
    .qr-panel img { width: min(320px, 100%); height: min(320px, 100%); object-fit: contain; border-radius: 10px; background: #fff; padding: 10px; }
    .qr-missing { display: grid; justify-items: center; gap: 8px; text-align: center; padding: 24px; color: #475569; }
    .qr-missing .pi { color: #dc001b; font-size: 52px; }
    .qr-missing strong { color: #0f172a; font-size: 18px; }
    .qr-missing span { max-width: 280px; font-size: 13px; line-height: 20px; }
    .payment-info { display: grid; align-content: start; gap: 12px; }
    .payment-info > div:not(.dev-actions) { display: flex; justify-content: space-between; gap: 18px; border-bottom: 1px solid #eef2f7; padding-bottom: 12px; font-size: 14px; }
    .payment-info span { color: #64748b; }
    .payment-info strong { text-align: right; color: #0f172a; }
    .payment-info .amount { color: #dc001b; font-size: 24px; }
    .mono { font-family: Consolas, "Courier New", monospace; }
    .state-box { display: flex; align-items: center; gap: 10px; margin: 24px; border: 1px solid #bfdbfe; border-radius: 10px; background: #eff6ff; color: #1d4ed8; padding: 14px 16px; font-size: 13px; font-weight: 800; }
    .state-box.error { border-color: #fecaca; background: #fff1f2; color: #be123c; }
    .dev-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 10px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #f8fafc; padding: 12px; }
    .dev-actions p { flex-basis: 100%; margin: 0; color: #64748b; font-size: 11px; font-weight: 900; text-transform: uppercase; }
    .dev-actions button { height: 34px; border-radius: 7px; background: #0f172a; color: #fff; padding: 0 12px; font-size: 12px; font-weight: 800; }
    .dev-actions button:first-of-type { background: #16a34a; }
    .dev-actions button:nth-of-type(2) { background: #dc2626; }
    .dev-actions button:nth-of-type(3) { background: #b45309; }
    @media (max-width: 767px) {
      .payment-header { align-items: flex-start; flex-direction: column; padding: 16px; }
      .payment-grid { grid-template-columns: 1fr; padding: 16px; }
      .qr-panel { min-height: 280px; }
      .payment-info > div:not(.dev-actions) { flex-direction: column; gap: 5px; }
      .payment-info strong { text-align: left; }
    }
  `]
})
export class PaymentComponent implements OnInit, OnDestroy {
  orderCode = '';
  contact = '';
  loading = signal(true);
  error = signal('');
  order = signal<Order | null>(null);
  payment = signal<PaymentTransaction | null>(null);
  status = signal('PENDING');

  private pollingSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.orderCode = this.route.snapshot.paramMap.get('orderCode') || '';
    this.contact = this.route.snapshot.queryParamMap.get('contact') || '';
    if (!this.orderCode) {
      this.loading.set(false);
      this.error.set('Không tìm thấy mã đơn hàng.');
      return;
    }

    this.loadPayment();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }

  isDevHost(): boolean {
    return ['localhost', '127.0.0.1'].includes(window.location.hostname);
  }

  statusLabel(): string {
    switch (this.status()) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'FAILED':
        return 'Thanh toán thất bại';
      case 'EXPIRED':
        return 'QR đã hết hạn';
      default:
        return 'Đang chờ thanh toán';
    }
  }

  simulate(status: 'success' | 'failed' | 'expired'): void {
    this.orderService.mockPayment(this.orderCode, status).subscribe({
      next: (payment) => {
        this.payment.set(payment);
        this.status.set(payment.status);
        if (payment.status === 'PAID') {
          this.router.navigate(['/payment', this.orderCode, 'success'], {
            queryParams: this.contact ? { contact: this.contact } : undefined
          });
        }
      },
      error: () => this.error.set('Không thể giả lập thanh toán. Hãy kiểm tra backend có bật profile dev chưa.')
    });
  }

  private loadPayment(): void {
    this.orderService.getOrderByCode(this.orderCode, this.contact).subscribe({
      next: (order) => {
        this.order.set(order);
        this.status.set(order.paymentStatus);
        this.loadTransaction(order);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Không thể tải thông tin đơn hàng.');
      }
    });
  }

  private loadTransaction(order: Order): void {
    const contact = this.contact || order.customerEmail || order.customerPhone;
    this.orderService.getOrderPayments(order.orderCode, contact).subscribe({
      next: (payments) => {
        this.payment.set(payments[0] || null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Không thể tải thông tin thanh toán VietQR.');
      }
    });
  }

  private startPolling(): void {
    this.pollingSub = interval(3000).pipe(
      switchMap(() => this.orderService.getPaymentStatus(this.orderCode))
    ).subscribe({
      next: (res) => {
        this.status.set(res.status);
        if (res.status === 'PAID') {
          this.pollingSub?.unsubscribe();
          this.router.navigate(['/payment', this.orderCode, 'success'], {
            queryParams: this.contact ? { contact: this.contact } : undefined
          });
        }
      },
      error: () => {}
    });
  }
}

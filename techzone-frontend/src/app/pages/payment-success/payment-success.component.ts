import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="success-page">
      <section class="success-card">
        <div class="success-icon">
          <i class="pi pi-check"></i>
        </div>
        <h1>Thanh toán thành công</h1>
        <p>Đơn hàng của bạn đã được xác nhận. TechZone sẽ xử lý và giao hàng sớm nhất.</p>

        <div class="success-info" *ngIf="order()">
          <div>
            <span>Mã đơn hàng</span>
            <strong>{{ order()?.orderCode }}</strong>
          </div>
          <div>
            <span>Tổng thanh toán</span>
            <strong class="amount">{{ order()?.totalAmount | number:'1.0-0' }}đ</strong>
          </div>
          <div>
            <span>Trạng thái</span>
            <strong>Đã xác nhận</strong>
          </div>
        </div>

        <div class="actions">
          <a routerLink="/">Tiếp tục mua sắm</a>
          <a routerLink="/cart">Xem giỏ hàng</a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .success-page { display: grid; place-items: center; min-height: 520px; color: #0f172a; font-family: Arial, "Segoe UI", sans-serif; }
    .success-card { width: min(100%, 560px); border: 1px solid #bbf7d0; border-radius: 14px; background: #fff; box-shadow: 0 12px 34px #0f172a12; padding: 34px; text-align: center; }
    .success-icon { display: grid; place-items: center; width: 70px; height: 70px; margin: 0 auto 16px; border-radius: 999px; background: #dcfce7; color: #16a34a; font-size: 34px; }
    h1 { margin: 0; color: #0f172a; font-size: 26px; line-height: 32px; font-weight: 900; text-transform: uppercase; }
    p { margin: 10px auto 0; max-width: 420px; color: #64748b; font-size: 14px; line-height: 22px; }
    .success-info { display: grid; gap: 10px; margin: 24px 0; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; padding: 16px; text-align: left; }
    .success-info div { display: flex; justify-content: space-between; gap: 14px; font-size: 14px; }
    .success-info span { color: #64748b; }
    .success-info strong { color: #0f172a; text-align: right; }
    .success-info .amount { color: #dc001b; }
    .actions { display: flex; justify-content: center; gap: 10px; }
    .actions a { display: inline-flex; align-items: center; justify-content: center; min-width: 150px; height: 42px; border-radius: 8px; background: #dc001b; color: #fff; font-size: 13px; font-weight: 900; text-transform: uppercase; }
    .actions a:last-child { background: #0f172a; }
    @media (max-width: 640px) {
      .success-card { padding: 24px 16px; }
      .actions { flex-direction: column; }
      .actions a { width: 100%; }
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  order = signal<Order | null>(null);

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const orderCode = this.route.snapshot.paramMap.get('orderCode');
    const contact = this.route.snapshot.queryParamMap.get('contact') || undefined;
    if (!orderCode) return;

    this.orderService.getOrderByCode(orderCode, contact).subscribe({
      next: (order) => this.order.set(order),
      error: () => this.order.set(null)
    });
  }
}

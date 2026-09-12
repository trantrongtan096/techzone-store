import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="orders-page">
      <div class="orders-head">
        <div>
          <p>Tài khoản TechZone</p>
          <h1>Lịch sử đặt hàng</h1>
        </div>
        <a routerLink="/products">Tiếp tục mua sắm</a>
      </div>

      <div *ngIf="!authService.currentUser()" class="empty-box">
        <i class="pi pi-user"></i>
        <strong>Bạn cần đăng nhập để xem lịch sử đơn hàng.</strong>
      </div>

      <div *ngIf="authService.currentUser() && loading()" class="empty-box">
        <i class="pi pi-spin pi-spinner"></i>
        <strong>Đang tải đơn hàng...</strong>
      </div>

      <div *ngIf="authService.currentUser() && !loading() && !orders().length" class="empty-box">
        <i class="pi pi-shopping-bag"></i>
        <strong>Bạn chưa có đơn hàng nào.</strong>
      </div>

      <div *ngIf="orders().length" class="orders-list">
        <article *ngFor="let order of orders()" class="order-card">
          <div class="order-top">
            <div>
              <span>Mã đơn</span>
              <strong>{{ order.orderCode }}</strong>
            </div>
            <div class="badges">
              <b>{{ order.orderStatus }}</b>
              <b [class.paid]="order.paymentStatus === 'PAID'">{{ order.paymentStatus }}</b>
            </div>
          </div>

          <div class="order-body">
            <div>
              <span>Người nhận</span>
              <strong>{{ order.customerName }} - {{ order.customerPhone }}</strong>
            </div>
            <div>
              <span>Tổng tiền</span>
              <strong class="amount">{{ order.totalAmount | number:'1.0-0' }}đ</strong>
            </div>
            <div>
              <span>Thanh toán</span>
              <strong>{{ paymentLabel(order.paymentMethod) }}</strong>
            </div>
          </div>

          <div class="items">
            <span *ngFor="let item of order.items">{{ item.productName }} x{{ item.quantity }}</span>
          </div>

          <a *ngIf="order.paymentMethod === 'QR_TRANSFER' && order.paymentStatus === 'PENDING'"
            [routerLink]="['/payment', order.orderCode]"
            [queryParams]="{ contact: order.customerEmail || order.customerPhone }">
            Thanh toán QR
          </a>
        </article>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .orders-page { color: #0f172a; font-family: Arial, "Segoe UI", sans-serif; }
    .orders-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
    .orders-head p { margin: 0 0 4px; color: #dc001b; font-size: 12px; font-weight: 900; text-transform: uppercase; }
    .orders-head h1 { margin: 0; font-size: 26px; font-weight: 900; text-transform: uppercase; }
    .orders-head a, .order-card > a { display: inline-flex; align-items: center; justify-content: center; height: 38px; border-radius: 8px; background: #dc001b; color: #fff; padding: 0 14px; font-size: 12px; font-weight: 900; text-transform: uppercase; }
    .empty-box { display: grid; justify-items: center; gap: 10px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; padding: 42px 16px; color: #64748b; text-align: center; }
    .empty-box .pi { color: #dc001b; font-size: 36px; }
    .empty-box strong { color: #0f172a; }
    .orders-list { display: grid; gap: 12px; }
    .order-card { border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-shadow: 0 4px 16px #0f172a0a; padding: 16px; }
    .order-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; border-bottom: 1px solid #eef2f7; padding-bottom: 12px; }
    .order-top span, .order-body span { display: block; margin-bottom: 4px; color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .order-top strong { color: #dc001b; font-family: Consolas, "Courier New", monospace; }
    .badges { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
    .badges b { border-radius: 999px; background: #fef3c7; color: #b45309; padding: 6px 9px; font-size: 11px; }
    .badges b.paid { background: #dcfce7; color: #15803d; }
    .order-body { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 12px; padding: 12px 0; }
    .order-body strong { font-size: 13px; }
    .order-body .amount { color: #dc001b; font-size: 16px; }
    .items { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .items span { border-radius: 999px; background: #f1f5f9; color: #475569; padding: 5px 9px; font-size: 11px; font-weight: 700; }
    @media (max-width: 767px) {
      .orders-head, .order-top { flex-direction: column; align-items: stretch; }
      .badges { justify-content: flex-start; }
      .order-body { grid-template-columns: 1fr; }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(false);

  constructor(
    public authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    if (!this.authService.currentUser()) return;

    this.loading.set(true);
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders || []);
        this.loading.set(false);
      },
      error: () => {
        this.orders.set([]);
        this.loading.set(false);
      }
    });
  }

  paymentLabel(method: string): string {
    return method === 'QR_TRANSFER' ? 'Chuyển khoản VietQR' : 'Thanh toán khi nhận hàng';
  }
}

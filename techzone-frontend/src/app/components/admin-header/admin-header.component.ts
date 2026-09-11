import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800 animate-fade-in">
      <!-- Left: Title, Icon, Badge & Subtitle -->
      <div class="flex items-start sm:items-center gap-3.5 min-w-0">
        <!-- Glowing Icon Box -->
        <div *ngIf="icon" class="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600/20 via-slate-900 to-slate-950 border border-red-500/40 text-red-400 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-red-950/40">
          <i [class]="icon"></i>
        </div>

        <div class="min-w-0 space-y-1">
          <!-- Breadcrumb (Optional) -->
          <div *ngIf="breadcrumbs && breadcrumbs.length > 0" class="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <a routerLink="/admin/dashboard" class="hover:text-white transition-colors">Admin</a>
            <ng-container *ngFor="let item of breadcrumbs">
              <i class="pi pi-chevron-right text-[9px] text-slate-600"></i>
              <a *ngIf="item.url" [routerLink]="item.url" class="hover:text-white transition-colors">{{ item.label }}</a>
              <span *ngIf="!item.url" class="text-slate-200 font-bold">{{ item.label }}</span>
            </ng-container>
          </div>

          <!-- Title & Optional Badge -->
          <div class="flex items-center gap-2.5 flex-wrap">
            <h2 class="text-2xl font-black text-white uppercase tracking-wide leading-none">
              {{ title }}
            </h2>
            <span *ngIf="badge" class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-500/30">
              {{ badge }}
            </span>
          </div>

          <!-- Subtitle -->
          <p *ngIf="subtitle" class="text-xs text-slate-400 font-medium line-clamp-1">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Right: Action Buttons Projection -->
      <div class="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap w-full md:w-auto justify-end">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class AdminHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() badge?: string;
  @Input() breadcrumbs?: BreadcrumbItem[];
}

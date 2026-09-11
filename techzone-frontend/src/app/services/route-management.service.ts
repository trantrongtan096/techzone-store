import { Injectable, signal } from '@angular/core';

export interface CustomRoute {
  id: string;
  name: string;
  path: string;
  icon: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN';
  target: 'ADMIN_SIDEBAR' | 'CLIENT_HEADER';
  active: boolean;
  isSystem?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RouteManagementService {
  private STORAGE_KEY = 'techzone_custom_routes';

  defaultRoutes: CustomRoute[] = [
    { id: 'sys-1', name: 'Tổng Quan (Dashboard)', path: '/admin/dashboard', icon: 'pi pi-chart-bar', role: 'ROLE_ADMIN', target: 'ADMIN_SIDEBAR', active: true, isSystem: true },
    { id: 'sys-2', name: 'Quản Lý Sản Phẩm', path: '/admin/products', icon: 'pi pi-box', role: 'ROLE_ADMIN', target: 'ADMIN_SIDEBAR', active: true, isSystem: true },
    { id: 'sys-3', name: 'Quản Lý Đơn Hàng', path: '/admin/orders', icon: 'pi pi-shopping-bag', role: 'ROLE_ADMIN', target: 'ADMIN_SIDEBAR', active: true, isSystem: true },
    { id: 'sys-4', name: 'Quản Lý Danh Mục', path: '/admin/categories', icon: 'pi pi-tags', role: 'ROLE_ADMIN', target: 'ADMIN_SIDEBAR', active: true, isSystem: true },
    { id: 'sys-5', name: 'Quản Lý Thương Hiệu', path: '/admin/brands', icon: 'pi pi-briefcase', role: 'ROLE_ADMIN', target: 'ADMIN_SIDEBAR', active: true, isSystem: true },
    { id: 'sys-8', name: 'Quản Lý Banners & Ads', path: '/admin/banners', icon: 'pi pi-images', role: 'ROLE_ADMIN', target: 'ADMIN_SIDEBAR', active: true, isSystem: true },
    { id: 'sys-9', name: 'Chiến Dịch Flash Sale', path: '/admin/flash-sale', icon: 'pi pi-bolt', role: 'ROLE_ADMIN', target: 'ADMIN_SIDEBAR', active: true, isSystem: true },
    { id: 'sys-11', name: 'Quản Lý Trang Chủ (Homepage Builder)', path: '/admin/homepage-builder', icon: 'pi pi-palette', role: 'ROLE_ADMIN', target: 'ADMIN_SIDEBAR', active: true, isSystem: true },
    { id: 'sys-10', name: 'Cấu Hình System & CMS', path: '/admin/settings', icon: 'pi pi-cog', role: 'ROLE_SUPER_ADMIN', target: 'ADMIN_SIDEBAR', active: true, isSystem: true },
    { id: 'sys-6', name: 'Phân Quyền User', path: '/admin/users', icon: 'pi pi-users', role: 'ROLE_SUPER_ADMIN', target: 'ADMIN_SIDEBAR', active: true, isSystem: true },
    { id: 'sys-7', name: 'Quản Lý Đường Dẫn', path: '/admin/routes', icon: 'pi pi-sitemap', role: 'ROLE_SUPER_ADMIN', target: 'ADMIN_SIDEBAR', active: true, isSystem: true }
  ];

  routes = signal<CustomRoute[]>([]);

  constructor() {
    this.loadRoutes();
  }

  loadRoutes(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    let customList: CustomRoute[] = [];
    if (saved) {
      try {
        customList = JSON.parse(saved);
      } catch (e) {
        customList = [];
      }
    }
    this.routes.set([...this.defaultRoutes, ...customList]);
  }

  addCustomRoute(newRouteData: Omit<CustomRoute, 'id' | 'isSystem' | 'active'>): CustomRoute {
    const newRoute: CustomRoute = {
      ...newRouteData,
      id: 'custom-' + Date.now(),
      active: true,
      isSystem: false
    };

    const currentSaved = this.getSavedCustomRoutes();
    currentSaved.push(newRoute);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentSaved));
    this.loadRoutes();
    return newRoute;
  }

  deleteCustomRoute(id: string): void {
    let currentSaved = this.getSavedCustomRoutes();
    currentSaved = currentSaved.filter(r => r.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentSaved));
    this.loadRoutes();
  }

  toggleRouteActive(id: string): void {
    const list = this.routes();
    const target = list.find(r => r.id === id);
    if (target) {
      target.active = !target.active;
      if (!target.isSystem) {
        const currentSaved = this.getSavedCustomRoutes();
        const found = currentSaved.find(r => r.id === id);
        if (found) {
          found.active = target.active;
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentSaved));
        }
      }
      this.routes.set([...list]);
    }
  }

  private getSavedCustomRoutes(): CustomRoute[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  }
}

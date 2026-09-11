import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';

import { adminGuard } from './guards/admin.guard';
import { superAdminGuard } from './guards/super-admin.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { AdminProductListComponent } from './pages/admin/admin-product-list/admin-product-list.component';
import { AdminProductFormComponent } from './pages/admin/admin-product-form/admin-product-form.component';
import { AdminOrderListComponent } from './pages/admin/admin-order-list/admin-order-list.component';
import { AdminCategoryListComponent } from './pages/admin/admin-category-list/admin-category-list.component';
import { AdminBrandListComponent } from './pages/admin/admin-brand-list/admin-brand-list.component';
import { AdminUserListComponent } from './pages/admin/admin-user-list/admin-user-list.component';
import { AdminRouteListComponent } from './pages/admin/admin-route-list/admin-route-list.component';

import { AdminBannerListComponent } from './pages/admin/admin-banner-list/admin-banner-list.component';
import { AdminFlashSaleComponent } from './pages/admin/admin-flash-sale/admin-flash-sale.component';
import { AdminHomepageBuilderComponent } from './pages/admin/admin-homepage-builder/admin-homepage-builder.component';
import { AdminSystemSettingsComponent } from './pages/admin/admin-system-settings/admin-system-settings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:slug', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductListComponent },
      { path: 'products/new', component: AdminProductFormComponent },
      { path: 'products/edit/:id', component: AdminProductFormComponent },
      { path: 'orders', component: AdminOrderListComponent },
      { path: 'categories', component: AdminCategoryListComponent },
      { path: 'brands', component: AdminBrandListComponent },
      { path: 'banners', component: AdminBannerListComponent },
      { path: 'flash-sale', component: AdminFlashSaleComponent },
      { path: 'homepage-builder', component: AdminHomepageBuilderComponent },
      { path: 'settings', component: AdminSystemSettingsComponent, canActivate: [superAdminGuard] },
      { path: 'users', component: AdminUserListComponent, canActivate: [superAdminGuard] },
      { path: 'routes', component: AdminRouteListComponent, canActivate: [superAdminGuard] }
    ]
  },

  { path: '**', redirectTo: '' }
];

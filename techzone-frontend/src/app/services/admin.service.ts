import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('techzone_token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  // Dashboard APIs
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`, { headers: this.getHeaders() });
  }

  getRecentOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard/recent-orders`, { headers: this.getHeaders() });
  }

  getLowStockProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard/low-stock`, { headers: this.getHeaders() });
  }

  // Product APIs
  getAllProducts(
    page: number = 0, 
    size: number = 10, 
    search: string = '', 
    categoryId?: number, 
    brandId?: number, 
    status: string = ''
  ): Observable<any> {
    let params: any = {
      page: page.toString(),
      size: size.toString()
    };
    if (search && search.trim()) params.search = search.trim();
    if (categoryId && categoryId.toString() !== 'null' && categoryId.toString() !== 'undefined') {
      params.categoryId = categoryId.toString();
    }
    if (brandId && brandId.toString() !== 'null' && brandId.toString() !== 'undefined') {
      params.brandId = brandId.toString();
    }
    if (status && status.trim() && status.toString() !== 'null') params.status = status.trim();

    return this.http.get<any>(`${this.baseUrl}/products`, { headers: this.getHeaders(), params });
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  createProduct(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/products`, data, { headers: this.getHeaders() });
  }

  updateProduct(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/products/${id}`, data, { headers: this.getHeaders() });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  bulkDeleteProducts(ids: number[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/products/bulk-delete`, ids, { headers: this.getHeaders() });
  }

  bulkUpdateProducts(payload: { ids: number[]; isActive?: boolean; isFlashSale?: boolean; flashSaleEndTime?: string }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/products/bulk-update`, payload, { headers: this.getHeaders() });
  }

  toggleActiveProduct(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/products/${id}/toggle-active`, {}, { headers: this.getHeaders() });
  }

  private getMultipartHeaders(): HttpHeaders {
    const token = localStorage.getItem('techzone_token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  importProducts(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/products/import`, formData, { headers: this.getMultipartHeaders() });
  }

  uploadImageToCloudinary(file: File, subFolder?: string): Observable<{ url: string; public_id: string; format: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (subFolder) {
      formData.append('subFolder', subFolder);
    }
    return this.http.post<{ url: string; public_id: string; format: string }>(`${this.baseUrl}/cloudinary/upload`, formData, { headers: this.getMultipartHeaders() });
  }

  uploadUrlToCloudinary(url: string, subFolder?: string): Observable<{ url: string; public_id: string; format: string }> {
    return this.http.post<{ url: string; public_id: string; format: string }>(`${this.baseUrl}/cloudinary/upload-url`, { url, subFolder }, { headers: this.getHeaders() });
  }

  // Order APIs
  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders`, { headers: this.getHeaders() });
  }

  updateOrderStatus(id: number, payload: { orderStatus: string; paymentStatus?: string }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/orders/${id}/status`, payload, { headers: this.getHeaders() });
  }

  // Category APIs
  getAllCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories`, { headers: this.getHeaders() });
  }

  createCategory(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/categories`, data, { headers: this.getHeaders() });
  }

  updateCategory(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/categories/${id}`, data, { headers: this.getHeaders() });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categories/${id}`, { headers: this.getHeaders() });
  }

  bulkDeleteCategories(ids: number[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/categories/bulk-delete`, ids, { headers: this.getHeaders() });
  }

  reorderCategories(ids: number[]): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/categories/reorder`, ids, { headers: this.getHeaders() });
  }

  toggleCategoryActive(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/categories/${id}/toggle-active`, {}, { headers: this.getHeaders() });
  }

  // Brand APIs
  getAllBrands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/brands`, { headers: this.getHeaders() });
  }

  createBrand(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/brands`, data, { headers: this.getHeaders() });
  }

  updateBrand(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/brands/${id}`, data, { headers: this.getHeaders() });
  }

  deleteBrand(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/brands/${id}`, { headers: this.getHeaders() });
  }

  bulkDeleteBrands(ids: number[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/brands/bulk-delete`, ids, { headers: this.getHeaders() });
  }

  reorderBrands(ids: number[]): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/brands/reorder`, ids, { headers: this.getHeaders() });
  }

  toggleBrandActive(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/brands/${id}/toggle-active`, {}, { headers: this.getHeaders() });
  }

  toggleBrandFeatured(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/brands/${id}/toggle-featured`, {}, { headers: this.getHeaders() });
  }

  // User & Role Management APIs
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`, { headers: this.getHeaders() });
  }

  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/users/${userId}/role`, { role }, { headers: this.getHeaders() });
  }

  // Banner APIs
  getAllBanners(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/banners`, { headers: this.getHeaders() });
  }

  createBanner(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/banners`, data, { headers: this.getHeaders() });
  }

  updateBanner(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/banners/${id}`, data, { headers: this.getHeaders() });
  }

  toggleBannerActive(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/banners/${id}/toggle`, {}, { headers: this.getHeaders() });
  }

  deleteBanner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/banners/${id}`, { headers: this.getHeaders() });
  }

  // Flash Sale Campaign APIs
  getAllFlashSaleCampaigns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/flash-sale`, { headers: this.getHeaders() });
  }

  createFlashSaleCampaign(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/flash-sale`, data, { headers: this.getHeaders() });
  }

  updateFlashSaleCampaign(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/flash-sale/${id}`, data, { headers: this.getHeaders() });
  }

  toggleFlashSaleActive(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/flash-sale/${id}/toggle`, {}, { headers: this.getHeaders() });
  }

  deleteFlashSaleCampaign(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/flash-sale/${id}`, { headers: this.getHeaders() });
  }

  // System Settings & Showrooms APIs
  getSystemSettings(): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(`${this.baseUrl}/system/settings`, { headers: this.getHeaders() });
  }

  updateSystemSettings(settings: Record<string, string>): Observable<Record<string, string>> {
    return this.http.post<Record<string, string>>(`${this.baseUrl}/system/settings`, settings, { headers: this.getHeaders() });
  }

  getAllShowrooms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/system/showrooms`, { headers: this.getHeaders() });
  }

  createShowroom(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/system/showrooms`, data, { headers: this.getHeaders() });
  }

  updateShowroom(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/system/showrooms/${id}`, data, { headers: this.getHeaders() });
  }

  toggleShowroomActive(id: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/system/showrooms/${id}/toggle`, {}, { headers: this.getHeaders() });
  }

  deleteShowroom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/system/showrooms/${id}`, { headers: this.getHeaders() });
  }
}

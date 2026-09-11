import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  targetUrl: string;
  position: 'HERO_SLIDER' | 'HERO_SIDE_TOP' | 'HERO_SIDE_BOTTOM' | 'FLOATING_LEFT' | 'FLOATING_RIGHT';
  priorityIndex: number;
  isActive: boolean;
  showOverlay?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private baseUrl = 'http://localhost:8080/api/public';

  constructor(private http: HttpClient) {}

  getBannersByPosition(position: string): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.baseUrl}/banners?position=${position}`);
  }

  getCurrentFlashSaleCampaign(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/flash-sale/current`);
  }

  getSystemSettings(): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(`${this.baseUrl}/system/settings`);
  }

  getActiveShowrooms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/system/showrooms`);
  }
}

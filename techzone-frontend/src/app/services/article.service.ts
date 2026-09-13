import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article, ArticleCategory, ArticlePage, ArticlePayload, ArticleStatus, HomepageArticleItem } from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private adminUrl = 'http://localhost:8080/api/admin';
  private publicUrl = 'http://localhost:8080/api/public';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('techzone_token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  getAdminArticles(page = 0, size = 10, search = '', categoryId?: number | null, status?: ArticleStatus | ''): Observable<ArticlePage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search.trim()) params = params.set('search', search.trim());
    if (categoryId) params = params.set('categoryId', categoryId);
    if (status) params = params.set('status', status);
    return this.http.get<ArticlePage>(`${this.adminUrl}/articles`, { headers: this.headers(), params });
  }

  getArticle(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.adminUrl}/articles/${id}`, { headers: this.headers() });
  }

  createArticle(payload: ArticlePayload): Observable<Article> {
    return this.http.post<Article>(`${this.adminUrl}/articles`, payload, { headers: this.headers() });
  }

  updateArticle(id: number, payload: ArticlePayload): Observable<Article> {
    return this.http.put<Article>(`${this.adminUrl}/articles/${id}`, payload, { headers: this.headers() });
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/articles/${id}`, { headers: this.headers() });
  }

  getAdminCategories(): Observable<ArticleCategory[]> {
    return this.http.get<ArticleCategory[]>(`${this.adminUrl}/article-categories`, { headers: this.headers() });
  }

  getPublishedArticles(page = 0, size = 12, search = '', categoryId?: number | null, sort = 'NEWEST'): Observable<ArticlePage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search.trim()) params = params.set('search', search.trim());
    if (categoryId) params = params.set('categoryId', categoryId);
    if (sort) params = params.set('sort', sort);
    return this.http.get<ArticlePage>(`${this.publicUrl}/articles`, { params });
  }

  getPublishedArticle(slug: string): Observable<Article> {
    return this.http.get<Article>(`${this.publicUrl}/articles/${slug}`);
  }

  getPublicCategories(): Observable<ArticleCategory[]> {
    return this.http.get<ArticleCategory[]>(`${this.publicUrl}/article-categories`);
  }

  getHomepageArticleItems(): Observable<HomepageArticleItem[]> {
    return this.http.get<HomepageArticleItem[]>(`${this.adminUrl}/homepage/article-items`, { headers: this.headers() });
  }

  addHomepageArticleItems(articleIds: number[]): Observable<HomepageArticleItem[]> {
    return this.http.post<HomepageArticleItem[]>(`${this.adminUrl}/homepage/article-items`, { articleIds }, { headers: this.headers() });
  }

  toggleHomepageArticleItem(id: number): Observable<HomepageArticleItem> {
    return this.http.put<HomepageArticleItem>(`${this.adminUrl}/homepage/article-items/${id}/toggle`, {}, { headers: this.headers() });
  }

  reorderHomepageArticleItems(ids: number[]): Observable<HomepageArticleItem[]> {
    return this.http.put<HomepageArticleItem[]>(`${this.adminUrl}/homepage/article-items/reorder`, ids, { headers: this.headers() });
  }

  deleteHomepageArticleItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/homepage/article-items/${id}`, { headers: this.headers() });
  }

  getPublicHomepageArticleItems(): Observable<HomepageArticleItem[]> {
    return this.http.get<HomepageArticleItem[]>(`${this.publicUrl}/homepage/article-items`);
  }
}

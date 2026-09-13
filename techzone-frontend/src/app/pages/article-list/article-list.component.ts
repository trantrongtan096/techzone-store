import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Article, ArticleCategory } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <main class="bg-[#f4f6f8] min-h-screen py-10 md:py-12">
      <div class="max-w-7xl mx-auto px-4 space-y-6">
        <div class="border-l-4 border-red-600 pl-5">
          <div class="text-xs text-slate-500 mb-1">
            <a routerLink="/" class="hover:text-red-600">Trang chủ</a>
            <span class="mx-2">/</span>
            <span>Tin tức</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-black uppercase text-slate-900">Tin tức công nghệ</h1>
          <p class="text-sm text-slate-500 mt-1">Cập nhật tin công nghệ, tư vấn mua sắm và review gear mới nhất từ TechZone.</p>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 lg:grid-cols-[1fr_230px_190px_auto] gap-3">
          <input [(ngModel)]="search" (keyup.enter)="loadArticles(0)" placeholder="Tìm bài viết..." class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500" />
          <select [(ngModel)]="categoryId" (change)="loadArticles(0)" class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500">
            <option [ngValue]="null">Tất cả chuyên mục</option>
            <option *ngFor="let c of categories()" [ngValue]="c.id">{{ c.name }}</option>
          </select>
          <select [(ngModel)]="sort" (change)="loadArticles(0)" class="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500">
            <option value="NEWEST">Mới nhất</option>
            <option value="OLDEST">Cũ nhất</option>
            <option value="TITLE_ASC">A → Z</option>
            <option value="TITLE_DESC">Z → A</option>
          </select>
          <button (click)="loadArticles(0)" class="bg-[#E30019] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-black">Tìm kiếm</button>
        </div>

        <div class="flex items-center justify-between text-sm text-slate-500">
          <span>Hiển thị {{ articles().length }} / {{ totalElements() }} bài viết</span>
          <span *ngIf="loading()">Đang tải...</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <article *ngFor="let a of articles()" class="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-red-300 transition-all duration-300">
            <a [routerLink]="['/tin-tuc', a.slug]" class="block overflow-hidden">
              <img [src]="a.thumbnail || fallbackImage" (error)="onImageError($event)" class="w-full aspect-video object-cover bg-slate-100 group-hover:scale-105 transition-transform duration-500" />
            </a>
            <div class="p-5 space-y-3">
              <div class="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span class="px-2.5 py-1 rounded-full bg-red-50 text-red-600 uppercase">{{ a.category.name }}</span>
                <span class="text-slate-400">{{ a.publishedAt | date:'dd/MM/yyyy' }}</span>
                <span class="text-slate-400">• {{ readTime(a) }} phút đọc</span>
              </div>
              <h2 class="text-lg font-black text-slate-900 line-clamp-2 min-h-[3.5rem] leading-snug">
                <a [routerLink]="['/tin-tuc', a.slug]" class="hover:text-red-600">{{ a.title }}</a>
              </h2>
              <p class="text-sm text-slate-500 line-clamp-3 min-h-[4rem]">{{ a.excerpt || plainText(a.content) }}</p>
              <a [routerLink]="['/tin-tuc', a.slug]" class="inline-flex text-sm font-black text-red-600 hover:text-red-700">Đọc bài viết →</a>
            </div>
          </article>
        </div>

        <div *ngIf="!loading() && articles().length === 0" class="bg-white rounded-2xl p-10 text-center text-slate-500">Chưa có bài viết đã xuất bản.</div>

        <div *ngIf="totalPages() > 1" class="flex justify-center items-center gap-2 pt-2">
          <button (click)="loadArticles(page() - 1)" [disabled]="page() === 0" class="px-4 py-2 bg-white border border-slate-200 rounded-xl disabled:opacity-40 font-bold hover:border-red-400">Trước</button>
          <button *ngFor="let p of visiblePages()" (click)="loadArticles(p)" [class]="p === page() ? 'px-4 py-2 bg-white border-2 border-slate-900 rounded-xl font-black text-slate-900' : 'px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold hover:border-red-400 hover:text-red-600'">
            {{ p + 1 }}
          </button>
          <button (click)="loadArticles(page() + 1)" [disabled]="page() + 1 >= totalPages()" class="px-4 py-2 bg-white border border-slate-200 rounded-xl disabled:opacity-40 font-bold hover:border-red-400">Sau</button>
        </div>
      </div>
    </main>
  `
})
export class ArticleListComponent implements OnInit {
  articles = signal<Article[]>([]);
  categories = signal<ArticleCategory[]>([]);
  loading = signal(false);
  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  search = '';
  categoryId: number | null = null;
  sort = 'NEWEST';
  fallbackImage = 'assets/placeholder-product.svg';

  constructor(private articleService: ArticleService) {}

  ngOnInit(): void {
    this.articleService.getPublicCategories().subscribe(categories => this.categories.set(categories));
    this.loadArticles();
  }

  loadArticles(page = 0): void {
    if (page < 0) return;
    this.loading.set(true);
    this.articleService.getPublishedArticles(page, 9, this.search, this.categoryId, this.sort).subscribe({
      next: res => {
        this.articles.set(res.content || []);
        this.page.set(res.number || 0);
        this.totalPages.set(res.totalPages || 0);
        this.totalElements.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  visiblePages(): number[] {
    const total = this.totalPages();
    const current = this.page();
    const start = Math.max(0, Math.min(current - 2, total - 5));
    const end = Math.min(total, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  readTime(article: Article): number {
    const text = `${article.title || ''} ${article.excerpt || ''} ${this.plainText(article.content || '')}`.trim();
    return Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 120));
  }

  plainText(html?: string | null): string {
    return this.decodeEscapedHtml(html || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private decodeEscapedHtml(value: string): string {
    return value
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.fallbackImage;
  }
}

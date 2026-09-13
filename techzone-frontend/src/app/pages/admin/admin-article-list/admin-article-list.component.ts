import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Article, ArticleCategory, ArticlePayload, ArticleStatus } from '../../../models/article.model';
import { ArticleService } from '../../../services/article.service';

@Component({
  selector: 'app-admin-article-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div *ngIf="toastMessage()"
      [class.bg-emerald-600]="toastMessage()?.type === 'success'"
      [class.bg-red-600]="toastMessage()?.type === 'error'"
      class="fixed top-6 right-6 z-50 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
      <i [class]="toastMessage()?.type === 'success' ? 'pi pi-check-circle text-xl' : 'pi pi-exclamation-triangle text-xl'"></i>
      <span class="text-xs font-bold">{{ toastMessage()?.text }}</span>
    </div>

    <div class="space-y-6 animate-fade-in text-slate-100">
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div class="text-xs text-slate-400 mb-1">Admin › Blog</div>
          <h2 class="text-2xl font-black text-white uppercase tracking-wide">Quản lý bài viết</h2>
          <p class="text-xs text-slate-400 mt-1">Tạo nháp, xuất bản và quản lý tin tức công nghệ của TechZone.</p>
        </div>
        <a routerLink="/admin/articles/new" class="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl text-xs font-black shadow-lg shadow-red-900/30">
          <i class="pi pi-plus"></i> Viết bài mới
        </a>
      </div>

      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-[1fr_220px_180px_auto] gap-3">
          <div class="relative">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
            <input [(ngModel)]="search" (keyup.enter)="loadArticles(0)" placeholder="Tìm tiêu đề bài viết..." class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500" />
          </div>
          <select [(ngModel)]="categoryId" (change)="loadArticles(0)" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
            <option [ngValue]="null">Tất cả chuyên mục</option>
            <option *ngFor="let c of categories()" [ngValue]="c.id">{{ c.name }}</option>
          </select>
          <select [(ngModel)]="status" (change)="loadArticles(0)" class="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500">
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="ARCHIVED">Lưu trữ</option>
          </select>
          <button (click)="loadArticles(0)" class="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold">Tìm kiếm</button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th class="text-left py-3 px-3">Bài viết</th>
                <th class="text-left py-3 px-3">Chuyên mục</th>
                <th class="text-left py-3 px-3">Trạng thái</th>
                <th class="text-left py-3 px-3">Ngày xuất bản</th>
                <th class="text-right py-3 px-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of articles()" class="border-b border-slate-800/70 hover:bg-slate-900/50">
                <td class="py-3 px-3">
                  <div class="flex items-center gap-3 min-w-[320px]">
                    <img [src]="a.thumbnail || fallbackImage" class="w-16 h-12 rounded-lg object-cover bg-slate-800" />
                    <div class="min-w-0">
                      <div class="font-black text-white line-clamp-1">{{ a.title }}</div>
                      <div class="text-slate-500 font-mono line-clamp-1">/{{ a.slug }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3 text-slate-300">{{ a.category.name }}</td>
                <td class="py-3 px-3">
                  <span [ngClass]="statusClass(a.status)" class="px-2 py-1 rounded-full border font-black">{{ statusLabel(a.status) }}</span>
                </td>
                <td class="py-3 px-3 text-slate-400">
                  <ng-container *ngIf="a.status === 'PUBLISHED' && a.publishedAt; else unpublishedDate">
                    {{ a.publishedAt | date:'dd/MM/yyyy HH:mm' }}
                  </ng-container>
                  <ng-template #unpublishedDate>—</ng-template>
                </td>
                <td class="py-3 px-3">
                  <div class="flex justify-end gap-2">
                    <a *ngIf="a.status === 'PUBLISHED'" [routerLink]="['/tin-tuc', a.slug]" target="_blank" title="Xem bài"
                      class="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300">
                      <i class="pi pi-eye"></i>
                    </a>
                    <a *ngIf="a.status !== 'PUBLISHED'" [routerLink]="['/admin/articles', a.id, 'edit']" title="Preview"
                      class="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300">
                      <i class="pi pi-search"></i>
                    </a>
                    <a [routerLink]="['/admin/articles', a.id, 'edit']" title="Sửa"
                      class="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/40">
                      <i class="pi pi-pencil"></i>
                    </a>
                    <button *ngIf="a.status !== 'PUBLISHED'" (click)="publishArticle(a)" [disabled]="updatingId() === a.id" title="Xuất bản"
                      class="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/40 disabled:opacity-50">
                      <i class="pi pi-send"></i>
                    </button>
                    <button *ngIf="a.status === 'PUBLISHED'" (click)="unpublishArticle(a)" [disabled]="updatingId() === a.id" title="Gỡ xuất bản"
                      class="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/40 disabled:opacity-50">
                      <i class="pi pi-undo"></i>
                    </button>
                    <button (click)="requestDelete(a)" title="Xóa"
                      class="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/40">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!loading() && articles().length === 0">
                <td colspan="5" class="py-10 text-center text-slate-500">Chưa có bài viết phù hợp.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span class="text-xs text-slate-500">Tổng {{ totalElements() }} bài viết</span>
          <div class="flex items-center gap-2">
            <button (click)="loadArticles(page() - 1)" [disabled]="page() === 0" class="px-3 py-2 rounded-lg bg-slate-800 disabled:opacity-40 text-xs font-bold">Trước</button>
            <span class="px-3 py-2 rounded-lg border border-slate-700 text-xs font-black">{{ page() + 1 }} / {{ totalPages() || 1 }}</span>
            <button (click)="loadArticles(page() + 1)" [disabled]="page() + 1 >= totalPages()" class="px-3 py-2 rounded-lg bg-slate-800 disabled:opacity-40 text-xs font-bold">Sau</button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="deleteTarget()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div class="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#111827] shadow-2xl">
        <div class="p-5 border-b border-slate-800 flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-red-500/10 text-red-300 border border-red-500/30 flex items-center justify-center">
            <i class="pi pi-exclamation-triangle text-lg"></i>
          </div>
          <div>
            <h3 class="text-sm font-black text-white uppercase tracking-wider">Xác nhận xóa bài viết</h3>
            <p class="text-xs text-slate-400 mt-1">Thao tác này sẽ xóa bài viết khỏi hệ thống.</p>
          </div>
        </div>
        <div class="p-5 space-y-4">
          <p class="text-sm text-slate-300">Bạn có chắc muốn xóa bài viết <span class="font-black text-white">"{{ deleteTarget()?.title }}"</span>?</p>
          <div class="flex justify-end gap-3">
            <button (click)="deleteTarget.set(null)" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold">Hủy</button>
            <button (click)="confirmDelete()" [disabled]="deleting()" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-black">
              {{ deleting() ? 'Đang xóa...' : 'Xác nhận xóa' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminArticleListComponent implements OnInit {
  articles = signal<Article[]>([]);
  categories = signal<ArticleCategory[]>([]);
  loading = signal(false);
  deleting = signal(false);
  updatingId = signal<number | null>(null);
  deleteTarget = signal<Article | null>(null);
  toastMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  search = '';
  categoryId: number | null = null;
  status: ArticleStatus | '' = '';
  fallbackImage = 'assets/placeholder-product.svg';

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.articleService.getAdminCategories().subscribe(c => this.categories.set(c));
    this.route.queryParams.subscribe(params => {
      if (params['success'] === 'draft') this.showToast('Đã lưu nháp bài viết thành công.');
      if (params['success'] === 'published') this.showToast('Xuất bản bài viết thành công.');
      if (params['success']) this.router.navigate([], { queryParams: { success: null }, queryParamsHandling: 'merge', replaceUrl: true });
    });
    this.loadArticles();
  }

  loadArticles(page = this.page()): void {
    if (page < 0) return;
    this.loading.set(true);
    this.articleService.getAdminArticles(page, 10, this.search, this.categoryId, this.status).subscribe({
      next: res => {
        this.articles.set(res.content || []);
        this.page.set(res.number || 0);
        this.totalPages.set(res.totalPages || 0);
        this.totalElements.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showToast('Không thể tải danh sách bài viết.', 'error');
      }
    });
  }

  publishArticle(article: Article): void {
    if (!this.stripHtml(article.content || '').trim()) {
      this.showToast('Nội dung là bắt buộc khi xuất bản.', 'error');
      return;
    }
    this.updateStatus(article, 'PUBLISHED', 'Xuất bản bài viết thành công.');
  }

  unpublishArticle(article: Article): void {
    this.updateStatus(article, 'DRAFT', 'Đã chuyển bài viết về trạng thái nháp.');
  }

  requestDelete(article: Article): void {
    this.deleteTarget.set(article);
  }

  confirmDelete(): void {
    const article = this.deleteTarget();
    if (!article) return;
    this.deleting.set(true);
    this.articleService.deleteArticle(article.id).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.deleting.set(false);
        this.showToast(`Đã xóa bài viết "${article.title}" thành công.`);
        this.loadArticles(this.page());
      },
      error: () => {
        this.deleting.set(false);
        this.showToast('Không thể xóa bài viết. Vui lòng thử lại.', 'error');
      }
    });
  }

  statusLabel(status: ArticleStatus): string {
    return status === 'PUBLISHED' ? 'Đã xuất bản' : status === 'ARCHIVED' ? 'Lưu trữ' : 'Nháp';
  }

  statusClass(status: ArticleStatus): string {
    if (status === 'PUBLISHED') return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40';
    if (status === 'ARCHIVED') return 'bg-slate-500/10 text-slate-300 border-slate-500/40';
    return 'bg-amber-500/10 text-amber-300 border-amber-500/40';
  }

  private updateStatus(article: Article, status: ArticleStatus, successMessage: string): void {
    this.updatingId.set(article.id);
    this.articleService.updateArticle(article.id, this.toPayload(article, status)).subscribe({
      next: updated => {
        this.articles.set(this.articles().map(item => item.id === updated.id ? updated : item));
        this.updatingId.set(null);
        this.showToast(successMessage);
      },
      error: err => {
        this.updatingId.set(null);
        this.showToast(err?.error?.message || err?.error || 'Không thể cập nhật trạng thái bài viết.', 'error');
      }
    });
  }

  private toPayload(article: Article, status: ArticleStatus): ArticlePayload {
    return {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || '',
      content: article.content || '',
      thumbnail: article.thumbnail || '',
      categoryId: article.category.id,
      status,
      seoTitle: article.seoTitle || '',
      seoDescription: article.seoDescription || ''
    };
  }

  private showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  private stripHtml(value: string): string {
    return value.replace(/<[^>]*>/g, '');
  }
}

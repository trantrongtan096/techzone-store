import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EditorModule } from 'primeng/editor';
import { ArticleCategory, ArticlePayload, ArticleStatus } from '../../../models/article.model';
import { AdminService } from '../../../services/admin.service';
import { ArticleService } from '../../../services/article.service';

@Component({
  selector: 'app-admin-article-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EditorModule],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in text-slate-100">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div class="text-xs text-slate-400 mb-1">Admin › Blog</div>
          <h2 class="text-2xl font-black text-white uppercase tracking-wide">{{ isEditMode() ? 'Chỉnh sửa bài viết' : 'Viết bài mới' }}</h2>
          <p class="text-xs text-slate-400 mt-1">Lưu nháp hoặc xuất bản bài viết cho trang Tin tức TechZone.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" (click)="preview()" [disabled]="!canPreview()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-xs font-bold">Xem trước</button>
          <a routerLink="/admin/articles" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold">Quay lại</a>
        </div>
      </div>

      <form class="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5" (ngSubmit)="save('DRAFT')">
        <div *ngIf="error()" class="rounded-xl border border-red-500/40 bg-red-950/30 text-red-200 px-4 py-3 text-xs font-bold">{{ error() }}</div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div class="lg:col-span-2 space-y-5">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tiêu đề *</label>
              <input [(ngModel)]="form.title" name="title" (ngModelChange)="onTitleChange()" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 font-bold" placeholder="VD: Top 5 Laptop Gaming RTX 40" />
            </div>

            <div>
              <div class="flex items-center justify-between gap-3 mb-1">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">Slug (URL) *</label>
                <button type="button" (click)="regenerateSlug()" class="text-[11px] font-bold text-red-400 hover:text-red-300">Tạo lại slug</button>
              </div>
              <input [(ngModel)]="form.slug" name="slug" (ngModelChange)="slugTouched = true; form.slug = slugify(form.slug)" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 font-mono" />
            </div>

            <div>
              <div class="flex items-center justify-between gap-3 mb-1">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">Tóm tắt</label>
                <span class="text-[11px]" [ngClass]="charCount(form.excerpt) > 180 ? 'text-red-300' : 'text-slate-500'">{{ charCount(form.excerpt) }}/180</span>
              </div>
              <textarea [(ngModel)]="form.excerpt" name="excerpt" maxlength="220" rows="3" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500" placeholder="Mô tả ngắn hiển thị trên danh sách bài viết..."></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Nội dung bài viết</label>
              <p-editor [(ngModel)]="form.content" name="content" [style]="{ height: '420px' }">
                <ng-template pTemplate="header">
                  <span class="ql-formats">
                    <select class="ql-header">
                      <option value="2">H2</option>
                      <option value="3">H3</option>
                      <option selected></option>
                    </select>
                  </span>
                  <span class="ql-formats">
                    <button type="button" class="ql-bold"></button>
                    <button type="button" class="ql-italic"></button>
                    <button type="button" class="ql-underline"></button>
                    <button type="button" class="ql-code-block"></button>
                  </span>
                  <span class="ql-formats">
                    <button type="button" class="ql-list" value="ordered"></button>
                    <button type="button" class="ql-list" value="bullet"></button>
                    <button type="button" class="ql-blockquote"></button>
                  </span>
                  <span class="ql-formats">
                    <button type="button" class="ql-link"></button>
                    <button type="button" class="ql-image"></button>
                  </span>
                </ng-template>
              </p-editor>
              <p class="text-[11px] text-slate-500 mt-2">Có thể lưu nháp khi chưa nhập nội dung. Khi xuất bản thì nội dung là bắt buộc.</p>
            </div>
          </div>

          <div class="space-y-5">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Chuyên mục *</label>
              <select [(ngModel)]="form.categoryId" name="categoryId" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500">
                <option [ngValue]="null" disabled>Chọn chuyên mục</option>
                <option *ngFor="let c of categories()" [ngValue]="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Thumbnail</label>
              <div class="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-3">
                <img [src]="thumbnailPreview || form.thumbnail || fallbackImage" class="w-full aspect-video rounded-xl object-cover bg-slate-900" />
                <p class="text-[11px] text-slate-500">Khuyến nghị 1200x630, JPG/PNG/WebP, tối đa 5MB.</p>
                <input type="file" accept="image/*" (change)="onThumbnailSelected($event)" class="block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" />
                <input [(ngModel)]="form.thumbnail" name="thumbnail" placeholder="Hoặc dán URL ảnh..." class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500" />
                <p *ngIf="uploading()" class="text-[11px] text-amber-300">Đang upload ảnh...</p>
                <p *ngIf="thumbnailError()" class="text-[11px] text-red-300 font-semibold">{{ thumbnailError() }}</p>
                <p *ngIf="thumbnailPreview && !form.thumbnail" class="text-[11px] text-amber-300">Ảnh đang chỉ là preview tạm. Cần upload thành công để lưu URL thật.</p>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between gap-3 mb-1">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">SEO Title</label>
                <span class="text-[11px]" [ngClass]="charCount(form.seoTitle) > 60 ? 'text-red-300' : 'text-slate-500'">{{ charCount(form.seoTitle) }}/60</span>
              </div>
              <input [(ngModel)]="form.seoTitle" name="seoTitle" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500" />
            </div>

            <div>
              <div class="flex items-center justify-between gap-3 mb-1">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">SEO Description</label>
                <span class="text-[11px]" [ngClass]="charCount(form.seoDescription) > 160 ? 'text-red-300' : 'text-slate-500'">{{ charCount(form.seoDescription) }}/160</span>
              </div>
              <textarea [(ngModel)]="form.seoDescription" name="seoDescription" rows="4" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500"></textarea>
            </div>

            <div class="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <div class="text-xs font-bold text-slate-400 uppercase mb-2">Trạng thái hiện tại</div>
              <span class="px-3 py-1 rounded-full border text-xs font-black" [ngClass]="form.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/10 text-amber-300 border-amber-500/40'">{{ form.status === 'PUBLISHED' ? 'Đã xuất bản' : form.status === 'ARCHIVED' ? 'Lưu trữ' : 'Nháp' }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-800">
          <button type="button" (click)="save('DRAFT')" [disabled]="saving()" class="px-5 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl text-xs font-black border border-slate-700">Lưu nháp</button>
          <button type="button" (click)="save('PUBLISHED')" [disabled]="saving()" class="px-5 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl text-xs font-black text-white shadow-lg shadow-red-900/30">Xuất bản</button>
        </div>
      </form>
    </div>
  `
})
export class AdminArticleFormComponent implements OnInit {
  categories = signal<ArticleCategory[]>([]);
  saving = signal(false);
  uploading = signal(false);
  error = signal('');
  thumbnailError = signal('');
  articleId: number | null = null;
  slugTouched = false;
  thumbnailPreview = '';
  fallbackImage = 'assets/placeholder-product.svg';
  form: ArticlePayload = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    thumbnail: '',
    categoryId: null,
    status: 'DRAFT',
    seoTitle: '',
    seoDescription: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private adminService: AdminService
  ) {}

  isEditMode(): boolean {
    return !!this.articleId;
  }

  ngOnInit(): void {
    this.error.set('');
    this.thumbnailError.set('');
    this.thumbnailPreview = '';
    this.articleService.getAdminCategories().subscribe(c => this.categories.set(c));
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.articleId = id;
      this.articleService.getArticle(id).subscribe(article => {
        this.form = {
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || '',
          content: article.content || '',
          thumbnail: article.thumbnail || '',
          categoryId: article.category?.id || null,
          status: article.status,
          seoTitle: article.seoTitle || '',
          seoDescription: article.seoDescription || ''
        };
        this.slugTouched = true;
      });
    }
  }

  onTitleChange(): void {
    if (!this.slugTouched) this.form.slug = this.slugify(this.form.title);
  }

  regenerateSlug(): void {
    this.form.slug = this.slugify(this.form.title);
    this.slugTouched = true;
  }

  charCount(value?: string): number {
    return (value || '').length;
  }

  canPreview(): boolean {
    return !!this.form.title.trim() && !!this.stripHtml(this.form.content || '').trim() && !!this.form.slug;
  }

  slugify(value: string): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  save(status: ArticleStatus): void {
    this.error.set('');
    const payload = { ...this.form, status, slug: this.slugify(this.form.slug || this.form.title) };
    if (!payload.title.trim()) return this.error.set('Tiêu đề bài viết là bắt buộc.');
    if (!payload.categoryId) return this.error.set('Vui lòng chọn chuyên mục.');
    if (status === 'PUBLISHED' && !this.stripHtml(payload.content || '').trim()) {
      return this.error.set('Nội dung là bắt buộc khi xuất bản.');
    }

    this.saving.set(true);
    const request = this.articleId
      ? this.articleService.updateArticle(this.articleId, payload)
      : this.articleService.createArticle(payload);
    request.subscribe({
      next: () => this.router.navigate(['/admin/articles'], {
        queryParams: { success: status === 'PUBLISHED' ? 'published' : 'draft' }
      }),
      error: err => {
        this.error.set(err?.error?.message || err?.error || 'Không thể lưu bài viết. Vui lòng kiểm tra dữ liệu.');
        this.saving.set(false);
      }
    });
  }

  preview(): void {
    if (this.canPreview()) {
      window.open(`/tin-tuc/${this.form.slug}`, '_blank');
    }
  }

  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (this.error().toLowerCase().includes('thumbnail') || this.error().toLowerCase().includes('upload ảnh')) {
      this.error.set('');
    }
    this.thumbnailError.set('');
    this.thumbnailPreview = '';

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.thumbnailError.set('Thumbnail chỉ hỗ trợ JPG, PNG hoặc WebP.');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.thumbnailError.set('Thumbnail tối đa 5MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.thumbnailPreview = String(reader.result || '');
    };
    reader.readAsDataURL(file);

    this.uploading.set(true);
    this.adminService.uploadImageToCloudinary(file, 'articles').subscribe({
      next: res => {
        const uploadedUrl = this.extractUploadUrl(res);
        if (!uploadedUrl) {
          this.thumbnailError.set('Upload thành công nhưng server không trả về URL ảnh.');
          this.uploading.set(false);
          return;
        }
        this.form.thumbnail = uploadedUrl;
        this.thumbnailPreview = '';
        this.thumbnailError.set('');
        if (this.error().toLowerCase().includes('thumbnail') || this.error().toLowerCase().includes('upload ảnh')) {
          this.error.set('');
        }
        this.uploading.set(false);
      },
      error: err => {
        this.thumbnailError.set(this.getUploadErrorMessage(err));
        this.uploading.set(false);
      }
    });
  }

  private extractUploadUrl(res: any): string {
    return String(res?.url || res?.secure_url || res?.secureUrl || '').trim();
  }

  private getUploadErrorMessage(err: any): string {
    if (err?.status === 413) return 'Ảnh không được vượt quá 5MB.';
    const raw = err?.error;
    if (typeof raw === 'string' && raw.trim()) return raw;
    if (raw?.message) return raw.message;
    if (err?.message) return err.message;
    return 'Không thể upload ảnh thumbnail.';
  }

  private stripHtml(value: string): string {
    return value.replace(/<[^>]*>/g, '');
  }
}

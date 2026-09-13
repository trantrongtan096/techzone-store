import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RichTextHeading, RichTextRendererComponent } from '../../components/rich-text-renderer/rich-text-renderer.component';
import { Article } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';

type TocItem = RichTextHeading;

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, RichTextRendererComponent],
  template: `
    <main class="bg-[#f4f6f8] min-h-screen py-10 md:py-12">
      <article *ngIf="article() as a" class="max-w-6xl mx-auto px-4">
        <div class="mb-5 text-[13px] md:text-sm font-semibold text-slate-600">
          <a routerLink="/" class="hover:text-red-600">Trang chủ</a>
          <span class="mx-2">/</span>
          <a routerLink="/tin-tuc" class="hover:text-red-600">Tin tức</a>
          <span class="mx-2">/</span>
          <span class="text-slate-800">{{ a.title }}</span>
        </div>

        <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <img [src]="a.thumbnail || fallbackImage" (error)="onImageError($event)" class="w-full aspect-[16/7] object-cover bg-slate-100" />
          <div class="max-w-[850px] mx-auto px-5 py-7 md:px-8 md:py-10">
            <a routerLink="/tin-tuc" class="inline-flex mb-5 text-sm font-bold text-red-600 hover:text-red-700">← Quay lại tin tức</a>
            <div class="flex flex-wrap items-center gap-2 text-xs font-bold mb-4">
              <span class="px-2.5 py-1 rounded-full bg-red-50 text-red-600 uppercase">{{ a.category.name }}</span>
              <span class="text-slate-400">{{ a.publishedAt | date:'dd/MM/yyyy HH:mm' }}</span>
              <span class="text-slate-400">• {{ readTime(a) }} phút đọc</span>
            </div>
            <h1 class="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4">{{ a.title }}</h1>
            <p *ngIf="a.excerpt" class="text-lg md:text-xl text-slate-500 leading-relaxed mb-7">{{ a.excerpt }}</p>

            <nav *ngIf="tableOfContents().length >= 3" class="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 class="text-sm font-black uppercase tracking-wide text-slate-900 mb-3">Mục lục</h2>
              <ol class="space-y-2 text-sm text-slate-600">
                <li *ngFor="let item of tableOfContents()" [class.pl-4]="item.level === 3">
                  <button type="button" (click)="scrollToHeading(item.id)" [class]="activeHeadingId() === item.id ? 'text-left font-black text-red-600 transition-colors' : 'text-left font-bold hover:text-red-600 transition-colors'">
                    {{ item.text }}
                  </button>
                </li>
              </ol>
            </nav>

            <app-rich-text-renderer [content]="a.content || ''" [title]="a.title" (headingsReady)="onHeadingsReady($event)"></app-rich-text-renderer>

            <div class="mt-8 border-t border-slate-200 pt-5">
              <div class="text-sm font-black uppercase text-slate-900 mb-3">Chia sẻ bài viết</div>
              <div class="flex flex-wrap gap-3">
                <a [href]="facebookShareUrl()" target="_blank" rel="noopener" class="inline-flex items-center justify-center rounded-xl bg-[#1877F2] px-5 py-3 text-sm font-black text-white hover:opacity-90">
                  Facebook
                </a>
                <button type="button" (click)="copyLink()" class="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-red-600">
                  {{ copied() ? 'Đã copy link' : 'Copy link' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <section class="mt-8 border-t border-slate-200 pt-6">
          <div class="border-l-4 border-red-600 pl-4 mb-5">
            <h2 class="text-2xl font-black uppercase text-slate-900">Có thể bạn quan tâm</h2>
            <p class="text-sm text-slate-500">Các bài viết cùng chuyên mục có thể bạn quan tâm.</p>
          </div>
          <div *ngIf="related().length" class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <a *ngFor="let r of related()" [routerLink]="['/tin-tuc', r.slug]" class="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-red-300 transition-all">
              <div class="overflow-hidden">
                <img [src]="r.thumbnail || fallbackImage" (error)="onImageError($event)" class="w-full aspect-video object-cover bg-slate-100 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div class="p-4">
                <div class="text-xs font-black text-red-600 uppercase mb-2">{{ r.category.name }}</div>
                <h3 class="font-black text-sm text-slate-900 line-clamp-2 group-hover:text-red-600">{{ r.title }}</h3>
              </div>
            </a>
          </div>
          <div class="text-center mt-6">
            <a routerLink="/tin-tuc" class="inline-flex items-center justify-center px-7 py-3.5 rounded-2xl bg-[#E30019] text-sm font-black text-white shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-xl transition-all">
              Xem tất cả tin tức →
            </a>
          </div>
        </section>
      </article>
    </main>
  `
})
export class ArticleDetailComponent implements OnInit {
  article = signal<Article | null>(null);
  related = signal<Article[]>([]);
  tableOfContents = signal<TocItem[]>([]);
  activeHeadingId = signal('');
  copied = signal(false);
  fallbackImage = 'assets/placeholder-product.svg';

  constructor(private route: ActivatedRoute, private articleService: ArticleService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) return;
      this.articleService.getPublishedArticle(slug).subscribe(article => {
        this.article.set(article);
        this.tableOfContents.set([]);
        this.activeHeadingId.set('');
        this.loadRelatedArticles(article);
      });
    });
  }

  @HostListener('window:scroll')
  updateActiveHeading(): void {
    const toc = this.tableOfContents();
    if (!toc.length) return;

    const headings = toc
      .map(item => ({
        ...item,
        top: document.getElementById(item.id)?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
      }))
      .filter(item => Number.isFinite(item.top));

    if (!headings.length) return;

    const current = headings.filter(item => item.top <= 150).pop() || headings[0];
    this.activeHeadingId.set(current.id);
  }

  loadRelatedArticles(article: Article): void {
    this.articleService.getPublishedArticles(0, 4, '', article.category.id, 'NEWEST').subscribe(res => {
      this.related.set((res.content || []).filter(item => item.id !== article.id).slice(0, 3));
    });
  }

  scrollToHeading(id: string): void {
    const heading = document.getElementById(id);
    if (!heading) return;
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.activeHeadingId.set(id);
  }

  onHeadingsReady(headings: RichTextHeading[]): void {
    this.tableOfContents.set(headings);
    this.activeHeadingId.set(headings[0]?.id || '');
    setTimeout(() => this.updateActiveHeading(), 80);
  }

  copyLink(): void {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    });
  }

  facebookShareUrl(): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
  }

  readTime(article: Article): number {
    const text = `${article.title || ''} ${article.excerpt || ''} ${this.plainText(article.content || '')}`.trim();
    return Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 120));
  }

  private plainText(html?: string | null): string {
    return this.normalizeHtml(html || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractTableOfContents(article: Article): TocItem[] {
    const content = this.normalizeHtml(article.content || '');
    const titleText = this.normalizeForCompare(article.title);
    const usedIds = new Set<string>();
    const headings = [...content.matchAll(/<h([23])[^>]*>(.*?)<\/h[23]>/gis)];

    return headings
      .map(match => {
        const rawText = this.normalizeText(String(match[2]).replace(/<[^>]*>/g, ' '));
        const text = this.stripHeadingNumber(rawText);
        return {
          id: this.uniqueHeadingId(this.slugify(text), usedIds),
          text,
          level: Number(match[1])
        };
      })
      .filter(item => item.text && this.normalizeForCompare(item.text) !== titleText)
      .slice(0, 8);
  }

  private uniqueHeadingId(base: string, usedIds: Set<string>): string {
    const safeBase = base || 'section';
    let id = safeBase;
    let index = 2;
    while (usedIds.has(id)) {
      id = `${safeBase}-${index}`;
      index += 1;
    }
    usedIds.add(id);
    return id;
  }

  private stripHeadingNumber(value: string): string {
    return value.replace(/^\s*\d+[\.)]\s*/, '').trim();
  }

  private slugify(value: string): string {
    return this.stripHeadingNumber(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private normalizeHtml(html: string): string {
    return html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  private normalizeText(value: string): string {
    return (value || '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeForCompare(value: string): string {
    return this.stripHeadingNumber(this.normalizeText(value)).toLocaleLowerCase('vi-VN');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.fallbackImage;
  }
}

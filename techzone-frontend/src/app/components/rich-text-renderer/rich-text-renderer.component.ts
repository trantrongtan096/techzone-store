import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SecurityContext,
  ViewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export interface RichTextHeading {
  id: string;
  text: string;
  level: number;
}

@Component({
  selector: 'app-rich-text-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ql-snow rich-text-renderer">
      <div #editor class="ql-editor techzone-rich-text" [innerHTML]="safeHtml"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .rich-text-renderer {
      border: 0;
      background: transparent;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor {
      padding: 0;
      min-height: auto;
      color: #1e293b;
      font-size: 16px;
      line-height: 1.8;
      white-space: normal;
      word-break: normal;
      overflow-wrap: break-word;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor * {
      word-break: normal;
      overflow-wrap: break-word;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor h1 {
      font-size: 30px;
      line-height: 1.25;
      font-weight: 900;
      color: #0f172a;
      margin: 32px 0 16px;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor h2 {
      font-size: 24px;
      line-height: 1.3;
      font-weight: 800;
      color: #0f172a;
      margin: 32px 0 16px;
      scroll-margin-top: 110px;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor h3 {
      font-size: 20px;
      line-height: 1.35;
      font-weight: 700;
      color: #0f172a;
      margin: 24px 0 12px;
      scroll-margin-top: 110px;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor p {
      font-size: 16px;
      line-height: 1.8;
      margin: 0 0 16px;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor strong {
      font-weight: 800;
      color: #0f172a;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor u {
      text-underline-offset: 3px;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor ul,
    :host ::ng-deep .techzone-rich-text.ql-editor ol {
      padding-left: 28px !important;
      margin: 14px 0 18px !important;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor ul {
      list-style: none !important;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor ol {
      list-style: none !important;
      counter-reset: techzone-list-counter;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor li {
      display: block !important;
      position: relative !important;
      list-style-position: outside !important;
      margin-bottom: 10px !important;
      line-height: 1.7 !important;
      padding-left: 1.35rem !important;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor li::marker {
      color: #e60023;
      font-weight: 800;
      font-size: 0.9em;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor li::before {
      display: none !important;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor ul > li::before,
    :host ::ng-deep .techzone-rich-text.ql-editor li[data-list="bullet"] {
      list-style: none !important;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor ul > li::before,
    :host ::ng-deep .techzone-rich-text.ql-editor li[data-list="bullet"]::before {
      content: '•' !important;
      display: block !important;
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 1rem !important;
      color: #e30019 !important;
      font-weight: 900 !important;
      text-align: left !important;
      line-height: 1.7 !important;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor ol > li {
      counter-increment: techzone-list-counter;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor li[data-list="ordered"] {
      list-style: none !important;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor ol > li::before,
    :host ::ng-deep .techzone-rich-text.ql-editor li[data-list="ordered"]::before {
      content: counter(techzone-list-counter) '.' !important;
      display: block !important;
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      color: #e30019 !important;
      font-weight: 800 !important;
      line-height: 1.7 !important;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor blockquote {
      border-left: 4px solid #e30019;
      background: #fff1f2;
      color: #334155;
      padding: 14px 18px;
      border-radius: 0 16px 16px 0;
      margin: 24px 0;
      font-weight: 600;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor a {
      color: #e30019;
      font-weight: 700;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor img {
      max-width: 100%;
      height: auto;
      border-radius: 16px;
      margin: 24px auto;
      display: block;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor pre {
      background: #0f172a;
      color: #e2e8f0;
      padding: 16px;
      border-radius: 16px;
      overflow-x: auto;
      margin: 24px 0;
      white-space: pre;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor code {
      background: #f1f5f9;
      color: #e30019;
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 0.92em;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor th,
    :host ::ng-deep .techzone-rich-text.ql-editor td {
      border: 1px solid #e2e8f0;
      padding: 12px;
      text-align: left;
    }

    :host ::ng-deep .techzone-rich-text.ql-editor th {
      background: #f8fafc;
      font-weight: 800;
    }
  `]
})
export class RichTextRendererComponent implements OnChanges, AfterViewChecked {
  @Input() content = '';
  @Input() title = '';
  @Output() headingsReady = new EventEmitter<RichTextHeading[]>();
  @ViewChild('editor') editor?: ElementRef<HTMLElement>;

  safeHtml = '';
  private shouldSyncHeadings = false;
  private lastHeadingSignature = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(): void {
    const normalizedHtml = this.removeDuplicatedTitle(this.normalizeQuillHtml(this.decodeEscapedHtml(this.content || '')));
    this.safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, normalizedHtml) || '';
    this.shouldSyncHeadings = true;
  }

  ngAfterViewChecked(): void {
    if (!this.shouldSyncHeadings) return;
    this.shouldSyncHeadings = false;
    queueMicrotask(() => this.syncHeadingAnchorsFromDom());
  }

  private decodeEscapedHtml(value: string): string {
    if (!/&lt;\/?(h1|h2|h3|p|ul|ol|li|blockquote|strong|b|em|i|u|img|a|table|pre|code)\b/i.test(value)) {
      return value;
    }
    return value
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  private removeDuplicatedTitle(html: string): string {
    const titleText = this.normalizeForCompare(this.title);
    if (!titleText) return html;

    return html.replace(/^\s*<h1[^>]*>(.*?)<\/h1>\s*/is, (match, heading) => {
      return this.normalizeForCompare(String(heading).replace(/<[^>]*>/g, '')) === titleText ? '' : match;
    });
  }

  private normalizeQuillHtml(html: string): string {
    return this.restoreQuillListTags(html.replace(/&nbsp;/g, ' '));
  }

  private restoreQuillListTags(html: string): string {
    if (typeof document === 'undefined' || !html.includes('data-list="bullet"')) {
      return html;
    }

    const template = document.createElement('template');
    template.innerHTML = html;

    template.content.querySelectorAll('ol').forEach(list => {
      const items = Array.from(list.children).filter(child => child.tagName.toLowerCase() === 'li');
      if (items.length && items.every(item => item.getAttribute('data-list') === 'bullet')) {
        const ul = document.createElement('ul');
        Array.from(list.attributes).forEach(attr => ul.setAttribute(attr.name, attr.value));
        while (list.firstChild) ul.appendChild(list.firstChild);
        list.replaceWith(ul);
      }
    });

    return template.innerHTML;
  }

  private syncHeadingAnchorsFromDom(): void {
    const root = this.editor?.nativeElement;
    if (!root) return;

    const titleText = this.normalizeForCompare(this.title);
    const usedIds = new Set<string>();
    const headings = Array.from(root.querySelectorAll('h2, h3'))
      .map(element => {
        const rawText = this.normalizeText(element.textContent || '');
        const text = this.stripHeadingNumber(rawText);
        if (!text || this.normalizeForCompare(text) === titleText) return null;

        const id = this.uniqueHeadingId(this.slugify(text), usedIds);
        element.id = id;
        return {
          id,
          text,
          level: element.tagName.toLowerCase() === 'h3' ? 3 : 2
        };
      })
      .filter((item): item is RichTextHeading => !!item)
      .slice(0, 8);

    const signature = JSON.stringify(headings);
    if (signature !== this.lastHeadingSignature) {
      this.lastHeadingSignature = signature;
      this.headingsReady.emit(headings);
    }
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

  private normalizeText(value: string): string {
    return (value || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeForCompare(value: string): string {
    return this.stripHeadingNumber(this.normalizeText(value)).toLocaleLowerCase('vi-VN');
  }
}

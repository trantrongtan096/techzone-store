import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CATEGORY_ICON_FALLBACK, CATEGORY_ICON_REGISTRY, CategoryIconGroup, CategoryIconOption, isValidCategoryIcon } from './category-icon-registry';

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
      <div class="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[88vh] shadow-2xl flex flex-col overflow-hidden text-slate-200">
        <div class="p-5 border-b border-slate-800 bg-[#111827] shrink-0 space-y-4">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-red-600/15 text-red-400 border border-red-500/30 flex items-center justify-center text-lg">
                <i class="fa-solid fa-icons"></i>
              </div>
              <div class="min-w-0">
                <h3 class="text-base font-black text-white uppercase tracking-wider">Bộ chọn icon danh mục</h3>
                <p class="text-xs text-slate-400">Chọn icon từ registry dùng chung cho Category, Header, menu và Homepage</p>
              </div>
            </div>

            <button
              type="button"
              (click)="close.emit()"
              class="text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="flex flex-col lg:flex-row gap-3">
            <div class="relative flex-1">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Tìm icon: laptop, cpu, keyboard, gaming..."
                class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-bold" />
              <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
            </div>

            <div class="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl overflow-x-auto text-[11px] font-bold">
              <button
                *ngFor="let group of iconGroups"
                type="button"
                (click)="selectedGroup.set(group)"
                [class.bg-[#E30019]]="selectedGroup() === group"
                [class.text-white]="selectedGroup() === group"
                [class.text-slate-400]="selectedGroup() !== group"
                class="px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap hover:text-white">
                {{ groupLabel(group) }}
              </button>
            </div>
          </div>
        </div>

        <div class="p-5 bg-slate-950 flex-1 overflow-y-auto custom-scrollbar space-y-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 text-red-400 flex items-center justify-center text-xl">
              <i [class]="safeSelectedIcon()"></i>
            </div>
            <div class="min-w-0">
              <div class="text-xs text-slate-400 font-bold uppercase">Icon đang chọn</div>
              <div class="text-sm text-white font-mono font-bold truncate">{{ selectedIcon || fallbackIcon }}</div>
            </div>
          </div>

          <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-3">
            <button
              *ngFor="let iconOpt of filteredIcons()"
              type="button"
              (click)="selectIcon(iconOpt.iconClass)"
              [title]="iconOpt.label + ' - ' + iconOpt.iconClass"
              [class.bg-[#E30019]]="selectedIcon === iconOpt.iconClass"
              [class.text-white]="selectedIcon === iconOpt.iconClass"
              [class.border-red-500]="selectedIcon === iconOpt.iconClass"
              [class.shadow-lg]="selectedIcon === iconOpt.iconClass"
              [class.bg-slate-900]="selectedIcon !== iconOpt.iconClass"
              [class.text-slate-300]="selectedIcon !== iconOpt.iconClass"
              [class.border-slate-800]="selectedIcon !== iconOpt.iconClass"
              class="p-3 border rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-red-500 hover:bg-slate-800 transition-all cursor-pointer group text-center min-h-24">
              <i [class]="iconOpt.iconClass" class="text-2xl text-amber-400 group-hover:scale-110 transition-transform"></i>
              <span class="text-[10px] font-bold line-clamp-2 leading-tight">{{ iconOpt.label }}</span>
            </button>
          </div>

          <div *ngIf="filteredIcons().length === 0" class="py-12 text-center text-slate-400 space-y-2">
            <i class="fa-solid fa-magnifying-glass text-3xl opacity-40"></i>
            <p class="text-xs font-bold">Không tìm thấy icon phù hợp.</p>
          </div>
        </div>

        <div class="p-4 border-t border-slate-800 bg-[#111827] shrink-0 flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 text-slate-400 font-medium min-w-0">
            <span class="shrink-0">Đang chọn:</span>
            <span class="font-mono text-slate-200 truncate">{{ selectedIcon || fallbackIcon }}</span>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="px-5 py-2 font-bold text-xs text-white bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer transition-all border border-slate-700">
            Đóng
          </button>
        </div>
      </div>
    </div>
  `
})
export class IconPickerComponent {
  @Input() selectedIcon = '';
  @Output() selectedIconChange = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  readonly fallbackIcon = CATEGORY_ICON_FALLBACK;
  readonly iconGroups: CategoryIconGroup[] = ['All', 'Hardware', 'Gaming', 'Devices', 'General'];
  selectedGroup = signal<CategoryIconGroup>('All');
  icons = signal<CategoryIconOption[]>(CATEGORY_ICON_REGISTRY);
  searchQuery = '';

  filteredIcons(): CategoryIconOption[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.icons().filter(icon => {
      const groupMatches = this.selectedGroup() === 'All' || icon.group === this.selectedGroup();
      const textMatches = !q ||
        icon.label.toLowerCase().includes(q) ||
        icon.iconClass.toLowerCase().includes(q) ||
        (icon.keywords || []).some(keyword => keyword.toLowerCase().includes(q));
      return groupMatches && textMatches;
    });
  }

  selectIcon(iconClass: string): void {
    this.selectedIcon = iconClass;
    this.selectedIconChange.emit(iconClass);
  }

  groupLabel(group: CategoryIconGroup): string {
    return group === 'All' ? 'Tất cả' : group;
  }

  safeSelectedIcon(): string {
    return this.isKnownIcon(this.selectedIcon) ? this.selectedIcon : this.fallbackIcon;
  }

  private isKnownIcon(icon?: string): boolean {
    return isValidCategoryIcon(icon) || (!!icon && this.icons().some(item => item.iconClass === icon));
  }
}

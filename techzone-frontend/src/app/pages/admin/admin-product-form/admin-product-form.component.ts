import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EditorModule } from 'primeng/editor';
import { AdminService } from '../../../services/admin.service';
import { ProductService } from '../../../services/product.service';
import { Category, Brand } from '../../../models/product.model';
import { ImageCompressorUtil } from '../../../utils/image-compressor.util';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EditorModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6 animate-fade-in text-slate-100">
      <!-- Title Bar -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 class="text-2xl font-black text-white uppercase tracking-wide">
            {{ isEditMode() ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới' }}
          </h2>
          <p class="text-xs text-slate-400">
            Cấu trúc thư mục Cloudinary: <code class="bg-slate-900 text-red-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">techzone_products/{{ getProductFolderSlug() }}/</code>
          </p>
        </div>

        <a routerLink="/admin/products" class="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2">
          <i class="pi pi-arrow-left"></i> Quay lại danh sách
        </a>
      </div>

      <!-- FORM -->
      <form (ngSubmit)="onSubmit()" class="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Name -->
          <div class="md:col-span-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tên Sản Phẩm *</label>
            <input 
              type="text" 
              [(ngModel)]="formData.name" 
              name="name" 
              required
              placeholder="VD: Laptop Gaming ASUS ROG Strix G16..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-bold" />
          </div>

          <!-- SKU -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Mã SKU</label>
            <input 
              type="text" 
              [(ngModel)]="formData.sku" 
              name="sku" 
              placeholder="VD: ROG-G614JVR-001"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono" />
          </div>

          <!-- Stock -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Số Lượng Tồn Kho</label>
            <input 
              type="number" 
              [(ngModel)]="formData.stockQuantity" 
              name="stockQuantity" 
              required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono" />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Danh Mục *</label>
            <select 
              [(ngModel)]="formData.categoryId" 
              name="categoryId" 
              required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 cursor-pointer font-bold">
              <option [ngValue]="null" disabled>-- Chọn danh mục --</option>
              <option *ngFor="let cat of categories()" [ngValue]="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <!-- Brand -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Thương Hiệu (Brand) *</label>
            <select 
              [(ngModel)]="formData.brandId" 
              name="brandId" 
              required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 cursor-pointer font-bold">
              <option [ngValue]="null" disabled>-- Chọn thương hiệu --</option>
              <option *ngFor="let b of brands()" [ngValue]="b.id">{{ b.name }}</option>
            </select>
          </div>

          <!-- Original Price -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Giá Niêm Yết (VND) *</label>
            <input 
              type="number" 
              [(ngModel)]="formData.originalPrice" 
              name="originalPrice" 
              required
              placeholder="VD: 44990000"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono font-bold" />
          </div>

          <!-- Promotion Price -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Giá Khuyến Mãi (VND)</label>
            <input 
              type="number" 
              [(ngModel)]="formData.promotionPrice" 
              name="promotionPrice" 
              placeholder="VD: 39990000 (Để trống nếu không giảm)"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-red-400 placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono font-bold" />
          </div>

          <!-- 1. THUMBNAIL UPLOAD SECTION (Enterprise Folder Migration) -->
          <div class="md:col-span-2 space-y-3 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div class="flex items-center justify-between">
              <div>
                <label class="block text-xs font-black uppercase tracking-wider text-white">
                  📸 Ảnh Đại Diện Chính (Thumbnail) *
                </label>
                <p class="text-[11px] text-slate-400">Tự động lưu vào thư mục riêng: <span class="font-mono text-red-400 font-bold">techzone_products/{{ getProductFolderSlug() }}/</span></p>
              </div>
              <span class="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                Enterprise Folder Mode
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <!-- Upload Box -->
              <div 
                (click)="thumbFileInput.click()"
                class="md:col-span-2 border-2 border-dashed border-slate-800 hover:border-red-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-950 hover:bg-slate-800 transition-all text-center relative group">
                
                <input 
                  type="file" 
                  #thumbFileInput 
                  (change)="onThumbnailFilePicked($event)" 
                  accept="image/*" 
                  class="hidden" />

                <!-- Progress Overlay -->
                <div *ngIf="uploadingThumbnail()" class="absolute inset-0 bg-slate-950/90 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4 z-20 space-y-2">
                  <i class="pi pi-spin pi-spinner text-2xl text-red-500"></i>
                  <div class="text-xs font-bold text-white">{{ thumbnailProgressText() }}</div>
                  <div class="w-3/4 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div class="bg-red-600 h-full transition-all duration-300" [style.width.%]="thumbnailProgress()"></div>
                  </div>
                </div>

                <i class="pi pi-cloud-upload text-3xl text-red-500 group-hover:scale-110 transition-transform mb-2"></i>
                <div class="text-xs font-bold text-white">Bấm hoặc Kéo Thả ảnh từ máy tính</div>
                <div class="text-[10px] text-slate-400 mt-1">Lưu trực tiếp vào thư mục {{ getProductFolderSlug() }}</div>
              </div>

              <!-- Live Preview Card -->
              <div class="md:col-span-1 flex flex-col items-center justify-center">
                <div class="w-full h-32 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden group shadow-sm">
                  <img 
                    *ngIf="formData.thumbnail; else noThumb" 
                    [src]="formData.thumbnail" 
                    class="max-h-full max-w-full object-contain p-2" 
                    (error)="onThumbnailError($event)" />
                  <ng-template #noThumb>
                    <div class="text-center p-4 text-slate-500">
                      <i class="pi pi-image text-2xl"></i>
                      <div class="text-[10px] font-bold mt-1">Xem trước Thumbnail</div>
                    </div>
                  </ng-template>
                </div>
              </div>
            </div>

            <!-- Direct URL Remote Upload Box -->
            <div class="pt-3 border-t border-slate-800 space-y-2">
              <label class="block text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <i class="pi pi-link text-red-500"></i>
                <span>Dán URL ảnh GearVN/Unsplash (Tự động bốc về thư mục sản phẩm):</span>
              </label>
              <div class="flex items-center gap-2">
                <input 
                  type="text" 
                  [(ngModel)]="formData.thumbnail" 
                  name="thumbnail" 
                  placeholder="https://cdn.hstatic.net/..."
                  class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono" />
                
                <button 
                  type="button" 
                  (click)="onUploadThumbnailFromUrl()" 
                  [disabled]="!formData.thumbnail || uploadingThumbnail()"
                  class="bg-[#E30019] hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs">
                  <i class="pi pi-bolt"></i>
                  <span>Bốc về Thư Mục SP</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 2. SUB-IMAGES ALBUM SECTION (5 Slots with Enterprise Folder Migration) -->
          <div class="md:col-span-2 space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div class="flex items-center justify-between">
              <div>
                <label class="block text-xs font-black uppercase tracking-wider text-white">
                  🖼️ Album Ảnh Chi Tiết Phụ (Tối đa 5 ảnh)
                </label>
                <p class="text-[11px] text-slate-400">Tự động sắp xếp gọn gàng trong thư mục <span class="font-mono text-red-400 font-bold">techzone_products/{{ getProductFolderSlug() }}/</span></p>
              </div>
              <button 
                type="button" 
                (click)="addSubImage()" 
                [disabled]="subImagesList().length >= 5"
                class="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all">
                <i class="pi pi-plus text-[10px]"></i> Thêm ô ảnh phụ
              </button>
            </div>

            <!-- 5 Slots Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div *ngFor="let item of subImagesList(); let idx = index" class="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between relative group shadow-sm hover:border-red-500 transition-all">
                
                <!-- Slot Title & Delete button -->
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[10px] font-black text-slate-400 uppercase">Ảnh #{{ idx + 1 }}</span>
                  <button 
                    type="button" 
                    (click)="removeSubImage(idx)" 
                    class="text-slate-400 hover:text-red-400 cursor-pointer" 
                    title="Xóa ảnh này">
                    <i class="pi pi-times text-xs"></i>
                  </button>
                </div>

                <!-- Upload/Preview Area -->
                <div 
                  (click)="subFileInput.click()"
                  class="h-28 rounded-lg bg-slate-900 border border-dashed border-slate-800 hover:border-red-500 flex items-center justify-center overflow-hidden cursor-pointer relative group/btn">
                  
                  <input 
                    type="file" 
                    #subFileInput 
                    (change)="onSubImageFilePicked($event, idx)" 
                    accept="image/*" 
                    class="hidden" />

                  <!-- Progress Overlay -->
                  <div *ngIf="uploadingSubImageIndex() === idx" class="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-2 z-20 text-center">
                    <i class="pi pi-spin pi-spinner text-lg text-red-500"></i>
                    <span class="text-[9px] font-bold text-white mt-1">Đang tải...</span>
                  </div>

                  <img 
                    *ngIf="item.url; else noSubImage" 
                    [src]="item.url" 
                    class="max-h-full max-w-full object-contain p-1" 
                    (error)="onSubImageError($event)" />
                  <ng-template #noSubImage>
                    <div class="text-center p-2 text-slate-500">
                      <i class="pi pi-plus-circle text-xl text-slate-500 group-hover/btn:scale-110 transition-transform"></i>
                      <div class="text-[9px] font-bold mt-1">Chọn ảnh phụ</div>
                    </div>
                  </ng-template>
                </div>

                <!-- Direct URL Input + Bốc Ảnh Cloudinary Button -->
                <div class="mt-2 space-y-1">
                  <input 
                    type="text" 
                    [(ngModel)]="item.url" 
                    [name]="'sub_url_' + idx" 
                    placeholder="Link URL..." 
                    class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-red-500 font-mono" />
                  
                  <button 
                    type="button" 
                    (click)="onUploadSubImageFromUrl(idx)" 
                    [disabled]="!item.url || uploadingSubImageIndex() === idx"
                    class="w-full text-[9px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1">
                    <i class="pi pi-bolt text-[8px] text-amber-400"></i>
                    <span>Bốc sang Thư Mục SP</span>
                  </button>
                </div>
              </div>

              <div *ngIf="subImagesList().length === 0" class="lg:col-span-5 text-center py-6 text-slate-500 text-xs bg-slate-950 rounded-xl border border-dashed border-slate-800">
                Chưa có ảnh phụ nào trong Album. Bấm "Thêm ô ảnh phụ" ở trên để chọn tối đa 5 ảnh chi tiết.
              </div>
            </div>
          </div>

          <!-- Switches (Active / Featured / FlashSale & EndTime) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2 py-2 bg-slate-900 border border-slate-800 rounded-xl p-4">
            <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
              <input type="checkbox" [(ngModel)]="formData.isActive" name="isActive" class="w-4 h-4 accent-red-600 rounded" />
              <span>Kích hoạt bán (Active)</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
              <input type="checkbox" [(ngModel)]="formData.isFeatured" name="isFeatured" class="w-4 h-4 accent-red-600 rounded" />
              <span>Nổi bật (Featured)</span>
            </label>

            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-red-400">
                <input type="checkbox" [(ngModel)]="formData.isFlashSale" name="isFlashSale" class="w-4 h-4 accent-red-600 rounded" />
                <span>⚡ Flash Sale</span>
              </label>

              <div *ngIf="formData.isFlashSale" class="pt-1">
                <label class="block text-[11px] font-bold text-slate-400 mb-1">Thời Gian Kết Thúc</label>
                <input 
                  type="datetime-local" 
                  [(ngModel)]="formData.flashSaleEndTime" 
                  name="flashSaleEndTime" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500" />
              </div>
            </div>
          </div>

          <!-- Specs JSON Builder -->
          <div class="md:col-span-2 space-y-3">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">Thông Số Kỹ Thuật Chi Tiết</label>
            <div class="space-y-2 max-h-[300px] overflow-y-auto border border-slate-800 rounded-xl p-3 bg-slate-900">
              <div *ngFor="let item of specsList(); let idx = index" class="flex items-center gap-3">
                <input 
                  type="text" 
                  [(ngModel)]="item.key" 
                  [name]="'spec_key_' + idx" 
                  placeholder="Tên thuộc tính (VD: CPU)"
                  class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500" />
                <input 
                  type="text" 
                  [(ngModel)]="item.value" 
                  [name]="'spec_val_' + idx" 
                  placeholder="Giá trị (VD: Core i5)"
                  class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500" />
                <button 
                  type="button" 
                  (click)="removeSpec(idx)"
                  class="p-1.5 text-slate-500 hover:text-red-400 cursor-pointer">
                  <i class="pi pi-trash text-sm"></i>
                </button>
              </div>
              <div *ngIf="specsList().length === 0" class="text-xs text-slate-500 text-center py-4">
                Chưa có thông số kỹ thuật nào. Hãy bấm nút thêm ở dưới.
              </div>
            </div>
            <button 
              type="button" 
              (click)="addSpec()"
              class="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer">
              <i class="pi pi-plus text-[10px]"></i>
              <span>Thêm dòng thông số</span>
            </button>
          </div>

          <!-- Description (PrimeNG Rich Text Editor) -->
          <div class="md:col-span-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Mô Tả Sản Phẩm</label>
            <p-editor 
              [(ngModel)]="formData.description" 
              name="description"
              [style]="{height:'250px'}"
              placeholder="Soạn thảo mô tả chi tiết sản phẩm TechZone...">
            </p-editor>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <a routerLink="/admin/products" class="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors">Hủy Bỏ</a>
          <button 
            type="submit" 
            [disabled]="loading() || uploadingThumbnail() || uploadingSubImageIndex() !== null"
            class="bg-[#E30019] hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2">
            <i class="pi pi-spin pi-spinner" *ngIf="loading()"></i>
            <span>{{ loading() ? 'Đang lưu...' : (isEditMode() ? 'CẬP NHẬT SẢN PHẨM' : 'TẠO SẢN PHẨM MỚI') }}</span>
          </button>
        </div>
      </form>
    </div>
  `
})
export class AdminProductFormComponent implements OnInit {
  isEditMode = signal(false);
  productId = signal<number | null>(null);
  loading = signal(false);

  // Cloudinary Upload Signals
  uploadingThumbnail = signal(false);
  thumbnailProgress = signal(0);
  thumbnailProgressText = signal('Đang nén & đẩy lên Cloudinary...');

  uploadingSubImageIndex = signal<number | null>(null);
  subImageProgress = signal(0);

  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  specsList = signal<{ key: string; value: string }[]>([]);
  subImagesList = signal<{ url: string }[]>([]);

  formData: any = {
    name: '',
    sku: '',
    categoryId: null,
    brandId: null,
    originalPrice: null,
    promotionPrice: null,
    thumbnail: '',
    description: '',
    specsJson: '',
    stockQuantity: 10,
    isActive: true,
    isFeatured: false,
    isFlashSale: false,
    flashSaleEndTime: ''
  };

  constructor(
    private adminService: AdminService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load Categories & Brands
    this.productService.getCategories().subscribe(res => this.categories.set(res));
    this.productService.getBrands().subscribe(res => this.brands.set(res));

    // Check if edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(Number(id));
      this.adminService.getProductById(Number(id)).subscribe({
        next: (p) => {
          this.formData = {
            name: p.name,
            sku: p.sku,
            categoryId: p.category?.id,
            brandId: p.brand?.id,
            originalPrice: p.originalPrice,
            promotionPrice: p.promotionPrice,
            thumbnail: p.thumbnail,
            description: p.description,
            specsJson: p.specsJson,
            stockQuantity: p.stockQuantity,
            isActive: p.isActive !== false,
            isFeatured: p.isFeatured,
            isFlashSale: p.isFlashSale,
            flashSaleEndTime: p.flashSaleEndTime ? p.flashSaleEndTime.substring(0, 16) : ''
          };

          // Parse specs
          if (p.specsJson) {
            try {
              const parsed = JSON.parse(p.specsJson);
              const list = Object.keys(parsed).map(k => ({ key: k, value: parsed[k] }));
              this.specsList.set(list);
            } catch (e) {
              this.specsList.set([]);
            }
          }

          // Populate subImages
          if (p.images && p.images.length > 0) {
            this.subImagesList.set(p.images.map((img: any) => ({ url: img.imageUrl })));
          } else {
            this.subImagesList.set([ { url: '' } ]);
          }
        },
        error: () => alert('Lỗi khi tải thông tin sản phẩm!')
      });
    } else {
      // Default specs & 1 empty sub-image slot for new product
      this.specsList.set([
        { key: 'CPU', value: '' },
        { key: 'RAM', value: '' },
        { key: 'Ổ cứng', value: '' },
        { key: 'VGA', value: '' },
        { key: 'Màn hình', value: '' }
      ]);
      this.subImagesList.set([ { url: '' } ]);
    }
  }

  // Generate clean Enterprise folder slug for product (e.g. sp-101-ban-phim-rog-azoth)
  getProductFolderSlug(): string {
    const pId = this.productId() ? `sp-${this.productId()}-` : 'sp-';
    let nameSlug = 'product';
    if (this.formData.name && this.formData.name.trim()) {
      nameSlug = this.formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    }
    return `${pId}${nameSlug}`;
  }

  // Client-side Compression & Cloudinary Upload for Main Thumbnail File
  async onThumbnailFilePicked(event: any): Promise<void> {
    const file = event.target?.files?.[0];
    if (!file) return;

    try {
      this.uploadingThumbnail.set(true);
      this.thumbnailProgressText.set('Đang nén ảnh phía Client...');
      this.thumbnailProgress.set(30);

      const compressedFile = await ImageCompressorUtil.compressImage(file);
      this.thumbnailProgressText.set(`Đang lưu vào techzone_products/${this.getProductFolderSlug()}/...`);
      this.thumbnailProgress.set(70);

      this.adminService.uploadImageToCloudinary(compressedFile, this.getProductFolderSlug()).subscribe({
        next: (res) => {
          this.thumbnailProgress.set(100);
          this.formData.thumbnail = res.url;
          setTimeout(() => this.uploadingThumbnail.set(false), 400);
        },
        error: (err) => {
          this.uploadingThumbnail.set(false);
          console.error('Cloudinary Thumbnail Upload Error:', err);
          alert('Lỗi khi tải ảnh Thumbnail lên Cloudinary!');
        }
      });
    } catch (e) {
      this.uploadingThumbnail.set(false);
      alert('Lỗi nén ảnh phía Client!');
    }
  }

  // Direct Remote URL Upload to Cloudinary for Main Thumbnail into Enterprise Subfolder
  onUploadThumbnailFromUrl(): void {
    const url = this.formData.thumbnail;
    if (!url || !url.trim()) {
      alert('Vui lòng dán link URL ảnh trước!');
      return;
    }

    this.uploadingThumbnail.set(true);
    this.thumbnailProgressText.set(`Bốc ảnh vào techzone_products/${this.getProductFolderSlug()}/...`);
    this.thumbnailProgress.set(50);

    this.adminService.uploadUrlToCloudinary(url.trim(), this.getProductFolderSlug()).subscribe({
      next: (res) => {
        this.thumbnailProgress.set(100);
        this.formData.thumbnail = res.url;
        setTimeout(() => this.uploadingThumbnail.set(false), 400);
      },
      error: (err) => {
        this.uploadingThumbnail.set(false);
        console.error('Cloudinary Remote URL Upload Error:', err);
        alert('Không thể bốc ảnh từ URL này! Hãy kiểm tra xem đường dẫn ảnh có hợp lệ hay không.');
      }
    });
  }

  // Client-side Compression & Cloudinary Upload for Sub-Image File
  async onSubImageFilePicked(event: any, index: number): Promise<void> {
    const file = event.target?.files?.[0];
    if (!file) return;

    try {
      this.uploadingSubImageIndex.set(index);
      this.subImageProgress.set(30);

      const compressedFile = await ImageCompressorUtil.compressImage(file);
      this.subImageProgress.set(70);

      this.adminService.uploadImageToCloudinary(compressedFile, this.getProductFolderSlug()).subscribe({
        next: (res) => {
          this.subImageProgress.set(100);
          const list = [...this.subImagesList()];
          list[index] = { url: res.url };
          this.subImagesList.set(list);
          setTimeout(() => this.uploadingSubImageIndex.set(null), 400);
        },
        error: (err) => {
          this.uploadingSubImageIndex.set(null);
          console.error('Cloudinary Sub-Image Upload Error:', err);
          alert('Lỗi khi tải ảnh phụ lên Cloudinary!');
        }
      });
    } catch (e) {
      this.uploadingSubImageIndex.set(null);
      alert('Lỗi nén ảnh phía Client!');
    }
  }

  // Direct Remote URL Upload to Cloudinary for Sub-Image Slot into Enterprise Subfolder
  onUploadSubImageFromUrl(index: number): void {
    const url = this.subImagesList()[index]?.url;
    if (!url || !url.trim()) {
      alert('Vui lòng dán link URL ảnh trước!');
      return;
    }

    this.uploadingSubImageIndex.set(index);

    this.adminService.uploadUrlToCloudinary(url.trim(), this.getProductFolderSlug()).subscribe({
      next: (res) => {
        const list = [...this.subImagesList()];
        list[index] = { url: res.url };
        this.subImagesList.set(list);
        setTimeout(() => this.uploadingSubImageIndex.set(null), 400);
      },
      error: (err) => {
        this.uploadingSubImageIndex.set(null);
        console.error('Cloudinary Remote Sub-Image Upload Error:', err);
        alert('Không thể bốc ảnh phụ từ URL này!');
      }
    });
  }

  onThumbnailError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&auto=format&fit=crop';
  }

  onSubImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&auto=format&fit=crop';
  }

  addSpec(): void {
    this.specsList.set([...this.specsList(), { key: '', value: '' }]);
  }

  removeSpec(idx: number): void {
    this.specsList.set(this.specsList().filter((_, i) => i !== idx));
  }

  addSubImage(): void {
    if (this.subImagesList().length < 5) {
      this.subImagesList.set([...this.subImagesList(), { url: '' }]);
    }
  }

  removeSubImage(idx: number): void {
    this.subImagesList.set(this.subImagesList().filter((_, i) => i !== idx));
  }

  onSubmit(): void {
    if (!this.formData.name || !this.formData.categoryId || !this.formData.brandId || !this.formData.originalPrice || !this.formData.thumbnail) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)!');
      return;
    }

    this.loading.set(true);

    // Ensure numeric values
    this.formData.categoryId = Number(this.formData.categoryId);
    this.formData.brandId = Number(this.formData.brandId);
    if (this.formData.originalPrice) this.formData.originalPrice = Number(this.formData.originalPrice);
    if (this.formData.promotionPrice) this.formData.promotionPrice = Number(this.formData.promotionPrice);
    if (this.formData.stockQuantity) this.formData.stockQuantity = Number(this.formData.stockQuantity);

    // Build specs JSON
    const specsObj: Record<string, string> = {};
    this.specsList().forEach(item => {
      if (item.key && item.key.trim()) {
        specsObj[item.key.trim()] = item.value || '';
      }
    });
    this.formData.specsJson = JSON.stringify(specsObj);

    // Filter valid sub-images URLs
    const validSubImages = this.subImagesList()
      .map(x => x.url ? x.url.trim() : '')
      .filter(url => url.length > 0);

    // Format flashSaleEndTime properly
    let formattedEndTime: string | null = null;
    if (this.formData.flashSaleEndTime && this.formData.flashSaleEndTime.trim()) {
      const val = this.formData.flashSaleEndTime.trim();
      formattedEndTime = val.length === 16 ? val + ':00' : val;
    }

    const payload = {
      ...this.formData,
      subImages: validSubImages,
      flashSaleEndTime: formattedEndTime
    };

    if (this.isEditMode() && this.productId()) {
      this.adminService.updateProduct(this.productId()!, payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/admin/products'], { queryParams: { success: 'updated' } });
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Update product error:', err);
          alert('Lỗi khi cập nhật sản phẩm!');
        }
      });
    } else {
      this.adminService.createProduct(payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/admin/products'], { queryParams: { success: 'created' } });
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Create product error:', err);
          alert('Lỗi khi tạo sản phẩm mới!');
        }
      });
    }
  }
}

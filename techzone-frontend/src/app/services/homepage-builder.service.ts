import { Injectable, signal } from '@angular/core';

export interface HomepageBlock {
  id: string;
  name: string;
  type: 'HERO_SLIDER' | 'USP_BAR' | 'QUICK_CATEGORIES' | 'FLASH_SALE' | 'FEATURED_TABS' | 'CATEGORY_SHELF' | 'TECH_BLOG' | 'BRAND_SHOWCASE';
  order: number;
  active: boolean;
  shelfId?: string;
}

export interface UspItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  active?: boolean;
}

export interface ProductShelf {
  id: string;
  title: string;
  categorySlug: string;
  subFilters: string[];
  brandIds?: number[];
  bannerUrl?: string;
  icon?: string;
  active: boolean;
  order?: number;
  limit?: number; // default 5
  sortType?: 'BEST_SELLER' | 'BEST_SELLING' | 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'DISCOUNT' | 'BIGGEST_DISCOUNT';
  showTabs?: boolean;
  showViewAll?: boolean;
}

export interface BlogArticle {
  id: number;
  homepageItemId?: number;
  title: string;
  slug?: string;
  category: string;
  date: string;
  image: string;
  summary: string;
  readTime: string;
  showOnHomepage: boolean;
  displayOrder?: number;
  inManualList?: boolean;
  status?: 'PUBLISHED' | 'DRAFT' | 'UNPUBLISHED';
  published?: boolean;
  views?: number;
  featured?: boolean;
}

export interface BrandItem {
  id: string;
  name: string;
  logoUrl?: string;
  showOnHomepage: boolean;
  displayOrder?: number;
}

export interface BrandShowcaseSettings {
  limit: number;
}

export interface BlogShowcaseSettings {
  mode: 'MANUAL' | 'AUTO_LATEST';
  limit: number;
  category: string;
  sortType: 'NEWEST' | 'MOST_VIEWED' | 'FEATURED';
}

@Injectable({
  providedIn: 'root'
})
export class HomepageBuilderService {
  private STORAGE_BLOCKS_KEY = 'techzone_homepage_blocks';
  private STORAGE_USPS_KEY = 'techzone_homepage_usps';
  private STORAGE_SHELVES_KEY = 'techzone_homepage_shelves';
  private STORAGE_BLOGS_KEY = 'techzone_homepage_blogs';
  private STORAGE_BRANDS_KEY = 'techzone_homepage_brands';
  private STORAGE_BRAND_SETTINGS_KEY = 'techzone_brand_showcase_settings';
  private STORAGE_BLOG_SETTINGS_KEY = 'techzone_blog_showcase_settings';

  defaultBlocks: HomepageBlock[] = [
    { id: 'blk-1', name: 'Hero Banner Slider', type: 'HERO_SLIDER', order: 1, active: true },
    { id: 'blk-2', name: 'Thanh Cam Kết Dịch Vụ', type: 'USP_BAR', order: 2, active: true },
    { id: 'blk-3', name: 'Lưới Danh Mục Nổi Bật', type: 'QUICK_CATEGORIES', order: 3, active: true },
    { id: 'blk-4', name: 'Flash Sale Giá Sốc', type: 'FLASH_SALE', order: 4, active: true },
    { id: 'blk-5', name: 'Sản Phẩm Nổi Bật (Tabs)', type: 'FEATURED_TABS', order: 5, active: true },
    { id: 'blk-6', name: 'Cụm SP: Laptop Gaming', type: 'CATEGORY_SHELF', order: 6, active: true, shelfId: 'shf-1' },
    { id: 'blk-7', name: 'Cụm SP: PC Build Sẵn', type: 'CATEGORY_SHELF', order: 7, active: true, shelfId: 'shf-2' },
    { id: 'blk-8', name: 'Tin Tức Công Nghệ', type: 'TECH_BLOG', order: 8, active: true },
    { id: 'blk-9', name: 'Thương Hiệu Đồng Hành', type: 'BRAND_SHOWCASE', order: 9, active: true }
  ];

  defaultUsps: UspItem[] = [
    { id: 'usp-1', icon: '🚚', title: 'Giao Hàng 2H', description: 'Nội thành TP.HCM & Hà Nội', active: true },
    { id: 'usp-2', icon: '🛡️', title: 'Bảo Hành 1 Đổi 1', description: 'Cam kết chính hãng 100%', active: true },
    { id: 'usp-3', icon: '💳', title: 'Trả Góp 0% Lãi Suất', description: 'Duyệt hồ sơ nhanh 5 phút', active: true },
    { id: 'usp-4', icon: '🔄', title: '30 Ngày Đổi Trả', description: 'Lỗi nhà sản xuất 100%', active: true }
  ];

  defaultShelves: ProductShelf[] = [
    {
      id: 'shf-1',
      title: 'LAPTOP GAMING & BĂNG THÔNG CAO',
      categorySlug: 'laptop-gaming',
      subFilters: ['Tất cả', 'Asus ROG', 'MSI', 'Acer Predator', 'Lenovo Legion'],
      icon: '💻',
      active: true,
      order: 1,
      limit: 5,
      sortType: 'BEST_SELLER',
      showTabs: true,
      showViewAll: true
    },
    {
      id: 'shf-2',
      title: 'PC TECHZONE BUILD SẴN',
      categorySlug: 'pc-build',
      subFilters: ['Tất cả', 'PC Văn Phòng', 'PC Gaming Giá Rẻ', 'PC Streamer/Render'],
      icon: '🖥️',
      active: true,
      order: 2,
      limit: 5,
      sortType: 'BEST_SELLER',
      showTabs: true,
      showViewAll: true
    }
  ];

  defaultBlogs: BlogArticle[] = [
    {
      id: 1,
      title: 'Top 5 Laptop Gaming RTX 40 Series Dưới 20 Triệu Đáng Mua Nhất 2026',
      category: 'TƯ VẤN MUA SẮM',
      date: '10/08/2026',
      readTime: '5 phút đọc',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop',
      summary: 'Đánh giá chi tiết 5 mẫu laptop gaming trang bị card đồ họa RTX 4050/4060 có hiệu năng trên giá thành ấn tượng nhất năm nay.',
      showOnHomepage: true,
      displayOrder: 1
    },
    {
      id: 2,
      title: 'Đánh Giá Chi Tiết Bàn Phím Cơ AULA F75: Vua Phím Cơ Giá Rẻ Mới',
      category: 'REVIEW GEAR',
      date: '08/08/2026',
      readTime: '4 phút đọc',
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop',
      summary: 'AULA F75 mang đến trải nghiệm gõ êm ái, switch Reaper mượt mà cùng kết nối 3 chế độ đỉnh cao trong tầm giá dưới 1 triệu.',
      showOnHomepage: true,
      displayOrder: 2
    },
    {
      id: 3,
      title: 'Hướng Dẫn Chọn Cấu Hình PC Streamer & Render 4K Tối Ưu Chi Phí 2026',
      category: 'BÀI VIẾT KỸ THUẬT',
      date: '05/08/2026',
      readTime: '7 phút đọc',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop',
      summary: 'Bí quyết cân bằng giữa CPU nhiều nhân, dung lượng RAM 32GB/64GB và VGA mã hóa NVENC để livestream 60fps mượt mà.',
      showOnHomepage: true,
      displayOrder: 3
    },
    {
      id: 4,
      title: 'VGA NVIDIA RTX 50 Series: Kỷ Nguyên Đồ Họa AI Thế Hệ Mới Sắp Ra Mắt',
      category: 'TIN CÔNG NGHỆ',
      date: '02/08/2026',
      readTime: '3 phút đọc',
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop',
      summary: 'Tổng hợp rò rỉ mới nhất về kiến trúc Blackwell, bộ nhớ GDDR7 cùng công nghệ DLSS 4 giúp tăng gấp đôi khung hình game 4K.',
      showOnHomepage: true,
      displayOrder: 4
    }
  ];

  defaultBrands: BrandItem[] = [
    { id: 'b-1', name: 'ASUS', showOnHomepage: true, displayOrder: 1 },
    { id: 'b-2', name: 'MSI', showOnHomepage: true, displayOrder: 2 },
    { id: 'b-3', name: 'RAZER', showOnHomepage: true, displayOrder: 3 },
    { id: 'b-4', name: 'LOGITECH', showOnHomepage: true, displayOrder: 4 },
    { id: 'b-5', name: 'LG', showOnHomepage: true, displayOrder: 5 },
    { id: 'b-6', name: 'CORSAIR', showOnHomepage: true, displayOrder: 6 },
    { id: 'b-7', name: 'ACER', showOnHomepage: true, displayOrder: 7 },
    { id: 'b-8', name: 'GIGABYTE', showOnHomepage: true, displayOrder: 8 }
  ];

  defaultBrandSettings: BrandShowcaseSettings = { limit: 8 };
  defaultBlogSettings: BlogShowcaseSettings = { mode: 'MANUAL', limit: 4, category: 'Tất cả', sortType: 'NEWEST' };

  blocks = signal<HomepageBlock[]>([]);
  usps = signal<UspItem[]>([]);
  shelves = signal<ProductShelf[]>([]);
  blogs = signal<BlogArticle[]>([]);
  brands = signal<BrandItem[]>([]);
  brandSettings = signal<BrandShowcaseSettings>({ ...this.defaultBrandSettings });
  blogSettings = signal<BlogShowcaseSettings>({ ...this.defaultBlogSettings });

  constructor() {
    this.loadAllData();
  }

  loadAllData(): void {
    // 1. Blocks
    const savedBlocks = localStorage.getItem(this.STORAGE_BLOCKS_KEY);
    if (savedBlocks) {
      try {
        this.blocks.set(this.normalizeBlockOrder(JSON.parse(savedBlocks), true));
      } catch (e) {
        this.blocks.set(this.normalizeBlockOrder(this.defaultBlocks, true));
      }
    } else {
      this.blocks.set(this.normalizeBlockOrder(this.defaultBlocks, true));
    }

    // 2. USPs
    const savedUsps = localStorage.getItem(this.STORAGE_USPS_KEY);
    if (savedUsps) {
      try {
        this.usps.set(JSON.parse(savedUsps));
      } catch (e) {
        this.usps.set([...this.defaultUsps]);
      }
    } else {
      this.usps.set([...this.defaultUsps]);
    }

    // 3. Shelves
    const savedShelves = localStorage.getItem(this.STORAGE_SHELVES_KEY);
    if (savedShelves) {
      try {
        this.shelves.set(JSON.parse(savedShelves));
      } catch (e) {
        this.shelves.set([...this.defaultShelves]);
      }
    } else {
      this.shelves.set([...this.defaultShelves]);
    }

    // 4. Blogs are loaded from the real Article/Homepage APIs.
    // Legacy localStorage/demo blog data is intentionally ignored.
    localStorage.removeItem(this.STORAGE_BLOGS_KEY);
    this.blogs.set([]);

    // 5. Brands
    const savedBrands = localStorage.getItem(this.STORAGE_BRANDS_KEY);
    if (savedBrands) {
      try {
        this.brands.set(this.normalizeBrandOrder(JSON.parse(savedBrands), true));
      } catch (e) {
        this.brands.set(this.normalizeBrandOrder(this.defaultBrands, true));
      }
    } else {
      this.brands.set(this.normalizeBrandOrder(this.defaultBrands, true));
    }

    const savedBrandSettings = localStorage.getItem(this.STORAGE_BRAND_SETTINGS_KEY);
    if (savedBrandSettings) {
      try {
        this.brandSettings.set({ ...this.defaultBrandSettings, ...JSON.parse(savedBrandSettings) });
      } catch (e) {
        this.brandSettings.set({ ...this.defaultBrandSettings });
      }
    }

    const savedBlogSettings = localStorage.getItem(this.STORAGE_BLOG_SETTINGS_KEY);
    if (savedBlogSettings) {
      try {
        this.blogSettings.set({ ...this.defaultBlogSettings, ...JSON.parse(savedBlogSettings) });
      } catch (e) {
        this.blogSettings.set({ ...this.defaultBlogSettings });
      }
    }
  }

  // --- BLOCKS MANAGEMENT ---
  saveBlocks(newBlocks: HomepageBlock[]): void {
    const normalizedBlocks = this.normalizeBlockOrder(newBlocks);
    this.blocks.set([...normalizedBlocks]);
    localStorage.setItem(this.STORAGE_BLOCKS_KEY, JSON.stringify(normalizedBlocks));
  }

  toggleBlockActive(id: string): void {
    const list = [...this.blocks()];
    const item = list.find(b => b.id === id);
    if (item) {
      item.active = !item.active;
      this.saveBlocks(list);
      if (item.type === 'CATEGORY_SHELF' && item.shelfId) {
        this.setShelfActive(item.shelfId, item.active);
      }
    }
  }

  moveBlockOrder(id: string, direction: 'UP' | 'DOWN'): void {
    const list = this.normalizeBlockOrder(this.blocks(), true);
    const index = list.findIndex(b => b.id === id);
    if (index === -1) return;

    if (direction === 'UP' && index > 0) {
      const temp = list[index - 1];
      list[index - 1] = list[index];
      list[index] = temp;
    } else if (direction === 'DOWN' && index < list.length - 1) {
      const temp = list[index + 1];
      list[index + 1] = list[index];
      list[index] = temp;
    }

    this.saveBlocks(list);
  }

  reorderBlock(sourceId: string, targetId: string): void {
    const list = this.normalizeBlockOrder(this.blocks(), true);
    const sourceIndex = list.findIndex(b => b.id === sourceId);
    const targetIndex = list.findIndex(b => b.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;

    const [movedBlock] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, movedBlock);
    this.saveBlocks(list);
  }

  private normalizeBlockOrder(blocks: HomepageBlock[], sortBeforeNormalize = false): HomepageBlock[] {
    const list = sortBeforeNormalize
      ? [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0))
      : [...blocks];
    return list.map((block, index) => ({ ...block, order: index + 1 }));
  }

  // --- USPS MANAGEMENT ---
  saveUsps(newUsps: UspItem[]): void {
    this.usps.set([...newUsps]);
    localStorage.setItem(this.STORAGE_USPS_KEY, JSON.stringify(newUsps));
  }

  // --- SHELVES MANAGEMENT ---
  saveShelves(newShelves: ProductShelf[]): void {
    this.shelves.set([...newShelves]);
    localStorage.setItem(this.STORAGE_SHELVES_KEY, JSON.stringify(newShelves));
  }

  addShelf(shelfData: Omit<ProductShelf, 'id' | 'active'> & { active?: boolean }): void {
    const newShelf: ProductShelf = {
      ...shelfData,
      id: 'shf-' + Date.now(),
      active: shelfData.active ?? true
    };
    const current = this.shelves();
    const updated = [...current, newShelf];
    this.saveShelves(updated);

    // Also add to Blocks
    const currentBlocks = this.blocks();
    const newBlock: HomepageBlock = {
      id: 'blk-' + Date.now(),
      name: 'Cụm SP: ' + newShelf.title,
      type: 'CATEGORY_SHELF',
      order: currentBlocks.length + 1,
      active: true,
      shelfId: newShelf.id
    };
    this.saveBlocks([...currentBlocks, newBlock]);
  }

  deleteShelf(id: string): void {
    const updatedShelves = this.shelves().filter(s => s.id !== id);
    this.saveShelves(updatedShelves);

    const updatedBlocks = this.blocks().filter(b => b.shelfId !== id);
    this.saveBlocks(updatedBlocks);
  }

  toggleShelfActive(id: string): void {
    const list = [...this.shelves()];
    const item = list.find(s => s.id === id);
    if (item) {
      item.active = !item.active;
      this.saveShelves(list);
      this.setShelfBlockActive(id, item.active);
    }
  }

  setShelfActive(id: string, active: boolean): void {
    const list = [...this.shelves()];
    const item = list.find(s => s.id === id);
    if (item && item.active !== active) {
      item.active = active;
      this.saveShelves(list);
    }
  }

  setShelfBlockActive(shelfId: string, active: boolean): void {
    const list = [...this.blocks()];
    const item = list.find(block => block.type === 'CATEGORY_SHELF' && block.shelfId === shelfId);
    if (item && item.active !== active) {
      item.active = active;
      this.saveBlocks(list);
    }
  }

  updateShelf(updatedShelf: ProductShelf): void {
    const list = [...this.shelves()];
    const index = list.findIndex(s => s.id === updatedShelf.id);
    if (index !== -1) {
      list[index] = { ...updatedShelf };
      this.saveShelves(list);
    }
  }

  moveShelfOrder(id: string, direction: 'UP' | 'DOWN'): void {
    const list = [...this.shelves()];
    const index = list.findIndex(s => s.id === id);
    if (index === -1) return;

    if (direction === 'UP' && index > 0) {
      const temp = list[index - 1];
      list[index - 1] = list[index];
      list[index] = temp;
    } else if (direction === 'DOWN' && index < list.length - 1) {
      const temp = list[index + 1];
      list[index + 1] = list[index];
      list[index] = temp;
    }

    list.forEach((s, idx) => s.order = idx + 1);
    this.saveShelves(list);
  }

  reorderShelf(sourceId: string, targetId: string): void {
    const list = [...this.shelves()];
    const sourceIndex = list.findIndex(s => s.id === sourceId);
    const targetIndex = list.findIndex(s => s.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;

    const [movedShelf] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, movedShelf);
    list.forEach((s, idx) => s.order = idx + 1);
    this.saveShelves(list);
  }

  // --- BLOGS MANAGEMENT ---
  toggleBlogHomepage(id: number): void {
    const list = this.normalizeBlogOrder(this.blogs());
    const item = list.find(b => b.id === id);
    if (item) {
      item.showOnHomepage = !item.showOnHomepage;
      this.saveBlogs(list);
    }
  }

  setAllBlogsHomepage(visible: boolean): void {
    this.saveBlogs(this.blogs().map(blog => (
      blog.inManualList === false ? blog : { ...blog, showOnHomepage: visible }
    )));
  }

  addBlogsToManualList(articleIds: number): void;
  addBlogsToManualList(articleIds: number[]): void;
  addBlogsToManualList(articleIds: number | number[]): void {
    const ids = Array.isArray(articleIds) ? articleIds : [articleIds];
    const uniqueIds = [...new Set(ids.map(Number).filter(Boolean))];
    if (!uniqueIds.length) return;

    const list = this.normalizeBlogOrder(this.blogs(), true);
    let nextOrder = list.filter(blog => blog.inManualList !== false).length + 1;
    const updated = list.map(blog => {
      if (!uniqueIds.includes(blog.id) || !this.isBlogPublished(blog) || blog.inManualList !== false) {
        return blog;
      }

      return {
        ...blog,
        inManualList: true,
        showOnHomepage: true,
        displayOrder: nextOrder++
      };
    });

    this.saveBlogs(updated);
  }

  addBlogItemsToManualList(items: BlogArticle[]): void {
    if (!items.length) return;
    const list = this.normalizeBlogOrder(this.blogs(), true);
    const existingIds = new Set(list.filter(blog => blog.inManualList !== false).map(blog => blog.id));
    let nextOrder = list.filter(blog => blog.inManualList !== false).length + 1;
    const updated = [...list];

    for (const item of items) {
      if (!item?.id || existingIds.has(item.id) || !this.isBlogPublished(item)) continue;
      const existingIndex = updated.findIndex(blog => blog.id === item.id);
      const manualItem = {
        ...item,
        inManualList: true,
        showOnHomepage: true,
        displayOrder: nextOrder++
      };
      if (existingIndex >= 0) {
        updated[existingIndex] = manualItem;
      } else {
        updated.push(manualItem);
      }
      existingIds.add(item.id);
    }

    this.saveBlogs(updated);
  }

  removeBlogFromManualList(id: number): void {
    const list = this.blogs().map(blog => {
      if (blog.id !== id) return blog;
      return { ...blog, inManualList: false, showOnHomepage: false };
    });
    this.saveBlogs(list);
  }

  reorderBlog(sourceId: number, targetId: number): void {
    const list = this.normalizeBlogOrder(this.blogs(), true);
    const sourceIndex = list.findIndex(blog => blog.id === sourceId);
    const targetIndex = list.findIndex(blog => blog.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;

    const [movedBlog] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, movedBlog);
    this.saveBlogs(list);
  }

  saveBlogs(blogs: BlogArticle[]): void {
    const normalizedBlogs = this.normalizeBlogOrder(blogs);
    this.blogs.set([...normalizedBlogs]);
    localStorage.setItem(this.STORAGE_BLOGS_KEY, JSON.stringify(normalizedBlogs));
  }

  saveBlogSettings(settings: BlogShowcaseSettings): void {
    const validSortTypes: BlogShowcaseSettings['sortType'][] = ['NEWEST', 'MOST_VIEWED', 'FEATURED'];
    const normalized: BlogShowcaseSettings = {
      mode: settings.mode,
      limit: Math.min(12, Math.max(1, Number(settings.limit) || this.defaultBlogSettings.limit)),
      category: settings.category || 'Tất cả',
      sortType: validSortTypes.includes(settings.sortType) ? settings.sortType : this.defaultBlogSettings.sortType
    };
    this.blogSettings.set(normalized);
    localStorage.setItem(this.STORAGE_BLOG_SETTINGS_KEY, JSON.stringify(normalized));
  }

  // --- BRANDS MANAGEMENT ---
  toggleBrandHomepage(id: string): void {
    const list = this.normalizeBrandOrder(this.brands());
    const item = list.find(b => b.id === id);
    if (item) {
      item.showOnHomepage = !item.showOnHomepage;
      this.saveBrands(list);
    }
  }

  setAllBrandsHomepage(visible: boolean): void {
    this.saveBrands(this.brands().map(brand => ({ ...brand, showOnHomepage: visible })));
  }

  reorderBrand(sourceId: string, targetId: string): void {
    const list = this.normalizeBrandOrder(this.brands(), true);
    const sourceIndex = list.findIndex(brand => brand.id === sourceId);
    const targetIndex = list.findIndex(brand => brand.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return;

    const [movedBrand] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, movedBrand);
    this.saveBrands(list);
  }

  saveBrands(brands: BrandItem[]): void {
    const normalizedBrands = this.normalizeBrandOrder(brands);
    this.brands.set([...normalizedBrands]);
    localStorage.setItem(this.STORAGE_BRANDS_KEY, JSON.stringify(normalizedBrands));
  }

  saveBrandSettings(settings: BrandShowcaseSettings): void {
    const normalized: BrandShowcaseSettings = {
      limit: Math.min(24, Math.max(1, Number(settings.limit) || this.defaultBrandSettings.limit))
    };
    this.brandSettings.set(normalized);
    localStorage.setItem(this.STORAGE_BRAND_SETTINGS_KEY, JSON.stringify(normalized));
  }

  private normalizeBrandOrder(brands: BrandItem[], sortBeforeNormalize = false): BrandItem[] {
    const list = sortBeforeNormalize
      ? [...brands].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      : [...brands];
    return list.map((brand, index) => ({ ...brand, displayOrder: index + 1 }));
  }

  private normalizeBlogOrder(blogs: BlogArticle[], sortBeforeNormalize = false): BlogArticle[] {
    const list = sortBeforeNormalize
      ? [...blogs].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      : [...blogs];
    let manualOrder = 1;
    return list.map((blog, index) => {
      const inManualList = blog.inManualList ?? true;
      return {
        ...blog,
        inManualList,
        displayOrder: inManualList ? manualOrder++ : blog.displayOrder || index + 1
      };
    });
  }

  private isBlogPublished(blog: BlogArticle): boolean {
    if (blog.published === false) return false;
    return !blog.status || blog.status === 'PUBLISHED';
  }
}

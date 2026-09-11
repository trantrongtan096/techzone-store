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
  bannerUrl?: string;
  icon: string;
  active: boolean;
}

export interface BlogArticle {
  id: number;
  title: string;
  category: string;
  date: string;
  image: string;
  summary: string;
  readTime: string;
  showOnHomepage: boolean;
}

export interface BrandItem {
  id: string;
  name: string;
  logoUrl?: string;
  showOnHomepage: boolean;
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
      active: true
    },
    {
      id: 'shf-2',
      title: 'PC TECHZONE BUILD SẴN',
      categorySlug: 'pc-build',
      subFilters: ['Tất cả', 'PC Văn Phòng', 'PC Gaming Giá Rẻ', 'PC Streamer/Render'],
      icon: '🖥️',
      active: true
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
      showOnHomepage: true
    },
    {
      id: 2,
      title: 'Đánh Giá Chi Tiết Bàn Phím Cơ AULA F75: Vua Phím Cơ Giá Rẻ Mới',
      category: 'REVIEW GEAR',
      date: '08/08/2026',
      readTime: '4 phút đọc',
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop',
      summary: 'AULA F75 mang đến trải nghiệm gõ êm ái, switch Reaper mượt mà cùng kết nối 3 chế độ đỉnh cao trong tầm giá dưới 1 triệu.',
      showOnHomepage: true
    },
    {
      id: 3,
      title: 'Hướng Dẫn Chọn Cấu Hình PC Streamer & Render 4K Tối Ưu Chi Phí 2026',
      category: 'BÀI VIẾT KỸ THUẬT',
      date: '05/08/2026',
      readTime: '7 phút đọc',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop',
      summary: 'Bí quyết cân bằng giữa CPU nhiều nhân, dung lượng RAM 32GB/64GB và VGA mã hóa NVENC để livestream 60fps mượt mà.',
      showOnHomepage: true
    },
    {
      id: 4,
      title: 'VGA NVIDIA RTX 50 Series: Kỷ Nguyên Đồ Họa AI Thế Hệ Mới Sắp Ra Mắt',
      category: 'TIN CÔNG NGHỆ',
      date: '02/08/2026',
      readTime: '3 phút đọc',
      image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop',
      summary: 'Tổng hợp rò rỉ mới nhất về kiến trúc Blackwell, bộ nhớ GDDR7 cùng công nghệ DLSS 4 giúp tăng gấp đôi khung hình game 4K.',
      showOnHomepage: true
    }
  ];

  defaultBrands: BrandItem[] = [
    { id: 'b-1', name: 'ASUS', showOnHomepage: true },
    { id: 'b-2', name: 'MSI', showOnHomepage: true },
    { id: 'b-3', name: 'RAZER', showOnHomepage: true },
    { id: 'b-4', name: 'LOGITECH', showOnHomepage: true },
    { id: 'b-5', name: 'LG', showOnHomepage: true },
    { id: 'b-6', name: 'CORSAIR', showOnHomepage: true },
    { id: 'b-7', name: 'ACER', showOnHomepage: true },
    { id: 'b-8', name: 'GIGABYTE', showOnHomepage: true }
  ];

  blocks = signal<HomepageBlock[]>([]);
  usps = signal<UspItem[]>([]);
  shelves = signal<ProductShelf[]>([]);
  blogs = signal<BlogArticle[]>([]);
  brands = signal<BrandItem[]>([]);

  constructor() {
    this.loadAllData();
  }

  loadAllData(): void {
    // 1. Blocks
    const savedBlocks = localStorage.getItem(this.STORAGE_BLOCKS_KEY);
    if (savedBlocks) {
      try {
        this.blocks.set(JSON.parse(savedBlocks));
      } catch (e) {
        this.blocks.set([...this.defaultBlocks]);
      }
    } else {
      this.blocks.set([...this.defaultBlocks]);
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

    // 4. Blogs
    const savedBlogs = localStorage.getItem(this.STORAGE_BLOGS_KEY);
    if (savedBlogs) {
      try {
        this.blogs.set(JSON.parse(savedBlogs));
      } catch (e) {
        this.blogs.set([...this.defaultBlogs]);
      }
    } else {
      this.blogs.set([...this.defaultBlogs]);
    }

    // 5. Brands
    const savedBrands = localStorage.getItem(this.STORAGE_BRANDS_KEY);
    if (savedBrands) {
      try {
        this.brands.set(JSON.parse(savedBrands));
      } catch (e) {
        this.brands.set([...this.defaultBrands]);
      }
    } else {
      this.brands.set([...this.defaultBrands]);
    }
  }

  // --- BLOCKS MANAGEMENT ---
  saveBlocks(newBlocks: HomepageBlock[]): void {
    newBlocks.sort((a, b) => a.order - b.order);
    this.blocks.set([...newBlocks]);
    localStorage.setItem(this.STORAGE_BLOCKS_KEY, JSON.stringify(newBlocks));
  }

  toggleBlockActive(id: string): void {
    const list = this.blocks();
    const item = list.find(b => b.id === id);
    if (item) {
      item.active = !item.active;
      this.saveBlocks(list);
    }
  }

  moveBlockOrder(id: string, direction: 'UP' | 'DOWN'): void {
    const list = [...this.blocks()].sort((a, b) => a.order - b.order);
    const index = list.findIndex(b => b.id === id);
    if (index === -1) return;

    if (direction === 'UP' && index > 0) {
      const prevOrder = list[index - 1].order;
      list[index - 1].order = list[index].order;
      list[index].order = prevOrder;
    } else if (direction === 'DOWN' && index < list.length - 1) {
      const nextOrder = list[index + 1].order;
      list[index + 1].order = list[index].order;
      list[index].order = nextOrder;
    }

    this.saveBlocks(list);
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

  addShelf(shelfData: Omit<ProductShelf, 'id' | 'active'>): void {
    const newShelf: ProductShelf = {
      ...shelfData,
      id: 'shf-' + Date.now(),
      active: true
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
    const list = this.shelves();
    const item = list.find(s => s.id === id);
    if (item) {
      item.active = !item.active;
      this.saveShelves(list);
    }
  }

  // --- BLOGS MANAGEMENT ---
  toggleBlogHomepage(id: number): void {
    const list = this.blogs();
    const item = list.find(b => b.id === id);
    if (item) {
      item.showOnHomepage = !item.showOnHomepage;
      this.blogs.set([...list]);
      localStorage.setItem(this.STORAGE_BLOGS_KEY, JSON.stringify(list));
    }
  }

  // --- BRANDS MANAGEMENT ---
  toggleBrandHomepage(id: string): void {
    const list = this.brands();
    const item = list.find(b => b.id === id);
    if (item) {
      item.showOnHomepage = !item.showOnHomepage;
      this.brands.set([...list]);
      localStorage.setItem(this.STORAGE_BRANDS_KEY, JSON.stringify(list));
    }
  }
}

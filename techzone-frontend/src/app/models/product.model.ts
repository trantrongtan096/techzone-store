export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  parentId?: number;
  priority?: number;
  isActive?: boolean;
  showInNavbar?: boolean;
  showOnHomepage?: boolean;
}

export interface Brand {
  id: number;
  name: string;
  logoUrl?: string;
  description?: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary?: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category: Category;
  brand: Brand;
  originalPrice: number;
  promotionPrice?: number;
  discountPercentage?: number;
  thumbnail: string;
  description: string;
  specsJson?: string;
  stockQuantity: number;
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSaleEndTime?: string;
  images?: ProductImage[];
}

export interface ProductPageResponse {
  content: Product[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

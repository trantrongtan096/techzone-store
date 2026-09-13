export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
  active: boolean;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  thumbnail?: string;
  category: ArticleCategory;
  status: ArticleStatus;
  author?: { id: number; fullName: string; email: string };
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ArticlePage {
  content: Article[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ArticlePayload {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  thumbnail?: string;
  categoryId: number | null;
  status: ArticleStatus;
  seoTitle?: string;
  seoDescription?: string;
}

export interface HomepageArticleItem {
  id: number;
  article: Article;
  displayOrder: number;
  active: boolean;
  createdAt?: string;
}

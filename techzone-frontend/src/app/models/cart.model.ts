import { Product } from './product.model';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: number;
  sessionId?: string;
  items: CartItem[];
}

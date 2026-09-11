import { Product } from './product.model';

export interface OrderItem {
  id: number;
  product: Product;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  discountAmount?: number;
  note?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface CheckoutRequest {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod?: string;
  note?: string;
  sessionId?: string;
}

export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id?: number;
  total: number;
  status: OrderStatus;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Category {
  id?: number;
  name: string;
  icon?: string;
  created_at?: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
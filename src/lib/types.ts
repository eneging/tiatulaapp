export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "preparing" | "ready" | "assigned" | "in_transit" | "delivered";
  deliveryMode: "delivery" | "pickup" | "dine_in";
  paymentMethod: string;
  createdAt: Date;
}

export type Role = "SUPER_ADMIN" | "COMMERCE_OWNER" | "COMMERCE_STAFF" | "DRIVER" | "CLIENT";

export type OrderStatus =
  | "PAYMENT_PENDING"
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "DRIVER_ASSIGNED"
  | "PICKED_UP"
  | "DELIVERED"
  | "CANCELLED";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: Role;
  isActive: boolean;
  // El backend expone el comercio propio (si el usuario es COMMERCE_OWNER) como objeto anidado,
  // no como un id plano, para que el front nunca necesite volver a pedirlo.
  commerce?: { id: string; name: string } | null;
}

export interface Commerce {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  isOpen: boolean;
  address: string;
}

export interface Product {
  id: string;
  commerceId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  commerceId: string;
  clientId: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryFee: number;
  dropoffAddress: string;
  items: OrderItem[];
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

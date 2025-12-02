// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'customer' | 'vendor' | 'admin' | 'delivery';
  addresses: Address[];
  favorites: string[];
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  label: string; // home, work, other
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  city: string;
  area: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
  instructions?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// ============================================
// PRODUCT & CATALOG TYPES
// ============================================

export type VerticalType = 'store' | 'restaurant' | 'sweets' | 'services' | 'wholesale';

export interface Product {
  _id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  thumbnail: string;
  category: string;
  subcategory?: string;
  vertical: VerticalType;
  vendorId: string;
  vendor: Vendor;
  stock: number;
  unit?: string; // kg, piece, etc
  weight?: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  variants?: ProductVariant[];
  nutritionInfo?: NutritionInfo;
  ingredients?: string[];
  allergens?: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  deliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  attributes: {
    size?: string;
    color?: string;
    flavor?: string;
    [key: string]: string | undefined;
  };
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export interface Category {
  _id: string;
  name: string;
  nameEn?: string;
  icon: string;
  image?: string;
  vertical: VerticalType;
  subcategories?: Subcategory[];
  order: number;
}

export interface Subcategory {
  _id: string;
  name: string;
  nameEn?: string;
  categoryId: string;
}

// ============================================
// VENDOR TYPES
// ============================================

export interface Vendor {
  _id: string;
  name: string;
  nameEn?: string;
  logo: string;
  banner?: string;
  description: string;
  vertical: VerticalType;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  minOrder: number;
  deliveryFee: number;
  address: Address;
  phone: string;
  email: string;
  isOpen: boolean;
  openingHours: OpeningHours[];
  categories: string[];
  featured: boolean;
  verified: boolean;
  createdAt: string;
}

export interface OpeningHours {
  day: number; // 0-6 (Sunday-Saturday)
  open: string; // "09:00"
  close: string; // "22:00"
  isOpen: boolean;
}

// ============================================
// CART & ORDER TYPES
// ============================================

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: ProductVariant;
  specialInstructions?: string;
  addons?: Addon[];
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  vendorId: string;
  vendor: Vendor;
  items: CartItem[];
  deliveryAddress: Address;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  specialInstructions?: string;
  trackingUpdates: TrackingUpdate[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'cash' | 'card' | 'wallet' | 'online';

export interface TrackingUpdate {
  status: OrderStatus;
  timestamp: string;
  message: string;
  location?: {
    lat: number;
    lng: number;
  };
}

// ============================================
// REVIEW & RATING TYPES
// ============================================

export interface Review {
  _id: string;
  userId: string;
  user: {
    name: string;
    avatar?: string;
  };
  productId?: string;
  vendorId?: string;
  orderId: string;
  rating: number;
  comment: string;
  images?: string[];
  helpful: number;
  createdAt: string;
}

// ============================================
// SERVICE TYPES
// ============================================

export interface ServiceItem {
  _id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  icon: string;
  image?: string;
  category: string;
  price?: number;
  priceType: 'fixed' | 'hourly' | 'custom';
  vendorId: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
}

export interface ServiceBooking {
  _id: string;
  userId: string;
  serviceId: string;
  service: ServiceItem;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  address: Address;
  notes?: string;
  price: number;
  createdAt: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  _id: string;
  userId: string;
  type: 'order' | 'promo' | 'system' | 'delivery';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// ============================================
// PROMOTION & COUPON TYPES
// ============================================

export interface Promotion {
  _id: string;
  title: string;
  description: string;
  image: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  vertical?: VerticalType;
  vendorId?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validUntil: string;
  isActive: boolean;
}

// ============================================
// SEARCH & FILTER TYPES
// ============================================

export interface SearchFilters {
  query?: string;
  vertical?: VerticalType;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'price' | 'rating' | 'popularity' | 'newest';
  sortOrder?: 'asc' | 'desc';
  inStock?: boolean;
}

// ============================================
// ANALYTICS & STATS TYPES (For Vendor Dashboard)
// ============================================

export interface VendorStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
  productsCount: number;
  rating: number;
  reviewCount: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

// ============================================
// CHAT & SUPPORT TYPES
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot' | 'support';
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface SupportTicket {
  _id: string;
  userId: string;
  orderId?: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: ChatMessage[];
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

// ============================================
// LANGUAGE & THEME TYPES
// ============================================

export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export interface AppSettings {
  language: Language;
  theme: Theme;
  notifications: boolean;
  soundEffects: boolean;
}

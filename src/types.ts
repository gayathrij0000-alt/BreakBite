export type DietType = 'veg' | 'non-veg' | 'egg';

export interface CustomizationOption {
  id: string;
  name: string;
  price: number; // in ₹
}

export interface CustomizationGroup {
  id: string;
  title: string;
  required?: boolean;
  maxSelect?: number;
  options: CustomizationOption[];
}

export interface FoodItem {
  id: string;
  stallId: string;
  name: string;
  description: string;
  price: number; // in ₹
  originalPrice?: number; // for discounts
  prepTimeMinutes: number; // Preparation time in minutes
  dietType: DietType;
  category: string;
  image: string;
  rating: number;
  ratingCount: number;
  isBestseller?: boolean;
  isExpressGrab?: boolean; // Ready to grab immediately (<3 mins)
  calories?: string;
  portion: string;
  customizationGroups?: CustomizationGroup[];
  tags: string[];
}

export interface CafeteriaStall {
  id: string;
  name: string;
  tagline: string;
  counterNumber: string;
  location: string;
  currentQueueCount: number; // live orders ahead
  averageWaitMinutes: number;
  rating: number;
  ratingCount: number;
  image: string;
  badge?: string;
  isOpen: boolean;
  categories: string[];
  bannerBg: string;
}

export interface SelectedCustomization {
  groupId: string;
  groupTitle: string;
  option: CustomizationOption;
}

export interface CartItem {
  cartItemId: string;
  item: FoodItem;
  quantity: number;
  selectedCustomizations: SelectedCustomization[];
  specialInstructions?: string;
  itemPrice: number; // unit price with add-ons
  totalPrice: number; // itemPrice * quantity
}

export type OrderStatus = 'confirmed' | 'cooking' | 'ready' | 'collected';
export type DineOption = 'dine-in' | 'takeaway';

export interface Order {
  id: string;
  tokenNumber: string; // e.g. "BB-204"
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  dineOption: DineOption;
  stallId: string;
  stallName: string;
  counterNumber: string;
  estimatedPrepMinutes: number;
  createdAt: number; // timestamp
  readyAt: number; // estimated ready timestamp
  completedAt?: number;
  paymentMethod: string;
  paymentId: string;
  collectionOtp: string;
}

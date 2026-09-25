import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, FoodItem, SelectedCustomization } from '../types';
import { sound } from '../utils/audio';

interface CartContextType {
  cart: CartItem[];
  addItem: (item: FoodItem, customizations?: SelectedCustomization[], instructions?: string, quantity?: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  maxPrepTime: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'breakbite_cart_v1';
const COUPON_STORAGE_KEY = 'breakbite_coupon_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() => {
    try {
      return localStorage.getItem(COUPON_STORAGE_KEY) || 'BREAK10'; // default welcome campus coupon
    } catch {
      return 'BREAK10';
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, appliedCoupon);
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [appliedCoupon]);

  const addItem = (
    item: FoodItem,
    customizations: SelectedCustomization[] = [],
    instructions?: string,
    quantity: number = 1
  ) => {
    sound.playTap();
    // Calculate customization price
    const addOnPrice = customizations.reduce((sum, c) => sum + c.option.price, 0);
    const unitPrice = item.price + addOnPrice;

    // Create a fingerprint to combine identical items
    const customKey = customizations.map(c => c.option.id).sort().join('_');
    const existingIndex = cart.findIndex(
      ci => ci.item.id === item.id && 
            ci.selectedCustomizations.map(c => c.option.id).sort().join('_') === customKey &&
            (ci.specialInstructions || '') === (instructions || '')
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + quantity;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].totalPrice = newQty * unitPrice;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        cartItemId: `${item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        item,
        quantity,
        selectedCustomizations: customizations,
        specialInstructions: instructions,
        itemPrice: unitPrice,
        totalPrice: unitPrice * quantity,
      };
      setCart(prev => [...prev, newItem]);
    }
  };

  const removeItem = (cartItemId: string) => {
    sound.playTap();
    setCart(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    sound.playTap();
    setCart(prev => {
      return prev
        .map(item => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.itemPrice * newQty,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // Maximum prep time among items in the cart
  const maxPrepTime = cart.length === 0 ? 0 : Math.max(...cart.map(i => i.item.prepTimeMinutes));

  // Discount calculation
  let discount = 0;
  if (appliedCoupon === 'BREAK10' && subtotal > 0) {
    discount = Math.round(subtotal * 0.1); // 10% student break coupon
  } else if (appliedCoupon === 'FLAT20' && subtotal >= 100) {
    discount = 20;
  }

  // 5% standard campus food GST
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.05);
  const grandTotal = taxableAmount + tax;

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (clean === 'BREAK10') {
      setAppliedCoupon('BREAK10');
      return { success: true, message: '10% Break Student Discount applied!' };
    }
    if (clean === 'FLAT20') {
      if (subtotal < 100) {
        return { success: false, message: 'Requires minimum order of ₹100' };
      }
      setAppliedCoupon('FLAT20');
      return { success: true, message: 'Flat ₹20 off applied!' };
    }
    return { success: false, message: 'Invalid coupon code. Try BREAK10 or FLAT20' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount,
        tax,
        grandTotal,
        maxPrepTime,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

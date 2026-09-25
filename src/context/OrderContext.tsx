import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CartItem, DineOption, Order, OrderStatus } from '../types';
import { sound } from '../utils/audio';

interface CreateOrderParams {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  dineOption: DineOption;
  stallId: string;
  stallName: string;
  counterNumber: string;
  estimatedPrepMinutes: number;
  paymentMethod: string;
}

interface OrderContextType {
  activeOrder: Order | null;
  orderHistory: Order[];
  createOrder: (params: CreateOrderParams) => Order;
  cancelActiveOrder: () => void;
  markOrderCollected: () => void;
  simulateOrderReady: () => void;
  remainingSeconds: number;
  progressPercent: number;
  isOrderTrackingOpen: boolean;
  setIsOrderTrackingOpen: (open: boolean) => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ACTIVE_ORDER_KEY = 'breakbite_active_order_v1';
const ORDER_HISTORY_KEY = 'breakbite_order_history_v1';

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_ORDER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [orderHistory, setOrderHistory] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDER_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const buzzerPlayedRef = useRef(false);

  // Sync to storage
  useEffect(() => {
    try {
      if (activeOrder) {
        localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify(activeOrder));
      } else {
        localStorage.removeItem(ACTIVE_ORDER_KEY);
      }
    } catch {
      // ignore
    }
  }, [activeOrder]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(orderHistory));
    } catch {
      // ignore
    }
  }, [orderHistory]);

  // Real-time ticking timer for active order
  useEffect(() => {
    if (!activeOrder) {
      setRemainingSeconds(0);
      setProgressPercent(0);
      return;
    }

    const totalDurationSecs = Math.max(1, activeOrder.estimatedPrepMinutes * 60);

    const updateTimer = () => {
      const now = Date.now();
      const diffMs = activeOrder.readyAt - now;
      const leftSecs = Math.max(0, Math.ceil(diffMs / 1000));
      setRemainingSeconds(leftSecs);

      const elapsed = (now - activeOrder.createdAt) / 1000;
      const pct = Math.min(100, Math.max(0, Math.round((elapsed / totalDurationSecs) * 100)));
      setProgressPercent(pct);

      // Auto update status based on progression
      let currentStatus: OrderStatus = activeOrder.status;

      if (leftSecs === 0) {
        currentStatus = 'ready';
        if (!buzzerPlayedRef.current) {
          sound.playReadyBuzzer();
          buzzerPlayedRef.current = true;
        }
      } else if (pct >= 20 && activeOrder.status === 'confirmed') {
        currentStatus = 'cooking';
      }

      if (currentStatus !== activeOrder.status) {
        setActiveOrder(prev => prev ? { ...prev, status: currentStatus } : null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeOrder]);

  const createOrder = (params: CreateOrderParams): Order => {
    buzzerPlayedRef.current = false;
    const now = Date.now();
    const prepMinutes = Math.max(1, params.estimatedPrepMinutes);
    const readyAt = now + prepMinutes * 60 * 1000;
    
    // Generate token like #BB-214
    const tokenNumber = `BB-${Math.floor(100 + Math.random() * 900)}`;
    const collectionOtp = String(Math.floor(1000 + Math.random() * 9000));

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      tokenNumber,
      items: params.items,
      subtotal: params.subtotal,
      discount: params.discount,
      tax: params.tax,
      total: params.total,
      status: 'confirmed',
      dineOption: params.dineOption,
      stallId: params.stallId,
      stallName: params.stallName,
      counterNumber: params.counterNumber,
      estimatedPrepMinutes: prepMinutes,
      createdAt: now,
      readyAt,
      paymentMethod: params.paymentMethod,
      paymentId: `PAY_UPI_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      collectionOtp,
    };

    setActiveOrder(newOrder);
    setOrderHistory(prev => [newOrder, ...prev]);
    setIsOrderTrackingOpen(true);
    sound.playSuccess();
    return newOrder;
  };

  const simulateOrderReady = () => {
    if (!activeOrder) return;
    const updated: Order = {
      ...activeOrder,
      status: 'ready',
      readyAt: Date.now(),
    };
    setActiveOrder(updated);
    setRemainingSeconds(0);
    setProgressPercent(100);
    sound.playReadyBuzzer();
  };

  const markOrderCollected = () => {
    if (!activeOrder) return;
    sound.playSuccess();
    const completed: Order = {
      ...activeOrder,
      status: 'collected',
      completedAt: Date.now(),
    };
    // Update in history
    setOrderHistory(prev =>
      prev.map(o => (o.id === completed.id ? completed : o))
    );
    setActiveOrder(null);
    setIsOrderTrackingOpen(false);
  };

  const cancelActiveOrder = () => {
    if (!activeOrder) return;
    sound.playTap();
    setActiveOrder(null);
    setIsOrderTrackingOpen(false);
  };

  return (
    <OrderContext.Provider
      value={{
        activeOrder,
        orderHistory,
        createOrder,
        cancelActiveOrder,
        markOrderCollected,
        simulateOrderReady,
        remainingSeconds,
        progressPercent,
        isOrderTrackingOpen,
        setIsOrderTrackingOpen,
        isHistoryOpen,
        setIsHistoryOpen,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

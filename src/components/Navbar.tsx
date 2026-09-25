import React from 'react';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { PWAInstallButton } from './PWAInstallButton';
import { ShoppingBag, Clock, History, UtensilsCrossed, Sparkles } from 'lucide-react';
import { DineOption } from '../types';

interface NavbarProps {
  currentBreakMinutes: number;
  onOpenBreakSelector: () => void;
  dineOption: DineOption;
  onToggleDineOption: (opt: DineOption) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentBreakMinutes,
  onOpenBreakSelector,
  dineOption,
  onToggleDineOption,
}) => {
  const { itemCount, grandTotal, setIsCartOpen } = useCart();
  const { activeOrder, setIsOrderTrackingOpen, setIsHistoryOpen, remainingSeconds } = useOrder();

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo with explicit "DINE IN" in Orange */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {/* Logo Emblem */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 p-0.5 shadow-md shadow-orange-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <div className="flex items-center justify-center text-orange-600 font-black text-xl font-heading tracking-tighter">
                  B<span className="text-orange-500 text-sm">⚡</span>
                </div>
              </div>
            </div>

            {/* Logo Text & Orange DINE IN badge */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-xl tracking-tight text-stone-900 leading-none">
                  break<span className="text-orange-600">bite</span>
                </span>
                {/* User explicit requirement: Logo with Dine In in Orange color */}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-orange-50 border border-orange-300 text-orange-600 text-[10px] font-black tracking-wider uppercase shadow-xs">
                  DINE IN
                </span>
              </div>
              <span className="text-[10px] font-medium text-stone-500 leading-none mt-0.5 hidden xs:inline">
                Campus Food Court • Ready on Time
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dine In vs Takeaway Toggle with Orange active highlight */}
          <div className="hidden md:flex items-center p-1 bg-stone-100 rounded-full border border-stone-200 text-xs font-semibold">
            <button
              onClick={() => onToggleDineOption('dine-in')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full transition cursor-pointer ${
                dineOption === 'dine-in'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <UtensilsCrossed className="w-3 h-3" />
              <span>Dine In</span>
            </button>
            <button
              onClick={() => onToggleDineOption('takeaway')}
              className={`flex items-center gap-1 px-3 py-1 rounded-full transition cursor-pointer ${
                dineOption === 'takeaway'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Quick Takeaway</span>
            </button>
          </div>

          {/* Break Timer Pill / Filter */}
          <button
            onClick={onOpenBreakSelector}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 hover:bg-orange-100 transition text-xs font-bold cursor-pointer"
            title="Set your break time limit"
          >
            <Clock className="w-3.5 h-3.5 text-orange-600 animate-spin-slow" />
            <span className="hidden sm:inline">Break:</span>
            <span>{currentBreakMinutes > 0 ? `${currentBreakMinutes}m` : 'Any'}</span>
          </button>

          {/* Active Order Live Tracker Pill */}
          {activeOrder && (
            <button
              onClick={() => setIsOrderTrackingOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 animate-pulse hover:brightness-105 transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>{activeOrder.tokenNumber}</span>
              <span className="text-[11px] opacity-90">
                {activeOrder.status === 'ready' ? 'READY!' : formatTimer(remainingSeconds)}
              </span>
            </button>
          )}

          {/* PWA Phone Install Button */}
          <PWAInstallButton variant="nav" />

          {/* Order History */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            aria-label="Order History"
            className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
            title="Past Orders"
          >
            <History className="w-5 h-5" />
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Cart"
            className="relative flex items-center gap-2 px-3 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-black flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            {itemCount > 0 ? (
              <span className="hidden xs:inline">₹{grandTotal}</span>
            ) : (
              <span className="hidden xs:inline">Cart</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

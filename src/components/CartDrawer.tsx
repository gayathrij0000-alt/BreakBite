import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, Clock, ShieldCheck, Tag, ArrowRight, Utensils, Zap } from 'lucide-react';
import { DineOption } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
  selectedBreakMinutes: number;
  dineOption: DineOption;
  onToggleDineOption: (opt: DineOption) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
  selectedBreakMinutes,
  dineOption,
  onToggleDineOption,
}) => {
  const {
    cart,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discount,
    tax,
    grandTotal,
    maxPrepTime,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput('');
  };

  // Time calculations
  const walkBuffer = 1; // 1 min walk to stall counter
  const totalEstimatedTime = maxPrepTime + walkBuffer;
  const breakWindow = selectedBreakMinutes > 0 ? selectedBreakMinutes : 10;
  const bufferRemaining = breakWindow - totalEstimatedTime;
  const isTimeSafe = bufferRemaining >= 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </div>
            <div>
              <h2 className="font-heading font-black text-lg text-stone-900 leading-tight">
                Your Food Tray
              </h2>
              <p className="text-xs text-stone-500">Live Kitchen Prep Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-stone-400 hover:text-red-600 transition cursor-pointer"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Items Container */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-4 text-orange-400">
              <Clock className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="font-heading font-bold text-lg text-stone-900">Your Tray is Empty</h3>
            <p className="text-xs text-stone-500 max-w-xs mt-1">
              Select items from campus stalls. Check live preparation times to grab food before class starts!
            </p>
            <button
              onClick={onClose}
              className="mt-5 px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition"
            >
              Explore Cafeteria Menu
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Dine-in vs Takeaway toggle */}
            <div className="bg-stone-100 p-1 rounded-xl flex items-center text-xs font-bold">
              <button
                onClick={() => onToggleDineOption('dine-in')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  dineOption === 'dine-in'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Dine In Counter</span>
              </button>
              <button
                onClick={() => onToggleDineOption('takeaway')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  dineOption === 'takeaway'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Express Takeaway</span>
              </button>
            </div>

            {/* Break Time Safety Meter */}
            <div
              className={`p-3 rounded-2xl border ${
                isTimeSafe
                  ? 'bg-emerald-50/80 border-emerald-200'
                  : 'bg-amber-50/80 border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold flex items-center gap-1 text-stone-900">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  Prep Time: {maxPrepTime} mins
                </span>
                <span
                  className={`font-black text-[11px] px-2 py-0.5 rounded-md ${
                    isTimeSafe
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {isTimeSafe ? 'Safe for Break' : 'Tight Schedule'}
                </span>
              </div>

              {/* Progress visual bar */}
              <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden border border-stone-200 my-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isTimeSafe ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((totalEstimatedTime / breakWindow) * 100))}%`,
                  }}
                />
              </div>

              <p className="text-[11px] text-stone-600 leading-tight">
                {isTimeSafe ? (
                  <span>
                    🟢 Prepared in <strong className="text-stone-900">{maxPrepTime}m</strong> + 1m walk = ready in {totalEstimatedTime}m. You have <strong>{bufferRemaining}m</strong> buffer before class!
                  </span>
                ) : (
                  <span>
                    ⚠️ Total {totalEstimatedTime}m exceeds your {breakWindow}m break by {Math.abs(bufferRemaining)}m. Consider faster items like Puffs (1m) or Chai (2m)!
                  </span>
                )}
              </p>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3">
              {cart.map(cartItem => (
                <div
                  key={cartItem.cartItemId}
                  className="p-3 rounded-xl border border-stone-200 bg-white hover:border-orange-200 transition shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {/* Veg indicator */}
                      <span className="mt-1 w-3.5 h-3.5 rounded-xs border-2 border-emerald-600 flex items-center justify-center p-0.5 shrink-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cartItem.item.dietType === 'veg'
                              ? 'bg-emerald-600'
                              : cartItem.item.dietType === 'egg'
                              ? 'bg-amber-500'
                              : 'bg-red-600'
                          }`}
                        />
                      </span>

                      <div>
                        <h4 className="text-xs font-bold text-stone-900 leading-tight">
                          {cartItem.item.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                          <span>⏱️ {cartItem.item.prepTimeMinutes}m prep</span>
                          <span>•</span>
                          <span>₹{cartItem.itemPrice} each</span>
                        </div>

                        {/* Selected customizations pills */}
                        {cartItem.selectedCustomizations.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {cartItem.selectedCustomizations.map((c, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium"
                              >
                                {c.option.name} {c.option.price > 0 ? `(+₹${c.option.price})` : ''}
                              </span>
                            ))}
                          </div>
                        )}

                        {cartItem.specialInstructions && (
                          <p className="text-[10px] text-orange-800 italic mt-0.5">
                            Note: "{cartItem.specialInstructions}"
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="font-heading font-black text-sm text-stone-900 shrink-0">
                      ₹{cartItem.totalPrice}
                    </span>
                  </div>

                  {/* Quantity controls */}
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => removeItem(cartItem.cartItemId)}
                      className="text-stone-400 hover:text-red-600 transition p-1 cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                      <button
                        onClick={() => updateQuantity(cartItem.cartItemId, -1)}
                        className="p-1 hover:bg-stone-200 transition cursor-pointer"
                      >
                        <Minus className="w-3 h-3 text-stone-700" />
                      </button>
                      <span className="px-2 text-xs font-bold text-stone-900 min-w-[20px] text-center">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(cartItem.cartItemId, 1)}
                        className="p-1 hover:bg-stone-200 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-stone-700" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Student Coupon Box */}
            <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-orange-950 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-orange-600" />
                  Campus Student Coupons
                </span>
                {appliedCoupon && (
                  <button
                    onClick={removeCoupon}
                    className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Remove ({appliedCoupon})
                  </button>
                )}
              </div>

              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    placeholder="Enter code (e.g. BREAK10)"
                    className="flex-1 uppercase text-xs px-3 py-1.5 rounded-lg bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold tracking-wider"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <span>✓ Coupon "{appliedCoupon}" applied</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              {couponMsg && (
                <p
                  className={`text-[10px] mt-1 font-semibold ${
                    couponMsg.isError ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* Bill Details Breakdown in ₹ */}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-900">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Campus Discount (BREAK10)</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Canteen Tax (GST 5%)</span>
                <span className="font-semibold text-stone-900">₹{tax}</span>
              </div>
              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>Student Platform Fee</span>
                <span className="text-emerald-700 font-bold uppercase">₹0 (Free)</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-heading font-black text-sm text-stone-900">
                <span>To Pay</span>
                <span className="text-base text-orange-600">₹{grandTotal}</span>
              </div>
            </div>
          </div>
        )}

        {/* Drawer Sticky Footer with Checkout button */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-stone-200 shrink-0 shadow-lg">
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-600/25 flex items-center justify-between transition active:scale-98 cursor-pointer"
            >
              <div className="text-left">
                <span className="text-[11px] block opacity-90 uppercase tracking-wider font-semibold">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} • ⏱️ {maxPrepTime}m Prep
                </span>
                <span className="font-heading font-black text-base">₹{grandTotal}</span>
              </div>

              <div className="flex items-center gap-1 text-sm font-black">
                <span>Order & Pay Now</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

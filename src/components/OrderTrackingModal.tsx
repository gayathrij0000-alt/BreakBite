import React from 'react';
import { useOrder } from '../context/OrderContext';
import { X, Clock, CheckCircle2, QrCode, MapPin, ChefHat, Bell, FastForward, Check, Utensils, AlertTriangle } from 'lucide-react';
import { sound } from '../utils/audio';

export const OrderTrackingModal: React.FC = () => {
  const {
    activeOrder,
    remainingSeconds,
    progressPercent,
    isOrderTrackingOpen,
    setIsOrderTrackingOpen,
    simulateOrderReady,
    markOrderCollected,
    cancelActiveOrder,
  } = useOrder();

  if (!isOrderTrackingOpen || !activeOrder) return null;

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isReady = activeOrder.status === 'ready' || remainingSeconds === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isReady ? 'bg-emerald-500 animate-ping' : 'bg-orange-500 animate-pulse'
              }`}
            />
            <h3 className="font-heading font-black text-lg text-stone-900">
              Live Order Status
            </h3>
          </div>
          <button
            onClick={() => setIsOrderTrackingOpen(false)}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Main Pickup Token & Timer Card */}
          <div
            className={`p-5 rounded-3xl text-center relative overflow-hidden transition-all duration-300 ${
              isReady
                ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/25 ring-4 ring-emerald-400/40'
                : 'bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 text-white shadow-xl shadow-orange-600/20'
            }`}
          >
            {/* Background watermarks */}
            <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-2">
              {activeOrder.dineOption === 'dine-in' ? '🍽️ Dine In Order' : '⚡ Express Takeaway'}
            </span>

            <p className="text-xs uppercase tracking-widest text-white/80 font-bold">
              Your Pickup Token
            </p>
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tight my-1 drop-shadow-sm">
              {activeOrder.tokenNumber}
            </h1>

            {/* Countdown or Ready state */}
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-black/25 backdrop-blur-md">
              <Clock className="w-4 h-4 text-amber-300" />
              {isReady ? (
                <span className="font-black text-sm tracking-wide text-amber-300 animate-pulse">
                  🔔 READY FOR PICKUP AT COUNTER!
                </span>
              ) : (
                <span className="font-mono font-black text-lg">
                  {formatTimer(remainingSeconds)} remaining
                </span>
              )}
            </div>

            <p className="text-xs text-white/90 mt-2 font-medium">
              Collect at: <strong className="underline decoration-white/50">{activeOrder.counterNumber} ({activeOrder.stallName})</strong>
            </p>
          </div>

          {/* 3-Step Live Progress Indicator */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Kitchen Preparation Pipeline
            </h4>

            <div className="space-y-3">
              {/* Step 1: Placed */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-stone-900">Order Confirmed & Paid</p>
                  <p className="text-[11px] text-stone-500">Ticket printed at stall kitchen</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-600">✓ Done</span>
              </div>

              {/* Step 2: Cooking */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isReady
                      ? 'bg-emerald-600 text-white'
                      : 'bg-orange-600 text-white animate-spin-slow'
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-stone-900">
                    Cooking & Packaging ({activeOrder.stallName})
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Fresh ingredients on tawa/griddle
                  </p>
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    isReady ? 'text-emerald-600' : 'text-orange-600'
                  }`}
                >
                  {isReady ? '✓ Done' : 'In Progress'}
                </span>
              </div>

              {/* Step 3: Ready */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isReady
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-300/60'
                      : 'bg-stone-200 text-stone-400'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-stone-900">
                    Ready on Tray ({activeOrder.counterNumber})
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Show token/QR to the counter staff
                  </p>
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    isReady ? 'text-emerald-600 animate-pulse' : 'text-stone-400'
                  }`}
                >
                  {isReady ? 'READY NOW!' : 'Waiting'}
                </span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-4 pt-3 border-t border-stone-200">
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isReady ? 'bg-emerald-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${isReady ? 100 : progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Digital QR Code & Verification Pin for Counter */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Simulated QR Code box */}
              <div className="w-16 h-16 rounded-xl bg-stone-900 p-1.5 flex flex-col justify-between shrink-0 shadow-xs">
                <div className="flex justify-between">
                  <div className="w-3.5 h-3.5 bg-white rounded-xs p-0.5"><div className="w-full h-full bg-stone-900" /></div>
                  <div className="w-3.5 h-3.5 bg-white rounded-xs p-0.5"><div className="w-full h-full bg-stone-900" /></div>
                </div>
                <div className="flex justify-center gap-0.5">
                  <div className="w-1.5 h-1.5 bg-white" />
                  <div className="w-1.5 h-1.5 bg-orange-400" />
                </div>
                <div className="flex justify-between">
                  <div className="w-3.5 h-3.5 bg-white rounded-xs p-0.5"><div className="w-full h-full bg-stone-900" /></div>
                  <div className="w-3.5 h-3.5 bg-white" />
                </div>
              </div>

              <div>
                <p className="text-xs font-black text-stone-900">
                  Scan at Counter or Show Token
                </p>
                <p className="text-[11px] text-stone-500">
                  Order ID: {activeOrder.id}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-stone-600">Counter OTP:</span>
                  <span className="font-mono font-black text-sm bg-orange-100 text-orange-900 px-2 py-0.5 rounded-md tracking-wider">
                    {activeOrder.collectionOtp}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => sound.playTap()}
              className="text-stone-400 hover:text-stone-700 transition p-2"
              title="QR Info"
            >
              <QrCode className="w-6 h-6 text-stone-600" />
            </button>
          </div>

          {/* Ordered Food Items List */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Items in this Order ({activeOrder.items.length})
            </h4>

            <div className="space-y-2">
              {activeOrder.items.map(item => (
                <div
                  key={item.cartItemId}
                  className="flex items-center justify-between text-xs py-1 border-b border-stone-200/60 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{item.quantity}x</span>
                    <span className="text-stone-700">{item.item.name}</span>
                  </div>
                  <span className="font-semibold text-stone-900">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-stone-200 flex justify-between text-xs font-bold">
              <span className="text-stone-600">Total Paid (in ₹)</span>
              <span className="font-heading font-black text-sm text-stone-900">
                ₹{activeOrder.total} ({activeOrder.paymentMethod})
              </span>
            </div>
          </div>
        </div>

        {/* Tracking Footer Controls */}
        <div className="p-4 bg-white border-t border-stone-200 shrink-0 space-y-2">
          {/* Fast-forward simulator for testing */}
          {!isReady && (
            <button
              onClick={simulateOrderReady}
              className="w-full py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5 text-orange-600" />
              <span>Simulate Kitchen: Food is Ready Now! (Test Alert)</span>
            </button>
          )}

          {/* Finalize Pickup button */}
          <button
            onClick={markOrderCollected}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer ${
              isReady
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {isReady ? 'Confirm Picked Up at Counter' : 'Picked Up (Collect Food)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

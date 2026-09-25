import React from 'react';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { X, Clock, RotateCcw, Utensils, CheckCircle2, History } from 'lucide-react';
import { sound } from '../utils/audio';

export const OrderHistoryModal: React.FC = () => {
  const { orderHistory, isHistoryOpen, setIsHistoryOpen } = useOrder();
  const { addItem, setIsCartOpen } = useCart();

  if (!isHistoryOpen) return null;

  const handleReorder = (order: typeof orderHistory[0]) => {
    sound.playSuccess();
    order.items.forEach(ci => {
      addItem(ci.item, ci.selectedCustomizations, ci.specialInstructions, ci.quantity);
    });
    setIsHistoryOpen(false);
    setIsCartOpen(true);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-stone-900 leading-tight">
                Order History
              </h3>
              <p className="text-xs text-stone-500">Your campus break meals & receipts</p>
            </div>
          </div>
          <button
            onClick={() => setIsHistoryOpen(false)}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders list */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {orderHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center mx-auto mb-3">
                <Utensils className="w-8 h-8" />
              </div>
              <h4 className="font-heading font-bold text-base text-stone-800">No Orders Yet</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                Your completed orders and tokens will be saved here for quick 1-tap reordering.
              </p>
            </div>
          ) : (
            orderHistory.map(order => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-orange-200 transition shadow-xs"
              >
                {/* Stall & Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-base text-stone-900">
                        {order.stallName}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-bold">
                        {order.tokenNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {formatDate(order.createdAt)} • {order.counterNumber}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      order.status === 'collected'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-orange-50 text-orange-700 border border-orange-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="capitalize">{order.status}</span>
                  </span>
                </div>

                {/* Items summary */}
                <div className="py-2 border-t border-stone-100 text-xs text-stone-600 space-y-1">
                  {order.items.map(item => (
                    <div key={item.cartItemId} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.item.name}
                      </span>
                      <span className="font-medium text-stone-800">₹{item.totalPrice}</span>
                    </div>
                  ))}
                </div>

                {/* Footer with total and reorder */}
                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-stone-400">Total Paid: </span>
                    <span className="font-heading font-black text-sm text-stone-900">
                      ₹{order.total}
                    </span>
                  </div>

                  <button
                    onClick={() => handleReorder(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white border border-orange-200 text-xs font-bold transition active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reorder</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

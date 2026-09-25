import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { X, Clock, ShieldCheck, CheckCircle2, CreditCard, Wallet, QrCode, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DineOption } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBreakMinutes: number;
  dineOption: DineOption;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedBreakMinutes,
  dineOption,
}) => {
  const { cart, subtotal, discount, tax, grandTotal, maxPrepTime, clearCart } = useCart();
  const { createOrder } = useOrder();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'wallet' | 'card' | 'counter'>('upi');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'other'>('gpay');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || cart.length === 0) return null;

  // Determine main stall info from the items
  const primaryStallId = cart[0].item.stallId;
  const primaryStallName = primaryStallId.includes('chai')
    ? 'Campus Chai & Maggi Hub'
    : primaryStallId.includes('dinein')
    ? 'Dine In Express (Main Food Court)'
    : primaryStallId.includes('south')
    ? 'South Canteen Delights'
    : primaryStallId.includes('rolls')
    ? 'Rolls & Street Wraps'
    : primaryStallId.includes('juice')
    ? 'Fresh Squeeze & Shake Bar'
    : 'The Oven Bakery & Quick Bites';

  const counterNumber = primaryStallId.includes('chai')
    ? 'Counter #1'
    : primaryStallId.includes('dinein')
    ? 'Counter #2'
    : primaryStallId.includes('south')
    ? 'Counter #3'
    : primaryStallId.includes('rolls')
    ? 'Counter #4'
    : primaryStallId.includes('juice')
    ? 'Counter #5'
    : 'Counter #6';

  const handlePayAndOrder = () => {
    setIsProcessing(true);

    setTimeout(() => {
      // Create order
      createOrder({
        items: [...cart],
        subtotal,
        discount,
        tax,
        total: grandTotal,
        dineOption,
        stallId: primaryStallId,
        stallName: primaryStallName,
        counterNumber,
        estimatedPrepMinutes: maxPrepTime,
        paymentMethod:
          paymentMethod === 'upi'
            ? `UPI (${upiApp.toUpperCase()})`
            : paymentMethod === 'wallet'
            ? 'Campus FastWallet'
            : paymentMethod === 'card'
            ? 'Student Debit Card'
            : 'Pay at Counter Pickup',
      });

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ea580c', '#f97316', '#fbbf24', '#10b981'],
        });
      } catch {
        // ignore
      }

      clearCart();
      setIsProcessing(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <h2 className="font-heading font-black text-xl text-stone-900 leading-tight">
              Confirm & Pay
            </h2>
            <p className="text-xs text-stone-500">
              Kitchen starts preparing the moment payment is verified
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Checkout Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Preparation & Pickup Time Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/15">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-orange-100">
                Guaranteed Prep Time
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-black">
                {dineOption === 'dine-in' ? '🍽️ Dine In Counter' : '⚡ Express Takeaway'}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading font-black text-3xl">
                {maxPrepTime} Minutes
              </span>
              <span className="text-xs text-orange-100">
                at {counterNumber} ({primaryStallName})
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-white/20 text-xs text-orange-50 flex items-center justify-between">
              <span>Collection Token will be generated instantly</span>
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            </div>
          </div>

          {/* Payment Methods Section in ₹ */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Select Payment Method (Rupees ₹)
            </label>

            <div className="space-y-2">
              {/* UPI Options */}
              <div
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-2xl border transition cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-orange-50/70 border-orange-500 ring-2 ring-orange-500/20 shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">
                        Instant UPI Payment (0% Gateway Fee)
                      </p>
                      <p className="text-[11px] text-stone-500">Google Pay, PhonePe, Paytm, BHIM</p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'upi'
                        ? 'border-orange-600 bg-orange-600 text-white'
                        : 'border-stone-300'
                    }`}
                  >
                    {paymentMethod === 'upi' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Sub-selector for UPI app */}
                {paymentMethod === 'upi' && (
                  <div className="mt-3 pt-3 border-t border-orange-200/70 grid grid-cols-4 gap-2">
                    {[
                      { id: 'gpay', name: 'GPay' },
                      { id: 'phonepe', name: 'PhonePe' },
                      { id: 'paytm', name: 'Paytm' },
                      { id: 'other', name: 'Any UPI' },
                    ].map(app => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setUpiApp(app.id as any);
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                          upiApp === app.id
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {app.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Campus Student Card / FastWallet */}
              <div
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 rounded-2xl border transition cursor-pointer ${
                  paymentMethod === 'wallet'
                    ? 'bg-orange-50/70 border-orange-500 ring-2 ring-orange-500/20 shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">
                        Campus Student Card / Breakbite Wallet
                      </p>
                      <p className="text-[11px] text-stone-500">Balance: ₹450 (1-Tap Auto Debit)</p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'wallet'
                        ? 'border-orange-600 bg-orange-600 text-white'
                        : 'border-stone-300'
                    }`}
                  >
                    {paymentMethod === 'wallet' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* Cash / Counter Pickup */}
              <div
                onClick={() => setPaymentMethod('counter')}
                className={`p-3 rounded-2xl border transition cursor-pointer ${
                  paymentMethod === 'counter'
                    ? 'bg-orange-50/70 border-orange-500 ring-2 ring-orange-500/20 shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">Pay at Stall Counter</p>
                      <p className="text-[11px] text-stone-500">UPI or Cash when collecting food</p>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'counter'
                        ? 'border-orange-600 bg-orange-600 text-white'
                        : 'border-stone-300'
                    }`}
                  >
                    {paymentMethod === 'counter' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Recap */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>Order Amount</span>
              <span className="font-semibold text-stone-900">₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Student Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>GST Tax (5%)</span>
              <span className="font-semibold text-stone-900">₹{tax}</span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex justify-between font-heading font-black text-sm text-stone-900">
              <span>Total Payable</span>
              <span className="text-base text-orange-600">₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-white border-t border-stone-200 shrink-0">
          <button
            onClick={handlePayAndOrder}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-bold text-sm shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying Payment & Kitchen Order...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Pay ₹{grandTotal} & Place Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

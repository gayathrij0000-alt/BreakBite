import React from 'react';
import { FoodItem } from '../types';
import { useCart } from '../context/CartContext';
import { Clock, Plus, Minus, Star, Zap, Flame } from 'lucide-react';

interface FoodItemCardProps {
  item: FoodItem;
  stallName: string;
  stallCounter: string;
  selectedBreakMinutes: number;
  onOpenDetails: (item: FoodItem) => void;
}

export const FoodItemCard: React.FC<FoodItemCardProps> = ({
  item,
  stallName,
  stallCounter,
  selectedBreakMinutes,
  onOpenDetails,
}) => {
  const { cart, addItem, updateQuantity } = useCart();

  // Find all cart items matching this base food item
  const matchingCartItems = cart.filter(ci => ci.item.id === item.id);
  const totalCartQty = matchingCartItems.reduce((acc, ci) => acc + ci.quantity, 0);

  // Feasibility check with user's break
  const fitsBreak = selectedBreakMinutes === 0 || item.prepTimeMinutes <= selectedBreakMinutes;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.customizationGroups && item.customizationGroups.length > 0) {
      onOpenDetails(item);
    } else {
      addItem(item);
    }
  };

  const handleQuickPlus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (matchingCartItems.length === 1 && (!item.customizationGroups || item.customizationGroups.length === 0)) {
      updateQuantity(matchingCartItems[0].cartItemId, 1);
    } else {
      onOpenDetails(item);
    }
  };

  const handleQuickMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (matchingCartItems.length === 1) {
      updateQuantity(matchingCartItems[0].cartItemId, -1);
    } else {
      onOpenDetails(item);
    }
  };

  // Color theme for prep time badge
  const getPrepBadgeStyle = (mins: number) => {
    if (mins <= 2) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (mins <= 5) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  return (
    <div
      onClick={() => onOpenDetails(item)}
      className="group relative bg-white rounded-2xl border border-stone-200 p-3.5 sm:p-4 hover:border-orange-300 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top image & badges row */}
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-stone-100 mb-3">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

          {/* Diet Badge & Bestseller on top left */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            {/* Standard FSSAI food indicator */}
            <div className="w-5 h-5 rounded-md bg-white/95 backdrop-blur-md flex items-center justify-center shadow-xs">
              {item.dietType === 'veg' && (
                <span className="w-3.5 h-3.5 rounded-xs border-2 border-emerald-600 flex items-center justify-center p-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </span>
              )}
              {item.dietType === 'non-veg' && (
                <span className="w-3.5 h-3.5 rounded-xs border-2 border-red-600 flex items-center justify-center p-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                </span>
              )}
              {item.dietType === 'egg' && (
                <span className="w-3.5 h-3.5 rounded-xs border-2 border-amber-500 flex items-center justify-center p-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </span>
              )}
            </div>

            {item.isBestseller && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black shadow-xs">
                <Flame className="w-3 h-3" />
                Bestseller
              </span>
            )}

            {item.isExpressGrab && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                <Zap className="w-3 h-3" />
                Grab & Go
              </span>
            )}
          </div>

          {/* Rating on top right */}
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-900/85 backdrop-blur-md text-white text-xs font-bold shadow-xs">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{item.rating}</span>
          </div>

          {/* Live Preparation Time Tag - Prominent */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-xs ${getPrepBadgeStyle(
                item.prepTimeMinutes
              )}`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{item.prepTimeMinutes} mins prep</span>
            </div>

            <span className="text-[11px] font-medium text-white/90 drop-shadow-sm bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
              {item.portion}
            </span>
          </div>
        </div>

        {/* Stall & Counter attribution */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
          <span className="font-semibold text-orange-700 truncate max-w-[140px]">{stallName}</span>
          <span className="text-stone-400 shrink-0 font-medium">{stallCounter}</span>
        </div>

        {/* Item Title */}
        <h3 className="font-heading font-bold text-base text-stone-900 line-clamp-1 group-hover:text-orange-600 transition">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
          {item.description}
        </p>

        {/* Break Compatibility Alert */}
        {selectedBreakMinutes > 0 && (
          <div className="mt-2.5">
            {fitsBreak ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span>✓</span> Ready in time for your {selectedBreakMinutes}m break
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <span>⚠️</span> May take longer than {selectedBreakMinutes}m
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Price & Add button in Rupees ₹ */}
      <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading font-black text-lg text-stone-900">
            ₹{item.price}
          </span>
          {item.originalPrice && (
            <span className="text-xs text-stone-400 line-through">
              ₹{item.originalPrice}
            </span>
          )}
        </div>

        {/* Add Button or Quantity Controller */}
        {totalCartQty > 0 ? (
          <div className="flex items-center bg-orange-600 text-white rounded-xl shadow-xs overflow-hidden">
            <button
              onClick={handleQuickMinus}
              aria-label="Decrease quantity"
              className="p-1.5 hover:bg-orange-700 transition active:scale-95 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 text-xs font-black min-w-[20px] text-center">
              {totalCartQty}
            </span>
            <button
              onClick={handleQuickPlus}
              aria-label="Increase quantity"
              className="p-1.5 hover:bg-orange-700 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white border border-orange-200 hover:border-transparent text-xs font-bold transition duration-150 shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD</span>
            {item.customizationGroups && item.customizationGroups.length > 0 && (
              <span className="text-[10px] opacity-80">+</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { FoodItem, SelectedCustomization, CustomizationOption } from '../types';
import { useCart } from '../context/CartContext';
import { X, Clock, Plus, Minus, Star, ShieldCheck, Flame, Check } from 'lucide-react';

interface ItemDetailModalProps {
  item: FoodItem | null;
  stallName: string;
  stallCounter: string;
  selectedBreakMinutes: number;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  stallName,
  stallCounter,
  selectedBreakMinutes,
  onClose,
}) => {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization[]>([]);
  const [instructions, setInstructions] = useState('');

  // Initialize required default customizations when modal opens
  useEffect(() => {
    if (!item) return;
    setQuantity(1);
    setInstructions('');

    const initialSelections: SelectedCustomization[] = [];
    if (item.customizationGroups) {
      item.customizationGroups.forEach(grp => {
        if (grp.required && grp.options.length > 0) {
          initialSelections.push({
            groupId: grp.id,
            groupTitle: grp.title,
            option: grp.options[0],
          });
        }
      });
    }
    setSelectedCustomizations(initialSelections);
  }, [item]);

  if (!item) return null;

  const handleToggleOption = (
    groupId: string,
    groupTitle: string,
    option: CustomizationOption,
    isRequired = false
  ) => {
    if (isRequired) {
      // Radio replacement
      setSelectedCustomizations(prev => [
        ...prev.filter(c => c.groupId !== groupId),
        { groupId, groupTitle, option },
      ]);
    } else {
      // Checkbox toggle
      setSelectedCustomizations(prev => {
        const exists = prev.some(c => c.groupId === groupId && c.option.id === option.id);
        if (exists) {
          return prev.filter(c => !(c.groupId === groupId && c.option.id === option.id));
        } else {
          return [...prev, { groupId, groupTitle, option }];
        }
      });
    }
  };

  const addOnsTotal = selectedCustomizations.reduce((acc, c) => acc + c.option.price, 0);
  const unitPrice = item.price + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addItem(item, selectedCustomizations, instructions.trim() || undefined, quantity);
    onClose();
  };

  const fitsBreak = selectedBreakMinutes === 0 || item.prepTimeMinutes <= selectedBreakMinutes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header & Hero Image */}
        <div className="relative aspect-[16/9] w-full bg-stone-100 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-stone-900/80 backdrop-blur-md text-white text-xs font-bold">
              {stallCounter} • {stallName}
            </span>
          </div>

          {/* Bottom Title & Time on Image */}
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              {/* Veg / Non-veg dot */}
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
              <span className="text-white/90 text-xs font-semibold drop-shadow-sm">
                {item.category} • {item.portion}
              </span>
            </div>
            <h2 className="text-white font-heading font-black text-xl sm:text-2xl drop-shadow-md">
              {item.name}
            </h2>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Preparation Time Guarantee Banner */}
          <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-stone-900">
                  Kitchen Prep Time: {item.prepTimeMinutes} Minutes
                </p>
                <p className="text-[11px] text-stone-600">
                  Starts cooking immediately upon digital payment
                </p>
              </div>
            </div>

            {selectedBreakMinutes > 0 && (
              <span
                className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
                  fitsBreak
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {fitsBreak ? '✓ In Break Window' : '⚠️ Rush Warning'}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
              About This Dish
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Customization Groups */}
          {item.customizationGroups && item.customizationGroups.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-stone-100">
              {item.customizationGroups.map(grp => {
                return (
                  <div key={grp.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-900">
                        {grp.title}{' '}
                        {grp.required && (
                          <span className="text-orange-600 font-semibold">*Required</span>
                        )}
                      </h4>
                      <span className="text-[11px] text-stone-400">
                        {grp.required ? 'Select 1' : 'Optional add-on'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {grp.options.map(opt => {
                        const isSelected = selectedCustomizations.some(
                          c => c.groupId === grp.id && c.option.id === opt.id
                        );

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              handleToggleOption(grp.id, grp.title, opt, grp.required)
                            }
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                              isSelected
                                ? 'bg-orange-50 border-orange-500 text-orange-950 font-bold'
                                : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-${
                                  grp.required ? 'full' : 'md'
                                } border flex items-center justify-center ${
                                  isSelected
                                    ? 'border-orange-600 bg-orange-600 text-white'
                                    : 'border-stone-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5" />}
                              </div>
                              <span>{opt.name}</span>
                            </div>

                            <span className="text-stone-500 font-medium">
                              {opt.price > 0 ? `+₹${opt.price}` : 'Free'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Kitchen Instruction Notes */}
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-900 mb-1">
              Cooking / Delivery Note for Stall (Optional)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. Extra spicy, pack separately, need disposable spoon"
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-800 placeholder:text-stone-400"
              maxLength={100}
            />
          </div>
        </div>

        {/* Modal Footer with Live Price & Add Button */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          {/* Quantity Controls */}
          <div className="flex items-center bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-stone-600 hover:bg-stone-100 transition cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-black text-stone-900 min-w-[28px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-stone-600 hover:bg-stone-100 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart button in ₹ */}
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-between px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition active:scale-98 cursor-pointer"
          >
            <span>Add to Order</span>
            <span className="font-heading font-black text-base">₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

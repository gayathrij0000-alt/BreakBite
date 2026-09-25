import React from 'react';
import { CafeteriaStall } from '../types';
import { Users, Clock, Star, MapPin } from 'lucide-react';

interface StallCardProps {
  stall: CafeteriaStall;
  isSelected: boolean;
  onSelect: (stallId: string) => void;
  itemCount: number;
}

export const StallCard: React.FC<StallCardProps> = ({
  stall,
  isSelected,
  onSelect,
  itemCount,
}) => {
  return (
    <div
      onClick={() => onSelect(stall.id)}
      className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer text-left bg-white ${
        isSelected
          ? 'ring-2 ring-orange-500 border-orange-500 shadow-md shadow-orange-500/10'
          : 'border-stone-200 hover:border-orange-300 hover:shadow-md'
      }`}
    >
      {/* Top Banner Image with Stall details */}
      <div className="relative h-28 w-full overflow-hidden bg-stone-100">
        <img
          src={stall.image}
          alt={stall.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Counter Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-stone-900/85 backdrop-blur-md text-white text-[11px] font-bold tracking-wide">
            {stall.counterNumber}
          </span>
          {stall.badge && (
            <span className="px-2 py-0.5 rounded-md bg-orange-600/90 backdrop-blur-md text-white text-[11px] font-bold">
              {stall.badge}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-stone-900 text-xs font-black shadow-xs">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>{stall.rating}</span>
        </div>

        {/* Stall Name on Bottom of Image */}
        <div className="absolute bottom-2 left-2.5 right-2.5">
          <h4 className="text-white font-black text-sm sm:text-base font-heading drop-shadow-sm truncate">
            {stall.name}
          </h4>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-3">
        <p className="text-stone-500 text-xs line-clamp-1 mb-2.5">
          {stall.tagline}
        </p>

        {/* Key Metrics: Wait Time + Queue status */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1 text-orange-600 font-bold">
            <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>Avg ~{stall.averageWaitMinutes}m wait</span>
          </div>

          <div className="flex items-center gap-1 text-stone-600 font-medium">
            <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>{stall.currentQueueCount} in queue</span>
          </div>
        </div>

        {/* Location & Menu Count */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center gap-1 truncate max-w-[180px]">
            <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
            <span className="truncate">{stall.location}</span>
          </div>
          <span className="font-semibold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">
            {itemCount} items
          </span>
        </div>
      </div>
    </div>
  );
};

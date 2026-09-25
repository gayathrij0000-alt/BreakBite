import React from 'react';
import { Clock, Zap, Search, ShieldCheck, Flame, Utensils, Check } from 'lucide-react';
import { DineOption } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeroBreakBannerProps {
  selectedBreak: number; // in minutes (e.g. 5, 10, 15, or 0 for all)
  onSelectBreak: (mins: number) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  dietFilter: 'all' | 'veg' | 'non-veg';
  onDietFilterChange: (d: 'all' | 'veg' | 'non-veg') => void;
  dineOption: DineOption;
  onToggleDineOption: (d: DineOption) => void;
}

export const HeroBreakBanner: React.FC<HeroBreakBannerProps> = ({
  selectedBreak,
  onSelectBreak,
  searchQuery,
  onSearchChange,
  dietFilter,
  onDietFilterChange,
  dineOption,
  onToggleDineOption,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-stone-50 border-b border-orange-100/80 pt-6 pb-8 px-4 sm:px-6">
      {/* Background ambient blurs */}
      <div className="absolute top-0 right-10 -mt-12 -mr-12 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -mb-12 -ml-12 w-64 h-64 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Top Centered Brand Display with Logo & Orange DINE IN */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-full bg-white border border-orange-200 shadow-xs mb-3">
            {/* Breakbite Logo Mark */}
            <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              B
            </div>
            <span className="font-heading font-black text-xl tracking-tight text-stone-900">
              Break<span className="text-orange-600">bite</span>
            </span>

            {/* Orange DINE IN badge highlighted explicitly */}
            <span className="ml-1 px-2.5 py-0.5 rounded-md bg-orange-500 text-white text-xs font-black tracking-wider uppercase shadow-xs flex items-center gap-1">
              <Utensils className="w-3 h-3" />
              DINE IN
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight max-w-2xl leading-tight">
            <span className="text-stone-900">Short </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
              break?
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-stone-600 max-w-xl font-medium">
            Don't miss lectures waiting in never-ending cafeteria queues. Check live kitchen prep times, order & pay in <span className="font-bold text-stone-900">₹ Rupees</span>, and pick up your hot meal immediately.
          </p>

          {/* Action Row: Dine-In toggle & Phone Install */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex p-1 bg-white rounded-xl border border-stone-200 shadow-xs text-xs font-bold">
              <button
                onClick={() => onToggleDineOption('dine-in')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition cursor-pointer ${
                  dineOption === 'dine-in'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Dine In (Table / Food Court)</span>
              </button>
              <button
                onClick={() => onToggleDineOption('takeaway')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition cursor-pointer ${
                  dineOption === 'takeaway'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Express Takeaway to Class</span>
              </button>
            </div>

            <PWAInstallButton variant="banner" />
          </div>
        </div>

        {/* Break Duration Selector Card (The Core USP) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-orange-200/90 shadow-lg shadow-orange-950/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Filter by Your Remaining Break Time</h3>
                <p className="text-xs text-stone-500">Only see dishes ready before the lecture bell rings</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Late Guarantee</span>
            </div>
          </div>

          {/* Break Options Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { mins: 5, label: '⚡ 5 Min Rush', desc: 'Grab & Go (<4m prep)', tag: 'Ultra Fast' },
              { mins: 10, label: '⏱️ 10 Min Break', desc: 'Standard class gap', tag: 'Most Popular' },
              { mins: 15, label: '🍱 15 Min Break', desc: 'Relaxed hot meals', tag: 'Full Meals' },
              { mins: 0, label: '✨ All Menus', desc: 'Browse full campus menu', tag: 'All Outlets' },
            ].map(opt => {
              const isActive = selectedBreak === opt.mins;
              return (
                <button
                  key={opt.mins}
                  onClick={() => onSelectBreak(opt.mins)}
                  className={`p-3 rounded-xl border text-left transition relative cursor-pointer ${
                    isActive
                      ? 'bg-orange-50 border-orange-500 shadow-sm ring-2 ring-orange-400/30'
                      : 'bg-stone-50/60 border-stone-200 hover:border-stone-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isActive ? 'text-orange-900' : 'text-stone-800'}`}>
                      {opt.label}
                    </span>
                    {isActive && <Check className="w-3.5 h-3.5 text-orange-600" />}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{opt.desc}</p>
                  <span
                    className={`mt-1.5 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {opt.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar & Veg/Non-Veg filter row */}
          <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Search food item (Maggi, Dosa, Chai, Frankie, Thali...)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Diet Filter Pills */}
            <div className="flex items-center gap-1.5 self-start md:self-auto shrink-0">
              <button
                onClick={() => onDietFilterChange('all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  dietFilter === 'all'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                All Diet
              </button>
              <button
                onClick={() => onDietFilterChange('veg')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  dietFilter === 'veg'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-sm border border-emerald-600 flex items-center justify-center p-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </span>
                <span>Pure Veg</span>
              </button>
              <button
                onClick={() => onDietFilterChange('non-veg')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  dietFilter === 'non-veg'
                    ? 'bg-red-700 text-white border-red-700'
                    : 'bg-white text-red-800 border-red-200 hover:bg-red-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-sm border border-red-600 flex items-center justify-center p-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                </span>
                <span>Non-Veg / Egg</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

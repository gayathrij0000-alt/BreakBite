import React, { useState, useMemo } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { OrderProvider, useOrder } from './context/OrderContext';
import { CAFETERIA_STALLS, FOOD_ITEMS } from './data/cafeteriaData';
import { FoodItem, DineOption } from './types';
import { Navbar } from './components/Navbar';
import { HeroBreakBanner } from './components/HeroBreakBanner';
import { StallCard } from './components/StallCard';
import { FoodItemCard } from './components/FoodItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { Clock, Filter, ArrowUpDown, Store, Sparkles, AlertCircle, ShoppingBag, Check } from 'lucide-react';

function AppContent() {
  const { cart, itemCount, grandTotal, maxPrepTime, isCartOpen, setIsCartOpen } = useCart();
  const { activeOrder, setIsOrderTrackingOpen } = useOrder();

  // Filters & State
  const [selectedBreakMinutes, setSelectedBreakMinutes] = useState<number>(10); // default to 10 mins break!
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [dineOption, setDineOption] = useState<DineOption>('dine-in');
  const [selectedStallId, setSelectedStallId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'fastest' | 'price-asc' | 'rating'>('fastest');

  // Modals
  const [detailItem, setDetailItem] = useState<FoodItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // All unique food categories across outlets
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    FOOD_ITEMS.forEach(item => set.add(item.category));
    return ['all', ...Array.from(set)];
  }, []);

  // Filtered and sorted food items
  const filteredItems = useMemo(() => {
    return FOOD_ITEMS.filter(item => {
      // Stall filter
      if (selectedStallId !== 'all' && item.stallId !== selectedStallId) return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Diet filter
      if (dietFilter === 'veg' && item.dietType !== 'veg') return false;
      if (dietFilter === 'non-veg' && item.dietType === 'veg') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      // Break duration filter (if user selected e.g. 5 or 10 mins)
      if (selectedBreakMinutes > 0 && item.prepTimeMinutes > selectedBreakMinutes) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'fastest') {
        return a.prepTimeMinutes - b.prepTimeMinutes;
      }
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });
  }, [selectedStallId, selectedCategory, dietFilter, searchQuery, selectedBreakMinutes, sortBy]);

  // Stall lookup map
  const stallMap = useMemo(() => {
    const map = new Map<string, typeof CAFETERIA_STALLS[0]>();
    CAFETERIA_STALLS.forEach(s => map.set(s.id, s));
    return map;
  }, []);

  const currentStallDetails = detailItem ? stallMap.get(detailItem.stallId) : null;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Offline Toast */}
      <OfflineIndicator />

      {/* Navigation Header */}
      <Navbar
        currentBreakMinutes={selectedBreakMinutes}
        onOpenBreakSelector={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        dineOption={dineOption}
        onToggleDineOption={setDineOption}
      />

      {/* Hero Banner with prominent Breakbite DINE IN logo and 10-Min Break timer */}
      <HeroBreakBanner
        selectedBreak={selectedBreakMinutes}
        onSelectBreak={setSelectedBreakMinutes}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dietFilter={dietFilter}
        onDietFilterChange={setDietFilter}
        dineOption={dineOption}
        onToggleDineOption={setDineOption}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 flex-1 w-full space-y-8">
        {/* Cafeteria Shops / Counters Section */}
        <section>
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-orange-600" />
                <h2 className="font-heading font-black text-lg sm:text-xl text-stone-900">
                  Campus Cafeteria Stalls
                </h2>
              </div>
              <p className="text-xs text-stone-500">
                Choose a counter to view stall-specific menu and live queue status
              </p>
            </div>

            {selectedStallId !== 'all' && (
              <button
                onClick={() => setSelectedStallId('all')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 cursor-pointer"
              >
                Show All Outlets
              </button>
            )}
          </div>

          {/* Stalls Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* All Stalls Chip Card */}
            <div
              onClick={() => setSelectedStallId('all')}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[110px] ${
                selectedStallId === 'all'
                  ? 'bg-orange-600 text-white border-orange-600 shadow-md ring-2 ring-orange-400/40'
                  : 'bg-white border-stone-200 hover:border-orange-300 text-stone-800'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm mb-1.5 ${
                  selectedStallId === 'all' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                }`}
              >
                🍽️
              </div>
              <span className="text-xs font-bold font-heading">All 6 Stalls</span>
              <span
                className={`text-[10px] mt-0.5 ${
                  selectedStallId === 'all' ? 'text-white/80' : 'text-stone-400'
                }`}
              >
                Full Food Court
              </span>
            </div>

            {/* Individual Outlets */}
            {CAFETERIA_STALLS.map(stall => {
              const count = FOOD_ITEMS.filter(i => i.stallId === stall.id).length;
              return (
                <StallCard
                  key={stall.id}
                  stall={stall}
                  isSelected={selectedStallId === stall.id}
                  onSelect={id => setSelectedStallId(selectedStallId === id ? 'all' : id)}
                  itemCount={count}
                />
              );
            })}
          </div>
        </section>

        {/* Live Food Items & Menu Section */}
        <section>
          {/* Controls Bar: Category Pills + Sort Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            {/* Category Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {cat === 'all' ? 'All Dishes' : cat}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="fastest">⚡ Fastest Prep Time</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="price-asc">₹ Price: Low to High</option>
              </select>
            </div>
          </div>

          {/* Active Filter Summary Pill */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span>Showing <strong>{filteredItems.length} items</strong></span>
            {selectedBreakMinutes > 0 && (
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md font-bold">
                <Clock className="w-3 h-3 text-orange-600" />
                Prep &lt;= {selectedBreakMinutes} mins
              </span>
            )}
            {selectedStallId !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-stone-200 text-stone-800 px-2 py-0.5 rounded-md font-bold">
                {stallMap.get(selectedStallId)?.name}
              </span>
            )}
            {dietFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-stone-200 text-stone-800 px-2 py-0.5 rounded-md font-bold uppercase">
                {dietFilter}
              </span>
            )}
          </div>

          {/* Food Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 my-6">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-black text-lg text-stone-900">
                No items found for {selectedBreakMinutes}m break
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                Dishes in this stall require slightly more time to cook fresh. Try increasing your break window or selecting another counter!
              </p>
              <button
                onClick={() => {
                  setSelectedBreakMinutes(0);
                  setSelectedStallId('all');
                  setDietFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {filteredItems.map(item => {
                const stall = stallMap.get(item.stallId);
                return (
                  <FoodItemCard
                    key={item.id}
                    item={item}
                    stallName={stall?.name || 'Campus Stall'}
                    stallCounter={stall?.counterNumber || 'Counter'}
                    selectedBreakMinutes={selectedBreakMinutes}
                    onOpenDetails={setDetailItem}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Campus Advice & Info Banner */}
        <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-5 text-white shadow-lg shadow-orange-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
              Student Pro Tip
            </span>
            <h3 className="font-heading font-black text-xl">
              Order 3 Mins Before Lecture Ends!
            </h3>
            <p className="text-xs text-orange-100 max-w-lg">
              Place your order via the app right as your teacher wraps up. By the time you walk down the stairs to the cafeteria, your hot food token will be ready for instant pickup!
            </p>
          </div>

          <div className="shrink-0">
            <PWAInstallButton variant="banner" />
          </div>
        </section>
      </main>

      {/* Floating Bottom Action Bar for Mobile */}
      {(itemCount > 0 || activeOrder) && (
        <div className="fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto">
          {activeOrder && (
            <div
              onClick={() => setIsOrderTrackingOpen(true)}
              className="mb-2 p-3 rounded-2xl bg-stone-900 text-white shadow-2xl flex items-center justify-between cursor-pointer border border-stone-700 animate-in slide-in-from-bottom duration-200"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <p className="text-xs font-black">
                    Active Order {activeOrder.tokenNumber} • {activeOrder.stallName}
                  </p>
                  <p className="text-[11px] text-stone-300">
                    {activeOrder.status === 'ready'
                      ? '🔔 FOOD READY AT COUNTER!'
                      : 'Cooking fresh right now'}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl bg-orange-600 text-white font-bold text-xs">
                Track
              </span>
            </div>
          )}

          {itemCount > 0 && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full py-3.5 px-5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-2xl shadow-orange-600/40 flex items-center justify-between font-bold text-sm transition active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center text-xs">
                  {itemCount}
                </div>
                <span>View Tray • {maxPrepTime}m Prep</span>
              </div>
              <span className="font-heading font-black text-base">₹{grandTotal} &rarr;</span>
            </button>
          )}
        </div>
      )}

      {/* App Modals */}
      <ItemDetailModal
        item={detailItem}
        stallName={currentStallDetails?.name || 'Campus Stall'}
        stallCounter={currentStallDetails?.counterNumber || 'Counter'}
        selectedBreakMinutes={selectedBreakMinutes}
        onClose={() => setDetailItem(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        selectedBreakMinutes={selectedBreakMinutes}
        dineOption={dineOption}
        onToggleDineOption={setDineOption}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedBreakMinutes={selectedBreakMinutes}
        dineOption={dineOption}
      />

      <OrderTrackingModal />
      <OrderHistoryModal />

      {/* Campus App Footer */}
      <footer className="mt-12 bg-white border-t border-stone-200 py-6 px-4 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-base text-stone-900">
              Break<span className="text-orange-600">bite</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-black uppercase">
              DINE IN & TAKEAWAY
            </span>
          </div>

          <p className="text-stone-400 text-[11px]">
            Campus Cafeteria Fast Order • Prepared on Time for Short 10-Min Breaks • Prices in ₹ INR
          </p>

          <PWAInstallButton variant="pill" />
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <OrderProvider>
        <AppContent />
      </OrderProvider>
    </CartProvider>
  );
}

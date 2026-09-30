import React, { useState } from 'react';
import Image from 'next/image';
import { Circle, Search, ShoppingBag } from 'lucide-react';
import { FishItem, Category } from '../types';
import { getFishImage } from '../utils/fishImageHelper';

interface FishAvailabilityProps {
  fishList: FishItem[];
  categories: Category[];
  loading: boolean;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onBookFish: (fish: FishItem) => void;
}

export default function FishAvailability({
  fishList,
  categories,
  loading,
  selectedCategory,
  onSelectCategory,
  onBookFish,
}: FishAvailabilityProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback fish data matching FishItem interface
  const fallbackFish: FishItem[] = [
    { id: '1', name: 'Rohu', unitPrice: 280, categoryId: 'c1', category: { id: 'c1', name: 'Freshwater/Pond', slug: 'freshwater' }, physicalAvailable: true, onlineBookable: true, freshnessState: 'GREEN' },
    { id: '2', name: 'Catla', unitPrice: 320, categoryId: 'c1', category: { id: 'c1', name: 'Freshwater/Pond', slug: 'freshwater' }, physicalAvailable: true, onlineBookable: true, freshnessState: 'GREEN' },
    { id: '3', name: 'Indian Pomfret', unitPrice: 640, categoryId: 'c1', category: { id: 'c1', name: 'Freshwater/Pond', slug: 'freshwater' }, physicalAvailable: true, onlineBookable: false, freshnessState: 'GREEN' },
    { id: '4', name: 'Boneless Basa Fillet', unitPrice: 490, categoryId: 'c2', category: { id: 'c2', name: 'Boneless Cuts', slug: 'boneless' }, physicalAvailable: true, onlineBookable: true, freshnessState: 'GREEN' },
    { id: '5', name: 'Common Carp', unitPrice: 260, categoryId: 'c1', category: { id: 'c1', name: 'Freshwater/Pond', slug: 'freshwater' }, physicalAvailable: true, onlineBookable: false, freshnessState: 'GREY' },
    { id: '6', name: 'Tilapia', unitPrice: 220, categoryId: 'c1', category: { id: 'c1', name: 'Freshwater/Pond', slug: 'freshwater' }, physicalAvailable: true, onlineBookable: true, freshnessState: 'GREEN' },
    { id: '7', name: 'Pangasius (Basa)', unitPrice: 200, categoryId: 'c1', category: { id: 'c1', name: 'Freshwater/Pond', slug: 'freshwater' }, physicalAvailable: true, onlineBookable: true, freshnessState: 'GREEN' },
    { id: '8', name: 'Magur', unitPrice: 320, categoryId: 'c1', category: { id: 'c1', name: 'Freshwater/Pond', slug: 'freshwater' }, physicalAvailable: true, onlineBookable: true, freshnessState: 'GREEN' },
    { id: '9', name: 'Singhi', unitPrice: 300, categoryId: 'c1', category: { id: 'c1', name: 'Freshwater/Pond', slug: 'freshwater' }, physicalAvailable: true, onlineBookable: true, freshnessState: 'GREEN' },
    { id: '10', name: 'Mrigal', unitPrice: 250, categoryId: 'c1', category: { id: 'c1', name: 'Freshwater/Pond', slug: 'freshwater' }, physicalAvailable: true, onlineBookable: true, freshnessState: 'GREEN' },
    { id: '11', name: 'Dry Fish Assortment', unitPrice: 420, categoryId: 'c3', category: { id: 'c3', name: 'Dry Fish', slug: 'dry_fish' }, physicalAvailable: true, onlineBookable: false, freshnessState: 'GREEN' },
  ];

  const sourceList = fishList && fishList.length > 0 ? fishList : fallbackFish;

  const tabs = [
    { label: 'All Fish', value: 'ALL' },
    { label: 'Freshwater/Pond', value: 'FRESHWATER' },
    { label: 'Boneless Cuts', value: 'BONELESS' },
    { label: 'Dry Fish', value: 'DRY_FISH' },
  ];

  const filteredFish = sourceList.filter((item) => {
    // Filter by tab
    if (selectedCategory !== 'ALL') {
      const catName = (item.category?.name || '').toLowerCase();
      const catSlug = (item.category?.slug || '').toLowerCase();
      const sel = selectedCategory.toLowerCase();
      
      if (sel === 'freshwater' && !catName.includes('freshwater') && !catName.includes('pond') && !catSlug.includes('freshwater')) {
        return false;
      }
      if (sel === 'boneless' && !catName.includes('boneless') && !catSlug.includes('boneless')) {
        return false;
      }
      if (sel === 'dry_fish' && !catName.includes('dry') && !catSlug.includes('dry')) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    }

    return true;
  });

  return (
    <section id="fish-availability" className="relative overflow-hidden bg-[#f4fafc] py-12 sm:py-16">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Title & Subtitle */}
        <div className="border-b border-[#bcd3df] pb-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-extrabold tracking-[.18em] text-[#1E56A0] uppercase">
                FRESH FROM OUR PONDS
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-.04em] text-[#0F2C59] sm:text-5xl">
                Fresh fish, clear prices.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#5f7892] sm:text-base">
                Stock availability and prices update live as fresh catch arrives from the inland ponds.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-xs">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fish (e.g. Rohu)..."
                className="w-full rounded-full border border-[#cbd5e1] bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 shadow-xs focus:border-[#1E56A0] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="mt-6 flex gap-2.5 overflow-x-auto pb-1 sm:gap-3">
            {tabs.map((tab) => {
              const active = selectedCategory.toUpperCase() === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onSelectCategory(tab.value)}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-bold transition-all sm:px-6 sm:py-3 sm:text-sm ${
                    active
                      ? 'bg-[#1e62b5] text-white shadow-[0_8px_18px_-10px_rgba(30,86,160,.9)]'
                      : 'border border-[#d7e3e9] bg-white/95 text-[#43617d] hover:border-[#9fbfd3] hover:bg-[#eaf4f8] hover:text-[#1E56A0]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fish Cards Grid */}
        <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredFish.map((item) => {
            const imgPath = getFishImage(item.name);
            const isFresh = !item.freshnessState || item.freshnessState === 'GREEN';
            const isBookable = item.onlineBookable !== false;

            return (
              <article
                key={item.id || item.name}
                className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#dce6eb] bg-white shadow-[0_5px_16px_-12px_rgba(15,44,89,.28)] transition hover:-translate-y-0.5 hover:border-[#a8c5d6] hover:shadow-[0_14px_24px_-18px_rgba(15,44,89,.38)] sm:rounded-2xl"
              >
                {/* 4:3 Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={imgPath}
                    alt={item.name}
                    fill
                    sizes="(max-width: 767px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  {item.category?.name && (
                    <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                      {item.category.name}
                    </span>
                  )}
                </div>

                {/* Card Info */}
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <div className="flex min-w-0 items-start justify-between gap-1.5">
                    <h3 className="min-w-0 text-sm font-extrabold leading-5 text-[#0F2C59] sm:text-base lg:text-lg">
                      {item.name}
                    </h3>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 pt-0.5 text-[10px] font-bold ${
                        isFresh ? 'text-[#07966c]' : 'text-amber-600'
                      }`}
                    >
                      <Circle size={6} fill="currentColor" />
                      {isFresh ? 'Fresh Catch' : 'Chilled'}
                    </span>
                  </div>

                  <p className="mt-1 min-h-6 text-[10px] leading-4 text-[#71849a] sm:text-xs">
                    {isFresh ? 'Fresh 0–24h' : 'Chilled 24–48h'} <span className="mx-0.5">•</span>{' '}
                    {isBookable ? 'Available today' : 'In-store only'}
                  </p>

                  {/* Price */}
                  <p className="mt-2 tabular-nums text-lg font-extrabold tracking-tight text-[#1E56A0] sm:text-2xl">
                    ₹{item.unitPrice || 250}
                    <span className="ml-1 text-[10px] font-bold text-[#71849a]">/ KG</span>
                  </p>

                  {/* Booking Action */}
                  <div className="mt-3">
                    {isBookable ? (
                      <button
                        type="button"
                        onClick={() => onBookFish(item)}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1e62b5] px-2 py-2 text-[10px] font-bold text-white shadow-xs transition hover:bg-[#0F2C59] active:scale-[0.99] sm:gap-2 sm:py-2.5 sm:text-sm"
                      >
                        <ShoppingBag size={14} />
                        Book for collection
                      </button>
                    ) : (
                      <p className="rounded-lg bg-slate-50 py-2 text-center text-[10px] font-bold text-slate-500 sm:py-2.5 sm:text-xs">
                        In-store purchase only
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredFish.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-bold text-slate-600">No fish found matching your filter or search.</p>
            <button
              onClick={() => {
                onSelectCategory('ALL');
                setSearchQuery('');
              }}
              className="mt-3 rounded-lg bg-[#1E56A0] px-4 py-2 text-xs font-bold text-white"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

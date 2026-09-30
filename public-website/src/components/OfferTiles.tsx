import React, { useState } from 'react';
import Image from 'next/image';
import { Crown, Heart, Leaf, ShoppingBag, Tag, Truck } from 'lucide-react';
import { DiscountOffer } from '../types';
import { getFishImage } from '../utils/fishImageHelper';

interface OfferTilesProps {
  apiDiscounts?: DiscountOffer[];
  onBookNow?: (fishName: string, price: number) => void;
}

export default function OfferTiles({ apiDiscounts, onBookNow }: OfferTilesProps) {
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Default featured offers if backend list is empty or fallback
  const offers = [
    {
      id: 'offer-rohu',
      name: 'Rohu',
      originalPrice: 280,
      offerPrice: 224,
      unit: '/KG',
      discountBadge: '20% OFF',
      discountSubtext: 'Daily Special',
      specialBadge: "Today's Special",
      catchTag: 'Fresh Catch',
      marketTag: 'Local Pond',
      freshness: 'Fresh / 0–24h',
      availability: 'Available today',
      image: '/img/rohu.png',
    },
    {
      id: 'offer-catla',
      name: 'Catla',
      originalPrice: 320,
      offerPrice: 272,
      unit: '/KG',
      discountBadge: '15% OFF',
      discountSubtext: 'Limited Stock',
      specialBadge: "Today's Special",
      catchTag: 'Fresh Catch',
      marketTag: 'Harvested Today',
      freshness: 'Fresh / 0–24h',
      availability: 'Available today',
      image: '/img/catla.png',
    },
  ];

  return (
    <section id="featured-offers" className="border-b border-slate-200/60 bg-slate-50/70 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-xs font-extrabold tracking-[.18em] text-[#1E56A0] uppercase">LIMITED TIME SAVINGS</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#0F2C59] sm:text-3xl">
            Today&apos;s Offers
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Enjoy special promotional prices on freshly caught freshwater fish</p>
        </div>

        {/* Offer Cards Grid - 2 columns side by side on mobile */}
        <div className="mx-auto grid max-w-[670px] grid-cols-2 justify-center gap-3 sm:gap-5">
          {offers.map((offer) => {
            const savings = offer.originalPrice - offer.offerPrice;
            const isFavorite = !!wishlist[offer.id];

            return (
              <article
                key={offer.id}
                className="group relative mx-auto flex w-full max-w-[320px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#9ac2e0] hover:shadow-md sm:rounded-2xl"
              >
                {/* 4:3 Aspect Ratio Image with Compact Badges */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={offer.image}
                    alt={offer.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 320px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />

                  {/* Top Left: Red Discount Tag Ribbon */}
                  <div className="absolute left-1.5 top-1.5 z-10 flex items-center gap-1 rounded-md bg-gradient-to-r from-red-600 to-rose-600 px-1.5 py-1 text-white shadow-md sm:left-2.5 sm:top-2.5 sm:gap-1.5 sm:rounded-lg sm:px-2 sm:py-1.5">
                    <Tag size={11} className="shrink-0 fill-white sm:size-3.5" />
                    <div>
                      <span className="block text-[9px] font-black leading-none tracking-tight sm:text-xs">
                        {offer.discountBadge}
                      </span>
                      <span className="mt-0.5 hidden text-[7px] font-semibold leading-tight text-rose-100 min-[380px]:block sm:text-[8px]">
                        {offer.discountSubtext}
                      </span>
                    </div>
                  </div>

                  {/* Top Right: Gold Crown Today's Special Badge */}
                  <div className="absolute right-1.5 top-0 z-10 flex flex-col items-center rounded-b-md border-b-2 border-amber-400 bg-[#facc15] px-1.5 py-0.5 shadow-sm sm:right-2.5 sm:rounded-b-lg sm:px-2 sm:py-1.5">
                    <Crown size={10} className="shrink-0 fill-amber-950/20 text-amber-950 sm:size-3" />
                    <span className="mt-0.5 text-center text-[7px] font-black leading-tight text-amber-950 sm:text-[8px]">
                      {offer.specialBadge}
                    </span>
                  </div>

                  {/* Bottom Left: Fresh Catch Tag */}
                  <div className="absolute bottom-1.5 left-1.5 z-10 inline-flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] font-bold text-white shadow-xs backdrop-blur-md sm:bottom-2 sm:left-2 sm:gap-1 sm:text-[9px]">
                    <Leaf size={9} className="shrink-0 fill-emerald-400 text-emerald-400 sm:size-2.5" />
                    <span>{offer.catchTag}</span>
                  </div>

                  {/* Bottom Right: Local Market Tag */}
                  <div className="absolute bottom-1.5 right-1.5 z-10 inline-flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] font-bold text-white shadow-xs backdrop-blur-md sm:bottom-2 sm:right-2 sm:gap-1 sm:text-[9px]">
                    <Truck size={9} className="shrink-0 text-sky-300 sm:size-2.5" />
                    <span className="hidden min-[380px]:inline">{offer.marketTag}</span>
                    <span className="min-[380px]:hidden">Local</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-2.5 sm:p-4">
                  <div className="flex min-w-0 items-start justify-between gap-1">
                    <h3 className="min-w-0 text-sm font-extrabold leading-5 text-[#0F2C59] sm:text-xl sm:font-black sm:leading-normal">
                      {offer.name}
                    </h3>
                    <span className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-[10px] font-black text-[#059669] sm:text-[11px]">
                      <span className="size-1.5 animate-pulse rounded-full bg-[#10b981]" />
                      Fresh
                    </span>
                  </div>

                  <p className="mt-0.5 text-[10px] font-semibold leading-4 text-slate-500 sm:text-[11px]">
                    {offer.freshness} <span className="mx-0.5">•</span> {offer.availability}
                  </p>

                  {/* Pricing Row */}
                  <div className="mt-2 flex flex-wrap items-baseline gap-1 sm:mt-2.5 sm:gap-1.5">
                    <span className="text-lg font-black tracking-tight text-[#dc2626] sm:text-[26px]">
                      ₹{offer.offerPrice}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-500 sm:text-[11px]">
                      {offer.unit}
                    </span>
                    <span className="ml-0.5 text-xs font-bold text-slate-400 line-through sm:text-base">
                      ₹{offer.originalPrice}
                    </span>
                    <span className="rounded border border-rose-200 bg-rose-50 px-1 py-0.5 text-[8px] font-black text-rose-600 sm:px-1.5 sm:text-[10px]">
                      {offer.discountBadge}
                    </span>
                  </div>

                  {/* Savings Callout */}
                  <p className="mt-0.5 text-[10px] font-extrabold text-[#dc2626] sm:text-[11px]">
                    You save ₹{savings} per kg
                  </p>

                  {/* CTA Action Buttons */}
                  <div className="mt-3 flex items-center gap-1.5 sm:mt-4 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => onBookNow && onBookNow(offer.name, offer.offerPrice)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#1E56A0] px-1.5 py-2 text-[10px] font-bold text-white shadow-xs transition-all duration-200 hover:bg-[#0F2C59] active:scale-[0.99] sm:gap-1.5 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm sm:font-black"
                    >
                      <ShoppingBag size={13} className="shrink-0 sm:size-4" />
                      <span className="hidden min-[400px]:inline">Book for collection</span>
                      <span className="min-[400px]:hidden">Book Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(offer.id)}
                      aria-label="Add to favorites"
                      className={`grid size-8 shrink-0 place-items-center rounded-lg border shadow-xs transition-all duration-200 sm:size-10 sm:rounded-xl ${
                        isFavorite
                          ? 'border-rose-300 bg-rose-50 text-rose-600'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500'
                      }`}
                    >
                      <Heart
                        size={14}
                        className={`sm:size-[17px] ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

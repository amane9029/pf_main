import React from 'react';
import Image from 'next/image';
import { Bell, ChevronRight, MapPin, ShoppingBag } from 'lucide-react';

export default function MobileApp() {
  return (
    <section id="mobile-app" className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-[#0F2C59] p-7 text-white sm:p-12 shadow-xl">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-extrabold tracking-[.16em] text-[#93CCFF] uppercase">
                PONDFISH CUSTOMER APP
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                Track fresh catch live on mobile.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                Reserve fish within 48 hours, monitor your local delivery truck in real-time on the map, manage subscription credits, and show your quick QR pickup pass at the counter.
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0F2C59] transition hover:bg-[#E8F1F5] shadow-md"
                >
                  <Bell size={18} className="text-[#1E56A0]" />
                  Notify me on Android & iOS launch
                </a>
              </div>
            </div>

            {/* Mobile Phone Mockup */}
            <div className="mx-auto w-52 rounded-[2.5rem] border-[8px] border-[#3D84A8]/40 bg-[#102e58] p-2 shadow-2xl">
              <div className="overflow-hidden rounded-[2rem] bg-[#edf7fb] p-3.5 text-[#0F2C59]">
                <div className="flex items-center justify-between text-[8px] font-bold text-slate-600">
                  <span>9:41</span>
                  <span>5G • 100%</span>
                </div>
                <p className="mt-3 text-sm font-extrabold tracking-[-.04em]">
                  Pond<span className="text-[#2670b7]">Fish</span>
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">Good morning, Customer</p>

                <div className="mt-3 rounded-xl bg-white p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-extrabold text-[#2670b7]">TODAY&apos;S CATCH</p>
                    <ShoppingBag size={12} className="text-[#2670b7]" />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <Image
                        src="/img/rohu.png"
                        alt="Rohu"
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-[#0F2C59]">Fresh Rohu</p>
                      <p className="mt-0.5 text-[9px] font-bold text-[#1E56A0]">₹280/kg • Fresh 0–24h</p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex w-full items-center justify-between rounded-lg bg-[#1E56A0] px-2.5 py-1.5 text-[9px] font-bold text-white">
                    <span>Active Reservation</span>
                    <ChevronRight size={12} />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[9px] font-semibold text-slate-600">
                  <MapPin size={11} className="text-[#2670b7]" />
                  PondFish Counter • 1.2 km away
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

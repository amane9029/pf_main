import React from 'react';
import { Clock3, MapPin, Thermometer, Truck } from 'lucide-react';

export default function TruckStatus() {
  return (
    <section id="truck-status" className="bg-[#F8FAFC] py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 rounded-2xl border border-[#BFDBFE] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,.05)] sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#E8F1F5] text-[#1E56A0]">
              <Truck size={22} />
            </span>
            <div>
              <p className="text-xs font-extrabold tracking-[.12em] text-[#1E56A0] uppercase">
                TODAY&apos;S COLD-CHAIN JOURNEY
              </p>
              <p className="mt-1 text-sm font-bold text-[#0F2C59] sm:text-base">
                Truck #1 is en route from Inland Pond #3 to PondFish Store
              </p>
              <p className="mt-1 text-xs text-[#64748b]">
                Real-time IoT cold chain telemetry • Stock logs sync automatically upon delivery.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-[#64748b] sm:border-t-0 sm:pt-0">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="size-2 animate-ping rounded-full bg-emerald-500" />
              <MapPin size={14} className="text-[#1E56A0]" />
              GPS Active
            </span>
            <span className="flex items-center gap-1.5">
              <Thermometer size={14} className="text-[#1E56A0]" />
              Cold-chain 2°C – 4°C
            </span>
            <span className="flex items-center gap-1.5 tabular-nums font-bold text-[#0F2C59]">
              <Clock3 size={14} className="text-[#1E56A0]" />
              Store Arrival: ~35 min
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

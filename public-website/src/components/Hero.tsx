import React from 'react';
import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';

function HeroCopy() {
  return (
    <div className="max-w-xl">
      <h1 className="text-[2.65rem] font-extrabold leading-[1.02] tracking-[-.065em] text-[#0f2c59] sm:text-6xl lg:text-7xl">
        Fresh <span className="text-[#2670b7]">&amp;</span>
        <span className="block text-[#2670b7]">Live Fish</span>
      </h1>
      <p className="mt-5 max-w-md text-[15px] leading-6 text-[#425b73] sm:mt-6 sm:text-[17px] sm:leading-7">
        Freshwater fish harvested today, handled with traceable cold-chain care, and ready at your local PondFish counter.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-8">
        <a
          href="#fish-availability"
          className="inline-flex items-center gap-2 rounded-full bg-[#1e56a0] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163f78] sm:px-6 sm:py-3.5"
        >
          See today&apos;s fish <ArrowRight size={16} />
        </a>
        <a
          href="#how-it-works"
          className="text-sm font-bold text-[#1e56a0] underline-offset-4 hover:underline"
        >
          How PondFish works
        </a>
      </div>
      <div className="mt-7 flex max-w-sm flex-col gap-2 text-sm font-semibold text-[#38536e] sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-x-5">
        <span className="inline-flex items-center gap-2">
          <Check size={16} className="text-[#159c57]" />
          Harvested every morning
        </span>
        <span className="inline-flex items-center gap-2">
          <Check size={16} className="text-[#159c57]" />
          48-hour online booking
        </span>
        <span className="inline-flex items-center gap-2">
          <Check size={16} className="text-[#159c57]" />
          Collection-only freshness
        </span>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="home" className="overflow-hidden bg-[#f7fcff]">
      {/* Mobile view banner */}
      <div className="relative min-h-[calc(100svh-72px)] sm:hidden">
        <Image
          src="/img/banner_phone.png"
          alt="Fresh fish at a PondFish source pond"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-x-0 top-0 h-[65%] bg-gradient-to-b from-[#f7fcff] via-[#f7fcff]/95 to-transparent" />
        <div className="relative z-10 flex min-h-[calc(100svh-72px)] px-6 pb-12 pt-14">
          <HeroCopy />
        </div>
      </div>

      {/* Desktop view banner */}
      <div className="relative hidden min-h-[calc(100svh-72px)] sm:block">
        <Image
          src="/img/banner.png"
          alt="Fresh fish at a PondFish source pond"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_bottom]"
        />
        <div className="absolute inset-y-0 left-0 w-[68%] bg-gradient-to-r from-[#f7fcff] via-[#f7fcff]/90 to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-72px)] max-w-7xl flex-col justify-center px-10 py-16 lg:px-8">
          <HeroCopy />
        </div>
      </div>
    </section>
  );
}

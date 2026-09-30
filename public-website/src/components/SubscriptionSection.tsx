import React from 'react';
import { ArrowRight, Check, Sparkles, WalletCards } from 'lucide-react';

const benefits = [
  'Monetary credit that accumulates directly in your wallet',
  'Weekly weight allowance for priority harvest reservations',
  'Guaranteed morning catch allocation before store opening',
];

interface PlanProps {
  amount: string;
  name: string;
  detail: string;
  featured?: boolean;
}

function Plan({ amount, name, detail, featured }: PlanProps) {
  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-6 shadow-[0_16px_32px_-24px_rgba(15,44,89,.5)] sm:p-7 ${
        featured
          ? 'border-[#1E56A0] bg-[#0F2C59] text-white'
          : 'border-white bg-white/90 text-[#0F2C59]'
      }`}
    >
      <div
        className={`absolute -right-8 -top-8 size-28 rounded-full ${
          featured ? 'bg-[#3d84a8]/50' : 'bg-[#e8f4f7]'
        }`}
      />
      {featured && (
        <p className="relative inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold tracking-[.14em] text-white">
          MOST POPULAR
        </p>
      )}
      <span
        className={`relative mt-5 grid size-11 place-items-center rounded-xl ${
          featured ? 'bg-white/15 text-[#93CCFF]' : 'bg-[#e8f4f7] text-[#1E56A0]'
        }`}
      >
        <WalletCards size={21} />
      </span>
      <p className="relative mt-5 text-lg font-extrabold">{name}</p>
      <p className={`relative mt-1 text-sm ${featured ? 'text-slate-300' : 'text-[#64748b]'}`}>
        {detail}
      </p>
      <div
        className={`relative mt-7 border-t pt-5 ${
          featured ? 'border-white/15' : 'border-[#e2e8f0]'
        }`}
      >
        <p
          className={`text-[10px] font-bold tracking-[.14em] ${
            featured ? 'text-[#93CCFF]' : 'text-[#64748b]'
          }`}
        >
          CREDIT ADDED
        </p>
        <p
          className={`mt-1 tabular-nums text-4xl font-extrabold ${
            featured ? 'text-white' : 'text-[#1E56A0]'
          }`}
        >
          {amount}
        </p>
      </div>
      <p
        className={`relative mt-6 text-xs leading-5 sm:text-sm sm:leading-6 ${
          featured ? 'text-slate-200' : 'text-[#475569]'
        }`}
      >
        Weekly allowances and eligible cuts apply seamlessly at point of collection.
      </p>
    </article>
  );
}

export default function SubscriptionSection() {
  return (
    <section id="subscription-plans" className="relative overflow-hidden bg-[#e8f4f7] py-16 sm:py-20">
      <div className="absolute -right-24 top-0 size-80 rounded-full bg-[#b9dce8]/45 blur-3xl" />
      <div className="absolute -left-20 bottom-0 size-56 rounded-full bg-white/75 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.78fr_1.22fr] lg:px-8">
        <div className="self-center">
          <p className="inline-flex items-center gap-2 text-xs font-extrabold tracking-[.16em] text-[#1E56A0]">
            <Sparkles size={15} />
            PONDFISH MEMBERSHIP
          </p>
          <h2 className="mt-3 max-w-lg text-3xl font-extrabold tracking-[-.045em] text-[#0F2C59] sm:text-5xl">
            A fish budget that stays useful.
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#475569]">
            Subscription value becomes PondFish wallet credits. Use it on eligible fresh catch within your plan&apos;s weekly allowance without recurring billing hassles.
          </p>
          <ul className="mt-7 space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm font-semibold text-[#28455e]">
                <span className="grid size-6 place-items-center rounded-full bg-white text-[#1E56A0] shadow-xs">
                  <Check size={14} />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0F2C59] px-6 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-[#1E56A0]"
          >
            Inquire about membership <ArrowRight size={17} />
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Plan amount="₹2,000" name="Fresh Start" detail="For regular home cooking (2-3 meals/week)" />
          <Plan amount="₹6,000" name="Pond Priority" detail="For busy family kitchens & large feasts" featured />
        </div>
      </div>
    </section>
  );
}

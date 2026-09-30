import React from 'react';
import { ShieldCheck, Waves, Award } from 'lucide-react';

const points = [
  { icon: Waves, title: 'Inland Pond Sourcing', text: 'Freshwater fish raised naturally with clean grain feeds.' },
  { icon: ShieldCheck, title: 'Zero Formalin / Chemicals', text: 'Rigorous freshness index guarantees 100% pure fish.' },
  { icon: Award, title: 'Traceable Weight & Cut', text: 'Digital weight certification and hygienic cutting counters.' },
];

export default function About() {
  return (
    <section id="about" className="bg-[#F8FAFC] py-14 sm:py-16 border-t border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="text-xs font-extrabold tracking-[.16em] text-[#1E56A0] uppercase">
              ABOUT PONDFISH
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F2C59] sm:text-4xl">
              Freshwater fish with zero unknowns.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              We started PondFish with one mission: bridge the gap between fresh inland freshwater fish harvesters and neighborhood kitchens with honest pricing and cold-chain transparency.
            </p>
          </div>
          <div>
            <p className="text-base leading-8 text-[#475569]">
              PondFish brings pond sourcing, cold-chain GPS transit, live store TV availability, and 48-hour online booking reservation into one seamless ecosystem.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {points.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-xl border border-[#d7e1e8] bg-white p-5 shadow-xs">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#e8f1f5] text-[#1E56A0]">
                    <Icon size={21} />
                  </span>
                  <h3 className="mt-4 text-sm font-extrabold text-[#0F2C59]">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#64748b]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

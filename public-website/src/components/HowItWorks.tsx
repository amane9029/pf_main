import React from 'react';
import { BadgeCheck, CreditCard, ScanLine, Truck } from 'lucide-react';

const steps = [
  { icon: BadgeCheck, title: 'Harvested', text: 'Sustainably caught from certified inland ponds every dawn.' },
  { icon: Truck, title: 'In transit', text: 'Monitored with continuous IoT cold chain temp control.' },
  { icon: ScanLine, title: 'At the counter', text: 'Weighed precisely, tagged, and recorded on the live TV board.' },
  { icon: CreditCard, title: 'Credited / Picked up', text: 'Instant 48-hr QR collection or wallet subscription credit.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="text-xs font-extrabold tracking-[.16em] text-[#1E56A0] uppercase">
              TRANSPARENT JOURNEY
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F2C59] sm:text-4xl">
              From pond to counter, without a mystery in between.
            </h2>
          </div>
          <p className="self-end text-sm leading-7 text-[#64748b]">
            PondFish is built around honest, traceable information. Every catch has an immutable record of when it was harvested, chilled, and prepared for your family.
          </p>
        </div>

        <div className="mt-8 grid border border-[#cbd5e1] md:grid-cols-4 rounded-xl overflow-hidden shadow-xs">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className="relative min-h-52 border-b border-[#cbd5e1] p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 bg-slate-50/40 hover:bg-white transition-colors"
            >
              <span className="absolute right-4 top-3 tabular-nums text-5xl font-extrabold text-[#c7dfeb]/60">
                0{i + 1}
              </span>
              <span className="relative grid size-10 place-items-center rounded-xl bg-[#e8f1f5] text-[#1E56A0]">
                <Icon size={20} />
              </span>
              <h3 className="relative mt-6 text-base font-extrabold text-[#0F2C59]">{title}</h3>
              <p className="relative mt-2 text-xs leading-5 text-[#64748b] sm:text-sm sm:leading-6">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

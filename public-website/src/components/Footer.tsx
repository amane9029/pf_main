import React from 'react';
import Link from 'next/link';
import { Clock3, Globe2, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Store } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#0F2C59] text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-9 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.25fr_.7fr_1fr] lg:px-8">
        <div>
          <p className="text-2xl font-extrabold tracking-[-.06em] text-white">
            Pond<span className="text-[#93CCFF]">Fish</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
            Sustainably farmed freshwater fish, handled with traceable cold-chain care from pond harvest to local store collection.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              aria-label="PondFish website"
              href="#home"
              className="grid size-9 place-items-center rounded-full border border-white/20 hover:bg-white/10"
            >
              <Globe2 size={17} />
            </a>
            <a
              aria-label="Contact PondFish"
              href="mailto:hello@pondfish.in"
              className="grid size-9 place-items-center rounded-full border border-white/20 hover:bg-white/10"
            >
              <MessageCircle size={17} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-white">Quick links</h3>
          <div className="mt-4 grid gap-2.5 text-sm text-slate-300">
            <a href="#featured-offers" className="hover:text-white">Today&apos;s Offers</a>
            <a href="#fish-availability" className="hover:text-white">Fish Availability</a>
            <a href="#subscription-plans" className="hover:text-white">Subscription Plans</a>
            <a href="#truck-status" className="hover:text-white">Truck Journey</a>
            <a href="#how-it-works" className="hover:text-white">How It Works</a>
            <a href="#about" className="hover:text-white">About PondFish</a>
            <div className="mt-3 border-t border-white/10 pt-3 flex flex-col gap-2">
              <a
                href="http://localhost:3002"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#93CCFF] hover:underline font-bold"
              >
                <ShieldCheck size={14} />
                Admin Portal Control Center
              </a>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-white">Store contact & pickup</h3>
          <div className="mt-4 space-y-3 text-sm leading-5 text-slate-300">
            <p className="flex gap-2">
              <MapPin className="shrink-0 text-[#93CCFF]" size={17} />
              PondFish Store Counter, Main Market
              <br />
              Bengaluru, Karnataka
            </p>
            <p className="flex items-center gap-2">
              <Clock3 className="text-[#93CCFF]" size={17} />
              Daily: 6:30 AM – 7:30 PM
            </p>
            <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-white">
              <Phone className="text-[#93CCFF]" size={17} />
              +91 98765 43210
            </a>
            <a href="mailto:hello@pondfish.in" className="flex items-center gap-2 hover:text-white">
              <Mail className="text-[#93CCFF]" size={17} />
              hello@pondfish.in
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} PondFish Ecosystem. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#contact" className="hover:text-white">Privacy Policy</a>
            <a href="#contact" className="hover:text-white">Terms of Booking</a>
            <p className="text-slate-400">Freshness you can trace.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

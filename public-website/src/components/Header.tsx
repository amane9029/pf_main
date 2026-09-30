import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Download, Menu, ShieldCheck, Store, X } from 'lucide-react';

const links = [
  { label: 'Home', href: '#home' },
  { label: 'Offers', href: '#featured-offers' },
  { label: 'Subscriptions', href: '#subscription-plans' },
  { label: 'Truck Status', href: '#truck-status' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
  { label: 'Get the app', href: '#mobile-app' },
  { label: 'Contact', href: '#contact' },
];

const fishLinks = [
  { label: 'All Fish', category: 'ALL' },
  { label: 'Freshwater / Pond', category: 'FRESHWATER' },
  { label: 'Boneless Cuts', category: 'BONELESS' },
  { label: 'Dry Fish', category: 'DRY_FISH' },
];

interface HeaderProps {
  onSelectCategory?: (category: string) => void;
}

export default function Header({ onSelectCategory }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e2e8f0] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" aria-label="PondFish home" className="text-[29px] font-extrabold leading-none tracking-[-.07em] sm:text-[31px]">
          <span className="text-[#0f2c59]">Pond</span>
          <span className="text-[#2670b7]">Fish</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-5 text-xs font-semibold text-slate-600 xl:flex">
          <a href="#home" className="transition-colors hover:text-[#1E56A0]">
            Home
          </a>

          {/* Fish Dropdown */}
          <div className="group relative">
            <a href="#fish-availability" className="flex items-center gap-1 py-7 text-[#0F2C59] transition-colors hover:text-[#1E56A0]">
              Fish <ChevronDown size={14} />
            </a>
            <div className="invisible absolute left-0 top-[60px] w-48 rounded-xl border border-slate-100 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:top-[56px] group-hover:opacity-100 group-focus-within:visible group-focus-within:top-[56px] group-focus-within:opacity-100">
              {fishLinks.map((item) => (
                <a
                  key={item.label}
                  href="#fish-availability"
                  onClick={() => onSelectCategory && onSelectCategory(item.category)}
                  className="block rounded-lg px-3 py-2 text-xs hover:bg-[#E8F1F5] hover:text-[#1E56A0]"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {links.slice(1).map((link) => (
            <a key={link.label} href={link.href} className="transition-colors hover:text-[#1E56A0]">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          <a
            href="http://localhost:3002"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-[#0F2C59] transition hover:border-[#1E56A0] hover:bg-white"
          >
            <ShieldCheck size={14} className="text-[#1E56A0]" />
            Admin Portal
          </a>

          <a
            href="#mobile-app"
            className="flex items-center gap-2 rounded-lg bg-[#1E56A0] px-3.5 py-2 text-sm font-bold text-white transition-all duration-200 hover:bg-[#0F2C59]"
          >
            <Download size={16} />
            Download app
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-slate-700 md:hidden"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="border-t border-[#e2e8f0] bg-white px-4 pb-5 md:hidden">
          <a
            onClick={() => setOpen(false)}
            className="block border-b border-slate-100 py-3 text-sm font-semibold"
            href="#fish-availability"
          >
            Fish Catalogue
          </a>
          {links.map((link) => (
            <a
              key={link.label}
              onClick={() => setOpen(false)}
              className="block border-b border-slate-100 py-3 text-sm font-semibold text-slate-700"
              href={link.href}
            >
              {link.label}
            </a>
          ))}

          <div className="mt-4 grid grid-cols-1 gap-2">
            <a
              onClick={() => setOpen(false)}
              href="http://localhost:3002"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-[#0F2C59]"
            >
              <ShieldCheck size={14} className="text-[#1E56A0]" />
              Admin Portal
            </a>
          </div>

          <a
            onClick={() => setOpen(false)}
            href="#mobile-app"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E56A0] py-2.5 text-sm font-bold text-white"
          >
            <Download size={16} />
            Download app
          </a>
        </div>
      )}
    </header>
  );
}

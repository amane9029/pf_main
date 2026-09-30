import React, { useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, Clock, MapPin, ShieldCheck, X } from 'lucide-react';
import { getFishImage } from '../utils/fishImageHelper';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  fishName: string;
  pricePerKg: number;
}

export default function BookingModal({
  isOpen,
  onClose,
  fishName,
  pricePerKg,
}: BookingModalProps) {
  const [weightKg, setWeightKg] = useState(1);
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  if (!isOpen) return null;

  const total = weightKg * pricePerKg;
  const imgPath = getFishImage(fishName);

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const mockRef = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(mockRef);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setPhone('');
    setCustomerName('');
    setWeightKg(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#0F2C59] px-6 py-4 text-white">
          <h3 className="text-base font-bold">
            {submitted ? 'Reservation Confirmed' : 'Book Fish For Collection'}
          </h3>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full p-1 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="mt-4 text-xl font-extrabold text-[#0F2C59]">Hold Reserved!</h4>
            <p className="mt-1 text-xs text-slate-500">
              Your 48-hour fresh catch reservation is active.
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left">
              <div className="flex justify-between border-b border-slate-200 pb-2 text-xs">
                <span className="font-semibold text-slate-500">Booking Reference:</span>
                <span className="font-mono font-bold text-[#1E56A0]">{bookingRef}</span>
              </div>
              <div className="flex justify-between py-2 text-xs">
                <span className="font-semibold text-slate-500">Item & Weight:</span>
                <span className="font-bold text-[#0F2C59]">
                  {fishName} ({weightKg} kg)
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-xs">
                <span className="font-semibold text-slate-500">Total Payable at Store:</span>
                <span className="font-extrabold text-[#1E56A0]">₹{total}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-amber-700">
              <Clock size={14} />
              <span>Valid for 48 hours from harvest time.</span>
            </div>

            <button
              onClick={handleReset}
              className="mt-6 w-full rounded-xl bg-[#1E56A0] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0F2C59]"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking} className="p-6">
            {/* Product Summary */}
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                <Image src={imgPath} alt={fishName} fill sizes="56px" className="object-cover" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#0F2C59]">{fishName}</h4>
                <p className="text-xs font-bold text-[#1E56A0]">₹{pricePerKg} / kg</p>
                <p className="text-[10px] text-slate-500">Live pond harvest • Cleaned at pickup</p>
              </div>
            </div>

            {/* Weight Selection */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700">Desired Weight (KG)</label>
              <div className="mt-2 flex gap-2">
                {[1, 1.5, 2, 3, 5].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeightKg(w)}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                      weightKg === w
                        ? 'bg-[#1E56A0] text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {w} kg
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Inputs */}
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#1E56A0] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Phone Number (For SMS QR)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#1E56A0] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Price Total */}
            <div className="mt-5 flex items-center justify-between rounded-xl bg-[#E8F1F5] px-4 py-3">
              <span className="text-xs font-bold text-[#0F2C59]">Estimated Total:</span>
              <span className="text-xl font-extrabold text-[#1E56A0]">₹{total}</span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>Zero cancellation fees. Pay only when inspecting at store counter.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-[#1E56A0] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0F2C59] active:scale-[0.99]"
            >
              Confirm 48-Hour Reservation
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

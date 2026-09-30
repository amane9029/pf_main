import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  Fish,
  Lock,
  LogOut,
  Package,
  Phone,
  QrCode,
  Receipt,
  RefreshCw,
  Scale,
  Search,
  Shield,
  ShoppingBag,
  Store,
  User,
  X,
} from 'lucide-react';
import { getWorkerApiBaseUrl } from './config/apiConfig';
import { WorkerAuthStorageService } from './services/authStorage';

export type AuthState = 'AUTHENTICATION_CHECKING' | 'AUTHENTICATION_REQUIRED' | 'AUTHENTICATED';

interface FishItem {
  id: string;
  name: string;
  unitPrice: number;
  physicalAvailable: boolean;
}

interface BookingItem {
  id: string;
  quantityKg: number;
  unitPrice: number;
  subtotal: number;
  fish?: { name: string };
}

interface Customer {
  id: string;
  mobileNumber: string;
  name?: string;
}

interface Booking {
  id: string;
  bookingCode: string;
  qrCodeData: string;
  totalAmount: number;
  subCreditUsed: number;
  razorpayPaid: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  customer?: Customer;
  bookingItems: BookingItem[];
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('AUTHENTICATION_CHECKING');
  const [token, setToken] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Portal View Tabs
  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'CASH_CHECKOUT'>('BOOKINGS');

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [lastCompletedBooking, setLastCompletedBooking] = useState<Booking | null>(null);

  // Fish Catalog for In-store Checkout
  const [fishList, setFishList] = useState<FishItem[]>([]);
  const [selectedFishId, setSelectedFishId] = useState<string>('');
  const [checkoutCustomerInput, setCheckoutCustomerInput] = useState('');
  const [qtyKg, setQtyKg] = useState('1.0');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [lastTxnResult, setLastTxnResult] = useState<any>(null);

  const API_BASE_URL = getWorkerApiBaseUrl();

  // Startup Session Restoration
  useEffect(() => {
    try {
      const storedToken = WorkerAuthStorageService.getToken();
      if (storedToken) {
        setToken(storedToken);
        setAuthState('AUTHENTICATED');
      } else {
        setAuthState('AUTHENTICATION_REQUIRED');
      }
    } catch {
      setAuthState('AUTHENTICATION_REQUIRED');
    }
  }, []);

  // Fetch Bookings from Backend API
  const fetchBookings = async () => {
    if (!token) return;
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      let url = `${API_BASE_URL}/worker/bookings`;
      const queryParams: string[] = [];
      if (searchQuery.trim()) queryParams.push(`search=${encodeURIComponent(searchQuery.trim())}`);
      if (statusFilter !== 'ALL') queryParams.push(`status=${encodeURIComponent(statusFilter)}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings(data.data || []);
      } else {
        setBookingsError(data.error?.message || 'Failed to fetch bookings.');
      }
    } catch {
      setBookingsError('Network connection error loading bookings.');
    } finally {
      setBookingsLoading(false);
    }
  };

  // Fetch Fish Catalogue for cash checkout
  const fetchFishCatalogue = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/public/fish`);
      const data = await res.json();
      if (res.ok && data.success && data.data && data.data.length > 0) {
        setFishList(data.data);
        if (!selectedFishId) setSelectedFishId(data.data[0].id);
      }
    } catch {
      // Fish catalogue silent fallback
    }
  };

  useEffect(() => {
    if (token && authState === 'AUTHENTICATED') {
      fetchBookings();
      fetchFishCatalogue();
    }
  }, [token, authState]);

  // Trigger search on query or filter change
  useEffect(() => {
    if (!token || authState !== 'AUTHENTICATED') return;
    const timer = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, token, authState]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || !password) {
      setErrorMsg('Please enter worker mobile number and password.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/worker/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobileNumber.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.token) {
        const verifiedToken = data.data.token;
        WorkerAuthStorageService.saveToken(verifiedToken);
        setToken(verifiedToken);
        setAuthState('AUTHENTICATED');
      } else {
        setErrorMsg(data.error?.message || 'Worker authentication failed. Check credentials.');
      }
    } catch {
      setErrorMsg('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    WorkerAuthStorageService.clearToken();
    setToken(null);
    setMobileNumber('');
    setPassword('');
    setSelectedBooking(null);
    setBookings([]);
    setLastCompletedBooking(null);
    setLastTxnResult(null);
    setAuthState('AUTHENTICATION_REQUIRED');
  };

  /**
   * Complete Booking Pickup via POST /api/v1/worker/bookings/:id/complete
   */
  const handleCompleteBooking = async (bookingId: string) => {
    if (!token || !bookingId) return;
    setCompletionLoading(true);
    setCompletionError(null);
    setLastCompletedBooking(null);

    try {
      const res = await fetch(`${API_BASE_URL}/worker/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLastCompletedBooking(data.data);
        if (selectedBooking && selectedBooking.id === bookingId) {
          setSelectedBooking(data.data);
        }
        fetchBookings();
      } else {
        setCompletionError(data.error?.message || 'Failed to complete booking pickup.');
      }
    } catch {
      setCompletionError('Error connecting to backend for booking completion.');
    } finally {
      setCompletionLoading(false);
    }
  };

  /**
   * In-store Cash Checkout via POST /api/v1/worker/transactions/collect-cash
   */
  const handleCollectCashCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutCustomerInput.trim()) {
      setCheckoutError('Please enter Customer Mobile Number or ID.');
      return;
    }
    if (!selectedFishId) {
      setCheckoutError('Please select a fish item.');
      return;
    }
    const quantity = parseFloat(qtyKg);
    if (isNaN(quantity) || quantity <= 0) {
      setCheckoutError('Please enter a valid weight in kg greater than zero.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);
    setLastTxnResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/worker/transactions/collect-cash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: checkoutCustomerInput.trim(),
          items: [{ fishId: selectedFishId, quantityKg: quantity }],
          useSubscriptionCredit: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLastTxnResult(data.data);
        setCheckoutCustomerInput('');
      } else {
        setCheckoutError(data.error?.message || 'Store counter checkout failed.');
      }
    } catch {
      setCheckoutError('Failed to complete cash checkout due to network error.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const selectedFishObj = fishList.find((f) => f.id === selectedFishId);
  const estimatedCheckoutSubtotal = selectedFishObj
    ? (parseFloat(qtyKg) || 0) * selectedFishObj.unitPrice
    : 0;

  // 1. Initial Loading Splash
  if (authState === 'AUTHENTICATION_CHECKING') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F2C59] p-4 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-[#93CCFF] border-t-transparent" />
          <p className="text-xs font-bold tracking-wider uppercase text-slate-300">
            Restoring Worker Tablet Session...
          </p>
        </div>
      </div>
    );
  }

  // 2. Authentication Login Screen
  if (authState === 'AUTHENTICATION_REQUIRED' || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F2C59] via-[#102e58] to-[#1E56A0] p-4">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#0F2C59] text-white shadow-md">
              <Store size={24} className="text-[#93CCFF]" />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-[#0F2C59]">
              Pond<span className="text-[#1E56A0]">Fish</span>
            </h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#1E56A0]">
              Worker Counter Station
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Sign in with mobile number and staff PIN to manage orders and counter billing.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
              <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Staff Mobile Number</label>
              <div className="relative mt-1">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#1E56A0] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Password / Access PIN</label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#1E56A0] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2C59] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#1E56A0] active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Station</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-400">
              PondFish Counter Operations v1.0
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Worker Station Interface
  return (
    <div className="flex min-h-screen flex-col bg-[#F4FAFC]">
      {/* Top Tablet Header Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3 shadow-xs sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Left: Brand + Counter Badge */}
          <div className="flex items-center gap-3">
            <div className="text-xl font-black tracking-tight sm:text-2xl">
              <span className="text-[#0F2C59]">Pond</span>
              <span className="text-[#1E56A0]">Fish</span>
            </div>
            <span className="rounded-md bg-[#1E56A0]/10 px-2 py-0.5 text-[11px] font-black uppercase text-[#1E56A0]">
              Counter Station
            </span>
          </div>

          {/* Middle: Segmented Navigation Pills */}
          <div className="hidden items-center gap-1.5 rounded-2xl bg-slate-100 p-1 md:flex">
            <button
              type="button"
              onClick={() => setActiveTab('BOOKINGS')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'BOOKINGS'
                  ? 'bg-[#1E56A0] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white/80 hover:text-[#0F2C59]'
              }`}
            >
              <Package size={15} />
              Booking Pickups
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CASH_CHECKOUT')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'CASH_CHECKOUT'
                  ? 'bg-[#1E56A0] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white/80 hover:text-[#0F2C59]'
              }`}
            >
              <Scale size={15} />
              In-Store POS Checkout
            </button>
          </div>

          {/* Right: Shift Status & End Shift Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5">
              <div className="relative">
                <span className="grid size-7 place-items-center rounded-lg bg-[#E8F1F5] text-xs font-black text-[#1E56A0]">
                  W
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="hidden text-left sm:block">
                <p className="max-w-[110px] truncate text-xs font-extrabold text-[#0F2C59] leading-tight">
                  Operator
                </p>
                <p className="text-[10px] font-bold text-emerald-600 leading-tight">On Shift</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="End shift and logout"
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">End Shift</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="mt-2.5 flex items-center justify-center gap-2 rounded-xl bg-slate-100 p-1 md:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('BOOKINGS')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${
              activeTab === 'BOOKINGS'
                ? 'bg-[#1E56A0] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F2C59]'
            }`}
          >
            <Package size={14} />
            Pickups
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CASH_CHECKOUT')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition ${
              activeTab === 'CASH_CHECKOUT'
                ? 'bg-[#1E56A0] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F2C59]'
            }`}
          >
            <Scale size={14} />
            POS Checkout
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
        {/* TAB 1: BOOKINGS & PICKUP VERIFICATION */}
        {activeTab === 'BOOKINGS' && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            {/* Left Column: Bookings Search & List */}
            <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
              <div className="flex items-center justify-between pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-[#0F2C59] sm:text-lg">
                    Customer Pickup Queue
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verify and fulfill 48-hour online reservations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchBookings}
                  title="Refresh Queue"
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-[#1E56A0]"
                >
                  <RefreshCw size={14} className={bookingsLoading ? 'animate-spin text-[#1E56A0]' : ''} />
                </button>
              </div>

              {/* Search Control */}
              <div className="relative mt-2">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer phone, name, or booking code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#1E56A0] focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'EXPIRED'].map((st) => {
                  const active = statusFilter === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                        active
                          ? 'bg-[#1E56A0] text-white shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>

              {/* Error Callout */}
              {bookingsError && (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className="text-rose-600" />
                    <span>{bookingsError}</span>
                  </div>
                  <button
                    onClick={fetchBookings}
                    className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-rose-700"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Bookings Card List */}
              <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[560px] pr-1">
                {bookingsLoading && bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                    <div className="size-7 animate-spin rounded-full border-2 border-[#1E56A0] border-t-transparent" />
                    <p className="mt-2 text-xs font-semibold">Loading orders from server...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-xs font-semibold text-slate-400">
                    No booking reservations found matching criteria.
                  </div>
                ) : (
                  bookings.map((bk) => {
                    const isSelected = selectedBooking?.id === bk.id;
                    const isConfirmed = bk.status === 'CONFIRMED' || bk.status === 'COMPLETED';

                    return (
                      <div
                        key={bk.id}
                        onClick={() => setSelectedBooking(bk)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-150 ${
                          isSelected
                            ? 'border-[#1E56A0] bg-[#E8F1F5]/40 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-extrabold text-[#0F2C59]">
                            {bk.bookingCode}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                              isConfirmed
                                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                : bk.status === 'EXPIRED'
                                ? 'border border-rose-200 bg-rose-50 text-rose-700'
                                : 'border border-amber-200 bg-amber-50 text-amber-700'
                            }`}
                          >
                            {bk.status}
                          </span>
                        </div>

                        <p className="mt-1.5 text-xs font-bold text-slate-700">
                          {bk.customer?.name || 'Customer'} •{' '}
                          <span className="font-mono font-normal text-slate-500">
                            {bk.customer?.mobileNumber || 'N/A'}
                          </span>
                        </p>

                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="font-extrabold text-[#1E56A0]">
                            ₹{bk.totalAmount.toFixed(2)} Total
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Expires: {new Date(bk.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Order Detail & Handover Fulfillment */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
              <h2 className="text-base font-extrabold text-[#0F2C59] sm:text-lg">
                Fulfillment & Verification
              </h2>
              <p className="text-xs text-slate-500">
                Inspect reservation details and authorize handover
              </p>

              {!selectedBooking ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center text-slate-400">
                  <Package size={32} className="text-slate-300" />
                  <p className="mt-2 text-xs font-semibold">
                    Select a booking order from the left queue to inspect and complete pickup.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {/* Order Summary Box */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
                    <div className="flex justify-between border-b border-slate-200/80 pb-2 text-xs">
                      <span className="font-semibold text-slate-500">Booking Code:</span>
                      <span className="font-mono font-black text-[#0F2C59]">
                        {selectedBooking.bookingCode}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 text-xs">
                      <span className="font-semibold text-slate-500">Status:</span>
                      <span className="font-extrabold text-[#1E56A0]">{selectedBooking.status}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/80 pt-2 text-xs">
                      <span className="font-semibold text-slate-500">Customer Mobile:</span>
                      <span className="font-bold text-slate-800">
                        {selectedBooking.customer?.mobileNumber}
                      </span>
                    </div>
                  </div>

                  {/* Reserved Items */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                      Reserved Catch Items
                    </h4>
                    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                      {selectedBooking.bookingItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 text-xs">
                          <div>
                            <p className="font-bold text-[#0F2C59]">{item.fish?.name || 'Fresh Fish'}</p>
                            <p className="text-[11px] text-slate-500">
                              {item.quantityKg} kg @ ₹{item.unitPrice}/kg
                            </p>
                          </div>
                          <span className="font-extrabold text-[#1E56A0]">
                            ₹{item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ledger Breakdown */}
                  <div className="rounded-2xl bg-[#E8F1F5]/50 p-3.5 text-xs text-slate-700 space-y-1.5 border border-[#BFDBFE]/60">
                    <div className="flex justify-between">
                      <span>Total Value:</span>
                      <span className="font-bold text-[#0F2C59]">₹{selectedBooking.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Subscription Wallet Applied:</span>
                      <span>₹{selectedBooking.subCreditUsed.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Razorpay Online Paid:</span>
                      <span>₹{selectedBooking.razorpayPaid.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Completion Alerts */}
                  {completionError && (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
                      <AlertCircle size={15} className="text-rose-600" />
                      <span>{completionError}</span>
                    </div>
                  )}

                  {lastCompletedBooking && lastCompletedBooking.id === selectedBooking.id && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Pickup verified and completed. Inventory deducted.</span>
                    </div>
                  )}

                  {/* Action Handover Button */}
                  {selectedBooking.status === 'EXPIRED' ? (
                    <button
                      disabled
                      className="w-full rounded-2xl bg-slate-300 py-3.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                    >
                      Cannot Complete: 48h Booking Expired
                    </button>
                  ) : selectedBooking.status === 'COMPLETED' ? (
                    <button
                      disabled
                      className="w-full rounded-2xl bg-slate-200 py-3.5 text-xs font-bold text-slate-600 cursor-not-allowed"
                    >
                      Order Already Completed
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCompleteBooking(selectedBooking.id)}
                      disabled={completionLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E56A0] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#0F2C59] active:scale-[0.99] disabled:opacity-60"
                    >
                      {completionLoading ? (
                        <>
                          <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Fulfilling Order...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Verify Token & Complete Handover</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: IN-STORE POS CASH CHECKOUT */}
        {activeTab === 'CASH_CHECKOUT' && (
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-extrabold text-[#0F2C59]">
                In-Store Point of Sale Checkout
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Process walk-in counter sales with automatic weight calculation and wallet credit reconciliation.
              </p>
            </div>

            {checkoutError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-800">
                <AlertCircle size={15} className="text-rose-600" />
                <span>{checkoutError}</span>
              </div>
            )}

            {lastTxnResult && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 size={16} />
                  <span>Transaction Recorded Successfully</span>
                </div>
                <div className="mt-2.5 space-y-1 text-slate-700">
                  <p>Receipt Ref: <strong className="font-mono text-[#0F2C59]">{lastTxnResult.transactionNumber}</strong></p>
                  <p>Wallet Credit Applied: ₹{lastTxnResult.subCreditUsed}</p>
                  <p>Cash Collected at Counter: <strong className="text-[#1E56A0]">₹{lastTxnResult.finalPaidAmount}</strong></p>
                </div>
              </div>
            )}

            <form onSubmit={handleCollectCashCheckout} className="mt-6 space-y-4">
              {/* Customer Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700">Customer Mobile / ID *</label>
                <div className="relative mt-1">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={checkoutCustomerInput}
                    onChange={(e) => setCheckoutCustomerInput(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs font-semibold text-slate-800 focus:border-[#1E56A0] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Fish Species Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700">Select Catch Species *</label>
                <div className="relative mt-1">
                  <select
                    value={selectedFishId}
                    onChange={(e) => setSelectedFishId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs font-semibold text-slate-800 focus:border-[#1E56A0] focus:outline-hidden"
                  >
                    {fishList.map((fish) => (
                      <option key={fish.id} value={fish.id}>
                        {fish.name} — ₹{fish.unitPrice} / kg
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weight Presets & Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700">Weight (KG) *</label>
                <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
                  {['0.5', '1.0', '1.5', '2.0', '3.0', '5.0'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQtyKg(val)}
                      className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                        qtyKg === val
                          ? 'bg-[#1E56A0] text-white shadow-xs'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {val} kg
                    </button>
                  ))}
                </div>
                <div className="relative mt-2">
                  <Scale size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={qtyKg}
                    onChange={(e) => setQtyKg(e.target.value)}
                    placeholder="Enter precise scale weight"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs font-semibold text-slate-800 focus:border-[#1E56A0] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Bill Estimation Card */}
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#E8F1F5] p-4 border border-[#BFDBFE]">
                <div>
                  <p className="text-xs font-bold text-slate-600">Calculated Total</p>
                  <p className="text-[10px] text-slate-500">Includes live counter weight conversion</p>
                </div>
                <p className="text-2xl font-black text-[#0F2C59]">
                  ₹{estimatedCheckoutSubtotal.toFixed(2)}
                </p>
              </div>

              {/* Submit Checkout Button */}
              <button
                type="submit"
                disabled={checkoutLoading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0F2C59] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#1E56A0] active:scale-[0.99] disabled:opacity-60"
              >
                {checkoutLoading ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Finalizing Checkout...</span>
                  </>
                ) : (
                  <>
                    <Receipt size={16} />
                    <span>Collect Payment & Print Receipt</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

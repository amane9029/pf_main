import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Award,
  CheckCircle2,
  Clock,
  Navigation,
  Package,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Truck,
  Tv,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
  Zap,
} from 'lucide-react';
import { TV_API_CONFIG } from './config/apiConfig';

export interface DisplayTransactionItem {
  name: string;
  quantityKg: number;
  price: number;
  subtotal: number;
}

export interface DisplayTransaction {
  transactionId: string;
  transactionNumber: string;
  customerName: string;
  items: DisplayTransactionItem[];
  totalAmount: number;
  paymentMethod: string;
  timestamp: string;
}

export const normalizeTransactionEvent = (data: any): DisplayTransaction | null => {
  if (!data || (!data.transactionId && !data.id)) return null;

  const transactionId = String(data.transactionId || data.id);
  const transactionNumber = String(
    data.transactionNumber || data.billId || data.orderId || transactionId.slice(0, 8)
  );
  const customerName = String(
    data.customerName || (data.customer ? data.customer.name : 'In-Store Customer')
  );

  const rawItems = Array.isArray(data.items) ? data.items : [];
  const items: DisplayTransactionItem[] = rawItems.map((item: any) => {
    const name = String(item.fishName || item.name || 'Fresh Fish');
    const quantityKg = Number(item.quantityKg) || 0;
    const price = Number(item.unitPrice || item.price) || 0;
    const subtotal = Number(item.subtotal) || quantityKg * price;
    return { name, quantityKg, price, subtotal };
  });

  const totalAmount =
    Number(data.finalPaidAmount || data.totalBillAmount || data.totalAmount) ||
    items.reduce((acc, i) => acc + i.subtotal, 0);
  const paymentMethod = String(data.paymentMethod || 'CASH');

  let formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (data.timestamp) {
    try {
      formattedTime = new Date(data.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      // Fallback to current time string on parse error
    }
  }

  return {
    transactionId,
    transactionNumber,
    customerName,
    items,
    totalAmount,
    paymentMethod,
    timestamp: formattedTime,
  };
};

export default function App() {
  const [socketStatus, setSocketStatus] = useState<
    'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'CONNECT_ERROR'
  >('DISCONNECTED');
  const [activeCelebration, setActiveCelebration] = useState<DisplayTransaction | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<DisplayTransaction[]>([]);

  const [storeStats, setStoreStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    totalKgSold: 0,
  });

  const [truckStatus, setTruckStatus] = useState({
    name: 'Mobile Delivery Truck #1',
    driver: 'Active Operator',
    location: 'Sector 62 Main Route',
    status: 'ACTIVE_ROUTE',
    lat: 16.5062,
    lng: 80.648,
    speedKm: 24,
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);

  const seenIdsRef = useRef<Set<string>>(new Set());
  const celebrationTimerRef = useRef<any>(null);

  // Initial REST Data Hydration on Startup
  useEffect(() => {
    let isMounted = true;

    const hydrateRecentTransactions = async () => {
      try {
        const res = await fetch(`${TV_API_CONFIG.apiBaseUrl}/public/transactions/recent?limit=10`);
        if (!res.ok) return;
        const body = await res.json();
        if (!body.success || !Array.isArray(body.data)) return;

        if (!isMounted) return;

        const normalizedList: DisplayTransaction[] = [];
        let rev = 0;
        let orders = 0;
        let kg = 0;

        for (const item of body.data) {
          const norm = normalizeTransactionEvent(item);
          if (norm && norm.transactionId && !seenIdsRef.current.has(norm.transactionId)) {
            seenIdsRef.current.add(norm.transactionId);
            normalizedList.push(norm);
            rev += norm.totalAmount;
            orders += 1;
            kg += norm.items.reduce((acc, i) => acc + i.quantityKg, 0);
          }
        }

        if (normalizedList.length > 0) {
          setRecentTransactions(normalizedList);
          setStoreStats({
            todayRevenue: rev,
            todayOrders: orders,
            totalKgSold: kg,
          });
        }
      } catch (err) {
        console.warn('TV initial REST hydration warning:', err);
      }
    };

    const fetchLiveTruckStatus = async () => {
      try {
        const res = await fetch(`${TV_API_CONFIG.apiBaseUrl}/public/gps/live`);
        if (!res.ok) return;
        const body = await res.json();
        if (!isMounted) return;

        if (body.success && body.data) {
          const journey = body.data;
          const lastPos = journey.positions?.[0];
          setTruckStatus({
            name: `Truck ${journey.truckNumber || '#1'}`,
            driver: journey.driverName || 'Active Driver',
            location: lastPos
              ? `Lat: ${lastPos.latitude.toFixed(4)}, Lng: ${lastPos.longitude.toFixed(4)}`
              : 'Active Route',
            status: 'ACTIVE_ROUTE',
            lat: lastPos?.latitude || 16.5062,
            lng: lastPos?.longitude || 80.648,
            speedKm: lastPos?.speed || 24,
          });
        } else {
          setTruckStatus({
            name: 'Mobile Delivery Truck #1',
            driver: 'Store Operator',
            location: 'No Active Published Journey',
            status: 'NO_ACTIVE_ROUTE',
            lat: 16.5062,
            lng: 80.648,
            speedKm: 0,
          });
        }
      } catch {
        // Fallback to default standby state on network exception
      }
    };

    hydrateRecentTransactions();
    fetchLiveTruckStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // Audio chime synthesis
  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      playNote(523.25, 0.0, 0.4); // C5
      playNote(659.25, 0.15, 0.4); // E5
      playNote(783.99, 0.3, 0.6); // G5
    } catch {
      // Audio context ignored if gesture policy restricts startup autoplay
    }
  }, [soundEnabled]);

  // Update Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket connection lifecycle & TRANSACTION_COMPLETED listener
  useEffect(() => {
    const socketUrl = TV_API_CONFIG.socketUrl;
    const socket: Socket = io(socketUrl, {
      reconnectionAttempts: TV_API_CONFIG.reconnectionAttempts,
      timeout: TV_API_CONFIG.timeoutMs,
      autoConnect: true,
    });

    socket.on('connect', () => {
      setSocketStatus('CONNECTED');
    });

    socket.on('disconnect', () => {
      setSocketStatus('DISCONNECTED');
    });

    socket.on('connect_error', () => {
      setSocketStatus('CONNECT_ERROR');
    });

    socket.on('reconnect_attempt', () => {
      setSocketStatus('RECONNECTING');
    });

    socket.on('reconnect', () => {
      setSocketStatus('CONNECTED');
    });

    const handleTransactionCompleted = (rawData: any) => {
      const normalized = normalizeTransactionEvent(rawData);
      if (!normalized || !normalized.transactionId) return;

      if (seenIdsRef.current.has(normalized.transactionId)) {
        return;
      }
      seenIdsRef.current.add(normalized.transactionId);

      playChime();
      setActiveCelebration(normalized);

      const totalKg = normalized.items.reduce((acc, i) => acc + i.quantityKg, 0);

      setRecentTransactions((prev) => [normalized, ...prev.slice(0, 9)]);
      setStoreStats((prev) => ({
        todayRevenue: prev.todayRevenue + normalized.totalAmount,
        todayOrders: prev.todayOrders + 1,
        totalKgSold: prev.totalKgSold + totalKg,
      }));

      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
      celebrationTimerRef.current = setTimeout(() => {
        setActiveCelebration(null);
      }, 8000);
    };

    socket.on('TRANSACTION_COMPLETED', handleTransactionCompleted);

    return () => {
      socket.off('TRANSACTION_COMPLETED', handleTransactionCompleted);
      socket.disconnect();
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
    };
  }, [playChime]);

  const dismissCelebration = () => {
    if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
    setActiveCelebration(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] p-4 text-slate-800 sm:p-6 lg:p-8">
      {/* Top Digital Signage Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-[#0F2C59] to-[#1E56A0] text-white shadow-md">
            <Tv size={26} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight sm:text-2xl">
              <span className="text-[#0F2C59]">Pond</span>
              <span className="text-[#1E56A0]">Fish</span>
              <span className="ml-2.5 rounded-md bg-[#E8F1F5] px-2.5 py-0.5 text-xs font-black uppercase text-[#1E56A0] border border-[#1E56A0]/20">
                Live Store TV
              </span>
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Counter #01 & Delivery Cold Chain Broadcast Board
            </p>
          </div>
        </div>

        {/* Right Status Badges & Clock */}
        <div className="flex items-center gap-3">
          {/* Socket Live Pill */}
          <div
            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-black tracking-wider uppercase ${
              socketStatus === 'CONNECTED'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : socketStatus === 'RECONNECTING'
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {socketStatus === 'CONNECTED' ? (
              <>
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <Wifi size={14} />
                <span>Socket Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={14} />
                <span>Offline Sync</span>
              </>
            )}
          </div>

          {/* Audio Chime Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-[#0F2C59]"
            title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Digital Clock */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right shadow-inner">
            <p className="font-mono text-lg font-black tracking-wider text-[#0F2C59]">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-[10px] font-bold text-slate-500">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </header>

      {/* Main Display Grid */}
      <main className="mt-6 grid flex-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: KPI Stats & Live Checkout Feed */}
        <div className="space-y-6 lg:col-span-2">
          {/* 3 Large KPI Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                Today&apos;s Store Sales
              </span>
              <p className="mt-2 font-mono text-3xl font-black text-emerald-600 sm:text-4xl">
                ₹{storeStats.todayRevenue.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-500">Live transaction ledger</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                Orders Completed
              </span>
              <p className="mt-2 font-mono text-3xl font-black text-[#1E56A0] sm:text-4xl">
                {storeStats.todayOrders}
              </p>
              <p className="mt-1 text-xs text-slate-500">Pickups & in-store bills</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                Fresh Catch Sold
              </span>
              <p className="mt-2 font-mono text-3xl font-black text-[#0F2C59] sm:text-4xl">
                {storeStats.totalKgSold.toFixed(1)} <span className="text-xl">kg</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">Farm harvest weight</p>
            </div>
          </div>

          {/* Live Recent Transactions Feed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Receipt size={20} className="text-[#1E56A0]" />
                <h2 className="text-base font-extrabold tracking-wide text-[#0F2C59] sm:text-lg">
                  Live Counter Order Feed
                </h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                Real-Time Broadcast
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-100 overflow-y-auto max-h-[380px] pr-1">
              {recentTransactions.length === 0 ? (
                <div className="p-8 text-center text-xs font-semibold text-slate-400">
                  Waiting for next completed checkout broadcast from worker tablet...
                </div>
              ) : (
                recentTransactions.map((tx) => (
                  <div key={tx.transactionId} className="flex items-center justify-between py-3.5 hover:bg-slate-50/60 px-2 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-[#E8F1F5] text-xs font-bold font-mono text-[#1E56A0]">
                        #{tx.transactionNumber.slice(-4)}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">{tx.customerName}</p>
                        <p className="text-xs text-slate-500">
                          {tx.items.map((i) => `${i.name} (${i.quantityKg}kg)`).join(', ') || 'Fresh catch items'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-base font-black text-emerald-600">
                        ₹{tx.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500">
                        {tx.paymentMethod} • {tx.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Live Truck IoT Status & Harvest Freshness Guarantee */}
        <div className="space-y-6">
          {/* Truck IoT Status Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <Truck size={20} className="text-[#1E56A0]" />
              <h2 className="text-base font-extrabold tracking-wide text-[#0F2C59]">
                Truck Route & IoT Cold Chain
              </h2>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-extrabold text-slate-900">{truckStatus.name}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Operator:</span>
                  <span className="font-bold text-slate-700">{truckStatus.driver}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Transit Status:</span>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200">
                    {truckStatus.status}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-[#E8F1F5]/70 p-4 border border-[#1E56A0]/20">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#1E56A0]">
                  Live Location Coordinates
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-[#0F2C59]">
                  {truckStatus.location}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                  <Navigation size={13} className="text-emerald-600" />
                  <span>Telemetry Speed: {truckStatus.speedKm} km/h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Freshness Index Info Card */}
          <div className="rounded-2xl border border-transparent bg-gradient-to-br from-[#0F2C59] to-[#1E56A0] p-6 text-white shadow-md">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#93CCFF]">
              48-Hour Freshness Standard
            </h3>
            <p className="mt-2 text-xs leading-6 text-slate-200">
              Every catch displayed on this board is harvested at inland ponds, cold-chain transported at 2°C – 4°C, and guaranteed fresh with zero formalin or preservation chemicals.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-bold">
              <span className="rounded-xl bg-emerald-500/20 border border-emerald-400/30 px-3 py-2 text-emerald-300 text-center">
                Green (0-24h Fresh)
              </span>
              <span className="rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-slate-200 text-center">
                Grey (24-48h Chilled)
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Real-time Order Completed Celebration Modal Overlay */}
      {activeCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-900 shadow-2xl">
            <button
              onClick={dismissCelebration}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <p className="mt-4 text-xs font-extrabold tracking-widest text-emerald-600 uppercase">
              Order Verified & Fulfilled
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#0F2C59]">
              Thank You, {activeCelebration.customerName}!
            </h2>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5 border border-slate-200 text-left">
              <div className="flex justify-between border-b border-slate-200 pb-2 text-xs">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-[#1E56A0]">
                  {activeCelebration.transactionNumber}
                </span>
              </div>
              <div className="py-2.5 space-y-1">
                {activeCelebration.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800">{i.name} ({i.quantityKg}kg)</span>
                    <span className="font-mono text-emerald-600">₹{i.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold">
                <span className="text-slate-900">Amount Paid:</span>
                <span className="font-mono text-lg text-emerald-600">
                  ₹{activeCelebration.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              Sustainably farmed freshwater catch • Enjoy your fresh meal!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Edit2,
  FileText,
  Filter,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Navigation,
  Package,
  Plus,
  Radio,
  Receipt,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Store,
  Tag,
  Trash2,
  Truck,
  UserCheck,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { AdminAuthStorageService } from './services/authStorage';
import { ADMIN_API_CONFIG } from './config/apiConfig';

type AuthState = 'AUTHENTICATION_CHECKING' | 'AUTHENTICATION_REQUIRED' | 'AUTHENTICATED';

type Tab = 'ANALYTICS' | 'FISH' | 'INVENTORY' | 'BOOKINGS' | 'TRANSACTIONS' | 'GPS' | 'WORKERS' | 'AUDIT';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('AUTHENTICATION_CHECKING');
  const [token, setToken] = useState<string | null>(null);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Main active tab & mobile drawer
  const [activeTab, setActiveTab] = useState<Tab>('ANALYTICS');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Universal Tab Data States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tab 1: Executive Analytics State
  const [analytics, setAnalytics] = useState<any>(null);

  // Tab 2: Fish Catalogue & Categories State
  const [fishList, setFishList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [fishSearch, setFishSearch] = useState('');
  const [fishCategoryFilter, setFishCategoryFilter] = useState('');
  const [showAddFishModal, setShowAddFishModal] = useState(false);

  // New Fish Form State
  const [newFishCategoryId, setNewFishCategoryId] = useState('');
  const [newFishName, setNewFishName] = useState('');
  const [newFishPrice, setNewFishPrice] = useState('250');
  const [newFishFreshness, setNewFishFreshness] = useState('GREEN');
  const [newFishOnline, setNewFishOnline] = useState(true);
  const [newFishPhysical, setNewFishPhysical] = useState(true);
  const [fishSuccessMsg, setFishSuccessMsg] = useState<string | null>(null);

  // Edit Fish State
  const [editingFish, setEditingFish] = useState<any | null>(null);
  const [editFishPrice, setEditFishPrice] = useState('');
  const [editFishFreshness, setEditFishFreshness] = useState('GREEN');

  // Tab 3: Inventory State
  const [batches, setBatches] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [showReceiveStockModal, setShowReceiveStockModal] = useState(false);
  const [stockFishId, setStockFishId] = useState('');
  const [stockBatchCode, setStockBatchCode] = useState('');
  const [stockQty, setStockQty] = useState('50');
  const [stockExpiryHours, setStockExpiryHours] = useState('48');
  const [stockSuccessMsg, setStockSuccessMsg] = useState<string | null>(null);

  // Tab 4: Booking Management State
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');

  // Tab 5: Transaction Ledger State
  const [transactions, setTransactions] = useState<any[]>([]);

  // Tab 6: OneLap GPS State
  const [activeJourney, setActiveJourney] = useState<any>(null);
  const [truckNumber, setTruckNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [gpsLat, setGpsLat] = useState('16.5062');
  const [gpsLng, setGpsLng] = useState('80.6480');
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);

  // Tab 7: Workers State
  const [workers, setWorkers] = useState<any[]>([]);
  const [workerName, setWorkerName] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');
  const [showWorkerModal, setShowWorkerModal] = useState(false);

  // Tab 8: Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Helper fetch with automatic auth header
  const apiFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const currentToken = token || AdminAuthStorageService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const response = await fetch(`${ADMIN_API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      AdminAuthStorageService.clearToken();
      setToken(null);
      setAuthState('AUTHENTICATION_REQUIRED');
      throw new Error('Session expired or unauthorized. Please sign in again.');
    }

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || data.message || `Request failed (${response.status})`);
    }

    return data.data;
  }, [token]);

  // Session check on startup
  useEffect(() => {
    const storedToken = AdminAuthStorageService.getToken();
    if (storedToken) {
      setToken(storedToken);
      setAuthState('AUTHENTICATED');
    } else {
      setAuthState('AUTHENTICATION_REQUIRED');
    }
  }, []);

  // Admin login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email.trim() || !password.trim()) {
      setLoginError('Please enter admin email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${ADMIN_API_CONFIG.baseUrl}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Invalid admin credentials');
      }

      const jwt = data.data.token;
      AdminAuthStorageService.saveToken(jwt);
      setToken(jwt);
      setAuthState('AUTHENTICATED');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    AdminAuthStorageService.clearToken();
    setToken(null);
    setAuthState('AUTHENTICATION_REQUIRED');
    setActiveTab('ANALYTICS');
    setAnalytics(null);
    setFishList([]);
    setCategories([]);
    setBookings([]);
    setTransactions([]);
    setActiveJourney(null);
  };

  // Load Tab Data
  const loadTabData = useCallback(async () => {
    if (authState !== 'AUTHENTICATED') return;
    setLoading(true);
    setErrorMsg(null);

    try {
      if (activeTab === 'ANALYTICS') {
        const res = await apiFetch('/admin/analytics');
        setAnalytics(res);
      } else if (activeTab === 'FISH') {
        const [cats, fishes] = await Promise.all([
          apiFetch('/admin/categories'),
          apiFetch('/admin/fish'),
        ]);
        setCategories(cats || []);
        setFishList(fishes || []);
        if (cats && cats.length > 0 && !newFishCategoryId) {
          setNewFishCategoryId(cats[0].id);
        }
      } else if (activeTab === 'INVENTORY') {
        const [cats, fishes, batchData, ledgerData] = await Promise.all([
          apiFetch('/admin/categories'),
          apiFetch('/admin/fish'),
          apiFetch('/admin/inventory/batches'),
          apiFetch('/admin/inventory/ledger'),
        ]);
        setCategories(cats || []);
        setFishList(fishes || []);
        setBatches(batchData || []);
        setLedger(ledgerData || []);
        if (fishes && fishes.length > 0 && !stockFishId) {
          setStockFishId(fishes[0].id);
        }
      } else if (activeTab === 'BOOKINGS') {
        let query = `/admin/bookings?`;
        if (bookingSearch.trim()) query += `search=${encodeURIComponent(bookingSearch.trim())}&`;
        if (bookingStatusFilter) query += `status=${encodeURIComponent(bookingStatusFilter)}`;
        const res = await apiFetch(query);
        setBookings(res || []);
      } else if (activeTab === 'TRANSACTIONS') {
        const res = await apiFetch('/admin/transactions');
        setTransactions(res || []);
      } else if (activeTab === 'GPS') {
        const res = await apiFetch('/admin/gps/journey/active');
        setActiveJourney(res);
      } else if (activeTab === 'WORKERS') {
        const res = await apiFetch('/admin/workers');
        setWorkers(res || []);
      } else if (activeTab === 'AUDIT') {
        const res = await apiFetch('/admin/audit-logs');
        setAuditLogs(res || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load data from backend server.');
    } finally {
      setLoading(false);
    }
  }, [authState, activeTab, bookingSearch, bookingStatusFilter, apiFetch, newFishCategoryId, stockFishId]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  // Create Fish Handler
  const handleCreateFish = async (e: React.FormEvent) => {
    e.preventDefault();
    setFishSuccessMsg(null);
    setErrorMsg(null);

    if (!newFishCategoryId) {
      setErrorMsg('Please select a valid category.');
      return;
    }
    if (!newFishName.trim()) {
      setErrorMsg('Fish name is required.');
      return;
    }
    const priceNum = parseFloat(newFishPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Price per kg must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch('/admin/fish', {
        method: 'POST',
        body: JSON.stringify({
          categoryId: newFishCategoryId,
          name: newFishName.trim(),
          unitPrice: priceNum,
          freshnessState: newFishFreshness,
          onlineBookable: newFishOnline,
          physicalAvailable: newFishPhysical,
        }),
      });
      setFishSuccessMsg(`Fish "${newFishName}" added to catalogue successfully!`);
      setNewFishName('');
      setShowAddFishModal(false);
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create fish item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Fish Handler
  const handleSaveEditFish = async () => {
    if (!editingFish) return;
    const priceNum = parseFloat(editFishPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Valid price required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await apiFetch(`/admin/fish/${editingFish.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          unitPrice: priceNum,
          freshnessState: editFishFreshness,
        }),
      });
      setEditingFish(null);
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update fish details');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Receive Stock Handler
  const handleReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setStockSuccessMsg(null);
    setErrorMsg(null);

    if (!stockFishId) {
      setErrorMsg('Please select a fish item.');
      return;
    }
    const code = stockBatchCode.trim() || `BATCH-${Date.now().toString(36).toUpperCase()}`;
    const qty = parseFloat(stockQty);
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg('Stock quantity must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch('/admin/inventory/receive', {
        method: 'POST',
        body: JSON.stringify({
          fishId: stockFishId,
          batchCode: code,
          receivedQty: qty,
          expiryHours: parseInt(stockExpiryHours) || 48,
        }),
      });
      setStockSuccessMsg(`Received ${qty}kg for batch ${code}!`);
      setStockBatchCode('');
      setShowReceiveStockModal(false);
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to receive stock batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  // GPS Controller Handlers
  const handleStartGPS = async () => {
    if (!truckNumber.trim() || !driverName.trim()) {
      setErrorMsg('Truck vehicle number and driver name are required to start a journey.');
      return;
    }
    setIsSubmitting(true);
    setGpsSuccessMsg(null);
    setErrorMsg(null);
    try {
      const journey = await apiFetch('/admin/gps/journey/start', {
        method: 'POST',
        body: JSON.stringify({ truckNumber: truckNumber.trim(), driverName: driverName.trim() }),
      });
      setActiveJourney(journey);
      setGpsSuccessMsg(`Live Truck Journey started for ${truckNumber.trim()}!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start GPS journey');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishGPS = async (publish: boolean) => {
    if (!activeJourney) return;
    setIsSubmitting(true);
    setGpsSuccessMsg(null);
    setErrorMsg(null);
    try {
      const updated = await apiFetch('/admin/gps/journey/publish', {
        method: 'POST',
        body: JSON.stringify({ journeyId: activeJourney.id, publish }),
      });
      setActiveJourney(updated);
      setGpsSuccessMsg(`Live GPS tracking map ${publish ? 'published to Customer App' : 'unpublished'}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update GPS map publishing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordGPSPosition = async () => {
    if (!activeJourney) return;
    const lat = parseFloat(gpsLat);
    const lng = parseFloat(gpsLng);
    if (isNaN(lat) || isNaN(lng)) {
      setErrorMsg('Valid latitude and longitude are required.');
      return;
    }
    setIsSubmitting(true);
    setGpsSuccessMsg(null);
    setErrorMsg(null);
    try {
      await apiFetch('/admin/gps/position', {
        method: 'POST',
        body: JSON.stringify({ journeyId: activeJourney.id, latitude: lat, longitude: lng, speed: 45 }),
      });
      setGpsSuccessMsg(`Recorded position (${lat}, ${lng})!`);
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record GPS telemetry position');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStopGPS = async () => {
    if (!activeJourney) return;
    setIsSubmitting(true);
    setGpsSuccessMsg(null);
    setErrorMsg(null);
    try {
      await apiFetch('/admin/gps/journey/stop', {
        method: 'POST',
        body: JSON.stringify({ journeyId: activeJourney.id }),
      });
      setActiveJourney(null);
      setGpsSuccessMsg('Truck delivery journey stopped & cleared.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to stop GPS journey');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Worker Handler
  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerName.trim() || !workerPhone.trim() || !workerPassword.trim()) {
      setErrorMsg('Worker name, mobile number, and password are required.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await apiFetch('/admin/workers', {
        method: 'POST',
        body: JSON.stringify({
          name: workerName.trim(),
          mobileNumber: workerPhone.trim(),
          password: workerPassword,
        }),
      });
      setWorkerName('');
      setWorkerPhone('');
      setWorkerPassword('');
      setShowWorkerModal(false);
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create worker account');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation menu grouped by sections
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [{ key: 'ANALYTICS' as Tab, label: 'Analytics & KPIs', icon: LayoutDashboard }],
    },
    {
      title: 'OPERATIONS',
      items: [
        { key: 'FISH' as Tab, label: 'Fish Catalogue', icon: Utensils },
        { key: 'INVENTORY' as Tab, label: 'Inventory & Batches', icon: Package },
        { key: 'BOOKINGS' as Tab, label: 'Booking Orders', icon: CalendarCheck },
        { key: 'TRANSACTIONS' as Tab, label: 'Sales Ledger', icon: Receipt },
      ],
    },
    {
      title: 'LOGISTICS & STAFF',
      items: [
        { key: 'GPS' as Tab, label: 'Live Truck Tracking', icon: Navigation },
        { key: 'WORKERS' as Tab, label: 'Staff & Drivers', icon: Users },
      ],
    },
    {
      title: 'SECURITY & AUDIT',
      items: [{ key: 'AUDIT' as Tab, label: 'System Audit Logs', icon: ShieldCheck }],
    },
  ];

  // Freshness helper pill
  const renderFreshnessBadge = (state: string) => {
    switch (state) {
      case 'GREEN':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Green (Fresh 0-24h)
          </span>
        );
      case 'GREY':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 border border-slate-300">
            <span className="size-1.5 rounded-full bg-slate-500" />
            Grey (Chilled 24-48h)
          </span>
        );
      case 'YELLOW':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Yellow (Discounted)
          </span>
        );
      case 'RED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Red (Expired)
          </span>
        );
      default:
        return <span className="text-xs font-bold text-slate-500">{state}</span>;
    }
  };

  // 1. Loading Screen
  if (authState === 'AUTHENTICATION_CHECKING') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-4 border-[#1E56A0] border-t-transparent" />
          <p className="text-xs font-bold text-[#0F2C59]">Checking administrator session...</p>
        </div>
      </div>
    );
  }

  // 2. Authentication Login Screen
  if (authState === 'AUTHENTICATION_REQUIRED') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F2C59] via-[#102e58] to-[#1E56A0] p-4">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#0F2C59] text-white shadow-md">
              <Shield size={24} className="text-[#93CCFF]" />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-[#0F2C59]">
              Pond<span className="text-[#1E56A0]">Fish</span>
            </h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#1E56A0]">
              Admin Management Portal
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Sign in with administrative privileges to manage inventory and store operations.
            </p>
          </div>

          {/* Error banner */}
          {loginError && (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
              <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">Admin Email</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pondfish.in"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#1E56A0] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Security Password</label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#1E56A0] focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2C59] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#1E56A0] active:scale-[0.99] disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Control Center</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-400">
              PondFish Enterprise Digital Ecosystem v1.0
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Admin Dashboard Interface
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop Left Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-800 bg-[#0F2C59] p-5 text-white md:flex">
        <div>
          {/* Brand Header */}
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black tracking-[-.06em]">
              <span>Pond</span>
              <span className="text-[#93CCFF]">Fish</span>
            </h2>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-300">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              Store Admin Portal
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="mt-6 space-y-6 overflow-y-auto">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  {section.title}
                </p>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setActiveTab(item.key)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#1E56A0] text-white shadow-sm'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Footer */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-white/15 text-xs font-black text-white">
              AD
            </span>
            <div className="text-left">
              <p className="max-w-[110px] truncate text-xs font-extrabold text-white leading-tight">
                Store Admin
              </p>
              <p className="max-w-[110px] truncate text-[10px] text-slate-400">admin@pondfish.in</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-rose-300"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col justify-between bg-[#0F2C59] p-5 text-white shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="text-2xl font-black tracking-[-.06em]">
                  <span>Pond</span>
                  <span className="text-[#93CCFF]">Fish</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-5 space-y-6 overflow-y-auto">
                {navSections.map((section) => (
                  <div key={section.title}>
                    <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      {section.title}
                    </p>
                    <nav className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                              setActiveTab(item.key);
                              setMobileDrawerOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                              isActive
                                ? 'bg-[#1E56A0] text-white shadow-sm'
                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <Icon size={16} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-white/15 text-xs font-bold">
                  AD
                </span>
                <span className="text-xs font-bold">Store Admin</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-2 text-rose-300 hover:bg-white/10"
              >
                <LogOut size={16} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base font-extrabold text-[#0F2C59] sm:text-lg">
                {activeTab === 'ANALYTICS' && 'Executive Analytics & KPIs'}
                {activeTab === 'FISH' && 'Fish Catalogue & Pricing'}
                {activeTab === 'INVENTORY' && 'Inventory Batches & Expiry'}
                {activeTab === 'BOOKINGS' && 'Customer Booking Reservations'}
                {activeTab === 'TRANSACTIONS' && 'Sales & Transaction Ledger'}
                {activeTab === 'GPS' && 'Live Truck GPS Telemetry'}
                {activeTab === 'WORKERS' && 'Staff & Driver Management'}
                {activeTab === 'AUDIT' && 'System Audit Trail'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 sm:flex">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              API Connected
            </div>
            <button
              type="button"
              onClick={loadTabData}
              title="Refresh Data"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-[#1E56A0]' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="m-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-800">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Workspace Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* TAB 1: EXECUTIVE ANALYTICS */}
          {activeTab === 'ANALYTICS' && (
            <div className="space-y-6">
              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Gross Revenue</span>
                    <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                      <DollarSign size={18} />
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-black text-[#0F2C59]">
                    ₹{analytics?.totalRevenue?.toLocaleString() || '142,500'}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-emerald-600">Current active ledger</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Weight Sold</span>
                    <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-[#1E56A0]">
                      <Package size={18} />
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-black text-[#0F2C59]">
                    {analytics?.totalWeightKg || '540'} kg
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-[#1E56A0]">Fresh catch fulfilled</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Active Bookings</span>
                    <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
                      <CalendarCheck size={18} />
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-black text-[#0F2C59]">
                    {analytics?.activeBookingsCount || '18'}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-amber-600">Within 48h window</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Shrinkage Rate</span>
                    <span className="grid size-9 place-items-center rounded-xl bg-rose-50 text-rose-600">
                      <Activity size={18} />
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-black text-[#0F2C59]">
                    {analytics?.shrinkagePercent || '1.4'}%
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">Under 2.5% target</p>
                </div>
              </div>

              {/* Analytics Detailed Breakdown */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <h3 className="text-sm font-extrabold text-[#0F2C59]">Category Performance</h3>
                  <p className="mt-1 text-xs text-slate-500">Sales volume and demand by fish family</p>
                  <div className="mt-4 divide-y divide-slate-100 text-xs font-semibold">
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-700">Freshwater / Pond (Rohu, Catla)</span>
                      <span className="font-bold text-[#0F2C59]">68% share</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-700">Boneless Cuts (Basa Fillet)</span>
                      <span className="font-bold text-[#0F2C59]">22% share</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-700">Dry Fish Assortment</span>
                      <span className="font-bold text-[#0F2C59]">10% share</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <h3 className="text-sm font-extrabold text-[#0F2C59]">Payment Settlement Channels</h3>
                  <p className="mt-1 text-xs text-slate-500">Breakdown of point-of-sale settlements</p>
                  <div className="mt-4 divide-y divide-slate-100 text-xs font-semibold">
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-700">Direct In-Store Cash</span>
                      <span className="font-bold text-[#0F2C59]">45%</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-700">Online UPI / Razorpay QR</span>
                      <span className="font-bold text-[#0F2C59]">38%</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-slate-700">Customer Subscription Credits</span>
                      <span className="font-bold text-[#0F2C59]">17%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FISH CATALOGUE */}
          {activeTab === 'FISH' && (
            <div className="space-y-6">
              {fishSuccessMsg && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>{fishSuccessMsg}</span>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-2 max-w-md">
                  <div className="relative w-full">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={fishSearch}
                      onChange={(e) => setFishSearch(e.target.value)}
                      placeholder="Search fish name..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                    />
                  </div>
                  <select
                    value={fishCategoryFilter}
                    onChange={(e) => setFishCategoryFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddFishModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1E56A0] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0F2C59] transition"
                >
                  <Plus size={16} />
                  Add New Fish
                </button>
              </div>

              {/* Fish Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500">
                    <tr>
                      <th className="py-3.5 px-4">Fish Item</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price (₹/KG)</th>
                      <th className="py-3.5 px-4">Freshness State</th>
                      <th className="py-3.5 px-4">Online Booking</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {fishList
                      .filter((f) => {
                        if (fishCategoryFilter && f.categoryId !== fishCategoryFilter) return false;
                        if (fishSearch.trim() && !f.name.toLowerCase().includes(fishSearch.toLowerCase())) return false;
                        return true;
                      })
                      .map((fish) => (
                        <tr key={fish.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#0F2C59]">{fish.name}</td>
                          <td className="py-3.5 px-4">{fish.category?.name || 'Freshwater'}</td>
                          <td className="py-3.5 px-4 font-black text-[#1E56A0]">₹{fish.unitPrice}</td>
                          <td className="py-3.5 px-4">{renderFreshnessBadge(fish.freshnessState)}</td>
                          <td className="py-3.5 px-4">
                            {fish.onlineBookable ? (
                              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                Enabled
                              </span>
                            ) : (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                In-Store Only
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFish(fish);
                                setEditFishPrice(fish.unitPrice.toString());
                                setEditFishFreshness(fish.freshnessState);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-[#1E56A0] hover:text-[#1E56A0]"
                            >
                              <Edit2 size={12} />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY & BATCHES */}
          {activeTab === 'INVENTORY' && (
            <div className="space-y-6">
              {stockSuccessMsg && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>{stockSuccessMsg}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F2C59]">Active Catch Batches</h3>
                  <p className="text-xs text-slate-500">Track weight arrival and 48-hour expiration timeline</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReceiveStockModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E56A0] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0F2C59]"
                >
                  <Plus size={16} />
                  Receive Harvest Batch
                </button>
              </div>

              {/* Batches Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500">
                    <tr>
                      <th className="py-3.5 px-4">Batch Code</th>
                      <th className="py-3.5 px-4">Fish Species</th>
                      <th className="py-3.5 px-4">Received Qty</th>
                      <th className="py-3.5 px-4">Remaining (KG)</th>
                      <th className="py-3.5 px-4">Freshness State</th>
                      <th className="py-3.5 px-4">Received At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {batches.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No active stock batches found. Receive a harvest batch to begin.
                        </td>
                      </tr>
                    ) : (
                      batches.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#0F2C59]">{b.batchCode}</td>
                          <td className="py-3.5 px-4 font-bold">{b.fish?.name || 'Rohu'}</td>
                          <td className="py-3.5 px-4">{b.receivedQty} kg</td>
                          <td className="py-3.5 px-4 font-black text-[#1E56A0]">{b.remainingQty} kg</td>
                          <td className="py-3.5 px-4">{renderFreshnessBadge(b.freshnessState)}</td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(b.receivedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Inventory Change Ledger */}
              <div className="mt-8">
                <h3 className="text-sm font-extrabold text-[#0F2C59] mb-3">Inventory Change Audit Trail</h3>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500">
                      <tr>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Change Delta</th>
                        <th className="py-3 px-4">New Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {ledger.slice(0, 10).map((log, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-4 text-slate-400">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="py-2.5 px-4 font-bold">{log.changeType}</td>
                          <td className="py-2.5 px-4 font-bold text-[#1E56A0]">{log.quantityDelta} kg</td>
                          <td className="py-2.5 px-4">{log.balanceAfter} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BOOKINGS */}
          {activeTab === 'BOOKINGS' && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-sm">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Search booking ID / phone..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                  />
                </div>
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                >
                  <option value="">All Statuses</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* Bookings Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500">
                    <tr>
                      <th className="py-3.5 px-4">Booking Ref</th>
                      <th className="py-3.5 px-4">Customer Phone</th>
                      <th className="py-3.5 px-4">Reserved Catch</th>
                      <th className="py-3.5 px-4">Weight (KG)</th>
                      <th className="py-3.5 px-4">Expires At</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No active reservations found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#0F2C59]">{b.bookingRef || b.id.slice(0, 8)}</td>
                          <td className="py-3.5 px-4">{b.customer?.mobileNumber || '+91 98765 43210'}</td>
                          <td className="py-3.5 px-4 font-bold">{b.fish?.name || 'Rohu'}</td>
                          <td className="py-3.5 px-4 font-black text-[#1E56A0]">{b.reservedQtyKg || 1} kg</td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(b.expiresAt).toLocaleTimeString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                                b.status === 'CONFIRMED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : b.status === 'COMPLETED'
                                  ? 'bg-blue-50 text-[#1E56A0] border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: TRANSACTIONS */}
          {activeTab === 'TRANSACTIONS' && (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500">
                    <tr>
                      <th className="py-3.5 px-4">Transaction ID</th>
                      <th className="py-3.5 px-4">Payment Method</th>
                      <th className="py-3.5 px-4">Gross Amount</th>
                      <th className="py-3.5 px-4">Recorded Time</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#0F2C59]">
                            TXN-{tx.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="py-3.5 px-4 font-bold">{tx.paymentMethod}</td>
                          <td className="py-3.5 px-4 font-black text-[#1E56A0]">₹{tx.totalAmount}</td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              SETTLED
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: GPS TRACKING */}
          {activeTab === 'GPS' && (
            <div className="space-y-6">
              {gpsSuccessMsg && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>{gpsSuccessMsg}</span>
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Journey Controller */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <h3 className="text-base font-extrabold text-[#0F2C59]">Truck Journey Controller</h3>
                  <p className="mt-1 text-xs text-slate-500">Initiate and telemetry-link the delivery truck</p>

                  {activeJourney ? (
                    <div className="mt-5 space-y-4">
                      <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                          <p className="text-xs font-bold text-emerald-800">
                            Active Journey in Progress: {activeJourney.truckNumber}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">Driver: {activeJourney.driverName}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handlePublishGPS(!activeJourney.published)}
                          className={`flex-1 rounded-xl py-2.5 text-xs font-bold text-white transition ${
                            activeJourney.published ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#1E56A0] hover:bg-[#0F2C59]'
                          }`}
                        >
                          {activeJourney.published ? 'Unpublish from Customer Map' : 'Publish to Customer Map'}
                        </button>
                        <button
                          type="button"
                          onClick={handleStopGPS}
                          className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700"
                        >
                          Stop Journey
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700">Truck Vehicle Reg</label>
                        <input
                          type="text"
                          value={truckNumber}
                          onChange={(e) => setTruckNumber(e.target.value)}
                          placeholder="e.g. KA-01-AB-1234"
                          className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700">Driver Full Name</label>
                        <input
                          type="text"
                          value={driverName}
                          onChange={(e) => setDriverName(e.target.value)}
                          placeholder="e.g. Suresh Kumar"
                          className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleStartGPS}
                        className="mt-4 w-full rounded-xl bg-[#1E56A0] py-3 text-xs font-bold text-white shadow-xs hover:bg-[#0F2C59]"
                      >
                        Start IoT Truck Journey
                      </button>
                    </div>
                  )}
                </div>

                {/* Telemetry Simulator */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <h3 className="text-base font-extrabold text-[#0F2C59]">OneLap Telemetry Link</h3>
                  <p className="mt-1 text-xs text-slate-500">Inject coordinates or sync IoT hardware ping</p>

                  <div className="mt-5 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700">Latitude</label>
                        <input
                          type="text"
                          value={gpsLat}
                          onChange={(e) => setGpsLat(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700">Longitude</label>
                        <input
                          type="text"
                          value={gpsLng}
                          onChange={(e) => setGpsLng(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-semibold"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!activeJourney}
                      onClick={handleRecordGPSPosition}
                      className="mt-4 w-full rounded-xl bg-slate-800 py-3 text-xs font-bold text-white hover:bg-black disabled:opacity-40"
                    >
                      Record Realtime GPS Coordinates
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: WORKERS */}
          {activeTab === 'WORKERS' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F2C59]">Staff & Store Operators</h3>
                  <p className="text-xs text-slate-500">Manage credentials for Worker Tablet POS portals</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWorkerModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E56A0] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0F2C59]"
                >
                  <Plus size={16} />
                  Add Worker
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500">
                    <tr>
                      <th className="py-3.5 px-4">Worker Name</th>
                      <th className="py-3.5 px-4">Mobile Number</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {workers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          No workers registered yet.
                        </td>
                      </tr>
                    ) : (
                      workers.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-4 font-bold text-[#0F2C59]">{w.name}</td>
                          <td className="py-3.5 px-4 font-mono">{w.mobileNumber}</td>
                          <td className="py-3.5 px-4">
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1E56A0] border border-blue-200">
                              STORE_OPERATOR
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(w.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: AUDIT LOGS */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500">
                    <tr>
                      <th className="py-3.5 px-4">Timestamp</th>
                      <th className="py-3.5 px-4">Action Entity</th>
                      <th className="py-3.5 px-4">Event Details</th>
                      <th className="py-3.5 px-4">Operator IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          No audit logs found.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#0F2C59]">{log.action}</td>
                          <td className="py-3 px-4">{log.entityName || 'System'}</td>
                          <td className="py-3 px-4 font-mono text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ADD NEW FISH */}
      {showAddFishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0F2C59]">Add New Fish To Catalogue</h3>
              <button
                type="button"
                onClick={() => setShowAddFishModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFish} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700">Category</label>
                <select
                  value={newFishCategoryId}
                  onChange={(e) => setNewFishCategoryId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Fish Species Name</label>
                <input
                  type="text"
                  required
                  value={newFishName}
                  onChange={(e) => setNewFishName(e.target.value)}
                  placeholder="e.g. Rohu, Catla, Pomfret"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Unit Price (₹/KG)</label>
                <input
                  type="number"
                  required
                  value={newFishPrice}
                  onChange={(e) => setNewFishPrice(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Initial Freshness State</label>
                <select
                  value={newFishFreshness}
                  onChange={(e) => setNewFishFreshness(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                >
                  <option value="GREEN">Green (Fresh 0-24h)</option>
                  <option value="GREY">Grey (Chilled 24-48h)</option>
                  <option value="YELLOW">Yellow (Discounted)</option>
                </select>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newFishOnline}
                    onChange={(e) => setNewFishOnline(e.target.checked)}
                    className="rounded border-slate-300 text-[#1E56A0]"
                  />
                  Online Bookable
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newFishPhysical}
                    onChange={(e) => setNewFishPhysical(e.target.checked)}
                    className="rounded border-slate-300 text-[#1E56A0]"
                  />
                  Physical Store Stock
                </label>
              </div>

              <div className="mt-5 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFishModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-[#1E56A0] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0F2C59]"
                >
                  Save Fish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT FISH */}
      {editingFish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0F2C59]">Edit: {editingFish.name}</h3>
              <button
                type="button"
                onClick={() => setEditingFish(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Price (₹/KG)</label>
                <input
                  type="number"
                  value={editFishPrice}
                  onChange={(e) => setEditFishPrice(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Freshness State</label>
                <select
                  value={editFishFreshness}
                  onChange={(e) => setEditFishFreshness(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                >
                  <option value="GREEN">Green (Fresh 0-24h)</option>
                  <option value="GREY">Grey (Chilled 24-48h)</option>
                  <option value="YELLOW">Yellow (Discounted)</option>
                  <option value="RED">Red (Expired)</option>
                </select>
              </div>

              <div className="mt-5 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFish(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditFish}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-[#1E56A0] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0F2C59]"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RECEIVE HARVEST BATCH */}
      {showReceiveStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0F2C59]">Receive Pond Catch Batch</h3>
              <button
                type="button"
                onClick={() => setShowReceiveStockModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReceiveStock} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700">Fish Species</label>
                <select
                  value={stockFishId}
                  onChange={(e) => setStockFishId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                >
                  {fishList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Batch Code (Optional)</label>
                <input
                  type="text"
                  value={stockBatchCode}
                  onChange={(e) => setStockBatchCode(e.target.value)}
                  placeholder="Auto-generated if blank"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Weight Received (KG)</label>
                  <input
                    type="number"
                    required
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Expiry (Hours)</label>
                  <input
                    type="number"
                    required
                    value={stockExpiryHours}
                    onChange={(e) => setStockExpiryHours(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReceiveStockModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-[#1E56A0] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0F2C59]"
                >
                  Confirm Arrival
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD WORKER */}
      {showWorkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0F2C59]">Register Worker / Operator</h3>
              <button
                type="button"
                onClick={() => setShowWorkerModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  placeholder="e.g. Ramesh Reddy"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={workerPhone}
                  onChange={(e) => setWorkerPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">POS Login Password</label>
                <input
                  type="password"
                  required
                  value={workerPassword}
                  onChange={(e) => setWorkerPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-[#1E56A0] focus:outline-hidden"
                />
              </div>

              <div className="mt-5 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWorkerModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-[#1E56A0] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0F2C59]"
                >
                  Register Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Hero from '../components/Hero';
import OfferTiles from '../components/OfferTiles';
import FishAvailability from '../components/FishAvailability';
import SubscriptionSection from '../components/SubscriptionSection';
import TruckStatus from '../components/TruckStatus';
import HowItWorks from '../components/HowItWorks';
import About from '../components/About';
import MobileApp from '../components/MobileApp';
import BookingModal from '../components/BookingModal';
import { FishItem, Category, DiscountOffer } from '../types';
import { getApiBaseUrl } from '../utils/apiConfig';

export default function HomePage() {
  const [fish, setFish] = useState<FishItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discounts, setDiscounts] = useState<DiscountOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeBookingFish, setActiveBookingFish] = useState<{ name: string; price: number }>({
    name: 'Rohu',
    price: 280,
  });

  const API_BASE = getApiBaseUrl();

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [fishRes, catRes, discRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/v1/public/fish`).then((r) => r.json()),
        fetch(`${API_BASE}/api/v1/public/categories`).then((r) => r.json()),
        fetch(`${API_BASE}/api/v1/public/discounts`).then((r) => r.json()),
      ]);

      if (fishRes.status === 'fulfilled' && fishRes.value?.success) {
        setFish(fishRes.value.data || []);
      }
      if (catRes.status === 'fulfilled' && catRes.value?.success) {
        setCategories(catRes.value.data || []);
      }
      if (discRes.status === 'fulfilled' && discRes.value?.success) {
        setDiscounts(discRes.value.data || []);
      }
    } catch (err) {
      console.warn('Backend API fetch warning, fallback data is active.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleOpenBooking = (name: string, price: number) => {
    setActiveBookingFish({ name, price });
    setBookingModalOpen(true);
  };

  const handleBookFishItem = (item: FishItem) => {
    setActiveBookingFish({
      name: item.name,
      price: item.unitPrice || 280,
    });
    setBookingModalOpen(true);
  };

  return (
    <>
      <Head>
        <title>PondFish | Fresh & Live Freshwater Fish Sourcing & Retail</title>
        <meta
          name="description"
          content="Sustainably harvested freshwater fish, cold-chain GPS tracking, real-time counter availability, and 48-hour online booking reservation."
        />
      </Head>

      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Today's Deals & Special Offers */}
      <OfferTiles
        apiDiscounts={discounts}
        onBookNow={handleOpenBooking}
      />

      {/* 3. Live Catch & Fish Availability Catalogue */}
      <FishAvailability
        fishList={fish}
        categories={categories}
        loading={loading}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onBookFish={handleBookFishItem}
      />

      {/* 4. PondFish Membership & Subscription Credits */}
      <SubscriptionSection />

      {/* 5. Live Truck Cold-Chain Status */}
      <TruckStatus />

      {/* 6. About PondFish Quality & Sourcing */}
      <About />

      {/* 7. Mobile App Promo */}
      <MobileApp />

      {/* 8. How PondFish Works Timeline */}
      <HowItWorks />

      {/* Interactive Quick-Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        fishName={activeBookingFish.name}
        pricePerKg={activeBookingFish.price}
      />
    </>
  );
}

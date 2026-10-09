import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import RoomCard from '../components/RoomCard';
import StayDateRangePicker from '../components/StayDateRangePicker';
import GuestSelector from '../components/GuestSelector';
import { Calendar, Users, SlidersHorizontal, RotateCcw, Sparkles, Instagram } from 'lucide-react';

export default function RoomsIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedGuests, setSelectedGuests] = useState(searchParams.get('guests') || '1');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  // Stay Bar Dates & Guest Counter
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(searchParams.get('check_in') || today);
  const [checkOut, setCheckOut] = useState(searchParams.get('check_out') || tomorrow);
  const [guestSelection, setGuestSelection] = useState({
    adults: parseInt(searchParams.get('adults') || searchParams.get('guests') || '2', 10),
    children: parseInt(searchParams.get('children') || '0', 10),
    infants: parseInt(searchParams.get('infants') || '0', 10),
    rooms: parseInt(searchParams.get('rooms') || '1', 10),
  });

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      try {
        const res = await api.get('/rooms');
        if (res.success) {
          setRooms(res.rooms || []);
          // Set initial max price dynamically from highest room price if available
          const highest = Math.max(...(res.rooms || []).map(r => Number(r.base_price) || 0), 50000);
          setMaxPrice(highest + 5000);
        }
      } catch (err) {
        console.error('Failed to load rooms:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  const handleFeatureToggle = (feat) => {
    setSelectedFeatures(prev =>
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    );
  };

  const handleReset = () => {
    setSelectedType('all');
    setSelectedGuests('1');
    const highest = Math.max(...rooms.map(r => Number(r.base_price) || 0), 50000);
    setMaxPrice(highest + 5000);
    setSelectedFeatures([]);
  };

  const handleAvailabilityCheck = () => {
    // Navigate or update filter bar
    setSelectedGuests(quickGuests);
  };

  // Filter logic
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // Type match (room / suite / villa)
      if (selectedType !== 'all') {
        const cat = (room.category || '').toLowerCase();
        const typeMatch = selectedType.toLowerCase();
        if (typeMatch === 'room' && !cat.includes('room') && !cat.includes('deluxe') && !cat.includes('tent')) return false;
        if (typeMatch === 'suite' && !cat.includes('suite')) return false;
        if (typeMatch === 'villa' && !cat.includes('villa')) return false;
      }

      // Guest capacity
      const minGuests = parseInt(selectedGuests, 10) || 1;
      if (Number(room.capacity_adults) < minGuests) return false;

      // Price limit
      if (Number(room.base_price) > maxPrice) return false;

      // Features filter
      if (selectedFeatures.length > 0) {
        const amenitiesStr = JSON.stringify(room.amenities || []).toLowerCase();
        const matchesAll = selectedFeatures.every(f => {
          if (f === 'heating') return amenitiesStr.includes('heat') || amenitiesStr.includes('floor');
          if (f === 'view') return amenitiesStr.includes('view') || (room.view_type || '').length > 0;
          if (f === 'tub') return amenitiesStr.includes('tub') || amenitiesStr.includes('bath');
          if (f === 'fire') return amenitiesStr.includes('fire') || amenitiesStr.includes('bonfire');
          return true;
        });
        if (!matchesAll) return false;
      }

      return true;
    });
  }, [rooms, selectedType, selectedGuests, maxPrice, selectedFeatures]);

  return (
    <div className="min-h-screen bg-[#2C332C] text-[#EAEBE8]">
      
      {/* 1. Page Hero Banner with V2 Signature Styling */}
      <section className="relative py-20 md:py-28 px-4 text-center border-b border-white/10 z-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3a443a] via-[#2C332C] to-[#232A23] opacity-80" />
        <div className="relative max-w-4xl mx-auto space-y-4">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#A8AD94] font-medium block">
            Katpana Cold Desert • Skardu
          </span>
          <h1 className="font-script text-6xl sm:text-7xl text-[#EAEBE8]">
            Rooms &amp; Rates
          </h1>
          <div className="w-16 h-px bg-white/20 mx-auto" />
          <p className="font-display italic text-lg sm:text-xl text-[#A8AD94] max-w-2xl mx-auto">
            Distinctive stone villas, mountain suites, and glamping domes framed by Karakoram peaks.
          </p>
        </div>

        {/* Quick Check Availability Bar */}
        <div className="relative max-w-4xl mx-auto mt-10 z-30">
          <div className="bg-[#232A23]/95 border border-white/15 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-3 items-end relative z-30">
            <div className="md:col-span-5 text-left">
              <label className="block text-[10px] uppercase tracking-wider text-[#A8AD94] mb-1">Stay Dates</label>
              <StayDateRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onChange={({ checkIn: s, checkOut: e }) => {
                  setCheckIn(s);
                  if (e) setCheckOut(e);
                }}
              />
            </div>

            <div className="md:col-span-4 text-left">
              <label className="block text-[10px] uppercase tracking-wider text-[#A8AD94] mb-1">Guests &amp; Rooms</label>
              <GuestSelector
                value={guestSelection}
                onChange={(val) => {
                  setGuestSelection(val);
                  setSelectedGuests(String(val.adults + val.children));
                }}
              />
            </div>

            <div className="md:col-span-3">
              <button
                onClick={() => {
                  setSelectedGuests(String(guestSelection.adults + guestSelection.children));
                }}
                className="w-full h-[42px] bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs tracking-wider uppercase rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Calendar className="w-4 h-4" /> Filter Stays
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Breadcrumb Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-[#A8AD94]">
        <Link to="/" className="hover:text-[#EAEBE8] transition">Home</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-[#EAEBE8]">Rooms &amp; Rates</span>
      </div>

      {/* 3. Main Filter & Accommodations Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Advanced Filter Aside (V2 Style) */}
          <aside className="lg:col-span-1">
            <div className="bg-[#232A23] border border-white/10 rounded-2xl p-6 space-y-6 sticky top-28">
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-[#EAEBE8] font-display text-xl font-medium">
                  <SlidersHorizontal className="w-4 h-4 text-[#787C68]" />
                  <span>Advanced Filter</span>
                </div>
                <p className="text-[11px] text-[#A8AD94] mt-1">Narrow down your perfect room</p>
              </div>

              {/* Room Type */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#EAEBE8]">Stay Category</h4>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'All Stays', val: 'all' },
                    { label: 'Rooms & Domes', val: 'room' },
                    { label: 'Suites', val: 'suite' },
                    { label: 'Private Villas', val: 'villa' },
                  ].map((item) => (
                    <label key={item.val} className="flex items-center space-x-2.5 cursor-pointer text-[#A8AD94] hover:text-[#EAEBE8]">
                      <input
                        type="radio"
                        name="rtype"
                        value={item.val}
                        checked={selectedType === item.val}
                        onChange={() => setSelectedType(item.val)}
                        className="accent-[#787C68] w-4 h-4 cursor-pointer"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Max Price Range Slider */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex justify-between items-center text-xs">
                  <h4 className="font-semibold uppercase tracking-wider text-[#EAEBE8]">Max Rate / Night</h4>
                  <span className="text-[#E3B94E] font-medium font-mono text-[11px]">
                    PKR {maxPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="15000"
                  max="120000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#787C68] cursor-pointer"
                />
                <p className="text-[11px] text-[#A8AD94]">Showing stays up to PKR {maxPrice.toLocaleString()} / night</p>
              </div>

              {/* Guests Selector */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#EAEBE8]">Guest Capacity</h4>
                <select
                  value={selectedGuests}
                  onChange={(e) => setSelectedGuests(e.target.value)}
                  className="w-full bg-[#1E241E] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#EAEBE8] focus:border-[#787C68] outline-none"
                >
                  <option value="1">1+ Guest</option>
                  <option value="2">2+ Guests</option>
                  <option value="3">3+ Guests</option>
                  <option value="4">4+ Guests (Family)</option>
                </select>
              </div>

              {/* Features Checkboxes */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#EAEBE8]">Features &amp; Comforts</h4>
                <div className="space-y-2 text-xs">
                  {[
                    { id: 'heating', label: 'Radiant Floor Heating' },
                    { id: 'view', label: 'Panoramic Valley View' },
                    { id: 'tub', label: 'Deep Soaking Bathtub' },
                    { id: 'fire', label: 'Fireplace / Bonfire' },
                  ].map((feat) => (
                    <label key={feat.id} className="flex items-center space-x-2.5 cursor-pointer text-[#A8AD94] hover:text-[#EAEBE8]">
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feat.id)}
                        onChange={() => handleFeatureToggle(feat.id)}
                        className="accent-[#787C68] w-4 h-4 rounded cursor-pointer"
                      />
                      <span>{feat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Filter Button */}
              <button
                onClick={handleReset}
                className="w-full py-2.5 border border-white/20 rounded-xl text-xs text-[#A8AD94] hover:text-[#EAEBE8] hover:border-[#787C68] transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            </div>
          </aside>

          {/* Rooms Grid */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between text-xs text-[#A8AD94]">
              <p>
                Showing <span className="text-[#EAEBE8] font-bold">{filteredRooms.length}</span> of {rooms.length} residences
              </p>
              <span className="text-[11px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                All rates in PKR net
              </span>
            </div>

            {loading ? (
              <div className="text-center py-24 text-[#A8AD94]">
                Loading Katpana rooms...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-24 bg-[#232A23] border border-white/10 rounded-2xl p-8 space-y-4">
                <p className="font-display text-xl text-[#EAEBE8]">No rooms match your active criteria</p>
                <p className="text-xs text-[#A8AD94]">Try widening your price range or adjusting the guest filter.</p>
                <button
                  onClick={handleReset}
                  className="bg-[#787C68] text-[#232A23] font-semibold text-xs px-5 py-2.5 rounded-full hover:bg-[#868B74] transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 4. "Feel Inspired" Instagram Strip from V2 */}
      <section className="border-t border-white/10 py-16 px-4 bg-[#232A23]/60 text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-2">
          <h2 className="font-script text-4xl sm:text-5xl text-[#EAEBE8]">Feel Inspired</h2>
          <p className="text-xs text-[#A8AD94] leading-relaxed">
            Show us how you immerse in Katpana Desert for a chance to be featured. Tag{' '}
            <span className="text-[#EAEBE8] font-medium">@oasis_resort_skardu</span> on Instagram.
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
          {[
            { img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', caption: 'Sunrise over Karakoram' },
            { img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80', caption: 'Private Stone Villa' },
            { img: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80', caption: 'Stargazing Pavilion' },
            { img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80', caption: 'Terrace Dining' },
            { img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80', caption: 'Desert Bonfire' },
          ].map((item, idx) => (
            <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg">
              <img src={item.img} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 text-center">
                <Instagram className="w-5 h-5 text-white" />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import RoomCard from '../components/RoomCard';
import {
  Users, Maximize2, Eye, BedDouble, Calendar, Check,
  Star, Compass, ArrowRight, ShieldCheck, Sparkles, ChevronRight
} from 'lucide-react';

export default function RoomDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedRooms, setRelatedRooms] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);

  // Dynamic Stay Dates for Calculator (Default 1 Night Stay)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(dayAfter);
  const [pricing, setPricing] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    async function fetchRoom() {
      setLoading(true);
      try {
        const res = await api.get(`/rooms/${slug}?check_in=${checkIn}&check_out=${checkOut}`);
        if (res.success) {
          setRoom(res.room);
          setReviews(res.reviews || []);
          setRelatedRooms(res.relatedRooms || []);
          setPricing(res.pricingBreakdown);
          setIsAvailable(res.isAvailable);
          setActiveImage(res.room.featured_image);
        }
      } catch (err) {
        console.error('Failed to load room details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [slug]);

  // Recalculate when dates change
  useEffect(() => {
    if (!room) return;
    async function recalc() {
      try {
        const res = await api.get(`/rooms/${room.id}/pricing?check_in=${checkIn}&check_out=${checkOut}`);
        if (res.success) {
          setPricing(res.pricing);
          setIsAvailable(res.is_available);
        }
      } catch (e) {
        console.error(e);
      }
    }
    recalc();
  }, [checkIn, checkOut, room?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2C332C] flex items-center justify-center text-[#A8AD94]">
        Loading room details...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#2C332C] flex flex-col items-center justify-center text-[#A8AD94] space-y-4">
        <h2 className="font-display text-2xl text-[#EAEBE8]">Room not found</h2>
        <Link to="/rooms" className="text-[#787C68] hover:underline text-sm">
          Return to All Stays
        </Link>
      </div>
    );
  }

  const imagesList = Array.isArray(room.images) && room.images.length > 0
    ? [room.featured_image, ...room.images.filter(img => img !== room.featured_image)]
    : [room.featured_image];

  return (
    <div className="min-h-screen bg-[#2C332C] text-[#EAEBE8] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-xs text-[#A8AD94]">
          <Link to="/" className="hover:text-[#EAEBE8] transition">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/rooms" className="hover:text-[#EAEBE8] transition">Rooms &amp; Rates</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#EAEBE8]">{room.title}</span>
        </div>

        {/* 1. Header & Title with V2 Typography */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#787C68]/30 text-[#EAEBE8] text-xs font-semibold uppercase px-3 py-1 rounded-full border border-white/10 tracking-wider">
              {room.category}
            </span>
            {isAvailable ? (
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-medium px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Available for Selected Dates
              </span>
            ) : (
              <span className="bg-rose-500/20 text-rose-300 text-xs font-medium px-3 py-1 rounded-full border border-rose-500/30">
                Reserved for Selected Dates
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl sm:text-5xl text-[#EAEBE8] font-bold">
            {room.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#A8AD94] pt-1">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#787C68]" /> {room.view_type}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#787C68]" /> Up to {room.capacity_adults} Guests
            </span>
            <span className="flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-[#787C68]" /> {room.bed_type}
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-[#787C68]" /> {room.room_size_sqm} m² Private Living
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {room.total_rooms || 4} Rooms in {room.category}
            </span>
          </div>
        </div>

        {/* 2. Photo Gallery Showcase */}
        <div className="space-y-4">
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#232A23]">
            <img
              src={activeImage || room.featured_image}
              alt={room.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {room.virtual_tour_url && (
              <a
                href={room.virtual_tour_url}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-4 right-4 bg-[#232A23]/90 hover:bg-[#787C68] text-[#EAEBE8] px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5 border border-white/20"
              >
                <Compass className="w-4 h-4 text-[#E3B94E]" /> 360° Virtual Tour
              </a>
            )}
          </div>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imagesList.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-28 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                    activeImage === img ? 'border-[#787C68] scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Main Details & Interactive Price Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Description & Amenities */}
          <div className="lg:col-span-2 space-y-10">
            <div className="space-y-4">
              <span className="text-[11px] uppercase tracking-widest text-[#A8AD94]">Room Overview</span>
              <h2 className="font-display text-2xl text-[#EAEBE8] font-bold">
                The Architecture &amp; Ambiance
              </h2>
              <p className="text-sm text-[#A8AD94] leading-relaxed font-light">
                {room.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4">
              <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                Residence Amenities &amp; Comforts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(room.amenities || []).map((amenity, idx) => (
                  <div
                    key={idx}
                    className="bg-[#232A23] border border-white/10 p-3 rounded-xl flex items-center space-x-3 text-xs text-[#EAEBE8]"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#787C68]/30 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#EAEBE8]" />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seasonal Pricing Schedule if exists */}
            {room.seasonal_prices && room.seasonal_prices.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display text-lg text-[#EAEBE8] font-bold">
                  Seasonal Rates Schedule
                </h3>
                <div className="bg-[#232A23] border border-white/10 p-4 rounded-xl space-y-2 text-xs">
                  {room.seasonal_prices.map((season, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                      <div>
                        <span className="font-semibold text-[#EAEBE8]">{season.season_name}</span>
                        <span className="text-[#A8AD94] text-[11px] block">{season.start_date} to {season.end_date}</span>
                      </div>
                      <span className="text-[#E3B94E] font-bold">PKR {parseInt(season.price_per_night).toLocaleString()} / night</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Guest Reviews */}
            <div className="space-y-6 pt-6 border-t border-white/10">
              <h3 className="font-display text-2xl text-[#EAEBE8] font-bold flex items-center gap-2">
                <span>Verified Guest Reviews</span>
                <span className="text-sm font-sans text-[#A8AD94]">({reviews.length})</span>
              </h3>

              {reviews.length === 0 ? (
                <p className="text-xs text-[#A8AD94]">No reviews published yet for this suite.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-[#232A23] border border-white/10 p-5 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-[#EAEBE8]">{rev.guest_name}</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Verified Stay
                          </span>
                        </div>
                        <div className="flex text-[#E3B94E]">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs italic text-[#EAEBE8]/90 font-light">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking / Price Calculator Card */}
          <div className="space-y-6">
            <div className="sticky top-28 bg-[#232A23] border border-white/15 p-6 sm:p-7 rounded-3xl space-y-6 shadow-2xl">
              
              <div className="border-b border-white/10 pb-4">
                <span className="text-[11px] uppercase tracking-wider text-[#A8AD94] block">Nightly Rate</span>
                <div className="flex items-baseline space-x-2">
                  <span className="font-display text-3xl font-bold text-[#EAEBE8]">
                    PKR {parseInt(room.base_price).toLocaleString()}
                  </span>
                  <span className="text-xs text-[#A8AD94]">/ night</span>
                </div>
              </div>

              {/* Category Inventory Status */}
              <div className="bg-[#1E241E] border border-white/10 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#A8AD94] font-medium">Category Inventory:</span>
                <span className="font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {room.total_rooms || 4} Rooms in {room.category}
                </span>
              </div>

              {/* Stay Dates selector */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#A8AD94]">
                  Select Stay Dates
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#A8AD94] block mb-1">Check-in</span>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={checkIn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCheckIn(val);
                        if (val && checkOut && val >= checkOut) {
                          const nextDay = new Date(new Date(val).getTime() + 86400000).toISOString().split('T')[0];
                          setCheckOut(nextDay);
                        }
                      }}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-[#EAEBE8] focus:border-[#787C68] outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A8AD94] block mb-1">Check-out</span>
                    <input
                      type="date"
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-[#EAEBE8] focus:border-[#787C68] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Breakdown */}
              {pricing && (
                <div className="bg-[#1E241E] border border-white/5 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-[#A8AD94]">
                    <span>Stay Duration:</span>
                    <span className="text-[#EAEBE8] font-medium">{pricing.total_nights} Nights</span>
                  </div>
                  <div className="flex justify-between text-[#A8AD94]">
                    <span>Average Nightly:</span>
                    <span className="text-[#EAEBE8] font-medium">PKR {pricing.average_nightly_rate.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-[#EAEBE8]">
                    <span>Total Accommodation:</span>
                    <span className="text-[#E3B94E]">PKR {pricing.total_room_price.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Reserve CTA Button */}
              <button
                onClick={() => navigate(`/book?room_id=${room.id}&check_in=${checkIn}&check_out=${checkOut}`)}
                disabled={!isAvailable}
                className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition flex items-center justify-center space-x-2 ${
                  isAvailable
                    ? 'bg-[#787C68] hover:bg-[#868B74] text-[#232A23] shadow-lg active:scale-95'
                    : 'bg-white/10 text-[#A8AD94] cursor-not-allowed'
                }`}
              >
                <span>{isAvailable ? 'Proceed to Reservation' : 'Unavailable for Dates'}</span>
                {isAvailable && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="space-y-2 text-[11px] text-[#A8AD94] pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#787C68]" /> Instant voucher confirmation
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E3B94E]" /> Includes organic Katpana breakfast & chai
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 4. Related Accommodations */}
        {relatedRooms.length > 0 && (
          <div className="space-y-6 pt-12 border-t border-white/10">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest text-[#A8AD94]">Alternative Options</span>
              <h2 className="font-display text-2xl sm:text-3xl text-[#EAEBE8] font-bold">
                Other Distinctive Rooms &amp; Suites
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedRooms.map((rel) => (
                <RoomCard key={rel.id} room={rel} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

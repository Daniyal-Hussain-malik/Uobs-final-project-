import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import RoomCard from '../components/RoomCard';
import {
  Calendar, Users, ArrowRight, Star, Sparkles, MapPin, Phone,
  Mail, Compass, Flame, Coffee, Check, Send, CheckCircle, Shield,
  Quote, ShieldCheck, Play, X
} from 'lucide-react';

import StayDateRangePicker from '../components/StayDateRangePicker';
import GuestSelector from '../components/GuestSelector';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHeroVideoModal, setShowHeroVideoModal] = useState(false);
  const navigate = useNavigate();

  // Booking Bar State (Default 1 Night Stay)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(dayAfter);
  const [guestSelection, setGuestSelection] = useState({
    adults: 2,
    children: 0,
    infants: 0,
    rooms: 1,
  });

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    dates: '',
    message: '',
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    async function fetchHome() {
      try {
        const res = await api.get('/public/home');
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHome();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      adults: guestSelection.adults,
      children: guestSelection.children,
      infants: guestSelection.infants,
      rooms: guestSelection.rooms,
    }).toString();
    navigate(`/book?${query}`);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      const res = await api.post('/public/contact', {
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        subject: `Website Inquiry (${contactForm.dates || 'Flexible Dates'})`,
        message: contactForm.message,
      });
      if (res.success) {
        setContactSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setContactLoading(false);
    }
  };

  const hero = data?.hero || {
    media_type: 'image',
    image_url: '/uploads/rooms/dji_fly_20250820_180134_0278_1755701835508_photo.JPG',
    video_url: '',
    badge: 'Katpana Cold Desert, Skardu • 2,228M',
    title: 'Experience Nature in Luxury',
    subtitle: 'A secluded resort where cold desert dunes embrace Karakoram peaks — refined hospitality since 2010.',
    cta_text: 'Explore Luxury Stays',
    cta_link: '/rooms',
    video_button_text: 'Watch Resort Tour',
  };

  return (
    <div className="bg-[#2C332C] text-[#EAEBE8] space-y-28 pb-20 selection:bg-[#787C68] selection:text-[#232A23]">
      
      {/* 1. OFFICIAL HERO SECTION */}
      <section className="relative min-h-[95vh] flex flex-col justify-center items-center px-4 sm:px-6 pt-16 pb-28 sm:pb-36 z-20">
        
        {/* Background Backdrop (Dynamic Image OR Ambient Video) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {hero.media_type === 'video' && hero.video_url ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              poster={hero.image_url || '/uploads/rooms/dji_fly_20250820_180134_0278_1755701835508_photo.JPG'}
              className="w-full h-full object-cover scale-105"
            >
              <source src={hero.video_url} type="video/mp4" />
              <source src={hero.video_url} type="video/quicktime" />
              <source src={hero.video_url} />
            </video>
          ) : (
            <img
              src={hero.image_url || '/uploads/rooms/dji_fly_20250820_180134_0278_1755701835508_photo.JPG'}
              alt="Oasis Resort Katpana Cold Desert Skardu"
              className="w-full h-full object-cover scale-105 animate-[kenburns_24s_infinite_alternate]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2C332C]/85 via-[#2C332C]/60 to-[#2C332C]" />
        </div>

        {/* Hero Central Header */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5 animate-fade-in">
          
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#232A23]/85 border border-white/15 text-[#A8AD94] text-xs font-medium tracking-[0.2em] uppercase backdrop-blur-md shadow-xl hover:border-[#E3B94E]/40 transition">
              <span className="font-script text-[#E3B94E] text-xl lowercase">katpana</span>
              <span>{hero.badge || 'Cold Desert, Skardu • 2,228M'}</span>
            </div>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-[#EAEBE8] leading-[1.08]">
            {hero.title || 'Experience Nature in Luxury'}
          </h1>

          <p className="max-w-2xl mx-auto font-display italic text-lg sm:text-xl text-[#EAEBE8]/80 leading-relaxed font-normal">
            {hero.subtitle || 'A secluded resort where cold desert dunes embrace Karakoram peaks — refined hospitality.'}
          </p>

          {hero.video_url && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHeroVideoModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-xs font-semibold text-[#EAEBE8] backdrop-blur transition shadow-md group"
              >
                <div className="w-5 h-5 rounded-full bg-[#E3B94E] text-[#232A23] flex items-center justify-center group-hover:scale-110 transition">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>{hero.video_button_text || 'Watch Resort Video Tour'}</span>
              </button>
            </div>
          )}

          {/* Floating Booking Bar (Official V2 Style with Flatpickr & Guest Counter) */}
          <div className="pt-6 relative z-30">
            <form
              onSubmit={handleSearch}
              className="bg-[#232A23]/95 backdrop-blur-xl border border-white/15 p-4 sm:p-5 rounded-2xl max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-3 text-left shadow-2xl items-end relative z-30"
            >
              {/* Single Range Flatpickr */}
              <div className="md:col-span-5">
                <label className="block text-[11px] uppercase font-semibold tracking-wider text-[#A8AD94] mb-1.5">
                  Stay Dates (Check In — Check Out)
                </label>
                <StayDateRangePicker
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={({ checkIn: start, checkOut: end }) => {
                    setCheckIn(start);
                    if (end) setCheckOut(end);
                  }}
                />
              </div>

              {/* Guest & Room Counter Popover */}
              <div className="md:col-span-4">
                <label className="block text-[11px] uppercase font-semibold tracking-wider text-[#A8AD94] mb-1.5">
                  Guests &amp; Rooms
                </label>
                <GuestSelector
                  value={guestSelection}
                  onChange={setGuestSelection}
                />
              </div>

              {/* Check Availability CTA */}
              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="w-full bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs tracking-wider uppercase h-[42px] rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Check Rates</span>
                </button>
              </div>
            </form>
          </div>

          {/* Highlights Checklist */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-[#A8AD94]">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#787C68]" /> Direct Booking Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#787C68]" /> Radiant Heated Floors
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#787C68]" /> Zero Light Pollution Stargazing
            </span>
          </div>

        </div>
      </section>


      {/* 2. OFFICIAL INTRO SECTION (Life Style / Ø Introduction) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="font-script text-3xl sm:text-4xl text-[#E3B94E] block">
              Life Style
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-medium text-[#EAEBE8] leading-tight">
              &Oslash; Introduction
            </h2>
            <div className="w-16 h-0.5 bg-[#787C68]/60" />
            <p className="text-sm sm:text-base text-[#EAEBE8]/80 leading-relaxed font-light">
              Where the stark beauty of the cold desert meets the timeless grandeur of the Karakoram range, Oasis Resort is born. Designed with indigenous stone, fragrant cedar, and floor-to-ceiling glass, every corner invites the outside in.
            </p>
            <p className="text-xs sm:text-sm text-[#A8AD94] leading-relaxed">
              Step from heated pine floors into the crisp mountain air, watch the morning light illuminate the snowcaps, and end your day beside cedar firepits with hot Balti saffron tea.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <span className="font-display text-2xl text-[#C5A880] font-bold block mb-1">2,228m</span>
                <span className="text-[#A8AD94]">High-Altitude Desert Elevation</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <span className="font-display text-2xl text-[#C5A880] font-bold block mb-1">100%</span>
                <span className="text-[#A8AD94]">Radiant Climate Heated Suites</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs tracking-widest uppercase font-semibold text-[#EAEBE8] hover:text-[#C5A880] transition group"
              >
                <span>Read Our Full Story</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="/uploads/assets/f2740c11-e1a4-4676-aeaa-da85cfe2100d.jpg"
                alt="Oasis Resort Architecture & Katpana View"
                className="rounded-2xl object-cover h-64 w-full border border-white/10 shadow-xl"
              />
              <img
                src="/uploads/assets/d6eccb38-1e02-4ca6-b7d4-3dbcf7473cbe.jpg"
                alt="Oasis Resort Luxury Suites & Grounds"
                className="rounded-2xl object-cover h-48 w-full border border-white/10 shadow-xl"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="/uploads/assets/5856889e-02fa-4c11-8962-37ac5d0f6f33.jpg"
                alt="Katpana Cold Desert Dune Sunset View"
                className="rounded-2xl object-cover h-48 w-full border border-white/10 shadow-xl"
              />
              <img
                src="/uploads/assets/2a0db57c-ae52-4b43-b4f4-56e263902c23.jpg"
                alt="Oasis Resort Landscape & Mountain Panorama"
                className="rounded-2xl object-cover h-64 w-full border border-white/10 shadow-xl"
              />
            </div>
          </div>

        </div>
      </section>


      {/* 3. OFFICIAL ACCOMMODATIONS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="font-script text-2xl sm:text-3xl text-[#E3B94E]">
              Private Rooms &amp; Suites
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#EAEBE8] font-medium">
              Accommodations & Suites
            </h2>
          </div>
          <Link
            to="/rooms"
            className="text-xs uppercase tracking-wider text-[#A8AD94] hover:text-[#EAEBE8] flex items-center gap-1.5 transition font-semibold"
          >
            <span>View All Residences</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#A8AD94]">Loading luxury suites...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(data?.rooms || []).slice(0, 3).map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>


      {/* 4. OFFICIAL EXPERIENCES SECTION */}
      <section className="bg-[#232A23] py-24 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-script text-3xl text-[#E3B94E]">
              Into the Wild
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#EAEBE8] font-medium">
              Curated Himalayan Experiences
            </h2>
            <p className="text-xs sm:text-sm text-[#A8AD94] leading-relaxed font-light">
              Tailored high-altitude expeditions guided by indigenous Balti mountaineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Experience 1 */}
            <div className="bg-[#2C332C] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#787C68] transition group">
              <div className="w-12 h-12 rounded-xl bg-[#787C68]/20 text-[#E3B94E] flex items-center justify-center">
                <Flame className="w-6 h-6 text-[#E3B94E]" />
              </div>
              <h3 className="font-display text-2xl text-[#EAEBE8] font-medium">
                Katpana Cold Desert Dune Safari
              </h3>
              <p className="text-xs text-[#A8AD94] leading-relaxed">
                4x4 Land Cruiser dune bashing across the highest cold desert on Earth, followed by private sunset campfires and wild saffron tea.
              </p>
              <Link
                to="/experiences"
                className="inline-flex items-center gap-1.5 text-xs text-[#C5A880] group-hover:text-white transition font-semibold"
              >
                <span>Discover Experience</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Experience 2 */}
            <div className="bg-[#2C332C] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#787C68] transition group">
              <div className="w-12 h-12 rounded-xl bg-[#787C68]/20 text-[#E3B94E] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#E3B94E]" />
              </div>
              <h3 className="font-display text-2xl text-[#EAEBE8] font-medium">
                Celestial Stargazing Nights
              </h3>
              <p className="text-xs text-[#A8AD94] leading-relaxed">
                Clear Karakoram skies with zero light pollution. Observe Saturn’s rings and the Milky Way arching directly over the sand dunes.
              </p>
              <Link
                to="/experiences"
                className="inline-flex items-center gap-1.5 text-xs text-[#C5A880] group-hover:text-white transition font-semibold"
              >
                <span>Discover Experience</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Experience 3 */}
            <div className="bg-[#2C332C] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#787C68] transition group">
              <div className="w-12 h-12 rounded-xl bg-[#787C68]/20 text-[#E3B94E] flex items-center justify-center">
                <Coffee className="w-6 h-6 text-[#E3B94E]" />
              </div>
              <h3 className="font-display text-2xl text-[#EAEBE8] font-medium">
                Riverside Dum Pukht & Dining
              </h3>
              <p className="text-xs text-[#A8AD94] leading-relaxed">
                Authentic organic Balti cuisine, fresh Indus River trout, and clay-pot slow-cooked lamb served on private terrace candlelight tables.
              </p>
              <Link
                to="/dining"
                className="inline-flex items-center gap-1.5 text-xs text-[#C5A880] group-hover:text-white transition font-semibold"
              >
                <span>Discover Dining</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </section>


      {/* 5. OFFICIAL AMENITIES BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="font-script text-3xl text-[#E3B94E]">
            Room Comforts
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-[#EAEBE8] font-medium">
            Amenities Designed for Rest
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {[
            { title: 'Heated Indoor Solarium', desc: 'Year-round tempered alpine waters with panoramic snowcapped peak views.' },
            { title: 'Balti Herbal Spa & Hammam', desc: 'Cold-pressed apricot kernel oil treatments and soothing hot stone relaxation.' },
            { title: 'Farm-to-Table Organic Dining', desc: 'Fresh mountain vegetables and organic herbs from our private resort orchard.' },
            { title: 'Cedar Firepit & Tea Pavilion', desc: 'Evening gatherings with traditional Balti acoustic music and spiced kahwa.' },
            { title: 'High-Speed Starlink WiFi', desc: 'Seamless satellite connectivity across all suites, terraces, and dunes.' },
            { title: '24/7 Chauffeur & Concierge', desc: 'Complimentary Skardu airport transfers and private sightseeing excursions.' },
          ].map((amenity, i) => (
            <div key={i} className="bg-[#232A23] border border-white/10 p-6 rounded-2xl space-y-2 hover:border-[#787C68] transition">
              <h4 className="font-display text-lg text-[#EAEBE8] font-medium">{amenity.title}</h4>
              <p className="text-[#A8AD94] leading-relaxed">{amenity.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* 6. SPECIAL OFFERS & PROMO CODE VOUCHER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#232A23] border border-[#787C68]/40 p-8 sm:p-12 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-xl">
            <span className="bg-[#787C68]/30 text-[#E3B94E] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Exclusive Privilege
            </span>
            <h3 className="font-display text-2xl sm:text-3xl text-[#EAEBE8] font-medium">
              Enjoy 10% Off Direct Stay with Code OASIS10
            </h3>
            <p className="text-xs text-[#A8AD94] leading-relaxed">
              Book direct on our official website to unlock guaranteed lowest rates, flexible cancellation, and complimentary airport transfers in Skardu.
            </p>
          </div>
          <Link
            to="/book?promo=OASIS10"
            className="shrink-0 bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-semibold text-xs tracking-wider uppercase px-8 py-4 rounded-xl shadow-xl transition"
          >
            Claim 10% Courtesy
          </Link>
        </div>
      </section>


      {/* 7. OFFICIAL GUEST REVIEWS & TESTIMONIALS */}
      {data?.testimonials && data.testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="font-script text-3xl sm:text-4xl text-[#E3B94E] block">
              Guest Experiences
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-medium text-[#EAEBE8]">
              Stories from the Cold Desert
            </h2>
            <div className="w-16 h-0.5 bg-[#787C68]/60 mx-auto" />
            <p className="font-display italic text-base text-[#A8AD94]">
              Authentic reflections from stayed guests and explorers who found serenity at Oasis Resort Katpana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-[#232A23] border border-white/10 hover:border-[#787C68]/50 p-7 rounded-3xl space-y-5 flex flex-col justify-between shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Top Bar: Stars & Verified Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#E3B94E] text-[#E3B94E]" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold tracking-wide">
                      <ShieldCheck className="w-3 h-3" /> Verified Stay
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-[#EAEBE8]/90 font-light leading-relaxed italic relative">
                    <Quote className="w-6 h-6 text-[#787C68]/20 absolute -top-2.5 -left-2 -z-0 pointer-events-none" />
                    <span className="relative z-10">"{t.comment}"</span>
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  {t.avatar_url ? (
                    <img
                      src={t.avatar_url}
                      alt={t.guest_name}
                      className="w-10 h-10 rounded-full object-cover border border-[#787C68]/50"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#787C68]/20 border border-[#787C68]/40 flex items-center justify-center font-display font-bold text-[#E3B94E] text-sm shrink-0">
                      {t.guest_name?.charAt(0) || 'G'}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h4 className="font-display font-bold text-sm text-[#EAEBE8] truncate">
                      {t.guest_name}
                    </h4>
                    <p className="text-[11px] text-[#A8AD94] truncate">
                      {t.guest_location || 'Stayed at Oasis Resort'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}


      {/* 8. OFFICIAL CONTACT & INQUIRY FORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="contact">
        <div className="bg-[#232A23] border border-white/15 rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Official Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <span className="font-script text-3xl text-[#E3B94E]">
              We'd love to hear from you
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#EAEBE8] font-medium">
              Begin Your Journey
            </h2>
            <p className="font-display italic text-base text-[#A8AD94]">
              Tell us your desired dates and our local hosts will craft the perfect stay around you.
            </p>

            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#EAEBE8] block">Email</span>
                  <a href="mailto:oasisresortskardu@gmail.com" className="text-[#A8AD94] hover:text-[#EAEBE8] transition">
                    oasisresortskardu@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#787C68] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#EAEBE8] block">Contact / WhatsApp</span>
                  <div className="text-[#A8AD94] space-x-2">
                    <a href="tel:03081472888" className="hover:text-[#EAEBE8] transition">0308-1472888</a>
                    <span>/</span>
                    <a href="tel:03445537788" className="hover:text-[#EAEBE8] transition">0344-5537788</a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#EAEBE8] block">Find Us</span>
                  <p className="text-[#A8AD94]">
                    Katpana Cold Desert, Skardu, Gilgit-Baltistan 16100 (15 min from Skardu Airport)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Direct Enquiry Form */}
          <div className="lg:col-span-7">
            {contactSubmitted ? (
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl text-[#EAEBE8] font-medium">Thank you.</h3>
                <p className="text-xs text-[#A8AD94]">
                  Your enquiry has been received. Our concierge hosts will reply within a few hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full name *"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-4 py-3 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email address *"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-4 py-3 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Mobile / WhatsApp number *"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-4 py-3 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Approximate Stay Dates (e.g. Oct 15 - Oct 20)"
                    value={contactForm.dates}
                    onChange={(e) => setContactForm({ ...contactForm, dates: e.target.value })}
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-4 py-3 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                </div>

                <textarea
                  rows="4"
                  placeholder="Tell us about your stay — occasion, special requests, number of guests..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full bg-black/30 border border-white/15 rounded-xl px-4 py-3 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  required
                />

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-semibold text-xs tracking-widest uppercase py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{contactLoading ? 'Sending Enquiry...' : 'Send Enquiry'}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Video Modal Lightbox */}
      {showHeroVideoModal && hero.video_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl bg-[#232A23] border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/30">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-[#E3B94E]" />
                <span className="font-display text-sm font-bold text-[#EAEBE8]">Oasis Resort Skardu — Video Tour</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHeroVideoModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#EAEBE8] flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                controls
                autoPlay
                className="w-full h-full object-contain"
                src={hero.video_url}
              >
                Your browser does not support video playback.
              </video>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

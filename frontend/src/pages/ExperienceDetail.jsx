import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { getMediaUrl, handleMediaError } from '../utils/media';
import {
  Compass,
  Clock,
  Gauge,
  CheckCircle2,
  Calendar,
  Users,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Share2
} from 'lucide-react';
import ServiceBookingModal from '../components/ServiceBookingModal';

export default function ExperienceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    async function fetchExperience() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/public/experiences/${id}`);
        if (res.success && res.experience) {
          setExperience(res.experience);
          setRelated(res.related || []);
        } else {
          setError('Experience not found.');
        }
      } catch (err) {
        console.error('Failed to load experience:', err);
        setError(err.message || 'Unable to load experience details.');
      } finally {
        setLoading(false);
      }
    }
    fetchExperience();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-[#A8AD94] space-y-3">
        <div className="w-10 h-10 border-2 border-[#E3B94E] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest">Loading Alpine Experience...</p>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-[60vh] max-w-xl mx-auto px-4 flex flex-col items-center justify-center text-center space-y-6">
        <Compass className="w-16 h-16 text-[#E3B94E]" />
        <h2 className="font-display text-3xl text-[#EAEBE8]">Experience Not Found</h2>
        <p className="text-xs text-[#A8AD94]">
          The safari or adventure you are looking for may have been moved or updated.
        </p>
        <Link
          to="/experiences"
          className="px-6 py-3 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] text-xs font-bold uppercase tracking-wider transition"
        >
          View All Experiences
        </Link>
      </div>
    );
  }

  const inclusionsList = experience.inclusions
    ? experience.inclusions.split(',').map((s) => s.trim()).filter(Boolean)
    : [
        'Specially modified 4WD Alpine Cruiser',
        'Certified Karakoram Rescue Driver',
        'Balti Wild Saffron Kahwa Tea',
        'Sunset Photography Stops',
        'Complete Safety Rigging & First Aid',
      ];

  const slotsList = experience.departure_times || experience.time_slots
    ? (experience.departure_times || experience.time_slots).split(',').map((s) => s.trim()).filter(Boolean)
    : ['Sunrise Thrill (06:00 - 08:30)', 'Sunset Dunes (16:30 - 18:45)'];

  const imageUrl = getMediaUrl(experience.image_url);

  return (
    <div className="bg-[#2C332C] text-[#EAEBE8] min-h-screen pb-24">
      
      {/* 1. TOP BREADCRUMB NAVIGATION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex items-center justify-between text-xs text-[#A8AD94]">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <Link to="/experiences" className="hover:text-white transition">Experiences</Link>
            <span>/</span>
            <span className="text-[#E3B94E] font-medium truncate max-w-xs">{experience.title}</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#EAEBE8] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* 2. HERO SHOWCASE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl min-h-[420px] sm:min-h-[500px] flex flex-col justify-end p-6 sm:p-12 bg-[#1A1F1A]">
          <img
            src={imageUrl}
            alt={experience.title}
            onError={handleMediaError}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          {/* Badges & Title */}
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-[#E3B94E] text-[#232A23] text-xs font-bold uppercase tracking-wider shadow">
                {experience.category || 'Desert Safari'}
              </span>
              {experience.duration && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#EAEBE8] text-xs border border-white/15">
                  <Clock className="w-3.5 h-3.5 text-[#E3B94E]" />
                  <span>{experience.duration}</span>
                </span>
              )}
              {experience.difficulty && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#EAEBE8] text-xs border border-white/15">
                  <Gauge className="w-3.5 h-3.5 text-[#E3B94E]" />
                  <span>{experience.difficulty} Difficulty</span>
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl text-white font-bold leading-tight">
              {experience.title}
            </h1>

            <p className="text-sm sm:text-base text-white/85 font-light leading-relaxed max-w-2xl">
              {experience.description}
            </p>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT & BOOKING SIDEBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Details, Inclusions, Schedule */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-[#232A23] border border-white/10 rounded-2xl">
            <div>
              <span className="text-[10px] text-[#A8AD94] uppercase tracking-wider block font-semibold">Location</span>
              <span className="text-sm font-bold text-[#EAEBE8] mt-0.5 block">Katpana Cold Desert</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A8AD94] uppercase tracking-wider block font-semibold">Duration</span>
              <span className="text-sm font-bold text-[#EAEBE8] mt-0.5 block">{experience.duration || '2 - 3 Hours'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A8AD94] uppercase tracking-wider block font-semibold">Difficulty</span>
              <span className="text-sm font-bold text-[#EAEBE8] mt-0.5 block">{experience.difficulty || 'Moderate'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#A8AD94] uppercase tracking-wider block font-semibold">Guidance</span>
              <span className="text-sm font-bold text-[#E3B94E] mt-0.5 block">Alpine Chauffeur</span>
            </div>
          </div>

          {/* In-depth Overview */}
          <div className="bg-[#232A23] border border-white/10 rounded-3xl p-8 space-y-5">
            <div className="flex items-center gap-2.5">
              <Compass className="w-5 h-5 text-[#E3B94E]" />
              <h2 className="font-display text-2xl text-[#EAEBE8] font-bold">About This Adventure</h2>
            </div>
            <div className="w-12 h-0.5 bg-[#787C68]/60" />
            <div className="text-xs sm:text-sm text-[#A8AD94] leading-relaxed space-y-3 font-light">
              <p>
                Nestled at 2,228 meters against the towering snowpeaks of the Karakoram range, this signature Oasis Resort experience takes you deep into the Katpana cold desert dunes and ancient mountain passes.
              </p>
              <p>
                Our licensed native Balti drivers are certified in high-altitude off-roading, alpine safety, and desert navigation. Whether traversing the golden crests during golden hour or observing celestial stargazing after dusk, every moment is meticulously curated for safety and wonder.
              </p>
            </div>
          </div>

          {/* Package Inclusions */}
          <div className="bg-[#232A23] border border-white/10 rounded-3xl p-8 space-y-5">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#E3B94E]" />
              <h2 className="font-display text-2xl text-[#EAEBE8] font-bold">What's Included</h2>
            </div>
            <div className="w-12 h-0.5 bg-[#787C68]/60" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {inclusionsList.map((inc, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-[#EAEBE8]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{inc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Departure Slots */}
          <div className="bg-[#232A23] border border-white/10 rounded-3xl p-8 space-y-5">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-[#E3B94E]" />
              <h2 className="font-display text-2xl text-[#EAEBE8] font-bold">Available Daily Slots</h2>
            </div>
            <div className="w-12 h-0.5 bg-[#787C68]/60" />
            <div className="flex flex-wrap gap-2.5">
              {slotsList.map((slot, i) => (
                <div
                  key={i}
                  className="px-4 py-2.5 rounded-2xl bg-[#1E241E] border border-white/10 text-xs font-semibold text-[#EAEBE8] flex items-center gap-2"
                >
                  <Clock className="w-3.5 h-3.5 text-[#E3B94E]" />
                  <span>{slot}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Why Book Direct */}
          <div className="bg-gradient-to-r from-[#232A23] to-[#1E241E] border border-[#787C68]/40 rounded-3xl p-8 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#E3B94E]" />
              <h3 className="font-display text-xl text-[#EAEBE8] font-bold">The Oasis Direct Booking Privilege</h3>
            </div>
            <p className="text-xs text-[#A8AD94] leading-relaxed">
              Resort guests and direct visitors enjoy zero middleman markups, guaranteed departure scheduling, 100% weather-rescheduling flexibility, and private concierge assistance.
            </p>
          </div>

        </div>

        {/* Right Column: Sticky Booking Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 bg-[#232A23] border border-white/15 rounded-3xl p-7 space-y-6 shadow-2xl">
            
            <div className="border-b border-white/10 pb-5 space-y-1">
              <span className="text-[10px] text-[#A8AD94] uppercase tracking-wider font-semibold block">Experience Fare</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-display font-bold text-[#E3B94E]">
                  PKR {parseInt(experience.price || 0).toLocaleString()}
                </span>
                <span className="text-xs text-[#A8AD94]">
                  / {(experience.pricing_unit || 'per_vehicle').replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-[11px] text-[#A8AD94] mt-1">All fuel, taxes, and guide fees included.</p>
            </div>

            {/* Highlights List */}
            <div className="space-y-2.5 text-xs text-[#EAEBE8]">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-[#A8AD94]">Instant Confirmation</span>
                <span className="text-emerald-400 font-semibold">Guaranteed</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-[#A8AD94]">Weather Flexibility</span>
                <span className="text-[#EAEBE8]">Free Rescheduling</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-[#A8AD94]">Payment Method</span>
                <span className="text-[#EAEBE8]">Pay Online or at Hotel</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setBookingModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider transition shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <span>Book This Experience</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="tel:+923001234567"
                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[#EAEBE8] font-semibold text-xs tracking-wider transition flex items-center justify-center gap-2 border border-white/10"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#E3B94E]" />
                <span>Call Front Desk / Inquire</span>
              </a>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[10px] text-[#A8AD94]">
                Questions about terrain or children suitability? Contact our Concierge Desk.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* 4. RELATED EXPERIENCES CAROUSEL / GRID */}
      {related && related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] text-[#E3B94E] uppercase tracking-wider font-semibold block">More Adventures</span>
              <h3 className="font-display text-2xl text-[#EAEBE8] font-bold">You May Also Like</h3>
            </div>
            <Link
              to="/experiences"
              className="text-xs uppercase tracking-wider text-[#A8AD94] hover:text-[#EAEBE8] flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/experiences/${item.id}`)}
                className="group bg-[#232A23] border border-white/10 hover:border-[#E3B94E]/40 rounded-2xl overflow-hidden cursor-pointer transition shadow-xl flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                  <img
                    src={getMediaUrl(item.image_url)}
                    alt={item.title}
                    onError={handleMediaError}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-[10px] font-bold text-[#E3B94E] uppercase tracking-wider border border-white/10">
                    {item.category}
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <h4 className="font-display text-lg font-bold text-[#EAEBE8] group-hover:text-[#E3B94E] transition line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#A8AD94] line-clamp-2">{item.description}</p>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#E3B94E]">
                      PKR {parseInt(item.price || 0).toLocaleString()}
                    </span>
                    <span className="text-[11px] font-semibold text-[#A8AD94] group-hover:text-white transition flex items-center gap-1">
                      Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && (
        <ServiceBookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          service={experience}
          bookingType="experience"
        />
      )}

    </div>
  );
}

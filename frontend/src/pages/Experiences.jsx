import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Compass, Sparkles, Check, ArrowRight } from 'lucide-react';
import ServiceBookingModal from '../components/ServiceBookingModal';

export default function Experiences() {
  const [experiences, setExperiences] = useState([]);
  const [bookingService, setBookingService] = useState(null);

  useEffect(() => {
    async function loadExp() {
      try {
        const res = await api.get('/public/experiences');
        if (res.success) setExperiences(res.experiences);
      } catch (e) {
        console.error(e);
      }
    }
    loadExp();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] uppercase tracking-widest text-[#C5A880] font-semibold">
          Karakoram Alpine Adventures
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-[#EAEBE8] font-bold">
          Curated Skardu Experiences
        </h1>
        <p className="text-xs text-[#A6ADA1] leading-relaxed">
          Embark on high-adrenaline desert safaris, explore glacial turquoise lakes, or unwind with holistic herbal wellness.
        </p>
      </div>

      {/* Grid of Experiences */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {experiences.map((item) => (
          <div key={item.id} className="bg-[#232A23] border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-[#787C68] transition shadow-xl group">
            <div className="relative aspect-[16/10] overflow-hidden bg-[#1E241E]">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute top-3 left-3 bg-[#2C332C]/90 backdrop-blur-md text-[#E3B94E] text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full border border-white/15">
                {item.category}
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-display text-2xl font-medium text-[#EAEBE8] mb-1.5">{item.title}</h3>
                <p className="text-xs text-[#A8AD94] leading-relaxed line-clamp-3 font-light">{item.description}</p>
                {(item.duration || item.difficulty) && (
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-[#A8AD94]">
                    {item.duration && <span>⏱️ {item.duration}</span>}
                    {item.difficulty && <span>• 🎯 {item.difficulty}</span>}
                  </div>
                )}
                {item.departure_times && (
                  <p className="text-[10px] text-[#E3B94E]/90 mt-1">
                    🕒 Slots: {item.departure_times}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#A8AD94] uppercase block font-medium">Rate</span>
                  <span className="font-display text-2xl text-[#E3B94E] font-bold">
                    PKR {parseInt(item.price).toLocaleString()} <span className="text-[10px] text-[#A8AD94] font-sans">/ {item.pricing_unit?.replace('_', ' ')}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingService(item)}
                  className="px-5 py-2.5 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 shadow-md"
                >
                  Book Safari <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Standalone Direct Experience Booking Modal */}
      {bookingService && (
        <ServiceBookingModal
          isOpen={!!bookingService}
          onClose={() => setBookingService(null)}
          service={bookingService}
          bookingType="experience"
        />
      )}

    </div>
  );
}

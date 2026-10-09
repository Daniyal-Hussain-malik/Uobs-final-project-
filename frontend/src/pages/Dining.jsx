import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Utensils, Flame, Coffee, Sparkles, ArrowRight } from 'lucide-react';
import ServiceBookingModal from '../components/ServiceBookingModal';

export default function Dining() {
  const [diningServices, setDiningServices] = useState([]);
  const [bookingService, setBookingService] = useState(null);

  useEffect(() => {
    async function loadDining() {
      try {
        const res = await api.get('/public/dining');
        if (res.success) setDiningServices(res.diningServices);
      } catch (e) {
        console.error(e);
      }
    }
    loadDining();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden aspect-[21/9] flex items-center justify-center p-8 text-center shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
          alt="Indus Riverside Dining"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121813] via-[#121813]/70 to-black/30" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold bg-[#1A221B]/80 px-3 py-1 rounded-full border border-white/10">
            Culinary Heritage of Baltistan
          </span>
          <h1 className="font-display text-3xl sm:text-5xl text-[#EAEBE8] font-bold">
            Indus River &amp; Desert Fire Dining
          </h1>
          <p className="text-xs sm:text-sm text-[#EAEBE8]/80 font-light">
            Feast on authentic organic high-altitude recipes, wild mountain herbs, and river trout cooked over crackling apricot wood.
          </p>
        </div>
      </div>

      {/* Culinary Philosophy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
        <div className="bg-[#232A23] border border-white/10 p-6 rounded-2xl space-y-3">
          <Flame className="w-6 h-6 text-[#E3B94E]" />
          <h3 className="font-display text-xl text-[#EAEBE8] font-medium">Slow-Cooked Dum Pukht</h3>
          <p className="text-[#A8AD94] leading-relaxed">
            Sealed in traditional clay vessels and simmered with Himalayan spices, mountain garlic, and local butter for up to eight hours.
          </p>
        </div>
        <div className="bg-[#232A23] border border-white/10 p-6 rounded-2xl space-y-3">
          <Utensils className="w-6 h-6 text-[#787C68]" />
          <h3 className="font-display text-xl text-[#EAEBE8] font-medium">Wild Organic Foraging</h3>
          <p className="text-[#A8AD94] leading-relaxed">
            Our kitchen sources seasonal dried apricots, sea buckthorn berries, and wild alpine thyme harvested across Skardu valleys.
          </p>
        </div>
        <div className="bg-[#232A23] border border-white/10 p-6 rounded-2xl space-y-3">
          <Coffee className="w-6 h-6 text-[#E3B94E]" />
          <h3 className="font-display text-xl text-[#EAEBE8] font-medium">Herbal Kahwa &amp; Butter Tea</h3>
          <p className="text-[#A8AD94] leading-relaxed">
            Warm your soul after cold desert evenings with freshly brewed Tibetan-Balti salted butter tea or saffron cardamom Kahwa.
          </p>
        </div>
      </div>

      {/* Bookable Dining Add-ons */}
      <div className="space-y-6">
        <h2 className="font-display text-3xl text-[#EAEBE8] font-medium">
          Signature Dining Packages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {diningServices.map((service) => (
            <div key={service.id} className="bg-[#232A23] border border-white/10 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:border-[#787C68] transition shadow-xl">
              <img src={service.image_url} alt={service.title} className="w-full sm:w-48 h-48 object-cover shrink-0" />
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-[#E3B94E] uppercase tracking-wider font-semibold">{service.category}</span>
                    {service.deal_type && (
                      <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full text-[#A8AD94] font-medium">
                        {service.deal_type}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-medium text-[#EAEBE8]">{service.title}</h3>
                  <p className="text-xs text-[#A8AD94] line-clamp-2 mt-1">{service.description}</p>
                  {service.menu_inclusions && (
                    <p className="text-[11px] text-[#E3B94E]/90 mt-2 font-mono line-clamp-1">
                      ✨ {service.menu_inclusions}
                    </p>
                  )}
                  {service.time_slots && (
                    <p className="text-[10px] text-[#A8AD94] mt-1">
                      🕒 {service.time_slots}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="font-display text-lg text-[#E3B94E] font-bold">
                    PKR {parseInt(service.price).toLocaleString()} <span className="text-[10px] text-[#A8AD94] font-sans">/ {service.pricing_unit?.replace('_', ' ')}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setBookingService(service)}
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] text-xs font-semibold uppercase tracking-wider transition shadow-md flex items-center gap-1.5"
                  >
                    Reserve Table <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standalone Direct Dining Booking Modal */}
      {bookingService && (
        <ServiceBookingModal
          isOpen={!!bookingService}
          onClose={() => setBookingService(null)}
          service={bookingService}
          bookingType="dining"
        />
      )}

    </div>
  );
}

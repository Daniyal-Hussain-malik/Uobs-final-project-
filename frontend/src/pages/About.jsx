import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Sparkles, Star, Users, MapPin, Award } from 'lucide-react';

export default function About() {
  const [team, setTeam] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    async function loadAbout() {
      try {
        const res = await api.get('/public/about');
        if (res.success) {
          setTeam(res.team || []);
          setTestimonials(res.testimonials || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadAbout();
  }, []);

  return (
    <div className="min-h-screen bg-[#2C332C] text-[#EAEBE8] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#A8AD94] font-medium bg-[#232A23] px-4 py-1.5 rounded-full border border-white/10">
            The Katpana Cold Desert Story • Est. 2026
          </span>
          <h1 className="font-script text-5xl sm:text-6xl text-[#EAEBE8]">
            High Altitude Hospitality &amp; Quiet Luxury
          </h1>
          <div className="w-16 h-px bg-white/20 mx-auto" />
          <p className="text-sm text-[#A8AD94] font-light leading-relaxed font-sans">
            Rooted at the crossroads of ancient Silk Road caravan routes, Oasis Resort Katpana was envisioned to celebrate the stark beauty of Skardu’s white desert sands without compromising on refined five-star comfort.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div className="bg-[#232A23] border border-white/10 p-7 rounded-3xl space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-[#787C68]/20 text-[#EAEBE8] flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="font-display text-xl text-[#EAEBE8] font-bold">Authentic Balti Masonry</h3>
            <p className="text-[#A8AD94] leading-relaxed font-light">
              Every room and suite is constructed using river-washed stones and hand-chiseled Himalayan cedar by multi-generational Balti master artisans.
            </p>
          </div>

          <div className="bg-[#232A23] border border-white/10 p-7 rounded-3xl space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-[#787C68]/20 text-[#EAEBE8] flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="font-display text-xl text-[#EAEBE8] font-bold">Ecological Stewardship</h3>
            <p className="text-[#A8AD94] leading-relaxed font-light">
              Our resort operates closed-loop water treatment and geothermal radiant floor heating systems to protect the fragile Katpana desert biome.
            </p>
          </div>

          <div className="bg-[#232A23] border border-white/10 p-7 rounded-3xl space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-[#787C68]/20 text-[#EAEBE8] flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="font-display text-xl text-[#EAEBE8] font-bold">Local Community Growth</h3>
            <p className="text-[#A8AD94] leading-relaxed font-light">
              Over 90% of our concierge, guiding, culinary, and housekeeping team are native residents of Skardu and surrounding Baltistan valleys.
            </p>
          </div>
        </div>

        {/* Team Members */}
        {team.length > 0 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[11px] uppercase tracking-widest text-[#A8AD94] font-medium">Your Hosts</span>
              <h2 className="font-script text-4xl sm:text-5xl text-[#EAEBE8]">Resort Leadership &amp; Guides</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((m) => (
                <div key={m.id} className="bg-[#232A23] border border-white/10 p-6 rounded-3xl space-y-4 text-center shadow-xl">
                  <img
                    src={m.image_url}
                    alt={m.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-[#787C68]"
                  />
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#EAEBE8]">{m.name}</h3>
                    <p className="text-xs text-[#787C68] font-medium uppercase tracking-wider">{m.role}</p>
                  </div>
                  <p className="text-xs text-[#A8AD94] font-light leading-relaxed">{m.bio}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div className="space-y-8 pt-8 border-t border-white/10">
            <div className="text-center space-y-2">
              <span className="text-[11px] uppercase tracking-widest text-[#A8AD94] font-medium">Guest Memories</span>
              <h2 className="font-script text-4xl sm:text-5xl text-[#EAEBE8]">Words From Our Travelers</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-[#232A23] border border-white/10 p-6 rounded-2xl space-y-3 shadow-xl">
                  <div className="flex text-[#E3B94E]">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs italic text-[#EAEBE8]/90 font-light leading-relaxed font-display text-[15px]">"{t.comment}"</p>
                  <div>
                    <p className="text-xs font-bold text-[#EAEBE8]">{t.guest_name}</p>
                    <p className="text-[11px] text-[#A8AD94]">{t.guest_location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

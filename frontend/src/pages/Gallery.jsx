import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    async function loadGallery() {
      try {
        let url = '/public/gallery';
        if (activeCategory !== 'all') url += `?category=${encodeURIComponent(activeCategory)}`;
        const res = await api.get(url);
        if (res.success) {
          setItems(res.items || []);
          if (res.categories) setCategories(res.categories);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadGallery();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#2C332C] text-[#EAEBE8] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#A8AD94] font-medium">
            Resort Visual Gallery • Skardu
          </span>
          <h1 className="font-script text-5xl sm:text-6xl text-[#EAEBE8]">
            The Oasis Gallery
          </h1>
          <div className="w-16 h-px bg-white/20 mx-auto" />
          <p className="text-xs text-[#A8AD94] font-light leading-relaxed">
            Capturing the stark contrasts of Katpana's snowcapped Karakoram peaks, white desert sand dunes, and hand-chiseled stone architecture.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              activeCategory === 'all'
                ? 'bg-[#787C68] text-[#232A23]'
                : 'bg-[#232A23] text-[#A8AD94] hover:text-[#EAEBE8] border border-white/10'
            }`}
          >
            All Photography
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                activeCategory === cat
                  ? 'bg-[#787C68] text-[#232A23]'
                  : 'bg-[#232A23] text-[#A8AD94] hover:text-[#EAEBE8] border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-square bg-[#232A23] border border-white/10 shadow-xl">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <span className="text-[10px] text-[#E3B94E] uppercase tracking-wider font-semibold">{item.category}</span>
                <h3 className="text-xs font-bold text-white leading-snug">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

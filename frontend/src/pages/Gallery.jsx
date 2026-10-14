import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Play, X, Maximize2 } from 'lucide-react';
import { getMediaUrl, handleMediaError, isVideoMedia, DEFAULT_RESORT_VIDEO } from '../utils/media';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeMediaItem, setActiveMediaItem] = useState(null);

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
            Resort Visual Gallery &amp; Cinema • Skardu
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
            All Media ({items.length})
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
          {items.map((item) => {
            const isVideo = isVideoMedia(item.image_url);
            const mediaSrc = getMediaUrl(item.image_url);
            return (
              <div
                key={item.id}
                onClick={() => setActiveMediaItem(item)}
                className="group relative rounded-2xl overflow-hidden aspect-square bg-[#232A23] border border-white/10 shadow-xl cursor-pointer hover:border-[#E3B94E]/50 transition-all duration-300"
              >
                {isVideo ? (
                  <div className="relative w-full h-full bg-[#151915] flex items-center justify-center">
                    <video
                      src={mediaSrc}
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      muted
                      preload="metadata"
                      playsInline
                      onError={(e) => {
                        if (e.target && e.target.src !== DEFAULT_RESORT_VIDEO) {
                          e.target.src = DEFAULT_RESORT_VIDEO;
                        }
                      }}
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/90 text-white border border-rose-400/40 shadow">
                        VIDEO REEL
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm text-[#E3B94E] flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 group-hover:bg-[#E3B94E] group-hover:text-[#232A23] transition-all duration-300">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={mediaSrc}
                    alt={item.title}
                    onError={handleMediaError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-[10px] text-[#E3B94E] uppercase tracking-wider font-semibold">
                    {item.category}
                  </span>
                  <h3 className="text-xs font-bold text-white leading-snug drop-shadow">
                    {item.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Media Lightbox Modal */}
      {activeMediaItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setActiveMediaItem(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveMediaItem(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white p-1 rounded-full transition text-sm font-bold flex items-center gap-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-full rounded-2xl overflow-hidden border border-white/20 bg-black shadow-2xl flex items-center justify-center max-h-[80vh]">
              {isVideoMedia(activeMediaItem.image_url) ? (
                <video
                  src={getMediaUrl(activeMediaItem.image_url)}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[78vh] object-contain"
                />
              ) : (
                <img
                  src={getMediaUrl(activeMediaItem.image_url)}
                  alt={activeMediaItem.title}
                  onError={handleMediaError}
                  className="w-full max-h-[78vh] object-contain"
                />
              )}
            </div>

            <div className="mt-4 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E3B94E]">
                {activeMediaItem.category}
              </span>
              <h3 className="text-base font-bold text-white">
                {activeMediaItem.title}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

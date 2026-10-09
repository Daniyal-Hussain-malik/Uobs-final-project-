import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Eye, ArrowRight, Sparkles, Check } from 'lucide-react';

export default function RoomCard({ room }) {
  let amenitiesList = [];
  if (Array.isArray(room.amenities)) {
    amenitiesList = room.amenities;
  } else if (typeof room.amenities === 'string') {
    try {
      amenitiesList = JSON.parse(room.amenities || '[]');
    } catch {
      amenitiesList = room.amenities.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  return (
    <div className="group bg-[#232A23] border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-[#787C68] transition-all duration-300 hover:-translate-y-1 shadow-xl">
      {/* Room Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#1E241E]">
        <img
          src={room.featured_image}
          alt={room.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#232A23] via-transparent to-black/20" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-[#2C332C]/90 backdrop-blur-md text-[#E3B94E] text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full border border-white/15">
          {room.category}
        </div>

        {/* View Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-xs text-[#EAEBE8]/90 truncate">
          <Eye className="w-3.5 h-3.5 text-[#E3B94E] shrink-0" />
          <span className="truncate text-[11px] text-[#EAEBE8] font-medium">{room.view_type}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-[#A8AD94] mb-1.5">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#787C68]" />
              Up to {room.capacity_adults} Adults
              {room.capacity_children > 0 && ` + ${room.capacity_children} Kids`}
            </span>
            <span>{room.room_size_sqm} m²</span>
          </div>

          <h3 className="font-display text-2xl text-[#EAEBE8] font-medium group-hover:text-[#E3B94E] transition leading-snug mb-2">
            {room.title}
          </h3>

          <p className="text-xs text-[#A8AD94] line-clamp-2 leading-relaxed mb-4 font-light">
            {room.description}
          </p>

          {/* Amenities Pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {amenitiesList.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-white/5 text-[#EAEBE8]/80 px-2.5 py-0.5 rounded-full border border-white/5 flex items-center gap-1"
              >
                <Check className="w-2.5 h-2.5 text-[#787C68]" />
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Price & CTA */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#A8AD94] block font-medium">Starting from</span>
            <div className="flex items-baseline space-x-1">
              <span className="font-display text-2xl text-[#EAEBE8] font-bold">
                PKR {parseInt(room.base_price).toLocaleString()}
              </span>
              <span className="text-xs text-[#A8AD94]">/ night</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/rooms/${room.slug}`}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-[#787C68] text-[#EAEBE8] hover:text-[#232A23] transition group-hover:scale-105 border border-white/10"
              title="View Suite Details"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={`/book?room_id=${room.id}`}
              className="px-4 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-semibold text-xs tracking-wider uppercase transition shadow-md"
            >
              Book
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

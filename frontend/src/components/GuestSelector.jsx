import React, { useState, useRef, useEffect } from 'react';
import { Users, Plus, Minus, ChevronDown, Check } from 'lucide-react';

export default function GuestSelector({
  value = { adults: 2, children: 0, infants: 0, rooms: 1 },
  onChange,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const { adults = 2, children = 0, infants = 0, rooms = 1 } = value;

  // Rule: Max 4 adults OR (2 adults + 2 children) per room
  // Total capacity across selected rooms:
  const maxTotalAdults = rooms * 4;
  const maxCombinedPerRoom = 4; // Either 4 adults or 2 adults + 2 children

  const canAddAdult = () => {
    // If we have children, adults per room should not exceed 2 if children >= 2
    if (adults >= maxTotalAdults) return false;
    if (children > 0 && adults >= rooms * 3) return false;
    return true;
  };

  const canAddChild = () => {
    if (children >= rooms * 2) return false;
    if ((adults + children) >= rooms * maxCombinedPerRoom) return false;
    return true;
  };

  const canAddRoom = () => rooms < 5;

  const update = (patch) => {
    const next = { ...value, ...patch };
    onChange?.(next);
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const summary = `${adults} Adult${adults > 1 ? 's' : ''}${
    children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''
  }${infants > 0 ? `, ${infants} Infant${infants > 1 ? 's' : ''}` : ''} • ${rooms} Room${
    rooms > 1 ? 's' : ''
  }`;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-[#1E241E] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-[#EAEBE8] focus:border-[#787C68] outline-none flex items-center justify-between gap-2 text-left"
      >
        <div className="flex items-center gap-2 truncate">
          <Users className="w-4 h-4 text-[#787C68] shrink-0" />
          <span className="truncate">{summary}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#A8AD94] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Card */}
      {open && (
        <div className="absolute left-0 sm:left-auto sm:right-0 w-[320px] max-w-[95vw] top-full mt-2 bg-[#232A23] border border-white/20 rounded-2xl p-4 shadow-[0_25px_60px_rgba(0,0,0,0.9)] z-[9999] space-y-3 backdrop-blur-xl animate-fadeIn max-h-[80vh] overflow-y-auto">
          <div className="border-b border-white/10 pb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8AD94]">
              Room Occupancy
            </span>
            <p className="text-[11px] text-[#A8AD94] font-light">
              Max 4 adults OR 2 adults + 2 children per room
            </p>
          </div>

          {/* 1. Adults */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#EAEBE8]">Adults</p>
              <p className="text-[10px] text-[#A8AD94]">Age 13 and above</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => update({ adults: Math.max(1, adults - 1) })}
                disabled={adults <= 1}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[#EAEBE8] transition"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-[#EAEBE8]">{adults}</span>
              <button
                type="button"
                onClick={() => {
                  if (canAddAdult()) update({ adults: adults + 1 });
                  else if (rooms < 5) update({ adults: adults + 1, rooms: rooms + 1 });
                }}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-[#EAEBE8] transition"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 2. Children */}
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <p className="text-xs font-semibold text-[#EAEBE8]">Children</p>
              <p className="text-[10px] text-[#A8AD94]">Ages 3 to 12</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => update({ children: Math.max(0, children - 1) })}
                disabled={children <= 0}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[#EAEBE8] transition"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-[#EAEBE8]">{children}</span>
              <button
                type="button"
                onClick={() => {
                  if (canAddChild()) update({ children: children + 1 });
                  else if (rooms < 5) update({ children: children + 1, rooms: rooms + 1 });
                }}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-[#EAEBE8] transition"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 3. Infants */}
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <p className="text-xs font-semibold text-[#EAEBE8]">Infants</p>
              <p className="text-[10px] text-[#A8AD94]">Under 3 (Crib on request)</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => update({ infants: Math.max(0, infants - 1) })}
                disabled={infants <= 0}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[#EAEBE8] transition"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-[#EAEBE8]">{infants}</span>
              <button
                type="button"
                onClick={() => update({ infants: infants + 1 })}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-[#EAEBE8] transition"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 4. Rooms */}
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <p className="text-xs font-semibold text-[#EAEBE8]">Rooms / Suites</p>
              <p className="text-[10px] text-[#A8AD94]">Required residences</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => update({ rooms: Math.max(1, rooms - 1) })}
                disabled={rooms <= 1}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[#EAEBE8] transition"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-[#EAEBE8]">{rooms}</span>
              <button
                type="button"
                onClick={() => {
                  if (canAddRoom()) update({ rooms: rooms + 1 });
                }}
                disabled={rooms >= 5}
                className="w-7 h-7 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-[#EAEBE8] transition"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full py-2 bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Apply Guests &amp; Rooms
          </button>
        </div>
      )}
    </div>
  );
}

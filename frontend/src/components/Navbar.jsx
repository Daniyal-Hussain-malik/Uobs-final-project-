import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu, X, Sparkles, ChevronDown, Calendar,
  ArrowRight, Tag, HelpCircle, Phone, Mail, Compass, Star,
  User, LogOut, MessageCircle, MapPin, BedDouble, Utensils, Shield
} from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileRoomsOpen, setMobileRoomsOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'rooms' | 'about' | null

  const location = useLocation();
  const { user, logout } = useAuth();

  // Close menus on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileOpen(false);
    setMobileRoomsOpen(false);
    setMobileAboutOpen(false);
  }, [location.pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#232A23]/95 backdrop-blur-md border-b border-white/10 transition-all shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Navbar Bar */}
        <div className="flex items-center justify-between h-20 sm:h-24 relative">
          
          {/* ================= MOBILE BRAND (Shown on < lg screens) ================= */}
          <div className="lg:hidden flex items-center z-10">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <img
                src="/logo.png"
                alt="OASIS Resort Skardu"
                className="h-11 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow"
              />
              <div className="flex flex-col">
                <span className="font-display text-sm sm:text-base tracking-[0.18em] text-[#EAEBE8] font-bold uppercase leading-none group-hover:text-[#E3B94E] transition">
                  Oasis Resort
                </span>
                <span className="text-[8.5px] text-[#E3B94E] tracking-[0.25em] font-mono mt-0.5">
                  ★★★★★ SKARDU
                </span>
              </div>
            </Link>
          </div>

          {/* ================= LEFT NAV CLUSTER (DESKTOP ONLY) ================= */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs uppercase tracking-[0.2em] font-medium z-10">
            
            {/* 1. Rooms & Rates (Dropdown Trigger) */}
            <div
              className="relative py-7 dropdown-container"
              onMouseEnter={() => setActiveDropdown('rooms')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveDropdown((prev) => (prev === 'rooms' ? null : 'rooms'));
                }}
                className={`flex items-center space-x-1.5 transition py-1 border-b-2 uppercase tracking-[0.2em] font-medium text-xs ${
                  location.pathname.startsWith('/rooms') || location.pathname === '/offers' || activeDropdown === 'rooms'
                    ? 'text-[#EAEBE8] border-[#787C68] font-bold'
                    : 'text-[#A8AD94] hover:text-[#EAEBE8] border-transparent'
                }`}
              >
                <span>Rooms &amp; Rates</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#A8AD94] transition-transform duration-300 ${
                    activeDropdown === 'rooms' ? 'rotate-180 text-[#EAEBE8]' : ''
                  }`}
                />
              </button>

              {/* ROOMS & RATES COMPACT DROPDOWN */}
              {activeDropdown === 'rooms' && (
                <div
                  className="absolute left-0 top-full -mt-2 w-72 bg-[#1E241E]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.7)] p-2 z-50 animate-fadeIn"
                  onMouseEnter={() => setActiveDropdown('rooms')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="px-3 py-2 border-b border-white/10 mb-1 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#787C68] font-bold">Rooms &amp; Rates</span>
                    <span className="text-[9px] text-[#E3B94E] font-mono tracking-wider font-semibold">5-STAR</span>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      to="/rooms"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition text-[#EAEBE8] group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#E3B94E] group-hover:bg-[#E3B94E]/20 transition shrink-0">
                          <BedDouble className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold group-hover:text-[#E3B94E] transition normal-case">All Rooms &amp; Suites</div>
                          <div className="text-[10.5px] text-[#A8AD94] font-light normal-case">Deluxe rooms, suites &amp; villas</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A8AD94] group-hover:text-[#EAEBE8] group-hover:translate-x-0.5 transition shrink-0" />
                    </Link>

                    <Link
                      to="/offers"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition text-[#EAEBE8] group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#E3B94E] group-hover:bg-[#E3B94E]/20 transition shrink-0">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold group-hover:text-[#E3B94E] transition normal-case flex items-center gap-1.5">
                            Special Offers
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-[#E3B94E]/20 text-[#E3B94E] font-bold">10% OFF</span>
                          </div>
                          <div className="text-[10.5px] text-[#A8AD94] font-light normal-case">Seasonal deals &amp; stay privileges</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A8AD94] group-hover:text-[#EAEBE8] group-hover:translate-x-0.5 transition shrink-0" />
                    </Link>

                    <Link
                      to="/book"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition text-[#EAEBE8] group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#787C68] group-hover:bg-[#787C68]/20 transition shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold group-hover:text-[#787C68] transition normal-case">Direct Reservation</div>
                          <div className="text-[10.5px] text-[#A8AD94] font-light normal-case">Airport pickup &amp; welcome Kahwa</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A8AD94] group-hover:text-[#EAEBE8] group-hover:translate-x-0.5 transition shrink-0" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Dining */}
            <NavLink
              to="/dining"
              className={({ isActive }) =>
                `transition py-1 border-b-2 ${
                  isActive
                    ? 'text-[#EAEBE8] border-[#787C68] font-bold'
                    : 'text-[#A8AD94] hover:text-[#EAEBE8] border-transparent'
                }`
              }
            >
              Dining
            </NavLink>

            {/* 3. Experiences */}
            <NavLink
              to="/experiences"
              className={({ isActive }) =>
                `transition py-1 border-b-2 ${
                  isActive
                    ? 'text-[#EAEBE8] border-[#787C68] font-bold'
                    : 'text-[#A8AD94] hover:text-[#EAEBE8] border-transparent'
                }`
              }
            >
              Experiences
            </NavLink>

          </nav>

          {/* ================= ABSOLUTE CENTER LOGO (DESKTOP ONLY) ================= */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center z-20 pointer-events-auto">
            <Link to="/" className="group flex flex-col items-center text-center">
              <img
                src="/logo.png"
                alt="OASIS Resort Skardu"
                className="h-16 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-2xl"
              />
              <span className="font-display text-sm md:text-base tracking-[0.25em] text-[#EAEBE8] font-bold uppercase -mt-1 group-hover:text-[#E3B94E] transition">
                Oasis Resort
              </span>
              <span className="text-[9px] text-[#E3B94E] tracking-[0.3em] font-mono mt-0.5">
                ★★★★★
              </span>
            </Link>
          </div>

          {/* ================= RIGHT SIDE CLUSTER ================= */}
          <div className="flex items-center space-x-3 sm:space-x-5 z-10">
            
            {/* Desktop Right Nav Links */}
            <nav className="hidden lg:flex items-center space-x-7 text-xs uppercase tracking-[0.2em] font-medium">
              
              {/* 4. Gallery */}
              <NavLink
                to="/gallery"
                className={({ isActive }) =>
                  `transition py-1 border-b-2 ${
                    isActive
                      ? 'text-[#EAEBE8] border-[#787C68] font-bold'
                      : 'text-[#A8AD94] hover:text-[#EAEBE8] border-transparent'
                  }`
                }
              >
                Gallery
              </NavLink>

              {/* 5. About (Dropdown Trigger) */}
              <div
                className="relative py-7 dropdown-container"
                onMouseEnter={() => setActiveDropdown('about')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveDropdown((prev) => (prev === 'about' ? null : 'about'));
                  }}
                  className={`flex items-center space-x-1.5 transition py-1 border-b-2 uppercase tracking-[0.2em] font-medium text-xs ${
                    location.pathname === '/about' || location.pathname === '/faqs' || activeDropdown === 'about'
                      ? 'text-[#EAEBE8] border-[#787C68] font-bold'
                      : 'text-[#A8AD94] hover:text-[#EAEBE8] border-transparent'
                  }`}
                >
                  <span>About</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#A8AD94] transition-transform duration-300 ${
                      activeDropdown === 'about' ? 'rotate-180 text-[#EAEBE8]' : ''
                    }`}
                  />
                </button>

                {/* ABOUT COMPACT DROPDOWN */}
                {activeDropdown === 'about' && (
                  <div
                    className="absolute right-0 top-full -mt-2 w-72 bg-[#1E241E]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.7)] p-2 z-50 animate-fadeIn"
                    onMouseEnter={() => setActiveDropdown('about')}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-1 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#787C68] font-bold">The Oasis Story</span>
                      <span className="text-[9px] text-[#E3B94E] font-mono tracking-wider font-semibold">EST. 2010</span>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        to="/about"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition text-[#EAEBE8] group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#E3B94E] group-hover:bg-[#E3B94E]/20 transition shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold group-hover:text-[#E3B94E] transition normal-case">Our Story &amp; Heritage</div>
                            <div className="text-[10.5px] text-[#A8AD94] font-light normal-case">Katpana Cold Desert hospitality</div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#A8AD94] group-hover:text-[#EAEBE8] group-hover:translate-x-0.5 transition shrink-0" />
                      </Link>

                      <Link
                        to="/faqs"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition text-[#EAEBE8] group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#E3B94E] group-hover:bg-[#E3B94E]/20 transition shrink-0">
                            <HelpCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold group-hover:text-[#E3B94E] transition normal-case">Travel Guide &amp; FAQs</div>
                            <div className="text-[10.5px] text-[#A8AD94] font-light normal-case">Heating, transfers &amp; climate</div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#A8AD94] group-hover:text-[#EAEBE8] group-hover:translate-x-0.5 transition shrink-0" />
                      </Link>

                      <Link
                        to="/contact"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition text-[#EAEBE8] group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#787C68] group-hover:bg-[#787C68]/20 transition shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold group-hover:text-[#787C68] transition normal-case">Location &amp; Inquiries</div>
                            <div className="text-[10.5px] text-[#A8AD94] font-light normal-case">Front desk &amp; 4x4 airport pickup</div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#A8AD94] group-hover:text-[#EAEBE8] group-hover:translate-x-0.5 transition shrink-0" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Contact */}
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `transition py-1 border-b-2 ${
                    isActive
                      ? 'text-[#EAEBE8] border-[#787C68] font-bold'
                      : 'text-[#A8AD94] hover:text-[#EAEBE8] border-transparent'
                  }`
                }
              >
                Contact
              </NavLink>

            </nav>

            {/* Action Button: Book Stay */}
            <Link
              to="/book"
              className="bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs tracking-wider uppercase px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg transition active:scale-95 flex items-center space-x-1.5 border border-white/10 shrink-0"
            >
              <Calendar className="w-3.5 h-3.5 text-[#232A23]" />
              <span className="hidden sm:inline">Book Stay</span>
              <span className="sm:hidden text-[11px]">Book</span>
            </Link>

            {/* Mobile Hamburger Button with Smooth Icon Animation */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              className="lg:hidden w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#EAEBE8] hover:text-[#E3B94E] transition active:scale-90"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 transition-transform duration-200 rotate-90" />
              ) : (
                <Menu className="w-5 h-5 transition-transform duration-200" />
              )}
            </button>

          </div>

        </div>
      </div>

      {/* ================= HIGH-END LUXURY MOBILE DRAWER (SLIDE-OVER VIA PORTAL) ================= */}
      {mobileOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] overflow-hidden">
          
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-Over Drawer Container */}
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-[360px] sm:max-w-[400px] bg-[#1C221C] border-l border-white/15 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-y-auto z-[1000000]">
            
            {/* Top Bar inside Drawer */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#191F19]">
              <div className="flex items-center space-x-3">
                <img
                  src="/logo.png"
                  alt="Oasis Logo"
                  className="h-10 w-auto object-contain drop-shadow"
                />
                <div>
                  <h3 className="font-display text-base font-bold text-[#EAEBE8] tracking-widest uppercase leading-tight">
                    Oasis Resort
                  </h3>
                  <span className="text-[9px] text-[#E3B94E] tracking-[0.25em] font-mono block">
                    ★★★★★ SKARDU
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#A8AD94] hover:text-white transition active:scale-90"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 p-5 space-y-6 overflow-y-auto">
              
              {/* Luxury CTA Card: Best Direct Rate Guarantee */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#283128] to-[#1E241E] border border-white/10 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#E3B94E] uppercase tracking-widest font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#E3B94E]" /> Direct Reservation
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-[#E3B94E]/15 text-[#E3B94E] px-2 py-0.5 rounded-full border border-[#E3B94E]/25">
                    CODE: OASIS10
                  </span>
                </div>
                <h4 className="font-display text-base text-[#EAEBE8] font-bold leading-snug">
                  Experience Cold Desert Luxury
                </h4>
                <p className="text-[11px] text-[#A8AD94] font-light leading-relaxed">
                  Best direct rate guarantee with complimentary airport Prado pickup &amp; welcome Kahwa.
                </p>
                <Link
                  to="/book"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reserve A Room Now</span>
                </Link>
              </div>

              {/* Main Nav Links (Luxury List) */}
              <div className="space-y-1 text-sm font-medium">
                
                {/* 1. Rooms & Suites Accordion */}
                <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                  <button
                    onClick={() => setMobileRoomsOpen(!mobileRoomsOpen)}
                    className="w-full flex items-center justify-between p-3.5 text-left text-[#EAEBE8] hover:bg-white/5 transition"
                  >
                    <span className="flex items-center gap-3">
                      <BedDouble className="w-4 h-4 text-[#E3B94E]" />
                      <span className="tracking-wide">Rooms &amp; Rates</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#A8AD94] transition-transform duration-300 ${
                        mobileRoomsOpen ? 'rotate-180 text-[#EAEBE8]' : ''
                      }`}
                    />
                  </button>

                  {mobileRoomsOpen && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-1.5 border-t border-white/5 bg-[#171C17] text-xs">
                      <Link
                        to="/rooms"
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 px-3 rounded-xl hover:bg-white/5 text-[#EAEBE8] transition flex items-center justify-between"
                      >
                        <span>All Rooms &amp; Suites</span>
                        <ArrowRight className="w-3 h-3 text-[#A8AD94]" />
                      </Link>
                      <Link
                        to="/offers"
                        onClick={() => setMobileOpen(false)}
                        className="py-2 px-3 rounded-xl hover:bg-white/5 text-[#E3B94E] font-semibold transition flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <Tag className="w-3 h-3 text-[#E3B94E]" /> Special Offers &amp; Deals
                        </span>
                        <span className="text-[9px] bg-[#E3B94E]/20 px-1.5 py-0.5 rounded text-[#E3B94E]">Save 10%</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 2. Dining */}
                <Link
                  to="/dining"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition border ${
                    location.pathname === '/dining'
                      ? 'bg-[#787C68]/20 border-[#787C68] text-white font-bold'
                      : 'bg-white/5 border-white/5 text-[#EAEBE8] hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Utensils className="w-4 h-4 text-[#E3B94E]" />
                    <span className="tracking-wide">Desert &amp; Riverside Dining</span>
                  </span>
                  <span className="text-[10px] text-[#A8AD94] font-light">BBQ &amp; Menus</span>
                </Link>

                {/* 3. Experiences */}
                <Link
                  to="/experiences"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition border ${
                    location.pathname === '/experiences'
                      ? 'bg-[#787C68]/20 border-[#787C68] text-white font-bold'
                      : 'bg-white/5 border-white/5 text-[#EAEBE8] hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Compass className="w-4 h-4 text-[#E3B94E]" />
                    <span className="tracking-wide">Resort Experiences</span>
                  </span>
                  <span className="text-[10px] text-[#A8AD94] font-light">4x4 &amp; Stargazing</span>
                </Link>

                {/* 4. Gallery */}
                <Link
                  to="/gallery"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition border ${
                    location.pathname === '/gallery'
                      ? 'bg-[#787C68]/20 border-[#787C68] text-white font-bold'
                      : 'bg-white/5 border-white/5 text-[#EAEBE8] hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Star className="w-4 h-4 text-[#E3B94E]" />
                    <span className="tracking-wide">Visual Gallery</span>
                  </span>
                  <span className="text-[10px] text-[#A8AD94] font-light">Photography</span>
                </Link>

                {/* 5. About Accordion */}
                <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                  <button
                    onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                    className="w-full flex items-center justify-between p-3.5 text-left text-[#EAEBE8] hover:bg-white/5 transition"
                  >
                    <span className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-[#E3B94E]" />
                      <span className="tracking-wide">About &amp; Guidelines</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#A8AD94] transition-transform duration-300 ${
                        mobileAboutOpen ? 'rotate-180 text-[#EAEBE8]' : ''
                      }`}
                    />
                  </button>

                  {mobileAboutOpen && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-1.5 border-t border-white/5 bg-[#171C17] text-xs">
                      <Link
                        to="/about"
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 px-3 rounded-xl hover:bg-white/5 text-[#EAEBE8] transition flex items-center justify-between"
                      >
                        <span>The Katpana Story &amp; Heritage</span>
                        <ArrowRight className="w-3 h-3 text-[#A8AD94]" />
                      </Link>
                      <Link
                        to="/faqs"
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 px-3 rounded-xl hover:bg-white/5 text-[#EAEBE8] transition flex items-center justify-between"
                      >
                        <span>Resort Guidelines &amp; FAQs</span>
                        <ArrowRight className="w-3 h-3 text-[#A8AD94]" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* 6. Contact */}
                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition border ${
                    location.pathname === '/contact'
                      ? 'bg-[#787C68]/20 border-[#787C68] text-white font-bold'
                      : 'bg-white/5 border-white/5 text-[#EAEBE8] hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#E3B94E]" />
                    <span className="tracking-wide">Concierge &amp; Contact</span>
                  </span>
                  <span className="text-[10px] text-[#A8AD94] font-light">Get In Touch</span>
                </Link>

              </div>

              {/* User / Member Profile Block */}
              <div className="p-4 rounded-2xl bg-[#181D18] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-[#A8AD94] font-bold">
                    Guest Account &amp; Portal
                  </span>
                  {user && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase font-mono font-bold">
                      {user.role}
                    </span>
                  )}
                </div>

                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#787C68] text-[#232A23] font-bold flex items-center justify-center text-xs">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'G'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-[#EAEBE8] truncate">{user.name}</p>
                        <p className="text-[10px] text-[#A8AD94] truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {user.role === 'admin' ? (
                        <Link
                          to="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-center text-xs font-bold text-[#EAEBE8] transition"
                        >
                          Manager Dashboard
                        </Link>
                      ) : (
                        <Link
                          to="/guest"
                          onClick={() => setMobileOpen(false)}
                          className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-center text-xs font-bold text-[#EAEBE8] transition"
                        >
                          My Reservations
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setMobileOpen(false);
                        }}
                        className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-center text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-center text-xs font-bold text-[#EAEBE8] transition flex items-center justify-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Guest Sign In</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-center text-xs font-bold text-[#232A23] transition"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Instant Contact Pills */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-[#A8AD94] font-bold block">
                  Direct Concierge Support
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href="tel:+923081472888"
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 text-[#EAEBE8] transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-semibold truncate">Call Resort</span>
                  </a>
                  <a
                    href="https://wa.me/923081472888"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-2 text-emerald-300 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-semibold truncate">WhatsApp Desk</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Drawer Bottom Footer */}
            <div className="p-4 bg-[#141814] border-t border-white/10 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-[11px] text-[#A8AD94]">
                <MapPin className="w-3 h-3 text-[#E3B94E]" />
                <span>Katpana Cold Desert, Skardu, Pakistan</span>
              </div>
              <p className="text-[9.5px] text-[#A8AD94]/60 font-mono tracking-wider">
                Altitude: 2,228m • 5-Star Eco Resort
              </p>
            </div>

          </div>
        </div>,
        document.body
      )}
    </header>
  );
}


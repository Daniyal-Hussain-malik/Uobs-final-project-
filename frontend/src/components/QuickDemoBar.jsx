import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, Phone, Tag, User, ShieldCheck, LogOut,
  ExternalLink, Copy, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

export default function QuickDemoBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [copiedPromo, setCopiedPromo] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const copyPromoCode = () => {
    navigator.clipboard?.writeText('OASIS10');
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 2000);
  };

  const getPortalPath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'reception') return '/reception';
    return '/guest';
  };

  return (
    <div className="bg-[#121813] text-[#A6ADA1] text-xs border-b border-white/10 transition-all select-none">
      
      {/* Primary Top Bar: Location, Socials, Promo, User Account Pill */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Location, Contact & Connected Social Media */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[11px]">
          <span className="flex items-center gap-1.5 text-[#EAEBE8] font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#787C68] shrink-0" />
            <span>Katpana Cold Desert, Skardu</span>
            <span className="hidden sm:inline text-[#A8AD94] font-mono">({SITE_CONFIG.altitude})</span>
          </span>
          
          <a
            href={`tel:${SITE_CONFIG.phoneRaw}`}
            className="hidden md:inline-flex items-center gap-1.5 text-[#A8AD94] hover:text-[#EAEBE8] transition"
          >
            <Phone className="w-3.5 h-3.5 text-[#787C68] shrink-0" />
            {SITE_CONFIG.phonePrimary} / {SITE_CONFIG.phoneSecondary}
          </a>

          {/* Connected Official Social Handles */}
          <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-white/10">
            {/* Facebook */}
            <a
              href={SITE_CONFIG.facebookUrl}
              target="_blank"
              rel="noreferrer"
              title="Official Facebook Page"
              className="text-[#A8AD94] hover:text-[#EAEBE8] transition"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* TikTok */}
            <a
              href={SITE_CONFIG.tiktokUrl}
              target="_blank"
              rel="noreferrer"
              title="Official TikTok"
              className="text-[#A8AD94] hover:text-[#EAEBE8] transition"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.29 1.76-.32 1.05-.13 2.27.53 3.12.74.96 1.99 1.42 3.17 1.25 1.09-.13 2.08-.85 2.56-1.84.28-.56.39-1.2.37-1.83V.02z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href={SITE_CONFIG.instagramUrl}
              target="_blank"
              rel="noreferrer"
              title="Official Instagram"
              className="text-[#A8AD94] hover:text-[#EAEBE8] transition"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Center: Promo Voucher Banner */}
        <div className="hidden md:flex items-center gap-2 text-[11px] bg-white/5 border border-white/10 px-3 py-1 rounded-full">
          <Tag className="w-3 h-3 text-[#E3B94E] shrink-0" />
          <span className="text-[#EAEBE8]/80">Winter &amp; Spring:</span>
          <button
            onClick={copyPromoCode}
            title="Click to copy promo code"
            className="group flex items-center gap-1 bg-[#232A23] hover:bg-[#2C332C] text-[#E3B94E] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase transition cursor-pointer border border-white/10"
          >
            <span>OASIS10</span>
            {copiedPromo ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100 transition" />
            )}
          </button>
          <span className="text-[#A8AD94] font-medium">10% OFF</span>
          <Link to="/rooms" className="text-[#E3B94E] hover:underline font-medium text-[10px] ml-1">
            Book with Code
          </Link>
        </div>

        {/* Right: User Authentication / Workspace Portal */}
        <div className="flex items-center gap-2 text-[11px]">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full text-[#EAEBE8] transition border border-white/10"
              >
                <div className="w-5 h-5 rounded-full bg-[#787C68] text-[#232A23] font-bold flex items-center justify-center text-[10px]">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium max-w-[120px] truncate text-xs">{user.name}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-[#E3B94E]">
                  {user.role}
                </span>
                <ChevronDown className={`w-3 h-3 text-[#A8AD94] transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
              </button>

              {userDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#232A23] border border-white/15 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn text-xs">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="font-bold text-[#EAEBE8] truncate">{user.name}</p>
                    <p className="text-[10px] text-[#A8AD94] truncate">{user.email}</p>
                  </div>
                  <Link
                    to={getPortalPath()}
                    onClick={() => setUserDropdown(false)}
                    className="w-full text-left px-4 py-2 hover:bg-white/5 text-[#EAEBE8] transition flex items-center space-x-2"
                  >
                    <User className="w-3.5 h-3.5 text-[#E3B94E]" />
                    <span>
                      {user.role === 'admin'
                        ? 'Admin Workspace'
                        : user.role === 'reception'
                        ? 'Reception Desk'
                        : 'My Reservations'}
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdown(false);
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2 text-rose-400 hover:bg-white/5 transition flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs uppercase tracking-wider text-[#A8AD94] hover:text-[#EAEBE8] transition font-medium px-2 py-1 rounded-lg hover:bg-white/5"
            >
              Sign In
            </Link>
          )}
        </div>

      </div>

    </div>
  );
}

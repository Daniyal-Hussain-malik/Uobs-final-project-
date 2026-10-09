import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, Phone, Tag, User, ShieldCheck, Key, LogOut,
  ExternalLink, Copy, Check, ChevronDown, ChevronUp, Sparkles, Loader2
} from 'lucide-react';

export default function QuickDemoBar() {
  const { user, quickLogin, logout } = useAuth();
  const navigate = useNavigate();
  const [switchingRole, setSwitchingRole] = useState(null);
  const [copiedPromo, setCopiedPromo] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [userDropdown, setUserDropdown] = useState(false);

  // Handle fast 1-click role switcher
  const handleQuickSwitch = async (role, targetPath) => {
    try {
      setSwitchingRole(role);
      const res = await quickLogin(role);
      if (res.success && targetPath) {
        navigate(targetPath);
      }
    } catch (err) {
      console.error('Quick login failed:', err);
    } finally {
      setSwitchingRole(null);
    }
  };

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
      
      {/* Primary Top Line: Location, Socials, Promo, User Account Pill & Demo Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Location, Contact & Connected Social Media */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[11px]">
          <span className="flex items-center gap-1.5 text-[#EAEBE8] font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#787C68] shrink-0" />
            <span>Katpana Cold Desert, Skardu</span>
            <span className="hidden sm:inline text-[#A8AD94] font-mono">(2,228m Alt)</span>
          </span>
          
          <a
            href="tel:+923081472888"
            className="hidden md:inline-flex items-center gap-1.5 text-[#A8AD94] hover:text-[#EAEBE8] transition"
          >
            <Phone className="w-3.5 h-3.5 text-[#787C68] shrink-0" />
            0308-1472888 / 0344-5537788
          </a>

          {/* Connected Official Social Handles */}
          <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-white/10">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/OasissResorts/"
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
              href="https://www.tiktok.com/@oasis_res0rt"
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
              href="https://www.instagram.com/oasis_resort_skardu/?"
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
              <Copy className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
            )}
          </button>
          <span className="text-[#EAEBE8]/70 text-[10px]">10% OFF</span>
          <Link
            to="/book?promo=OASIS10"
            className="text-[10px] text-[#787C68] hover:text-[#EAEBE8] underline underline-offset-2 transition font-medium ml-1"
          >
            Book with Code
          </Link>
        </div>

        {/* Right: User Profile Pill (MOVED UP FROM NAVBAR) + Demo Toggle */}
        <div className="flex items-center gap-3">
          
          {/* USER ACCOUNT PILL MOVED HERE AS CIRCLED BY USER */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#232A23] border border-white/15 hover:border-[#787C68] text-xs text-[#EAEBE8] transition shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-[#E3B94E]" />
                <span className="font-medium">{user.name.split(' ')[0]}</span>
                <span className="text-[9px] uppercase font-bold bg-[#787C68]/40 text-[#EAEBE8] px-1.5 py-0.5 rounded font-mono">
                  {user.role}
                </span>
                <ChevronDown className="w-3 h-3 text-[#A8AD94]" />
              </button>

              {userDropdown && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#232A23] border border-white/15 shadow-2xl py-2 z-50 text-xs"
                  onMouseLeave={() => setUserDropdown(false)}
                >
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-[10px] text-[#A8AD94]">Signed in as</p>
                    <p className="font-semibold text-[#EAEBE8] truncate">{user.email}</p>
                  </div>
                  <Link
                    to={getPortalPath()}
                    onClick={() => setUserDropdown(false)}
                    className="block px-4 py-2 text-[#EAEBE8] hover:bg-white/5 transition"
                  >
                    {user.role === 'admin'
                      ? 'Admin Dashboard'
                      : user.role === 'reception'
                      ? 'Reception Desk'
                      : 'My Reservations'}
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
              className="text-xs uppercase tracking-wider text-[#A8AD94] hover:text-[#EAEBE8] transition font-medium px-2"
            >
              Sign In
            </Link>
          )}

          {/* Demo Role Switcher Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-[#EAEBE8] transition border border-white/10"
          >
            <Sparkles className="w-3 h-3 text-[#E3B94E]" />
            <span className="font-semibold hidden xs:inline">Demo Roles</span>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3 text-[#A8AD94]" />
            ) : (
              <ChevronDown className="w-3 h-3 text-[#A8AD94]" />
            )}
          </button>
        </div>

      </div>

      {/* Expanded Demo Toolbar with 1-Click Role Logins */}
      {isExpanded && (
        <div className="bg-[#182019] border-t border-white/5 px-4 sm:px-6 py-2 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            
            {/* Quick Login Role Buttons */}
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#A8AD94] mr-1 flex items-center gap-1">
                <Key className="w-3 h-3 text-[#787C68]" />
                1-Click Test Login:
              </span>

              {/* Guest Demo */}
              <button
                onClick={() => handleQuickSwitch('guest', '/guest')}
                disabled={switchingRole !== null}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium transition border ${
                  user?.role === 'guest'
                    ? 'bg-[#787C68] text-[#232A23] font-bold border-[#787C68]'
                    : 'bg-white/5 text-[#EAEBE8] border-white/10 hover:border-[#787C68] hover:bg-white/10'
                }`}
              >
                {switchingRole === 'guest' ? (
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                ) : (
                  <User className="w-3 h-3 text-[#E3B94E]" />
                )}
                <span>Guest (Tariq M.)</span>
              </button>

              {/* Reception Demo */}
              <button
                onClick={() => handleQuickSwitch('reception', '/reception')}
                disabled={switchingRole !== null}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium transition border ${
                  user?.role === 'reception'
                    ? 'bg-[#787C68] text-[#232A23] font-bold border-[#787C68]'
                    : 'bg-white/5 text-[#EAEBE8] border-white/10 hover:border-[#787C68] hover:bg-white/10'
                }`}
              >
                {switchingRole === 'reception' ? (
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                ) : (
                  <ShieldCheck className="w-3 h-3 text-[#E3B94E]" />
                )}
                <span>Reception Desk</span>
              </button>

              {/* Admin Demo */}
              <button
                onClick={() => handleQuickSwitch('admin', '/admin')}
                disabled={switchingRole !== null}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium transition border ${
                  user?.role === 'admin'
                    ? 'bg-[#787C68] text-[#232A23] font-bold border-[#787C68]'
                    : 'bg-white/5 text-[#EAEBE8] border-white/10 hover:border-[#787C68] hover:bg-white/10'
                }`}
              >
                {switchingRole === 'admin' ? (
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                ) : (
                  <Sparkles className="w-3 h-3 text-[#E3B94E]" />
                )}
                <span>General Manager</span>
              </button>
            </div>

            {/* Active session info */}
            <div className="flex items-center gap-2 text-[11px]">
              {user ? (
                <>
                  <span className="text-[#A8AD94]">Portal:</span>
                  <Link
                    to={getPortalPath()}
                    className="text-[#E3B94E] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Open {user.role.toUpperCase()} Workspace</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </>
              ) : (
                <span className="text-[#A8AD94] italic text-[10px]">
                  Select a test role above for instant 1-click access
                </span>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

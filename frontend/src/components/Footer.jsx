import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, Instagram, Facebook, Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B0F0C] text-[#A6ADA1] pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/logo.png"
                alt="OASIS Resort"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div>
                <span className="font-display text-lg text-[#EAEBE8] font-bold tracking-wider block">
                  OASIS RESORT
                </span>
                <span className="text-[8px] text-[#E3B94E] tracking-[0.25em] font-mono block">
                  ★★★★★
                </span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-[#A8AD94]">
              Gilgit-Baltistan’s premier eco-luxury resort perched beside the mystical Katpana Cold Desert dunes at 2,228 meters altitude.
            </p>
            <div className="flex space-x-3 text-[#A8AD94]">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/OasissResorts/"
                target="_blank"
                rel="noreferrer"
                title="Official Facebook"
                className="p-2 rounded-full bg-white/5 hover:bg-[#787C68] hover:text-[#232A23] transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@oasis_res0rt"
                target="_blank"
                rel="noreferrer"
                title="Official TikTok"
                className="p-2 rounded-full bg-white/5 hover:bg-[#787C68] hover:text-[#232A23] transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.29 1.76-.32 1.05-.13 2.27.53 3.12.74.96 1.99 1.42 3.17 1.25 1.09-.13 2.08-.85 2.56-1.84.28-.56.39-1.2.37-1.83V.02z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/oasis_resort_skardu/?"
                target="_blank"
                rel="noreferrer"
                title="Official Instagram"
                className="p-2 rounded-full bg-white/5 hover:bg-[#787C68] hover:text-[#232A23] transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-base text-[#EAEBE8] font-semibold tracking-wider mb-4 uppercase">
              Accommodations
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/rooms/royal-karakoram-presidential-villa" className="hover:text-[#C5A880] transition">Presidential Villa</Link></li>
              <li><Link to="/rooms/katpana-stargazer-glass-suite" className="hover:text-[#C5A880] transition">Stargazer Glass Suite</Link></li>
              <li><Link to="/rooms/balti-heritage-stone-cottage" className="hover:text-[#C5A880] transition">Heritage Stone Cottage</Link></li>
              <li><Link to="/rooms/cold-desert-deluxe-glamping-pod" className="hover:text-[#C5A880] transition">Deluxe Glamping Pod</Link></li>
              <li><Link to="/offers" className="text-[#C5A880] hover:underline transition">Direct Booking Offers (10% Off)</Link></li>
            </ul>
          </div>

          {/* Experiences */}
          <div>
            <h4 className="font-display text-base text-[#EAEBE8] font-semibold tracking-wider mb-4 uppercase">
              Curated Escapes
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/experiences" className="hover:text-[#C5A880] transition">Katpana 4x4 Dune Bashing</Link></li>
              <li><Link to="/dining" className="hover:text-[#C5A880] transition">Candlelit Indus Riverside Dining</Link></li>
              <li><Link to="/experiences" className="hover:text-[#C5A880] transition">Himalayan Herbal Oil Spa</Link></li>
              <li><Link to="/gallery" className="hover:text-[#C5A880] transition">Media Gallery & Architecture</Link></li>
              <li><Link to="/faqs" className="hover:text-[#C5A880] transition">Travel Policies & FAQs</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-base text-[#EAEBE8] font-semibold tracking-wider mb-4 uppercase">
              Contact & Inquiries
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>Katpana Cold Desert, Skardu, Gilgit-Baltistan 16100, Pakistan</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#787C68] shrink-0" />
                <a href="tel:03081472888" className="hover:text-[#EAEBE8] transition">0308-1472888</a>
                <span>/</span>
                <a href="tel:03445537788" className="hover:text-[#EAEBE8] transition">0344-5537788</a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#C5A880] shrink-0" />
                <a href="mailto:oasisresortskardu@gmail.com" className="hover:text-[#EAEBE8] transition">oasisresortskardu@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A6ADA1]/70">
          <p>© {new Date().getFullYear()} OASIS Resort Katpana, Skardu. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/faqs" className="hover:text-[#C5A880]">Privacy Policy</Link>
            <Link to="/faqs" className="hover:text-[#C5A880]">Cancellation Terms</Link>
            <Link to="/contact" className="hover:text-[#C5A880]">Front Desk Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

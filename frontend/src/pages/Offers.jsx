import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
import { Tag, Copy, Check, Calendar, ArrowRight } from 'lucide-react';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    async function loadOffers() {
      try {
        const res = await api.get('/public/offers');
        if (res.success) setOffers(res.offers);
      } catch (e) {
        console.error(e);
      }
    }
    loadOffers();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] uppercase tracking-widest text-[#C5A880] font-semibold">
          Curated Stay Packages
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-[#EAEBE8] font-bold">
          Direct Booking Privileges
        </h1>
        <p className="text-xs text-[#A6ADA1]">
          Enjoy guaranteed savings, complimentary airport transfers, and seasonal amenities when booking directly through our website.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-[#232A23] border border-white/10 p-6 sm:p-8 rounded-2xl flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-[#787C68]/30 text-[#E3B94E] text-xs font-semibold uppercase px-3 py-1 rounded-full border border-white/15">
                  {offer.discount_type === 'percentage' ? `${parseInt(offer.discount_value)}% Off Stay` : `PKR ${parseInt(offer.discount_value).toLocaleString()} Off`}
                </span>
                <span className="text-[11px] text-[#A8AD94] flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[#787C68]" /> Valid till {offer.valid_until}
                </span>
              </div>

              <h2 className="font-display text-2xl font-medium text-[#EAEBE8]">
                {offer.title}
              </h2>

              <p className="text-xs text-[#A8AD94] leading-relaxed font-light">
                {offer.description}
              </p>

              {offer.min_spend > 0 && (
                <p className="text-[11px] text-[#A8AD94]">
                  * Minimum booking spend: <strong className="text-[#EAEBE8]">PKR {parseInt(offer.min_spend).toLocaleString()}</strong>
                </p>
              )}
            </div>

            {/* Code Box & CTA */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2 bg-black/40 px-3.5 py-2 rounded-xl border border-white/10 w-full sm:w-auto justify-between sm:justify-start">
                <span className="font-mono text-sm font-bold text-[#E3B94E]">{offer.code}</span>
                <button
                  onClick={() => handleCopy(offer.code)}
                  className="p-1 text-[#A8AD94] hover:text-white transition"
                  title="Copy code"
                >
                  {copiedCode === offer.code ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Copied!
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <Link
                to={`/book?promo=${offer.code}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-md"
              >
                <span>Apply & Book</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

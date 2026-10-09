import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function Faqs() {
  const [faqs, setFaqs] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [openIds, setOpenIds] = useState({});

  useEffect(() => {
    async function loadFaqs() {
      try {
        const res = await api.get('/public/faqs');
        if (res.success) {
          setFaqs(res.faqs || []);
          setGrouped(res.grouped || {});
          // Default open first 2
          const initial = {};
          if (res.faqs && res.faqs.length > 0) initial[res.faqs[0].id] = true;
          if (res.faqs && res.faqs.length > 1) initial[res.faqs[1].id] = true;
          setOpenIds(initial);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadFaqs();
  }, []);

  const toggle = (id) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = searchTerm
    ? faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (f.keywords && f.keywords.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : null;

  return (
    <div className="min-h-screen bg-[#2C332C] text-[#EAEBE8] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#A8AD94] font-medium">
            Information &amp; Resort Guidelines
          </span>
          <h1 className="font-script text-5xl sm:text-6xl text-[#EAEBE8]">
            Frequently Asked Questions
          </h1>
          <div className="w-16 h-px bg-white/20 mx-auto" />
          <p className="text-xs text-[#A8AD94] font-light leading-relaxed max-w-xl mx-auto">
            Everything you need to know regarding cold desert altitude, floor heating, airport transfers, and flexible cancellation policies.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto pt-4">
            <Search className="w-4 h-4 text-[#A8AD94] absolute left-3.5 top-7" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search (e.g. heating, airport, cancellation, breakfast)..."
              className="w-full bg-[#232A23] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#EAEBE8] focus:border-[#787C68] outline-none shadow-lg"
            />
          </div>
        </div>

        {/* FAQs List */}
        {filteredFaqs ? (
          <div className="space-y-4">
            <p className="text-xs text-[#787C68] font-semibold">Found {filteredFaqs.length} matching questions:</p>
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="bg-[#232A23] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between text-xs font-semibold text-[#EAEBE8] hover:text-[#787C68] transition"
                >
                  <span>{faq.question}</span>
                  {openIds[faq.id] ? <ChevronUp className="w-4 h-4 shrink-0 text-[#787C68]" /> : <ChevronDown className="w-4 h-4 shrink-0 text-[#A8AD94]" />}
                </button>
                {openIds[faq.id] && (
                  <div className="px-5 pb-5 text-xs text-[#A8AD94] font-light leading-relaxed border-t border-white/5 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="space-y-4">
                <h2 className="font-display text-xl text-[#EAEBE8] font-bold border-b border-white/10 pb-2">
                  {category}
                </h2>
                <div className="space-y-3">
                  {items.map((faq) => (
                    <div key={faq.id} className="bg-[#232A23] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                      <button
                        onClick={() => toggle(faq.id)}
                        className="w-full p-5 text-left flex items-center justify-between text-xs font-semibold text-[#EAEBE8] hover:text-[#787C68] transition"
                      >
                        <span>{faq.question}</span>
                        {openIds[faq.id] ? <ChevronUp className="w-4 h-4 shrink-0 text-[#787C68]" /> : <ChevronDown className="w-4 h-4 shrink-0 text-[#A8AD94]" />}
                      </button>
                      {openIds[faq.id] && (
                        <div className="px-5 pb-5 text-xs text-[#A8AD94] font-light leading-relaxed border-t border-white/5 pt-3">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

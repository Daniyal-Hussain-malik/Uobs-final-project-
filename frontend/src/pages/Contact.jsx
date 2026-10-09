import React, { useState } from 'react';
import { api } from '../api/client';
import { MapPin, Phone, Mail, Clock, CheckCircle, Send } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Stay Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await api.post('/public/contact', formData);
      if (res.success) {
        setSubmitted(true);
        setMsg(res.message);
      }
    } catch (err) {
      setMsg(err.message || 'Failed to submit message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] uppercase tracking-widest text-[#C5A880] font-semibold">
          Katpana Front Desk Support
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-[#EAEBE8] font-bold">
          Connect With Us
        </h1>
        <p className="text-xs text-[#A6ADA1]">
          Our concierge team is available 24/7 to assist with flight updates, airport transfers, and bespoke honeymoon arrangements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <h3 className="font-display text-2xl text-[#EAEBE8] font-bold border-b border-white/10 pb-4">
              Direct Inquiries & Location
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#EAEBE8]">Resort Address</h4>
                  <p className="text-[#A6ADA1]">{SITE_CONFIG.address}</p>
                  <p className="text-[11px] text-[#819170] mt-1 font-medium">{SITE_CONFIG.airportDistance}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-[#787C68] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#EAEBE8]">Front Desk & WhatsApp</h4>
                  <p className="text-[#A6ADA1]">{SITE_CONFIG.phonePrimary} / {SITE_CONFIG.phoneSecondary}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#EAEBE8]">Email Inquiries</h4>
                  <p className="text-[#A6ADA1]">{SITE_CONFIG.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-[#819170] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#EAEBE8]">Check-In / Check-Out Hours</h4>
                  <p className="text-[#A6ADA1]">Check-in: {SITE_CONFIG.checkInTime} • Check-out: {SITE_CONFIG.checkOutTime} (Early check-in flexible for morning flights)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card p-8 rounded-3xl space-y-6">
          <h3 className="font-display text-2xl text-[#EAEBE8] font-bold border-b border-white/10 pb-4">
            Send an Inquiry Message
          </h3>

          {submitted ? (
            <div className="bg-emerald-500/15 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-300">Message Received</h4>
              <p className="text-xs text-[#EAEBE8]/80">{msg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ayesha Siddiqui"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-[#EAEBE8] focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ayesha@gmail.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-[#EAEBE8] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 321 0000000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-[#EAEBE8] focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-[#EAEBE8] focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">Message *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your dates, group size, or questions..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-[#EAEBE8] focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#b5976e] text-[#121813] font-bold text-xs shadow-lg hover:brightness-110 transition flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Sending...' : 'Dispatch Message'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}

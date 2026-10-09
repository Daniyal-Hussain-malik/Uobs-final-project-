import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { BookingStatusBadge, PaymentStatusBadge } from '../components/StatusBadge';
import {
  CheckCircle, Printer, Calendar, MapPin, User,
  Sparkles, ArrowRight, ShieldCheck, Phone
} from 'lucide-react';

export default function BookingConfirmation() {
  const { bookingNumber } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await api.get(`/bookings/${bookingNumber}`);
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingNumber]);

  if (loading) return <div className="text-center py-24 text-[#A6ADA1]">Generating your stay voucher...</div>;
  if (!data || !data.booking) return <div className="text-center py-24 text-[#A6ADA1]">Voucher not found.</div>;

  const { booking, addons } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      
      {/* Success Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
          <CheckCircle className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase font-bold text-[#C5A880] tracking-widest">
          Reservation Confirmed
        </span>
        <h1 className="font-display text-3xl sm:text-4xl text-[#EAEBE8] font-bold">
          We Look Forward to Welcoming You
        </h1>
        <p className="text-xs text-[#A6ADA1]">
          A formal reservation confirmation has been generated under reference code{' '}
          <strong className="text-[#EAEBE8] font-mono">{booking.booking_number}</strong>
        </p>
      </div>

      {/* Luxury Printable Voucher Card */}
      <div id="printable-voucher" className="bg-[#232A23] p-6 sm:p-10 rounded-2xl border border-white/15 space-y-8 shadow-2xl">
        
        {/* Voucher Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display text-2xl font-bold text-[#EAEBE8] tracking-wider">OASIS RESORT</span>
              <span className="text-[10px] text-[#E3B94E] font-mono">KATPANA</span>
            </div>
            <p className="text-[10px] text-[#A8AD94] uppercase tracking-widest">Guest Stay Voucher</p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <span className="text-xs text-[#A8AD94] block">Reference Number:</span>
            <span className="font-mono text-lg font-bold text-[#E3B94E]">{booking.booking_number}</span>
          </div>
        </div>

        {/* Statuses Bar */}
        <div className="bg-black/30 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-[#A8AD94]">Status:</span>
            <BookingStatusBadge status={booking.booking_status} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#A8AD94]">Payment:</span>
            <PaymentStatusBadge status={booking.payment_status} method={booking.payment_method} />
          </div>
        </div>

        {/* Stay & Room Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          
          <div className="space-y-4">
            <h3 className="font-display text-lg text-[#EAEBE8] font-bold border-b border-white/10 pb-2">
              Accommodations
            </h3>
            <div className="space-y-2">
              <p className="text-sm font-bold text-[#EAEBE8]">{booking.room_title}</p>
              <p className="text-[#A6ADA1]">{booking.room_category} • {booking.room_view}</p>
              <p className="text-[#A6ADA1]">
                <strong>Guests &amp; Rooms:</strong> {booking.adults} Adults {booking.children > 0 && `• ${booking.children} Children`} • {booking.rooms_count || 1} Room{(booking.rooms_count || 1) > 1 ? 's' : ''}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-[#A6ADA1]">
                <span>Check-in Date:</span>
                <span className="text-[#EAEBE8] font-semibold">{booking.check_in} (from 14:00)</span>
              </div>
              <div className="flex justify-between text-[#A6ADA1]">
                <span>Check-out Date:</span>
                <span className="text-[#EAEBE8] font-semibold">{booking.check_out} (until 11:30)</span>
              </div>
              <div className="flex justify-between text-[#A6ADA1]">
                <span>Duration:</span>
                <span className="text-[#EAEBE8] font-semibold">{booking.total_nights} Nights</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-lg text-[#EAEBE8] font-bold border-b border-white/10 pb-2">
              Guest Details
            </h3>
            <div className="space-y-1.5 text-[#A6ADA1]">
              <p><strong className="text-[#EAEBE8]">Guest Name:</strong> {booking.guest_name}</p>
              <p><strong className="text-[#EAEBE8]">Email:</strong> {booking.guest_email}</p>
              <p><strong className="text-[#EAEBE8]">Phone / WhatsApp:</strong> {booking.guest_phone}</p>
              {booking.guest_cnic_passport && (
                <p><strong className="text-[#EAEBE8]">CNIC / Passport:</strong> {booking.guest_cnic_passport}</p>
              )}
              {booking.special_requests && (
                <p className="italic pt-2"><strong className="text-[#EAEBE8]">Note:</strong> {booking.special_requests}</p>
              )}
            </div>
          </div>

        </div>

        {/* Experiential Addons if any */}
        {addons && addons.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
            <h4 className="font-display text-base font-bold text-[#EAEBE8]">Curated Add-Ons Reserved</h4>
            <div className="space-y-1">
              {addons.map((a, i) => (
                <div key={i} className="flex justify-between py-1 border-b border-white/5 last:border-0 text-[#A6ADA1]">
                  <span>{a.title} ({a.quantity}x)</span>
                  <span className="text-[#EAEBE8]">PKR {parseInt(a.total_price).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
          <div>
            <span className="text-xs uppercase font-bold text-[#A6ADA1] block">Grand Total</span>
            <span className="text-[10px] text-[#A6ADA1]">Method: {booking.payment_method.replace(/_/g, ' ').toUpperCase()}</span>
          </div>
          <span className="font-display text-3xl font-bold text-[#C5A880]">
            PKR {parseInt(booking.final_total).toLocaleString()}
          </span>
        </div>

      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#EAEBE8] transition flex items-center space-x-2 border border-white/10"
        >
          <Printer className="w-4 h-4 text-[#C5A880]" />
          <span>Print / Save Voucher</span>
        </button>

        <div className="flex items-center space-x-3">
          <Link
            to="/guest"
            className="px-6 py-2.5 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-xs font-semibold uppercase tracking-wider text-[#232A23] transition flex items-center space-x-2 shadow-md"
          >
            <span>View in Guest Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#EAEBE8] transition border border-white/10"
          >
            Return Home
          </Link>
        </div>
      </div>

    </div>
  );
}

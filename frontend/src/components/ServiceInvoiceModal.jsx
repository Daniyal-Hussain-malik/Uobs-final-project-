import React from 'react';
import { Printer, X, CheckCircle, ShieldCheck, Calendar, Clock, Users, MapPin, Phone, Mail, Award } from 'lucide-react';

export default function ServiceInvoiceModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const bookingNumber = booking.booking_number || 'INV-OASIS-2026';
  const isDining = booking.booking_type === 'dining' || (bookingNumber.startsWith('DIN'));
  const serviceTypeLabel = isDining ? 'Fine Dining & Banquet Experience' : 'Outdoor Desert & Alpine Experience';

  const totalPrice = parseFloat(booking.total_price || booking.unit_price || 0);
  const guestsCount = booking.guests_count || booking.guestsCount || 2;
  const bookingDate = booking.booking_date || booking.date || new Date().toISOString().split('T')[0];
  const timeSlot = booking.time_slot || booking.timeSlot || 'Standard Sitting';
  const paymentStatus = booking.payment_status || 'pending';
  const paymentMethod = booking.payment_method || 'pay_at_hotel';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#1C221C] border border-white/20 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-[#EAEBE8]">
        
        {/* Modal Toolbar (hidden during print) */}
        <div className="print:hidden bg-[#242C24] px-6 py-3.5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E3B94E]">
              Official Reservation Voucher &amp; Invoice
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A8AD94] hover:text-white transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="service-invoice-sheet" className="p-6 sm:p-10 space-y-8 overflow-y-auto print:p-0 print:m-0 print:bg-white print:text-black">
          
          {/* Header & Resort Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-white/15 pb-6 print:border-black/20">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-2xl sm:text-3xl tracking-widest text-[#E3B94E] uppercase print:text-black">
                  OASIS RESORT
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#E3B94E]/10 border border-[#E3B94E]/30 text-[#E3B94E] uppercase font-bold tracking-widest print:border-black print:text-black">
                  Skardu
                </span>
              </div>
              <p className="text-xs font-light text-[#A8AD94] tracking-wider uppercase print:text-gray-600">
                Cold Desert • Katpana Dunes • Gilgit-Baltistan
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#A8AD94] pt-1 print:text-gray-600">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#E3B94E] print:text-black"/> +92 344 8603636</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#E3B94E] print:text-black"/> info@oasisresortskardu.com</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#E3B94E] print:text-black"/> Katpana Cold Desert, Skardu</span>
              </div>
            </div>

            <div className="sm:text-right space-y-1 bg-white/5 p-4 rounded-2xl border border-white/10 print:bg-gray-100 print:border-black/10">
              <span className="text-[10px] uppercase tracking-widest text-[#A8AD94] block font-bold print:text-gray-700">Tax Invoice &amp; Voucher</span>
              <div className="font-mono text-xl sm:text-2xl font-black text-[#EAEBE8] print:text-black">
                {bookingNumber}
              </div>
              <div className="text-[11px] text-[#A8AD94] print:text-gray-600">
                Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <div className="pt-1">
                <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  paymentStatus === 'paid' || paymentStatus === 'verified'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 print:text-emerald-800'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40 print:text-amber-800'
                }`}>
                  {paymentStatus === 'paid' || paymentStatus === 'verified' ? 'Payment Confirmed' : 'Payment at Resort / Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Guest & Reservation Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#232A23] p-5 sm:p-6 rounded-2xl border border-white/10 print:bg-gray-50 print:border-gray-300">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#E3B94E] block print:text-gray-800">
                Guest Particulars
              </span>
              <div className="text-sm font-bold text-[#EAEBE8] print:text-black">
                {booking.guest_name || booking.guestName || 'Valued Guest'}
              </div>
              <div className="text-xs text-[#A8AD94] space-y-0.5 print:text-gray-700">
                {booking.guest_phone && <p>Contact: {booking.guest_phone}</p>}
                {booking.guest_email && <p>Email: {booking.guest_email}</p>}
                <p>Party Size: <strong className="text-[#EAEBE8] print:text-black">{guestsCount} Guests</strong></p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#E3B94E] block print:text-gray-800">
                Reservation Details
              </span>
              <div className="text-sm font-bold text-[#EAEBE8] print:text-black">
                {serviceTypeLabel}
              </div>
              <div className="text-xs text-[#A8AD94] space-y-1 print:text-gray-700">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#E3B94E] print:text-black"/>
                  <span>Activity Date: <strong className="text-[#EAEBE8] print:text-black">{bookingDate}</strong></span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#E3B94E] print:text-black"/>
                  <span>Scheduled Slot: <strong className="text-[#EAEBE8] print:text-black">{timeSlot}</strong></span>
                </p>
                {booking.special_requests && (
                  <p className="text-[11px] italic text-[#C5A880] print:text-gray-600">
                    Notes: "{booking.special_requests}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8AD94] block print:text-gray-700">
              Itemized Service Breakdown
            </span>
            <div className="overflow-x-auto border border-white/10 rounded-2xl print:border-gray-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-wider text-[#A8AD94] print:bg-gray-200 print:text-gray-800">
                  <tr>
                    <th className="py-3 px-4">Service Description</th>
                    <th className="py-3 px-4">Rate Structure</th>
                    <th className="py-3 px-4 text-center">Party / Units</th>
                    <th className="py-3 px-4 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-gray-200">
                  <tr>
                    <td className="py-4 px-4 font-medium">
                      <div className="font-bold text-sm text-[#EAEBE8] print:text-black">
                        {booking.service_title || booking.title || (isDining ? 'Dunes Culinary Experience' : 'Katpana Desert Tour')}
                      </div>
                      <div className="text-[11px] text-[#A8AD94] mt-0.5 print:text-gray-600">
                        {isDining
                          ? 'Includes authentic Balti mountain specialties, welcome Kahwa, private seating & bonfire ambiance'
                          : 'Includes certified Karakoram desert guide, 4x4 dune transport, safety equipment & permits'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#A8AD94] print:text-gray-700 font-mono">
                      {booking.pricing_unit ? `Per ${booking.pricing_unit.replace('_', ' ')}` : 'Flat Package'}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-[#EAEBE8] print:text-black">
                      {guestsCount}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-[#E3B94E] print:text-black">
                      {totalPrice.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-white/5 border-t border-white/10 text-xs print:bg-gray-100 print:border-gray-300">
                  <tr>
                    <td colSpan="3" className="py-2.5 px-4 text-right font-semibold text-[#A8AD94] print:text-gray-700">
                      Subtotal
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-[#EAEBE8] print:text-black">
                      PKR {totalPrice.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="py-2.5 px-4 text-right font-semibold text-[#A8AD94] print:text-gray-700">
                      Taxes &amp; Tourism Levies (Inclusive)
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-[#A8AD94] print:text-gray-700">
                      PKR 0
                    </td>
                  </tr>
                  <tr className="border-t border-white/15 text-sm font-bold print:border-gray-400">
                    <td colSpan="3" className="py-3 px-4 text-right text-[#EAEBE8] uppercase tracking-wider print:text-black">
                      Total Payable Amount
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-base text-[#E3B94E] print:text-black">
                      PKR {totalPrice.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment & Security Clearance Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="border border-white/10 rounded-2xl p-4 space-y-1.5 text-xs bg-white/5 print:border-gray-300 print:bg-gray-50">
              <span className="text-[10px] uppercase font-bold text-[#A8AD94] block tracking-wider print:text-gray-700">
                Payment Channel
              </span>
              <p className="font-semibold text-[#EAEBE8] capitalize print:text-black">
                {paymentMethod.replace(/_/g, ' ')}
              </p>
              {booking.payment_transaction_id && (
                <p className="font-mono text-[11px] text-[#A8AD94] print:text-gray-700">
                  Ref / Trx: {booking.payment_transaction_id}
                </p>
              )}
              <p className="text-[10px] text-[#A8AD94] pt-1 border-t border-white/5 print:text-gray-600">
                Status: {paymentStatus.toUpperCase()} • Verified through Resort Reservation Gateway
              </p>
            </div>

            <div className="border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs bg-white/5 print:border-gray-300 print:bg-gray-50">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#A8AD94] block tracking-wider print:text-gray-700">
                  Concierge Verification
                </span>
                <div className="flex items-center gap-1.5 text-emerald-400 print:text-emerald-800 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Authorized Resort Voucher</span>
                </div>
                <p className="text-[10px] text-[#A8AD94] print:text-gray-600 font-mono">
                  AUTH-SKD-{(bookingNumber.slice(-4) || '9921')}
                </p>
              </div>

              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#E3B94E]/40 flex flex-col items-center justify-center text-center p-1 print:border-black/40">
                <span className="text-[8px] uppercase font-bold tracking-widest text-[#E3B94E] print:text-black">SEAL</span>
                <span className="text-[7px] text-[#A8AD94] print:text-gray-600">OASIS RESORT</span>
              </div>
            </div>
          </div>

          {/* Terms & Instructions */}
          <div className="border-t border-white/10 pt-4 text-[10px] text-[#A8AD94] space-y-1 print:border-gray-300 print:text-gray-600">
            <p className="font-semibold uppercase tracking-wider text-[#EAEBE8] print:text-black">
              Important Guest Notice &amp; Resort Policies:
            </p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Please present this digital or printed voucher to the OASIS Concierge or Front Desk upon arrival.</li>
              <li>Guests are requested to arrive 15 minutes prior to their reserved sitting or excursion departure time.</li>
              <li>Weather-dependent activities (such as dunes 4x4 or paragliding) are subject to high-altitude Karakoram safety regulations.</li>
              <li>For any schedule amendments or dietary preferences, contact the Front Desk directly at +92 344 8603636.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}

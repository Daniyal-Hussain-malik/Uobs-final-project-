import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, Users, Clock, CreditCard, Building,
  CheckCircle, AlertCircle, X, ArrowRight, ShieldCheck, Upload, Printer
} from 'lucide-react';
import ServiceInvoiceModal from './ServiceInvoiceModal';

export default function ServiceBookingModal({
  isOpen,
  onClose,
  service,
  bookingType = 'dining', // 'dining' or 'experience'
}) {
  const { user } = useAuth();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState(
    bookingType === 'dining' ? 'Sunset Sitting (18:30 - 20:30)' : 'Golden Hour Sunset (16:30 - 19:00)'
  );
  const [guestsCount, setGuestsCount] = useState(2);
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('pay_at_hotel');
  const [transactionId, setTransactionId] = useState('');
  const [slipFile, setSlipFile] = useState(null);
  const [paymentAccounts, setPaymentAccounts] = useState([]);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Sync user info
  useEffect(() => {
    if (user) {
      if (!guestName) setGuestName(user.name || '');
      if (!guestEmail) setGuestEmail(user.email || '');
      if (!guestPhone) setGuestPhone(user.phone || '');
    }
  }, [user]);

  // Load public payment accounts
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await api.get('/public/payment-accounts');
        if (res.success && res.accounts) {
          setPaymentAccounts(res.accounts);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen]);

  if (!isOpen || !service) return null;

  const unitPrice = parseFloat(service.price || 0);
  const isPerPerson = service.pricing_unit?.includes('person') || bookingType === 'dining';
  const totalPrice = isPerPerson ? unitPrice * guestsCount : unitPrice;

  const diningSlots = [
    'Lunch Gathering (12:30 - 14:30)',
    'Sunset Sitting (18:30 - 20:30)',
    'Candlelight Dinner (20:30 - 22:30)',
    'Cold Desert Bonfire & BBQ (21:00 - 23:30)',
  ];

  const experienceSlots = [
    'Sunrise Dawn Safari (06:00 - 08:30)',
    'Morning Desert Explorer (09:00 - 12:00)',
    'Golden Hour Sunset (16:30 - 19:00)',
    'Night Sky Astrophotography (21:30 - 23:30)',
  ];

  const currentSlots = bookingType === 'dining' ? diningSlots : experienceSlots;

  // Selected account details
  const selectedAccount = paymentAccounts.find((a) => a.method === paymentMethod) || {
    bank_name: paymentMethod === 'bank_transfer' ? 'Habib Bank Limited (HBL) Skardu' : paymentMethod === 'jazzcash' ? 'Mobilink Bank / JazzCash' : 'Telenor Bank / Easypaisa',
    account_title: 'Oasis Resort Katpana Pvt Ltd',
    account_number: paymentMethod === 'bank_transfer' ? '0001-23456789-01' : paymentMethod === 'jazzcash' ? '0308-1472888' : '0344-5537788',
    iban: paymentMethod === 'bank_transfer' ? 'PK36 HABB 0001 2345 6789 0101' : 'TILL / MOBILE TRANSFER',
    instructions: 'Send payment and upload screenshot below for instant verification.',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('booking_type', bookingType);
      formData.append('service_id', service.id);
      formData.append('service_title', service.title);
      formData.append('guest_name', guestName);
      formData.append('guest_email', guestEmail);
      formData.append('guest_phone', guestPhone);
      formData.append('booking_date', date);
      formData.append('booking_time', timeSlot);
      formData.append('guests_count', guestsCount);
      formData.append('unit_price', unitPrice);
      formData.append('total_price', totalPrice);
      formData.append('special_requests', specialRequests);
      formData.append('payment_method', paymentMethod);
      formData.append('payment_transaction_id', transactionId);

      if (slipFile) {
        formData.append('payment_slip', slipFile);
      }

      const res = await api.post('/public/service-bookings', formData);
      if (res.success) {
        setConfirmedBooking({
          booking_number: res.booking_number,
          booking_type: bookingType,
          service_title: service.title,
          total_price: totalPrice,
          unit_price: unitPrice,
          pricing_unit: service.pricing_unit,
          date,
          timeSlot,
          guestsCount,
          guestName,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          special_requests: specialRequests,
          payment_method: paymentMethod,
          payment_transaction_id: transactionId,
          payment_status: paymentMethod === 'pay_at_hotel' ? 'pending' : 'verified',
        });
      } else {
        setErrorMsg(res.message || 'Reservation failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server error processing your reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#232A23] border border-white/20 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              {service.image_url && (
                <img src={service.image_url} alt={service.title} className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-white/10" />
              )}
              <div>
                <span className="text-[10px] text-[#E3B94E] uppercase tracking-wider font-semibold">
                  Direct {bookingType === 'dining' ? 'Dining' : 'Experience'} Booking (No Room Stay Required)
                </span>
                <h3 className="font-display text-2xl text-[#EAEBE8] font-bold">{service.title}</h3>
                <p className="text-xs text-[#A8AD94]">
                  PKR {unitPrice.toLocaleString()} / {service.pricing_unit?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#A8AD94] hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Confirmation State */}
          {confirmedBooking ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-[#E3B94E] tracking-widest">
                  Reservation Confirmed
                </span>
                <h2 className="font-display text-3xl text-[#EAEBE8] font-bold">
                  Table &amp; Activity Reserved
                </h2>
                <p className="text-xs text-[#A8AD94]">
                  Reference Code:{' '}
                  <strong className="text-[#EAEBE8] font-mono text-sm">{confirmedBooking.booking_number}</strong>
                </p>
              </div>

              <div className="bg-[#1E241E] border border-white/10 rounded-2xl p-5 text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between text-[#A8AD94]">
                  <span>Activity / Package:</span>
                  <span className="text-[#EAEBE8] font-bold font-sans">{confirmedBooking.service_title}</span>
                </div>
                <div className="flex justify-between text-[#A8AD94]">
                  <span>Reserved For:</span>
                  <span className="text-[#EAEBE8] font-sans">{confirmedBooking.guestName} ({confirmedBooking.guestsCount} Guests)</span>
                </div>
                <div className="flex justify-between text-[#A8AD94]">
                  <span>Date &amp; Slot:</span>
                  <span className="text-[#E3B94E] font-sans">{confirmedBooking.date} • {confirmedBooking.timeSlot}</span>
                </div>
                <div className="flex justify-between text-[#A8AD94] border-t border-white/10 pt-2 font-sans font-bold">
                  <span>Total Amount:</span>
                  <span className="text-[#E3B94E] text-sm">PKR {confirmedBooking.total_price.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#A8AD94] max-w-md mx-auto">
                Our concierge team at Katpana Desert has received your booking. Please arrive 15 minutes prior to your reserved slot.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E3B94E] hover:bg-[#F3C95E] text-[#121813] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xl"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-xl"
                >
                  Done &amp; Close
                </button>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {errorMsg && (
              <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: Schedule & Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                  Reservation Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#1E241E] border border-white/15 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                  Time / Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-[#1E241E] border border-white/15 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] outline-none"
                >
                  {currentSlots.map((slot, i) => (
                    <option key={i} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                  Number of Guests
                </label>
                <div className="flex items-center gap-2 bg-[#1E241E] border border-white/15 rounded-xl px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-[#EAEBE8]">{guestsCount}</span>
                  <button
                    type="button"
                    onClick={() => setGuestsCount(guestsCount + 1)}
                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Guest Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Malik"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-[#1E241E] border border-white/15 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="guest@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full bg-[#1E241E] border border-white/15 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Mobile / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="0300-1234567"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-[#1E241E] border border-white/15 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                Special Requests &amp; Dietary Preferences (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Vegetarian diet, anniversary setup by desert dunes, high chair..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full bg-[#1E241E] border border-white/15 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] outline-none"
              />
            </div>

            {/* Step 3: Payment Method & Dynamic Account */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="text-[10px] text-[#A8AD94] uppercase font-bold block">
                Select Payment Guarantee
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'pay_at_hotel', label: 'Pay at Hotel', sub: 'Cash on Arrival' },
                  { id: 'bank_transfer', label: 'Bank Transfer', sub: 'Online / Slip' },
                  { id: 'jazzcash', label: 'JazzCash', sub: 'Instant Wallet' },
                  { id: 'easypaisa', label: 'EasyPaisa', sub: 'Instant Wallet' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col justify-center items-center ${
                      paymentMethod === pm.id
                        ? 'border-[#787C68] bg-[#787C68]/20 text-[#EAEBE8]'
                        : 'border-white/10 bg-white/5 text-[#A8AD94] hover:border-white/20'
                    }`}
                  >
                    <span className="font-bold text-xs">{pm.label}</span>
                    <span className="text-[9px] opacity-75">{pm.sub}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Account Card */}
              {paymentMethod !== 'pay_at_hotel' && (
                <div className="bg-[#1E241E] p-4 rounded-2xl space-y-3 border border-white/10">
                  <div className="flex items-center gap-2 text-[#E3B94E] font-bold">
                    <Building className="w-4 h-4 text-[#787C68]" />
                    <span>{selectedAccount.bank_name}</span>
                  </div>

                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1 text-xs">
                    <p><span className="text-[#A8AD94]">Title:</span> <strong className="text-[#EAEBE8]">{selectedAccount.account_title}</strong></p>
                    <p><span className="text-[#A8AD94]">Account / Mobile:</span> <strong className="text-[#E3B94E] tracking-wider">{selectedAccount.account_number}</strong></p>
                    {selectedAccount.iban && (
                      <p><span className="text-[#A8AD94]">IBAN / Ref:</span> <strong className="text-[#EAEBE8]">{selectedAccount.iban}</strong></p>
                    )}
                    {selectedAccount.instructions && (
                      <p className="text-[10px] text-[#A8AD94] pt-1 border-t border-white/5">{selectedAccount.instructions}</p>
                    )}
                  </div>

                  {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
                    <div>
                      <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                        Transaction ID / Reference #
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. JC-9922881 or EP-4411882"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-[#EAEBE8] outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                      Upload Deposit Receipt / Screenshot (Optional)
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => setSlipFile(e.target.files[0])}
                      className="w-full text-xs text-[#A8AD94] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#787C68] file:text-[#232A23] file:font-semibold file:text-xs cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Total & Submit */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">
              <div>
                <span className="text-[10px] text-[#A8AD94] uppercase tracking-wider block">Estimated Total</span>
                <span className="font-display text-2xl text-[#E3B94E] font-bold">
                  PKR {totalPrice.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#A8AD94] font-semibold uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold uppercase tracking-wider transition shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{submitting ? 'Confirming...' : 'Confirm Reservation'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>

    {showInvoiceModal && confirmedBooking && (
      <ServiceInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        booking={confirmedBooking}
      />
    )}
  </>
  );
}

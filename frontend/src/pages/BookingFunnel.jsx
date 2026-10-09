import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StayDateRangePicker from '../components/StayDateRangePicker';
import GuestSelector from '../components/GuestSelector';
import {
  Calendar, Users, Check, Tag, CreditCard, Shield,
  ArrowRight, Upload, Sparkles, AlertCircle, Building
} from 'lucide-react';

export default function BookingFunnel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const preselectedRoomId = searchParams.get('room_id') || '';
  const preCheckIn = searchParams.get('check_in') || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const preCheckOut = searchParams.get('check_out') || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const prePromo = searchParams.get('promo') || '';

  // Form State
  const [rooms, setRooms] = useState([]);
  const [addons, setAddons] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(preselectedRoomId);
  const [checkIn, setCheckIn] = useState(preCheckIn);
  const [checkOut, setCheckOut] = useState(preCheckOut);
  const [guestSelection, setGuestSelection] = useState({
    adults: parseInt(searchParams.get('adults') || '2', 10),
    children: parseInt(searchParams.get('children') || '0', 10),
    infants: parseInt(searchParams.get('infants') || '0', 10),
    rooms: parseInt(searchParams.get('rooms') || '1', 10),
  });

  // Selected Add-ons: { [addonId]: quantity }
  const [selectedAddons, setSelectedAddons] = useState({});

  // Guest Details
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [guestCnic, setGuestCnic] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Promo Code
  const [promoCode, setPromoCode] = useState(prePromo);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('pay_at_hotel');
  const [transactionId, setTransactionId] = useState('');
  const [slipFile, setSlipFile] = useState(null);
  const [paymentAccounts, setPaymentAccounts] = useState([]);

  // Dynamic Pricing State
  const [pricing, setPricing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load Rooms, Addons & Payment Accounts
  useEffect(() => {
    async function loadData() {
      try {
        const [roomsRes, addonsRes, payRes] = await Promise.all([
          api.get('/rooms'),
          api.get('/bookings/addons'),
          api.get('/public/payment-accounts'),
        ]);

        if (roomsRes.success && roomsRes.rooms.length > 0) {
          setRooms(roomsRes.rooms);
          if (!selectedRoomId) {
            setSelectedRoomId(roomsRes.rooms[0].id.toString());
          }
        }
        if (addonsRes.success) {
          setAddons(addonsRes.addons);
        }
        if (payRes.success && payRes.accounts) {
          setPaymentAccounts(payRes.accounts);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  // Update Guest fields if user logs in or switches account
  useEffect(() => {
    if (user) {
      setGuestName(user.name || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
    }
  }, [user]);

  // Recalculate room stay price
  useEffect(() => {
    if (!selectedRoomId || !checkIn || !checkOut) return;
    async function fetchPricing() {
      try {
        const res = await api.get(`/rooms/${selectedRoomId}/pricing?check_in=${checkIn}&check_out=${checkOut}`);
        if (res.success) {
          setPricing(res.pricing);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchPricing();
  }, [selectedRoomId, checkIn, checkOut]);

  // Calculate Add-on totals
  const addonsTotal = Object.entries(selectedAddons).reduce((acc, [id, qty]) => {
    const service = addons.find((a) => a.id.toString() === id.toString());
    return acc + (service ? parseFloat(service.price) * qty : 0);
  }, 0);

  const roomsCount = Math.max(1, guestSelection.rooms || 1);
  const selectedRoom = rooms.find((r) => r.id.toString() === selectedRoomId.toString());
  const categoryMaxRooms = selectedRoom ? (selectedRoom.total_rooms || 4) : 4;
  const isOverRoomLimit = roomsCount > categoryMaxRooms;

  const nightsCount = pricing?.total_nights || Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1);
  const singleRoomStayPrice = pricing ? pricing.total_room_price : (selectedRoom ? parseFloat(selectedRoom.base_price) * nightsCount : 0);
  const roomTotal = singleRoomStayPrice * roomsCount;
  const subtotal = roomTotal + addonsTotal;
  const discountAmount = appliedPromo ? appliedPromo.discount_amount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Handle Promo Verification
  const handleApplyPromo = async (codeToVerify = promoCode) => {
    const code = (codeToVerify || '').trim();
    if (!code) return;
    setValidatingPromo(true);
    setPromoError('');
    try {
      const res = await api.post('/bookings/validate-promo', {
        code,
        subtotal: subtotal > 0 ? subtotal : 10000,
      });
      if (res.valid) {
        setAppliedPromo(res);
      } else {
        setPromoError(res.message || 'Invalid promo code');
      }
    } catch (err) {
      setPromoError(err.message || 'Promo code could not be applied');
    } finally {
      setValidatingPromo(false);
    }
  };

  // Auto-apply promo code from query parameter once pricing or subtotal is available
  useEffect(() => {
    if (prePromo && subtotal > 0 && !appliedPromo && !promoError) {
      handleApplyPromo(prePromo);
    }
  }, [subtotal, prePromo]);

  // Toggle Addon checkbox
  const toggleAddon = (id) => {
    setSelectedAddons((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  };

  // Submit Reservation
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedRoomId) {
      setErrorMsg('Please select an accommodation.');
      return;
    }

    if (isOverRoomLimit) {
      setErrorMsg(`Cannot book ${roomsCount} rooms in ${selectedRoom?.category || 'selected category'}. Only ${categoryMaxRooms} rooms are available in this category. To book additional rooms, please complete this reservation for up to ${categoryMaxRooms} rooms and book another category for the remaining rooms.`);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('room_id', selectedRoomId);
      formData.append('check_in', checkIn);
      formData.append('check_out', checkOut);
      formData.append('adults', guestSelection.adults);
      formData.append('children', guestSelection.children);
      formData.append('infants', guestSelection.infants || 0);
      formData.append('rooms_count', roomsCount);
      formData.append('rooms', roomsCount);
      formData.append('guest_name', guestName);
      formData.append('guest_email', guestEmail);
      formData.append('guest_phone', guestPhone);
      formData.append('guest_cnic_passport', guestCnic);
      formData.append('special_requests', specialRequests);
      formData.append('payment_method', paymentMethod);
      formData.append('payment_transaction_id', transactionId);
      if (appliedPromo) formData.append('promo_code', appliedPromo.code);

      const addonsPayload = Object.entries(selectedAddons).map(([id, qty]) => ({
        id: parseInt(id, 10),
        quantity: qty,
      }));
      formData.append('addons', JSON.stringify(addonsPayload));

      if (slipFile) {
        formData.append('payment_slip', slipFile);
      }

      const res = await api.post('/bookings', formData);
      if (res.success) {
        navigate(`/booking/${res.booking_number}/confirmation`);
      } else {
        setErrorMsg(res.message || 'Booking failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while creating your reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <span className="text-[11px] uppercase tracking-widest text-[#C5A880] font-semibold">
          Seamless Direct Reservation
        </span>
        <h1 className="font-display text-3xl sm:text-4xl text-[#EAEBE8] font-bold">
          Reserve Your Cold Desert Stay
        </h1>
        <p className="text-xs text-[#A6ADA1]">
          Complete your customized booking in a few simple steps with best direct rate guarantee.
        </p>
      </div>

      {errorMsg && (
        <div className="max-w-4xl mx-auto mb-8 bg-rose-500/20 border border-rose-500/40 text-rose-300 p-4 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Cols: Funnel Steps */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* STEP 1: Room & Dates */}
          <div className="bg-[#232A23] border border-white/10 p-6 sm:p-7 rounded-2xl space-y-5">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
              <div className="w-8 h-8 rounded-full bg-[#787C68] text-[#232A23] font-bold flex items-center justify-center text-xs">
                1
              </div>
              <h2 className="font-display text-2xl text-[#EAEBE8] font-medium">
                Select Suite & Stay Dates
              </h2>
            </div>

            {/* Room Select Dropdown / Radio */}
            <div className="space-y-3">
              <label className="text-xs text-[#A8AD94] font-semibold uppercase">Accommodation</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rooms.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoomId(r.id.toString())}
                    className={`cursor-pointer p-3.5 rounded-xl border transition flex items-center space-x-3 ${
                      selectedRoomId.toString() === r.id.toString()
                        ? 'border-[#787C68] bg-[#787C68]/15'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <img src={r.featured_image} alt={r.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#EAEBE8] truncate">{r.title}</h4>
                        <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0 ml-1">
                          {r.total_rooms || 4} Units
                        </span>
                      </div>
                      <p className="text-[11px] text-[#E3B94E] font-semibold">
                        PKR {parseInt(r.base_price).toLocaleString()} <span className="text-[9px] text-[#A8AD94]">/ night</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates & Guests with Flatpickr & Guest/Room Popover */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
              <div className="md:col-span-7">
                <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">
                  Stay Dates (Check In — Check Out)
                </label>
                <StayDateRangePicker
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={({ checkIn: s, checkOut: e }) => {
                    setCheckIn(s);
                    if (e) setCheckOut(e);
                  }}
                />
              </div>

              <div className="md:col-span-5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block">
                    Guests &amp; Rooms
                  </label>
                  {selectedRoom && (
                    <span className="text-[10px] text-emerald-400 font-medium">
                      Max {categoryMaxRooms} in {selectedRoom.category}
                    </span>
                  )}
                </div>
                <GuestSelector
                  value={guestSelection}
                  onChange={setGuestSelection}
                />
              </div>
            </div>

            {/* Room Limit Warning Banner if Exceeded */}
            {isOverRoomLimit && (
              <div className="bg-rose-500/15 border border-rose-500/40 rounded-xl p-3.5 text-xs text-rose-300 flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-rose-200">
                    Category Room Limit: Only {categoryMaxRooms} Units Available in {selectedRoom?.category}
                  </strong>
                  <span className="text-[11px] leading-relaxed">
                    You have selected <strong>{roomsCount} rooms</strong>. Only <strong>{categoryMaxRooms} rooms</strong> exist in the {selectedRoom?.category} category. To book {roomsCount} rooms in total, please select up to {categoryMaxRooms} rooms here, and book another room from a different category for the extra rooms.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Experiential Add-ons */}
          <div className="bg-[#232A23] border border-white/10 p-6 sm:p-7 rounded-2xl space-y-5">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
              <div className="w-8 h-8 rounded-full bg-[#787C68] text-[#232A23] font-bold flex items-center justify-center text-xs">
                2
              </div>
              <div>
                <h2 className="font-display text-2xl text-[#EAEBE8] font-medium">
                  Curated Himalayan Add-Ons
                </h2>
                <p className="text-[11px] text-[#A8AD94]">Elevate your stay with licensed desert safaris & dining</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addons.map((addon) => {
                const isChecked = !!selectedAddons[addon.id];
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                      isChecked
                        ? 'border-[#787C68] bg-[#787C68]/15'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-[#787C68] focus:ring-0"
                        />
                        <span className="text-xs font-bold text-[#EAEBE8]">{addon.title}</span>
                      </div>
                      <p className="text-[10px] text-[#A8AD94] line-clamp-1">{addon.description}</p>
                      <p className="text-xs text-[#E3B94E] font-semibold">
                        PKR {parseInt(addon.price).toLocaleString()} <span className="text-[10px] text-[#A8AD94]">/ {addon.pricing_unit.replace('_', ' ')}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Guest Contact Information */}
          <div className="bg-[#232A23] border border-white/10 p-6 sm:p-7 rounded-2xl space-y-5">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
              <div className="w-8 h-8 rounded-full bg-[#787C68] text-[#232A23] font-bold flex items-center justify-center text-xs">
                3
              </div>
              <h2 className="font-display text-2xl text-[#EAEBE8] font-medium">
                Guest Identification & Contact
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Tariq Malik"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#C5A880] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">Email Address *</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.g. tariq@gmail.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#C5A880] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">Mobile / WhatsApp *</label>
                <input
                  type="text"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#C5A880] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">CNIC / Passport Number</label>
                <input
                  type="text"
                  value={guestCnic}
                  onChange={(e) => setGuestCnic(e.target.value)}
                  placeholder="37405-1234567-1 or Passport #"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">Special Requests / Flight Arrival</label>
                <textarea
                  rows="2"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Arriving on morning flight from Islamabad, need airport pickup or extra room heating..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#C5A880] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: Payment Method */}
          <div className="bg-[#232A23] border border-white/10 p-6 sm:p-7 rounded-2xl space-y-5">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
              <div className="w-8 h-8 rounded-full bg-[#787C68] text-[#232A23] font-bold flex items-center justify-center text-xs">
                4
              </div>
              <h2 className="font-display text-2xl text-[#EAEBE8] font-medium">
                Payment Guarantee
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { id: 'pay_at_hotel', label: 'Pay at Hotel', desc: 'Settle at front desk' },
                { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Direct deposit slip' },
                { id: 'jazzcash', label: 'JazzCash', desc: 'Instant mobile wallet' },
                { id: 'easypaisa', label: 'Easypaisa', desc: 'Instant mobile wallet' },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`cursor-pointer p-3 rounded-xl border text-center transition ${
                    paymentMethod === m.id
                      ? 'border-[#787C68] bg-[#787C68]/15'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <p className="font-bold text-[#EAEBE8]">{m.label}</p>
                  <p className="text-[10px] text-[#A8AD94] mt-0.5">{m.desc}</p>
                </div>
              ))}
            </div>

            {/* Structured Payment Account Card & Slip Upload (Bank, JazzCash, EasyPaisa) */}
            {paymentMethod !== 'pay_at_hotel' && (() => {
              const activeAcc = paymentAccounts.find((a) => a.method === paymentMethod) || {
                bank_name: paymentMethod === 'bank_transfer'
                  ? 'Habib Bank Limited (HBL) Skardu'
                  : paymentMethod === 'jazzcash'
                  ? 'Mobilink Microfinance Bank / JazzCash'
                  : 'Telenor Microfinance Bank / Easypaisa',
                account_title: 'Oasis Resort Katpana Pvt Ltd',
                account_number: paymentMethod === 'bank_transfer'
                  ? '0001-23456789-01'
                  : paymentMethod === 'jazzcash'
                  ? '0308-1472888'
                  : '0344-5537788',
                iban: paymentMethod === 'bank_transfer'
                  ? 'PK36 HABB 0001 2345 6789 0101'
                  : paymentMethod === 'jazzcash'
                  ? 'JC-TILL-9922881'
                  : 'EP-TILL-7722119',
                instructions: paymentMethod === 'bank_transfer'
                  ? 'Official Resort Corporate Account. Transfer online via 1Link or visit any HBL branch.'
                  : `Transfer to ${paymentMethod === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} mobile wallet or till number.`,
              };

              return (
                <div className="bg-black/30 p-5 rounded-2xl space-y-3.5 text-xs border border-white/10">
                  <div className="flex items-center gap-2 text-[#E3B94E] font-bold">
                    <Building className="w-4 h-4 text-[#787C68]" />
                    <span>{activeAcc.bank_name}</span>
                  </div>

                  <div className="text-xs text-[#A8AD94] space-y-1.5 bg-white/5 p-3.5 rounded-xl border border-white/5 font-mono">
                    <p><span className="text-[#A8AD94] uppercase text-[10px] tracking-wider block font-sans">Account Title:</span> <strong className="text-[#EAEBE8] font-bold text-sm font-sans">{activeAcc.account_title}</strong></p>
                    <p><span className="text-[#A8AD94] uppercase text-[10px] tracking-wider block font-sans">{paymentMethod === 'bank_transfer' ? 'Account Number:' : 'Mobile / Till Number:'}</span> <strong className="text-[#E3B94E] text-sm tracking-wider">{activeAcc.account_number}</strong></p>
                    {activeAcc.iban && (
                      <p><span className="text-[#A8AD94] uppercase text-[10px] tracking-wider block font-sans">IBAN / Ref:</span> <strong className="text-[#EAEBE8] text-xs">{activeAcc.iban}</strong></p>
                    )}
                    {activeAcc.instructions && (
                      <p className="text-[11px] text-[#A8AD94] font-sans pt-1 border-t border-white/5">{activeAcc.instructions}</p>
                    )}
                  </div>

                  {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
                    <div>
                      <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                        Transaction ID / Mobile Reference #
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. JC-9922881 or EP-4411882"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] text-xs focus:border-[#787C68] focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                      Upload Deposit Receipt Slip (Optional now or upload later in guest portal)
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => setSlipFile(e.target.files[0])}
                      className="w-full text-xs text-[#A8AD94] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#787C68] file:text-[#232A23] file:font-semibold file:text-xs cursor-pointer"
                    />
                  </div>
                </div>
              );
            })()}
          </div>

        </div>

        {/* Right Col: Summary & Confirmation */}
        <div className="space-y-6">
          <div className="sticky top-28 bg-[#232A23] border border-white/10 p-6 sm:p-7 rounded-2xl space-y-6 shadow-2xl">
            
            <h3 className="font-display text-2xl text-[#EAEBE8] font-medium border-b border-white/10 pb-3">
              Reservation Summary
            </h3>

            {selectedRoom && (
              <div className="flex items-center space-x-3 pb-3 border-b border-white/5">
                <img src={selectedRoom.featured_image} alt={selectedRoom.title} className="w-16 h-12 rounded-xl object-cover shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#EAEBE8]">{selectedRoom.title}</h4>
                  <p className="text-[10px] text-[#A8AD94]">
                    {pricing?.total_nights || 1} Nights • {guestSelection.adults} Adults
                    {guestSelection.children > 0 ? ` • ${guestSelection.children} Children` : ''}
                    {roomsCount > 1 ? ` • ${roomsCount} Rooms` : ' • 1 Room'}
                  </p>
                </div>
              </div>
            )}

            {/* Line Items */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#A8AD94]">
                <span>Room Stay ({pricing?.total_nights || 1} nights × {roomsCount} {roomsCount > 1 ? 'rooms' : 'room'}):</span>
                <span className="text-[#EAEBE8] font-medium">PKR {roomTotal.toLocaleString()}</span>
              </div>

              {addonsTotal > 0 && (
                <div className="flex justify-between text-[#A8AD94]">
                  <span>Experiential Add-ons:</span>
                  <span className="text-[#EAEBE8] font-medium">PKR {addonsTotal.toLocaleString()}</span>
                </div>
              )}

              {/* Promo Code Box */}
              <div className="pt-2">
                <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Promo Code</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="OASIS10"
                    className="flex-1 bg-black/30 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPromo()}
                    disabled={validatingPromo}
                    className="px-3.5 py-1.5 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] text-xs font-semibold tracking-wider uppercase transition"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[10px] text-rose-400 mt-1">{promoError}</p>}
                {appliedPromo && (
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Code {appliedPromo.code} applied: -PKR {appliedPromo.discount_amount.toLocaleString()}
                  </p>
                )}
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold pt-1">
                  <span>Courtesy Discount:</span>
                  <span>- PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}

              {/* Final Net Total */}
              <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                <div>
                  <span className="text-xs uppercase font-bold text-[#EAEBE8] block">Total Amount</span>
                  <span className="text-[10px] text-[#A8AD94]">Taxes & Service included</span>
                </div>
                <span className="font-display text-3xl text-[#E3B94E] font-bold">
                  PKR {finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Confirm Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-semibold text-xs tracking-widest uppercase shadow-xl transition flex items-center justify-center space-x-2"
            >
              <span>{submitting ? 'Confirming Stay...' : 'Confirm & Reserve Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-[#A8AD94]/70 leading-relaxed">
              By confirming your reservation, you agree to Oasis Resort’s cancellation policies and stay terms.
            </p>

          </div>
        </div>

      </form>

    </div>
  );
}

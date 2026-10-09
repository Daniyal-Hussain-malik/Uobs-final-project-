import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { BookingStatusBadge, PaymentStatusBadge } from '../components/StatusBadge';
import StayDateRangePicker from '../components/StayDateRangePicker';
import GuestSelector from '../components/GuestSelector';
import {
  Calendar, Search, UserPlus, CheckCircle, LogIn, LogOut,
  Clock, AlertCircle, FileText, ExternalLink, RefreshCw,
  BedDouble, Sparkles, ShieldCheck, Phone, Mail, Check, X
} from 'lucide-react';

export default function ReceptionDashboard() {
  const [data, setData] = useState(null);
  const [matrixRooms, setMatrixRooms] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'matrix' | 'walkin' | 'in_house' | 'arrivals'
  const [loading, setLoading] = useState(true);

  // Walk-in Stay State
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [walkinDates, setWalkinDates] = useState({ checkIn: today, checkOut: tomorrow });
  const [walkinGuests, setWalkinGuests] = useState({ adults: 2, children: 0, infants: 0, rooms: 1 });
  const [availableWalkinRooms, setAvailableWalkinRooms] = useState([]);
  const [loadingAvailableRooms, setLoadingAvailableRooms] = useState(false);
  const [selectedWalkinRoom, setSelectedWalkinRoom] = useState(null);

  const [walkinForm, setWalkinForm] = useState({
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    guest_cnic_passport: '',
    payment_method: 'pay_at_hotel',
    payment_status: 'paid',
    special_requests: '',
  });
  const [submittingWalkin, setSubmittingWalkin] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const loadDashboard = async () => {
    try {
      let url = `/reception/dashboard?date=${filterDate}`;
      if (searchTerm) url += `&q=${encodeURIComponent(searchTerm)}`;
      const res = await api.get(url);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMatrix = async () => {
    try {
      const res = await api.get('/reception/rooms-matrix');
      if (res.success) {
        setMatrixRooms(res.rooms || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Search available rooms for walk-in (Excludes booked rooms)
  const searchWalkinAvailableRooms = async () => {
    if (!walkinDates.checkIn || !walkinDates.checkOut) return;
    setLoadingAvailableRooms(true);
    try {
      const res = await api.get(
        `/reception/available-rooms?check_in=${walkinDates.checkIn}&check_out=${walkinDates.checkOut}`
      );
      if (res.success) {
        setAvailableWalkinRooms(res.available_rooms || []);
        if (res.available_rooms.length > 0) {
          setSelectedWalkinRoom(res.available_rooms[0]);
        } else {
          setSelectedWalkinRoom(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAvailableRooms(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [filterDate, searchTerm]);

  useEffect(() => {
    if (activeTab === 'matrix') loadMatrix();
    if (activeTab === 'walkin') searchWalkinAvailableRooms();
  }, [activeTab, walkinDates.checkIn, walkinDates.checkOut]);

  // Update Housekeeping Status
  const handleUpdateHousekeeping = async (roomId, status) => {
    try {
      const res = await api.post(`/reception/rooms/${roomId}/housekeeping`, { status });
      if (res.success) {
        triggerToast(res.message);
        loadMatrix();
        loadDashboard();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to update housekeeping.');
    }
  };

  // Update Booking Status
  const handleUpdateStatus = async (bookingId, bookingStatus, paymentStatus = null) => {
    try {
      const res = await api.post(`/reception/bookings/${bookingId}/status`, {
        booking_status: bookingStatus,
        payment_status: paymentStatus,
      });
      if (res.success) {
        triggerToast(res.message);
        loadDashboard();
        if (activeTab === 'matrix') loadMatrix();
      }
    } catch (err) {
      triggerToast(err.message || 'Status update failed.');
    }
  };

  // Submit Walk-in Booking
  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWalkinRoom) {
      triggerToast('Please select an available room.');
      return;
    }
    setSubmittingWalkin(true);
    try {
      const payload = {
        ...walkinForm,
        room_id: selectedWalkinRoom.id,
        check_in: walkinDates.checkIn,
        check_out: walkinDates.checkOut,
        adults: walkinGuests.adults,
        children: walkinGuests.children,
      };

      const res = await api.post('/reception/walkin', payload);
      if (res.success) {
        triggerToast(res.message);
        setWalkinForm({
          guest_name: '',
          guest_phone: '',
          guest_email: '',
          guest_cnic_passport: '',
          payment_method: 'pay_at_hotel',
          payment_status: 'paid',
          special_requests: '',
        });
        loadDashboard();
        searchWalkinAvailableRooms();
        setActiveTab('in_house');
      }
    } catch (err) {
      triggerToast(err.message || 'Walk-in booking failed.');
    } finally {
      setSubmittingWalkin(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2C332C] flex items-center justify-center text-[#A8AD94]">
        Loading reception desk console...
      </div>
    );
  }

  const d = data || {};
  const m = d.metrics || {};

  return (
    <div className="min-h-screen bg-[#2C332C] text-[#EAEBE8] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#232A23] border border-[#787C68] text-[#EAEBE8] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Header & Operational Counters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#A8AD94] uppercase tracking-widest font-semibold">
                Front Desk Operations • Katpana
              </span>
              <span className="text-[10px] bg-[#787C68]/30 text-[#EAEBE8] px-2 py-0.5 rounded-full font-mono font-bold">
                RECEPTION
              </span>
            </div>
            <h1 className="font-script text-4xl sm:text-5xl text-[#EAEBE8] mt-1">
              Reception Concierge Desk
            </h1>
            <p className="text-xs text-[#A8AD94]">Manage upcoming check-ins, room cleaning/housekeeping, and walk-in registrations.</p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-3">
            <div className="bg-[#232A23] border border-white/10 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] text-[#A8AD94] uppercase block">Total Rooms</span>
              <span className="font-display text-xl text-[#EAEBE8] font-bold">{m.totalRooms}</span>
            </div>
            <div className="bg-[#232A23] border border-white/10 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] text-[#A8AD94] uppercase block">In-House Occupied</span>
              <span className="font-display text-xl text-[#E3B94E] font-bold">{m.occupiedCount}</span>
            </div>
            <div className="bg-[#232A23] border border-white/10 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] text-[#A8AD94] uppercase block">Available Vacant</span>
              <span className="font-display text-xl text-emerald-400 font-bold">{m.availableCount}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 bg-[#232A23] border border-white/10 p-1.5 rounded-2xl">
            {[
              { id: 'upcoming', label: `Upcoming Stays (${(d.upcoming || []).length})` },
              { id: 'matrix', label: 'Room Schedule & Housekeeping' },
              { id: 'walkin', label: 'Walk-in Guest Check-in' },
              { id: 'in_house', label: `In-House Guests (${(d.inHouse || []).length})` },
              { id: 'arrivals', label: `Today's Arrivals (${(d.arrivals || []).length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  activeTab === tab.id
                    ? 'bg-[#787C68] text-[#232A23] font-bold shadow-md'
                    : 'text-[#A8AD94] hover:text-[#EAEBE8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Guest Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#A8AD94] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search guest name, phone, CNIC..."
              className="w-full bg-[#232A23] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-[#EAEBE8] focus:border-[#787C68] outline-none"
            />
          </div>
        </div>

        {/* ================= TAB 1: UPCOMING BOOKINGS LIST ================= */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                  Upcoming Stays Directory
                </h2>
                <p className="text-xs text-[#A8AD94]">All future and upcoming guest arrivals from today onwards.</p>
              </div>
            </div>

            <div className="bg-[#232A23] border border-white/10 rounded-3xl p-6 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[#A8AD94]">
                    <th className="pb-3">Booking #</th>
                    <th className="pb-3">Guest Contact</th>
                    <th className="pb-3">Room</th>
                    <th className="pb-3">Stay Dates</th>
                    <th className="pb-3">Settlement</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Front Desk Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(d.upcoming || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-[#A8AD94]">
                        No upcoming bookings recorded for future dates.
                      </td>
                    </tr>
                  ) : (
                    (d.upcoming || []).map((b) => (
                      <tr key={b.id} className="hover:bg-white/5 transition">
                        <td className="py-3 font-mono font-bold text-[#E3B94E]">{b.booking_number}</td>
                        <td className="py-3">
                          <p className="font-semibold text-[#EAEBE8]">{b.guest_name}</p>
                          <p className="text-[11px] text-[#A8AD94]">{b.guest_phone}</p>
                          {b.guest_email && <p className="text-[10px] text-[#A8AD94]/70">{b.guest_email}</p>}
                        </td>
                        <td className="py-3">
                          <p className="text-[#EAEBE8] font-medium">{b.room_title}</p>
                          <span className="text-[10px] text-[#A8AD94] uppercase">{b.room_category}</span>
                        </td>
                        <td className="py-3">
                          <p className="text-[#EAEBE8]">{b.check_in} &rarr; {b.check_out}</p>
                          <p className="text-[10px] text-[#A8AD94]">{b.total_nights} Nights • {b.adults} Adults</p>
                        </td>
                        <td className="py-3">
                          <p className="font-bold text-[#E3B94E]">PKR {parseInt(b.final_total).toLocaleString()}</p>
                          <PaymentStatusBadge status={b.payment_status} method={b.payment_method} />
                        </td>
                        <td className="py-3">
                          <BookingStatusBadge status={b.booking_status} />
                        </td>
                        <td className="py-3 text-right space-x-2 whitespace-nowrap">
                          {b.booking_status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'checked_in')}
                              className="px-3 py-1.5 rounded-lg bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase transition shadow"
                            >
                              Check In Guest
                            </button>
                          )}
                          {b.booking_status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold text-xs uppercase"
                            >
                              Confirm Stay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ROOM SCHEDULE & HOUSEKEEPING MATRIX ================= */}
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                Room Schedule &amp; Housekeeping Status
              </h2>
              <p className="text-xs text-[#A8AD94]">
                Update room cleaning status (`ready to serve`, `cleaning`, `dirty`, `maintenance`) and view all future reservations by room.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matrixRooms.map((room) => (
                <div key={room.id} className="bg-[#232A23] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                  <div>
                    {/* Header with Title & Occupancy */}
                    <div className="flex justify-between items-start border-b border-white/10 pb-3">
                      <div>
                        <h3 className="font-display text-xl font-bold text-[#EAEBE8]">{room.title}</h3>
                        <span className="text-[10px] uppercase text-[#A8AD94]">{room.category}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                        room.is_currently_occupied
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {room.is_currently_occupied ? 'Occupied' : 'Vacant'}
                      </span>
                    </div>

                    {/* Housekeeping Status Switcher */}
                    <div className="py-3 space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-[#A8AD94] font-bold block">
                        Housekeeping Status:
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {[
                          { val: 'ready to serve', label: 'Ready to Serve', color: 'emerald' },
                          { val: 'cleaning', label: 'Cleaning', color: 'amber' },
                          { val: 'dirty', label: 'Dirty', color: 'orange' },
                          { val: 'maintenance', label: 'Maintenance', color: 'rose' },
                        ].map((st) => (
                          <button
                            key={st.val}
                            onClick={() => handleUpdateHousekeeping(room.id, st.val)}
                            className={`p-2 rounded-xl text-center font-bold uppercase tracking-wider transition border ${
                              room.housekeeping_status === st.val
                                ? 'bg-[#787C68] text-[#232A23] border-[#787C68] shadow-md'
                                : 'bg-white/5 text-[#A8AD94] border-white/5 hover:bg-white/10'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active & Future Bookings Schedule */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <span className="text-[10px] uppercase tracking-wider text-[#A8AD94] font-bold block">
                        Reserved Dates ({room.active_bookings?.length || 0}):
                      </span>

                      {(!room.active_bookings || room.active_bookings.length === 0) ? (
                        <p className="text-[11px] text-emerald-400 font-light italic">
                          No future bookings — completely free for walk-in guests!
                        </p>
                      ) : (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {room.active_bookings.map((ab) => (
                            <div key={ab.id} className="bg-[#1E241E] p-2 rounded-xl text-[11px] flex justify-between items-center">
                              <div>
                                <span className="font-bold text-[#EAEBE8] block">{ab.guest_name}</span>
                                <span className="text-[10px] text-[#A8AD94]">{ab.check_in} to {ab.check_out}</span>
                              </div>
                              <span className="font-mono text-[9px] text-[#E3B94E]">{ab.booking_number}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 text-[11px] text-[#A8AD94] flex justify-between">
                    <span>Base: PKR {parseInt(room.base_price).toLocaleString()}</span>
                    <span>Max: {room.capacity_adults} Adults</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: WALK-IN GUEST RESERVATION ================= */}
        {activeTab === 'walkin' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                Walk-in Front Desk Registration
              </h2>
              <p className="text-xs text-[#A8AD94]">
                Only available rooms (not booked on selected dates, and not in maintenance) are shown.
              </p>
            </div>

            {/* Step 1: Date & Guests Filter */}
            <div className="bg-[#232A23] border border-white/15 p-6 rounded-3xl space-y-4 shadow-xl">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8AD94] block">
                Step 1: Select Stay Dates &amp; Guests
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-[#A8AD94] block mb-1">Stay Dates (Check In — Check Out)</label>
                  <StayDateRangePicker
                    checkIn={walkinDates.checkIn}
                    checkOut={walkinDates.checkOut}
                    onChange={({ checkIn, checkOut }) => {
                      setWalkinDates({ checkIn, checkOut: checkOut || checkIn });
                    }}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A8AD94] block mb-1">Guests &amp; Rooms</label>
                  <GuestSelector
                    value={walkinGuests}
                    onChange={setWalkinGuests}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Available Rooms Selector */}
            <div className="bg-[#232A23] border border-white/15 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8AD94]">
                  Step 2: Choose Available Room
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  {availableWalkinRooms.length} Rooms Free for Dates
                </span>
              </div>

              {loadingAvailableRooms ? (
                <div className="py-6 text-center text-[#A8AD94]">Checking availability calendar...</div>
              ) : availableWalkinRooms.length === 0 ? (
                <div className="py-6 text-center text-rose-400 bg-[#1E241E] rounded-2xl p-4">
                  All rooms are reserved for the selected dates. Try adjusting stay dates.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {availableWalkinRooms.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedWalkinRoom(r)}
                      className={`p-3.5 rounded-2xl text-left transition border ${
                        selectedWalkinRoom?.id === r.id
                          ? 'bg-[#1E241E] border-[#787C68] shadow-lg ring-1 ring-[#787C68]'
                          : 'bg-[#1E241E]/60 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-[#EAEBE8]">{r.title}</span>
                        {selectedWalkinRoom?.id === r.id && <Check className="w-4 h-4 text-[#E3B94E]" />}
                      </div>
                      <span className="text-[10px] text-[#A8AD94] block uppercase">{r.category}</span>
                      <span className="text-xs font-bold text-[#E3B94E] mt-1 block">
                        PKR {parseInt(r.base_price).toLocaleString()} / night
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: Guest Registration Form */}
            {selectedWalkinRoom && (
              <form onSubmit={handleWalkinSubmit} className="bg-[#232A23] border border-white/15 p-6 rounded-3xl space-y-5 shadow-xl text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8AD94] block border-b border-white/10 pb-3">
                  Step 3: Walk-in Guest Information &amp; Immediate Check-in
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Guest Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Asad Ali Khan"
                      value={walkinForm.guest_name}
                      onChange={(e) => setWalkinForm({ ...walkinForm, guest_name: e.target.value })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="0300-1234567"
                      value={walkinForm.guest_phone}
                      onChange={(e) => setWalkinForm({ ...walkinForm, guest_phone: e.target.value })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">CNIC / Passport #</label>
                    <input
                      type="text"
                      placeholder="71501-XXXXXXX-X"
                      value={walkinForm.guest_cnic_passport}
                      onChange={(e) => setWalkinForm({ ...walkinForm, guest_cnic_passport: e.target.value })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="guest@gmail.com"
                      value={walkinForm.guest_email}
                      onChange={(e) => setWalkinForm({ ...walkinForm, guest_email: e.target.value })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Payment Method</label>
                    <select
                      value={walkinForm.payment_method}
                      onChange={(e) => setWalkinForm({ ...walkinForm, payment_method: e.target.value })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    >
                      <option value="pay_at_hotel">Cash at Reception</option>
                      <option value="jazzcash">JazzCash (0308-1472888)</option>
                      <option value="easypaisa">Easypaisa (0344-5537788)</option>
                      <option value="bank_transfer">Bank Transfer / Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Payment Status</label>
                    <select
                      value={walkinForm.payment_status}
                      onChange={(e) => setWalkinForm({ ...walkinForm, payment_status: e.target.value })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    >
                      <option value="paid">Paid &amp; Collected</option>
                      <option value="pending">Pending (Pay upon Check-out)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={submittingWalkin}
                    className="px-6 py-3 rounded-2xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{submittingWalkin ? 'Registering...' : 'Register & Check In Walk-in Guest'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ================= TAB 4: IN-HOUSE GUESTS ================= */}
        {activeTab === 'in_house' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
              Currently Staying In-House ({d.inHouse?.length || 0})
            </h2>

            <div className="bg-[#232A23] border border-white/10 rounded-3xl p-6 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[#A8AD94]">
                    <th className="pb-3">Room</th>
                    <th className="pb-3">Guest Contact</th>
                    <th className="pb-3">Check In &rarr; Check Out</th>
                    <th className="pb-3">Settlement</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(d.inHouse || []).map((b) => (
                    <tr key={b.id} className="hover:bg-white/5 transition">
                      <td className="py-3 font-semibold text-[#EAEBE8]">{b.room_title}</td>
                      <td className="py-3">
                        <p className="font-semibold text-[#EAEBE8]">{b.guest_name}</p>
                        <p className="text-[11px] text-[#A8AD94]">{b.guest_phone}</p>
                      </td>
                      <td className="py-3 text-[#A8AD94]">{b.check_in} &rarr; {b.check_out}</td>
                      <td className="py-3 font-bold text-[#E3B94E]">PKR {parseInt(b.final_total).toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'completed', 'paid')}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold text-xs uppercase transition"
                        >
                          Check Out Guest
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: TODAY'S ARRIVALS ================= */}
        {activeTab === 'arrivals' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
              Arrivals Due Today ({d.arrivals?.length || 0})
            </h2>

            <div className="bg-[#232A23] border border-white/10 rounded-3xl p-6 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[#A8AD94]">
                    <th className="pb-3">Booking #</th>
                    <th className="pb-3">Guest</th>
                    <th className="pb-3">Room</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(d.arrivals || []).map((b) => (
                    <tr key={b.id} className="hover:bg-white/5 transition">
                      <td className="py-3 font-mono font-bold text-[#E3B94E]">{b.booking_number}</td>
                      <td className="py-3">
                        <p className="font-semibold text-[#EAEBE8]">{b.guest_name}</p>
                        <p className="text-[11px] text-[#A8AD94]">{b.guest_phone}</p>
                      </td>
                      <td className="py-3 text-[#EAEBE8]">{b.room_title}</td>
                      <td className="py-3"><BookingStatusBadge status={b.booking_status} /></td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'checked_in')}
                          className="px-3 py-1.5 rounded-lg bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase"
                        >
                          Check In Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

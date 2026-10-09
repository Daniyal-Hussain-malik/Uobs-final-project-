import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BookingStatusBadge, PaymentStatusBadge } from '../components/StatusBadge';
import {
  Calendar, Upload, Star, XCircle, FileText, CheckCircle,
  AlertCircle, ArrowRight, ShieldCheck, Clock, MessageSquareQuote, Send
} from 'lucide-react';

export default function GuestDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [metrics, setMetrics] = useState({ totalStays: 0, upcomingStays: 0 });
  const [loading, setLoading] = useState(true);

  // Modal States
  const [activeSlipBooking, setActiveSlipBooking] = useState(null);
  const [slipFile, setSlipFile] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [uploadingSlip, setUploadingSlip] = useState(false);

  const [activeReviewBooking, setActiveReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [toastMsg, setToastMsg] = useState('');

  const loadData = async () => {
    try {
      const res = await api.get('/guest/dashboard');
      if (res.success) {
        setBookings(res.bookings || []);
        setMetrics(res.metrics || { totalStays: 0, upcomingStays: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Upload Slip
  const handleUploadSlip = async (e) => {
    e.preventDefault();
    if (!slipFile || !activeSlipBooking) return;
    setUploadingSlip(true);
    try {
      const fd = new FormData();
      fd.append('payment_slip', slipFile);
      if (transactionId) fd.append('payment_transaction_id', transactionId);

      const res = await api.post(`/guest/bookings/${activeSlipBooking.id}/slip`, fd);
      if (res.success) {
        triggerToast('Receipt slip uploaded successfully! Front Desk will verify your slip.');
        setActiveSlipBooking(null);
        setSlipFile(null);
        setTransactionId('');
        loadData();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to upload receipt.');
    } finally {
      setUploadingSlip(false);
    }
  };

  // Cancel Booking
  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation per resort cancellation policy?')) return;
    try {
      const res = await api.post(`/guest/bookings/${bookingId}/cancel`, {
        reason: 'Guest self-service cancellation via portal',
      });
      if (res.success) {
        triggerToast(res.message);
        loadData();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to cancel reservation.');
    }
  };

  // Submit Feedback / Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!activeReviewBooking) return;
    setSubmittingReview(true);
    try {
      const res = await api.post(`/guest/bookings/${activeReviewBooking.id}/review`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      if (res.success) {
        triggerToast(res.message || 'Thank you! Your feedback has been submitted.');
        setActiveReviewBooking(null);
        setReviewComment('');
        loadData();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2C332C] flex items-center justify-center text-[#A8AD94]">
        Loading your guest portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2C332C] text-[#EAEBE8] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#232A23] border border-[#787C68] text-[#EAEBE8] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header & Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-[11px] text-[#A8AD94] uppercase tracking-widest font-semibold block mb-1">
              Guest Portal • Katpana Cold Desert
            </span>
            <h1 className="font-script text-4xl sm:text-5xl text-[#EAEBE8]">
              Welcome, {user?.name}
            </h1>
            <p className="text-xs text-[#A8AD94] mt-1">Review your reservations, upload payment slips, and share your stay feedback.</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-[#232A23] border border-white/10 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] text-[#A8AD94] uppercase block">Upcoming Stays</span>
              <span className="font-display text-xl text-[#E3B94E] font-bold">{metrics.upcomingStays}</span>
            </div>
            <div className="bg-[#232A23] border border-white/10 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] text-[#A8AD94] uppercase block">Completed Stays</span>
              <span className="font-display text-xl text-emerald-400 font-bold">{metrics.totalStays}</span>
            </div>
            <Link
              to="/book"
              className="px-5 py-2.5 rounded-2xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider transition shadow-lg"
            >
              Book Stay
            </Link>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          <h2 className="font-display text-2xl text-[#EAEBE8] font-bold">
            Your Reservations
          </h2>

          {bookings.length === 0 ? (
            <div className="bg-[#232A23] border border-white/10 p-12 text-center rounded-3xl space-y-4 shadow-xl">
              <Calendar className="w-10 h-10 text-[#787C68] mx-auto opacity-70" />
              <h3 className="font-display text-2xl text-[#EAEBE8]">No Reservations Found</h3>
              <p className="text-xs text-[#A8AD94] max-w-sm mx-auto">
                You do not have any active reservations under your account. Explore our luxury rooms and suites today!
              </p>
              <Link
                to="/rooms"
                className="inline-block px-5 py-2.5 rounded-full bg-[#787C68] text-[#232A23] font-bold text-xs uppercase tracking-wider hover:bg-[#868B74] transition"
              >
                Browse Residences
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {bookings.map((b) => {
                // Eligible for review if completed OR today is check_out day or later (and not cancelled)
                const canLeaveFeedback = !b.review_id && (b.booking_status === 'completed' || (b.check_out <= today && b.booking_status !== 'cancelled'));

                return (
                  <div key={b.id} className="bg-[#232A23] p-6 sm:p-7 rounded-3xl border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
                    
                    {/* Room & Dates */}
                    <div className="flex items-start space-x-4">
                      <img src={b.room_image} alt={b.room_title} className="w-24 h-24 rounded-2xl object-cover shrink-0 border border-white/10" />
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#E3B94E]">{b.booking_number}</span>
                          <BookingStatusBadge status={b.booking_status} />
                        </div>
                        <h3 className="font-display text-xl font-bold text-[#EAEBE8]">{b.room_title}</h3>
                        <p className="text-xs text-[#A8AD94]">
                          {b.check_in} to {b.check_out} ({b.total_nights} Nights • {b.adults} Adults{b.children > 0 ? `, ${b.children} Children` : ''})
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-xs">
                          <PaymentStatusBadge status={b.payment_status} method={b.payment_method} />
                          <span className="font-bold text-[#E3B94E]">PKR {parseInt(b.final_total).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10">
                      
                      {/* Printable Voucher link */}
                      <Link
                        to={`/booking/${b.booking_number}/confirmation`}
                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#EAEBE8] transition flex items-center gap-1.5 border border-white/10"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#787C68]" />
                        <span>View Voucher</span>
                      </Link>

                      {/* Upload Bank Slip */}
                      {b.payment_method === 'bank_transfer' && (
                        <button
                          onClick={() => setActiveSlipBooking(b)}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#E3B94E] transition flex items-center gap-1.5 border border-white/10"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{b.payment_slip_path ? 'Update Receipt' : 'Upload Slip'}</span>
                        </button>
                      )}

                      {/* Write Review Option (Shown on check-out day or completed stay) */}
                      {canLeaveFeedback && (
                        <button
                          onClick={() => setActiveReviewBooking(b)}
                          className="px-4 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-xs font-bold text-[#232A23] transition flex items-center gap-1.5 shadow-md"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>Give Feedback</span>
                        </button>
                      )}

                      {b.review_id && (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                          <CheckCircle className="w-3.5 h-3.5" /> Feedback Submitted
                        </span>
                      )}

                      {/* Cancel if pending or confirmed */}
                      {['pending', 'confirmed'].includes(b.booking_status) && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition border border-rose-500/20"
                        >
                          Cancel Stay
                        </button>
                      )}

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL: Submit Guest Review / Feedback */}
        {activeReviewBooking && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquareQuote className="w-5 h-5 text-[#E3B94E]" />
                  <h3 className="font-display text-xl text-[#EAEBE8] font-bold">Share Your Experience</h3>
                </div>
                <button
                  onClick={() => setActiveReviewBooking(null)}
                  className="text-[#A8AD94] hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <p className="text-xs text-[#A8AD94]">
                  Room: <strong className="text-[#EAEBE8]">{activeReviewBooking.room_title}</strong>
                </p>
                <p className="text-[11px] text-[#A8AD94]">
                  Stay Dates: {activeReviewBooking.check_in} to {activeReviewBooking.check_out}
                </p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                {/* Star rating selector */}
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1.5">
                    Your Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setReviewRating(num)}
                        className={`p-2 rounded-xl transition flex items-center gap-1 ${
                          reviewRating >= num
                            ? 'bg-[#E3B94E]/20 text-[#E3B94E] border border-[#E3B94E]/40'
                            : 'bg-white/5 text-[#A8AD94] hover:bg-white/10'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${reviewRating >= num ? 'fill-current' : ''}`} />
                        <span className="text-[11px] font-bold">{num}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment textarea */}
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Your Review &amp; Comments
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about the hospitality, floor heating, food, stargazing, and overall experience..."
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl p-3 text-[#EAEBE8] focus:border-[#787C68] outline-none text-xs"
                  />
                  <p className="text-[10px] text-[#A8AD94] mt-1">
                    Once approved by resort management, your review will be published to the website.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveReviewBooking(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingReview ? 'Submitting...' : 'Submit Feedback'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Upload Bank Transfer Slip */}
        {activeSlipBooking && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-md w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-display text-xl text-[#EAEBE8] font-bold">Upload Deposit Receipt</h3>
                <button onClick={() => setActiveSlipBooking(null)} className="text-[#A8AD94] hover:text-white text-lg font-bold">✕</button>
              </div>

              <p className="text-xs text-[#A8AD94]">
                Attach your bank transaction receipt or online screenshot for booking reference{' '}
                <strong className="text-[#E3B94E] font-mono">{activeSlipBooking.booking_number}</strong>.
              </p>

              <form onSubmit={handleUploadSlip} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Receipt File (JPG, PNG, PDF)</label>
                  <input
                    type="file"
                    required
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setSlipFile(e.target.files[0])}
                    className="w-full text-xs text-[#A8AD94] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#787C68] file:text-[#232A23] file:font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Bank Transaction / Ref #</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. HBL-TRX-12345"
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveSlipBooking(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingSlip}
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider transition"
                  >
                    {uploadingSlip ? 'Uploading...' : 'Submit Receipt'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import React from 'react';

export function BookingStatusBadge({ status }) {
  const styles = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    confirmed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    checked_in: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    completed: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    cancelled: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };

  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    checked_in: 'Checked In',
    completed: 'Stay Completed',
    cancelled: 'Cancelled',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
        styles[status] || 'bg-white/10 text-white border-white/20'
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

export function PaymentStatusBadge({ status, method }) {
  const styles = {
    paid: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    verified: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    refunded: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
        styles[status] || 'bg-white/10 text-white border-white/20'
      }`}
    >
      {status} {method ? `(${method.replace(/_/g, ' ')})` : ''}
    </span>
  );
}

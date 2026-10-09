import React, { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/themes/dark.css';
import { Calendar } from 'lucide-react';

export default function StayDateRangePicker({
  checkIn,
  checkOut,
  onChange,
  className = '',
  placeholder = 'Select Check-in — Check-out',
}) {
  const inputRef = useRef(null);
  const fpRef = useRef(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const defaultDates = [];
    if (checkIn) defaultDates.push(checkIn);
    if (checkOut) defaultDates.push(checkOut);

    fpRef.current = flatpickr(inputRef.current, {
      mode: 'range',
      minDate: 'today',
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'M j, Y',
      defaultDate: defaultDates.length > 0 ? defaultDates : undefined,
      showMonths: 2,
      locale: {
        rangeSeparator: '  —  ',
      },
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          const start = selectedDates[0].toISOString().split('T')[0];
          const end = selectedDates[1].toISOString().split('T')[0];
          const nights = Math.max(1, Math.round((selectedDates[1] - selectedDates[0]) / (1000 * 60 * 60 * 24)));
          onChange({ checkIn: start, checkOut: end, nights });
        } else if (selectedDates.length === 1) {
          const start = selectedDates[0].toISOString().split('T')[0];
          onChange({ checkIn: start, checkOut: '', nights: 0 });
        }
      },
    });

    return () => {
      if (fpRef.current) {
        fpRef.current.destroy();
      }
    };
  }, []);

  // Sync external props change
  useEffect(() => {
    if (fpRef.current && checkIn && checkOut) {
      fpRef.current.setDate([checkIn, checkOut], false);
    }
  }, [checkIn, checkOut]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Calendar className="w-4 h-4 text-[#787C68] absolute left-3.5 z-10 pointer-events-none" />
      <input
        ref={inputRef}
        placeholder={placeholder}
        className="w-full bg-[#1E241E] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#EAEBE8] focus:border-[#787C68] focus:outline-none cursor-pointer"
        readOnly
      />
    </div>
  );
}

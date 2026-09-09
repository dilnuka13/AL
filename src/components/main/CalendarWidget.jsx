import React, { useState } from 'react';
import Icons from '../common/Icons';
import { SRI_LANKAN_HOLIDAYS_MAP } from '../../lib/holidays';

export const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
    setSelectedDate(null);
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div
      className="glass rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-xl max-w-md mx-auto animate__animated animate__fadeInUp border transition-colors"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)'
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'var(--card-glass)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)'
          }}
          aria-label="Previous Month"
        >
          <Icons.ChevronLeft size={18} />
        </button>
        <h3
          className="text-xl md:text-2xl font-bold flex items-center gap-2 font-heading"
          style={{ color: 'var(--text-main)' }}
        >
          <span className="text-emerald-500">{monthName}</span> {year}
        </h3>
        <button
          onClick={() => changeMonth(1)}
          className="p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'var(--card-glass)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)'
          }}
          aria-label="Next Month"
        >
          <Icons.ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-3 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span
            key={d}
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const holiday = SRI_LANKAN_HOLIDAYS_MAP[dateStr];
          const isToday =
            new Date().toDateString() === new Date(year, month, day).toDateString();

          return (
            <div
              key={day}
              onClick={() => setSelectedDate(holiday ? dateStr : null)}
              className={`aspect-square rounded-xl md:rounded-2xl flex flex-col items-center justify-center relative cursor-pointer transition-all duration-200 hover:scale-105 border ${
                isToday
                  ? 'bg-emerald-600 text-white shadow-md border-transparent font-bold'
                  : 'hover:border-emerald-500'
              } ${holiday?.type === 'poya' ? 'border-amber-400 bg-amber-400/10' : ''} ${
                holiday?.type === 'public' ? 'border-red-400 bg-red-400/10' : ''
              }`}
              style={{
                backgroundColor: isToday
                  ? undefined
                  : holiday?.type === 'poya'
                  ? 'rgba(245, 158, 11, 0.12)'
                  : holiday?.type === 'public'
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'var(--card-glass)',
                borderColor: isToday ? undefined : holiday ? undefined : 'var(--border-color)',
                color: isToday ? '#ffffff' : 'var(--text-main)'
              }}
            >
              <span className="text-xs md:text-sm font-bold">{day}</span>
              {holiday && (
                <div className="absolute bottom-1.5 flex gap-0.5">
                  {holiday.type === 'poya' ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.8)]"></div>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        className="mt-6 pt-5 border-t min-h-[4rem] text-center rounded-2xl p-3 border"
        style={{
          backgroundColor: 'var(--card-glass)',
          borderColor: 'var(--border-color)'
        }}
      >
        {selectedDate && SRI_LANKAN_HOLIDAYS_MAP[selectedDate] ? (
          <div className="animate__animated animate__fadeIn">
            <p
              className={`text-sm font-bold mb-0.5 ${
                SRI_LANKAN_HOLIDAYS_MAP[selectedDate].type === 'poya'
                  ? 'text-amber-500'
                  : 'text-red-500'
              }`}
            >
              {SRI_LANKAN_HOLIDAYS_MAP[selectedDate].name}
            </p>
            <p className="text-[11px] capitalize font-mono tracking-wide" style={{ color: 'var(--text-muted)' }}>
              {SRI_LANKAN_HOLIDAYS_MAP[selectedDate].type} Holiday
            </p>
          </div>
        ) : (
          <div
            className="flex justify-center gap-6 text-xs h-full items-center font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" /> Poya Day
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm" /> Public Holiday
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarWidget;

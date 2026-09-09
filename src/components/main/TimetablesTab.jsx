import React from 'react';
import Icons from '../common/Icons';
import CalendarWidget from './CalendarWidget';
import usePageTitle from '../../hooks/usePageTitle';

export const TimetablesTab = ({ timetablePdf, examDates }) => {
  usePageTitle('Exam Schedules & Smart Calendar | DE Education.lk');

  return (
    <div className="max-w-6xl mx-auto animate__animated animate__fadeIn pb-16">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 text-xs font-bold uppercase tracking-widest mb-4">
          <Icons.Calendar size={13} /> Official Schedules
        </div>
        <h2
          className="text-3xl md:text-5xl font-extrabold mb-4 font-heading"
          style={{ color: 'var(--text-main)' }}
        >
          Exam Schedules & Smart Calendar
        </h2>
        <p
          className="max-w-xl mx-auto mb-8 text-base md:text-lg font-light"
          style={{ color: 'var(--text-muted)' }}
        >
          Stay prepared with official dates, poya days, public holidays, and key deadlines.
        </p>

        {timetablePdf?.link && (
          <a
            href={timetablePdf.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg hover:-translate-y-1 hover:scale-105 border-t border-white/20"
          >
            <Icons.Download size={20} />
            <span>Download Official Timetable ({timetablePdf.year || '2025/2026'})</span>
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        {/* Left Column: Upcoming Key Dates */}
        <div
          className="glass rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border shadow-xl transition-colors"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <h3
            className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-3 font-heading"
            style={{ color: 'var(--text-main)' }}
          >
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-500 border border-purple-500/20">
              <Icons.Calendar size={20} />
            </div>
            <span>Upcoming Exam Dates</span>
          </h3>

          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
            {examDates && examDates.length > 0 ? (
              examDates.map((date, idx) => (
                <div
                  key={date.id || idx}
                  style={{
                    animationDelay: `${idx * 100}ms`,
                    backgroundColor: 'var(--card-glass)',
                    borderColor: 'var(--border-color)'
                  }}
                  className="flex items-center gap-5 p-5 rounded-2xl border transition-all animate__animated animate__fadeInUp hover:-translate-y-0.5 group"
                >
                  <div
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl shadow-inner border shrink-0 ${
                      date.type === 'Exam'
                        ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                        : 'bg-red-500/15 text-red-500 border-red-500/30'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                      {new Date(date.date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-2xl font-bold leading-none mt-1 font-mono">
                      {new Date(date.date).getDate()}
                    </span>
                  </div>

                  <div>
                    <h4
                      className="font-bold text-base md:text-lg group-hover:text-emerald-500 transition-colors"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {date.details}
                    </h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                          date.type === 'Exam'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-500 border-red-500/30'
                        }`}
                      >
                        {date.type}
                      </span>
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        Year {new Date(date.date).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="text-center py-20 rounded-2xl border border-dashed"
                style={{
                  backgroundColor: 'var(--card-glass)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-muted)'
                }}
              >
                No scheduled exam dates found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calendar Widget */}
        <div>
          <CalendarWidget />
        </div>
      </div>
    </div>
  );
};

export default TimetablesTab;

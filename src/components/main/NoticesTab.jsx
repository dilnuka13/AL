import React from 'react';
import Icons from '../common/Icons';
import usePageTitle from '../../hooks/usePageTitle';

export const NoticesTab = ({ notices }) => {
  usePageTitle('Announcements & Official Notices | DE Education.lk');

  return (
    <div className="max-w-4xl mx-auto animate__animated animate__fadeIn pb-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-widest mb-4">
          <Icons.Bell size={13} /> Official Bulletins
        </div>
        <h2
          className="text-3xl md:text-5xl font-extrabold mb-4 font-heading"
          style={{ color: 'var(--text-main)' }}
        >
          Announcements & Notices
        </h2>
        <p className="text-base md:text-lg font-light" style={{ color: 'var(--text-muted)' }}>
          Official news, examination updates, and student advisories.
        </p>
      </div>

      <div className="grid gap-6">
        {notices && notices.length > 0 ? (
          notices.map((n, idx) => (
            <div
              key={n.id || idx}
              style={{
                animationDelay: `${idx * 100}ms`,
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
              className="glass p-6 md:p-8 rounded-[2rem] border relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 animate__animated animate__fadeInUp shadow-lg"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-2 ${
                  n.type === 'important'
                    ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : n.type === 'opportunity'
                    ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                }`}
              ></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pl-3">
                <h3
                  className="font-bold text-lg md:text-2xl group-hover:text-emerald-500 transition-colors font-heading"
                  style={{ color: 'var(--text-main)' }}
                >
                  {n.title}
                </h3>
                <span
                  className="text-[10px] font-mono font-bold tracking-wider px-3 py-1 rounded-lg border w-fit"
                  style={{
                    backgroundColor: 'var(--card-glass)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)'
                  }}
                >
                  {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Recent'}
                </span>
              </div>

              <p
                className="text-sm md:text-base leading-relaxed pl-3 whitespace-pre-wrap font-light"
                style={{ color: 'var(--text-muted)' }}
              >
                {n.body}
              </p>
            </div>
          ))
        ) : (
          <div
            className="text-center py-20 rounded-3xl border border-dashed"
            style={{
              backgroundColor: 'var(--card-glass)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-muted)'
            }}
          >
            <Icons.Bell size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-bold">No announcements posted yet</p>
            <p className="text-xs mt-1">Check back later for exam updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticesTab;

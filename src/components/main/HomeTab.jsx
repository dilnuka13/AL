import React from 'react';
import { Link } from 'react-router-dom';
import Icons from '../common/Icons';
import usePageTitle from '../../hooks/usePageTitle';

export const HomeTab = ({ sysUpdateMsg }) => {
  usePageTitle("DE Education.lk | Sri Lanka's Best A/L Education Platform");

  const currentYear = new Date().getFullYear();

  const featureCards = [
    {
      to: '/papers',
      icon: Icons.BookOpen,
      tag: 'Past Papers',
      badge: `Archive Library`,
      label: 'G.C.E. A/L Past Papers',
      desc: 'Download official exam papers & marking schemes with instant access.',
      gradient: 'from-emerald-500/20 to-teal-500/5',
      iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    },
    {
      to: '/results',
      icon: Icons.Award,
      tag: 'Verification',
      badge: 'Official Doenets',
      label: 'Exam Results Portal',
      desc: 'Verify Advanced Level examination index results via official government services.',
      gradient: 'from-blue-500/20 to-cyan-500/5',
      iconBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    },
    {
      to: '/timetables',
      icon: Icons.Calendar,
      tag: 'Schedules',
      badge: `${currentYear - 1}/${currentYear} Academic`,
      label: 'Exam Dates & Calendar',
      desc: 'Comprehensive calendar with Poya holidays, exam dates & timetable downloads.',
      gradient: 'from-purple-500/20 to-indigo-500/5',
      iconBg: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    },
    {
      to: '/notices',
      icon: Icons.Bell,
      tag: 'Announcements',
      badge: 'Live Bulletins',
      label: 'Official Notices',
      desc: 'Stay informed with circulars, Department announcements, and education news.',
      gradient: 'from-amber-500/20 to-orange-500/5',
      iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    }
  ];

  return (
    <div className="py-2 animate__animated animate__fadeIn">
      {/* Compact & Sleek Hero Banner */}
      <div
        className="w-full border rounded-3xl md:rounded-[2.5rem] p-6 sm:p-8 md:p-10 mb-8 text-left relative overflow-hidden shadow-xl animate__animated animate__zoomIn group glass transition-colors"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-[11px] uppercase tracking-wider mb-4 backdrop-blur-md">
            <span>🚀 Future of A/L Learning</span>
          </div>

          <h2
            className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 leading-tight tracking-tight font-heading"
            style={{ color: 'var(--text-main)' }}
          >
            Shape Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-glow">
              Future Today
            </span>
          </h2>

          <p
            className="text-xs sm:text-sm md:text-base max-w-xl mb-6 leading-relaxed font-light"
            style={{ color: 'var(--text-muted)' }}
          >
            Access Sri Lanka's largest free database of G.C.E. A/L past papers, marking schemes, and exam resources organized by stream and subject.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/papers"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-600/30 transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 text-xs sm:text-sm"
            >
              <span>Explore Past Papers</span>
              <Icons.ArrowRight size={14} />
            </Link>
            <Link
              to="/timetables"
              className="py-3 px-6 rounded-xl transition-all border backdrop-blur-md flex items-center gap-2 text-xs sm:text-sm font-bold hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--card-glass)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-main)'
              }}
            >
              <Icons.Calendar size={14} className="text-emerald-500" />
              <span>Exam Timetables</span>
            </Link>
          </div>
        </div>
      </div>

      {/* System Announcement Banner (If active) */}
      {sysUpdateMsg && (
        <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-1 animate__animated animate__fadeInUp backdrop-blur-md shadow-lg">
          <div className="w-full h-full rounded-xl p-4 sm:p-5 flex items-start sm:items-center gap-4">
            <div className="bg-amber-500/20 p-2.5 rounded-xl text-amber-500 animate-pulse border border-amber-500/30 shrink-0">
              <Icons.Bell size={20} />
            </div>
            <div>
              <h4 className="font-bold text-amber-500 text-[11px] uppercase tracking-wider mb-0.5">
                System Announcement
              </h4>
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                {sysUpdateMsg.message}
              </p>
              {sysUpdateMsg.date && (
                <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                  Posted: {sysUpdateMsg.date}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Premium Feature Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 animate__animated animate__fadeInUp">
        {featureCards.map((item, index) => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              animationDelay: `${index * 80}ms`,
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
            className="p-6 md:p-7 rounded-3xl cursor-pointer group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 border glass flex flex-col justify-between"
          >
            <div className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br ${item.gradient} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`}></div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md ${item.iconBg}`}
                >
                  <item.icon size={22} />
                </div>
                <span
                  className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full border"
                  style={{
                    backgroundColor: 'var(--card-glass)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)'
                  }}
                >
                  {item.badge}
                </span>
              </div>

              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-1">
                {item.tag}
              </span>

              <h3
                className="text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors font-heading leading-snug"
                style={{ color: 'var(--text-main)' }}
              >
                {item.label}
              </h3>

              <p
                className="text-xs font-light leading-relaxed mb-6"
                style={{ color: 'var(--text-muted)' }}
              >
                {item.desc}
              </p>
            </div>

            <div
              className="pt-4 border-t flex items-center justify-between"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <span className="text-xs font-semibold text-emerald-500">
                Browse Resources
              </span>
              <div className="w-7 h-7 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:translate-x-1 text-emerald-500">
                <Icons.ArrowRight size={13} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomeTab;

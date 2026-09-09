import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackgroundEffects from '../components/common/BackgroundEffects';
import supabase from '../lib/supabase';
import Icons from '../components/common/Icons';

export const MaintenancePage = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'maintenance')
          .single();
        if (data?.value?.endTime) {
          setEndTime(new Date(data.value.endTime).getTime());
        } else {
          setEndTime(new Date().getTime() + 86400000);
        }
      } catch (e) {
        setEndTime(new Date().getTime() + 86400000);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!endTime) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;
      if (distance < 0) {
        clearInterval(timer);
        window.location.href = '/';
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black text-gray-200">
      <BackgroundEffects />
      <div className="relative z-10 glass p-10 md:p-14 rounded-[2rem] max-w-xl w-full text-center shadow-2xl animate__animated animate__zoomIn border border-white/5 bg-black/60 backdrop-blur-2xl">
        <div className="animate-float mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30 shadow-[0_0_80px_rgba(16,185,129,0.2)]">
            <i className="fas fa-tools text-5xl text-emerald-400"></i>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-white mb-4 animate__animated animate__fadeInUp">
          Upgrade in Progress
        </h1>
        <p className="text-gray-400 mb-10 font-light text-base md:text-lg">
          We are enhancing DE Education to serve you better. We'll be back online shortly!
        </p>

        <div className="flex justify-center gap-3 sm:gap-4 mb-8">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div
              key={unit}
              className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/5 min-w-[70px] sm:min-w-[85px] backdrop-blur-md shadow-lg"
            >
              <span className="text-3xl sm:text-4xl font-bold text-emerald-400 font-mono">
                {String(value).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 mt-2">{unit}</span>
            </div>
          ))}
        </div>

        <div
          className="pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-xs"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        >
          <span>DE Education Support: isaradilnuka@gmail.com</span>
          <span className="font-mono opacity-60">Status: Scheduled Maintenance</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;

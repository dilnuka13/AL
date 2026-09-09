import React from 'react';

export const BackgroundEffects = () => {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-colors duration-500 no-print bg-effects"
      style={{ backgroundColor: 'var(--bg-color)' }}
    >
      {/* Dynamic Theme Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[150px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[150px] animate-blob animation-delay-2000"></div>
      <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-teal-500/5 rounded-full blur-[120px] animate-pulse-slow"></div>

      {/* Subtle Grid Overlay */}
      <div
        className="absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_30%,transparent_100%)]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, var(--border-color) 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      ></div>
    </div>
  );
};

export default BackgroundEffects;

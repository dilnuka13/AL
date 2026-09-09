import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeSwitcher = () => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 text-xs font-bold shadow-sm"
        style={{
          backgroundColor: 'var(--card-glass)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-main)'
        }}
        title={`Current Theme: ${currentTheme.label}`}
        aria-label="Theme selector"
      >
        <i className={`fas ${currentTheme.icon} text-emerald-500`}></i>
        <span className="hidden sm:inline capitalize">{currentTheme.label}</span>
        <i className={`fas fa-chevron-down text-[10px] text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-2xl border p-1.5 shadow-2xl z-50 animate__animated animate__fadeIn animate__faster backdrop-blur-xl"
          style={{
            backgroundColor: 'var(--modal-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isSelected ? 'text-emerald-500 bg-emerald-500/10' : 'hover:bg-white/5'
                }`}
                style={{
                  color: isSelected ? 'var(--accent)' : 'var(--text-main)'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <i className={`fas ${t.icon} w-4 text-center`}></i>
                  <div>
                    <span className="block font-bold">{t.label}</span>
                    <span className="block text-[10px] text-gray-400 font-normal">{t.desc}</span>
                  </div>
                </div>
                {isSelected && <i className="fas fa-check text-xs text-emerald-500"></i>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;

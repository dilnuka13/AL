import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import Icons from '../common/Icons';
import ThemeSwitcher from '../common/ThemeSwitcher';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/', label: 'Home', exact: true },
    { to: '/papers', label: 'Past Papers' },
    { to: '/results', label: 'Results' },
    { to: '/timetables', label: 'Schedules' },
    { to: '/notices', label: 'Notices' },
    { to: '/apps', label: 'Apps' }
  ];

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-3 shadow-xl backdrop-blur-xl border-b'
          : 'bg-transparent py-5'
      }`}
      style={{
        backgroundColor: isScrolled ? 'var(--header-bg)' : 'transparent',
        borderColor: isScrolled ? 'var(--header-border)' : 'transparent'
      }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3.5 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-xl blur opacity-40 group-hover:opacity-100 transition-opacity animate-pulse-slow"></div>
              <div className="w-11 h-11 md:w-12 md:h-12 relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg border border-white/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6">
                DE
              </div>
            </div>
            <div>
              <h1
                className="text-lg md:text-xl font-bold leading-none tracking-tight font-heading"
                style={{ color: 'var(--text-main)' }}
              >
                DE Education<span className="text-emerald-500">.lk</span>
              </h1>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] group-hover:underline transition-colors mt-0.5">
                Future Learning
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center p-1.5 rounded-full border backdrop-blur-md shadow-lg"
            style={{
              backgroundColor: 'var(--card-glass)',
              borderColor: 'var(--border-color)'
            }}
          >
            {navItems.map((item) => {
              const isActive =
                item.exact
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 relative ${
                    isActive
                      ? 'text-white bg-emerald-600 shadow-md shadow-emerald-600/30'
                      : 'hover:text-emerald-500'
                  }`}
                  style={{
                    color: isActive ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Theme Switcher & Mobile Menu Toggle */}
          <div className="flex items-center gap-2.5">
            <ThemeSwitcher />

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl border transition-all active:scale-95 shadow-sm"
              style={{
                backgroundColor: 'var(--card-glass)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-main)'
              }}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <Icons.X size={18} /> : <Icons.Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden border-b absolute w-full animate__animated animate__fadeInDown z-50 py-4 shadow-2xl backdrop-blur-2xl"
          style={{
            backgroundColor: 'var(--modal-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="container mx-auto px-6 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.exact
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block w-full text-left px-5 py-3.5 rounded-xl text-sm font-bold border-l-4 transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                      : 'border-transparent text-gray-400 hover:bg-white/5'
                  }`}
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text-main)'
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

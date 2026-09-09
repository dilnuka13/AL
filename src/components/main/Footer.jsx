import React, { useState } from 'react';
import Icons from '../common/Icons';

export const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);
  const currentYear = new Date().getFullYear();
  const copyrightYear = `${currentYear - 1}/${currentYear}`;

  return (
    <>
      <footer
        className="border-t py-12 mt-auto relative z-10 transition-colors"
        style={{
          backgroundColor: 'var(--card-glass)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-muted)'
        }}
      >
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-sm">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div
              className="flex items-center gap-3 font-bold text-lg"
              style={{ color: 'var(--text-main)' }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-xs shadow-md">
                DE
              </div>
              DE Education.lk
            </div>
            <span className="font-mono text-xs opacity-75">
              © {copyrightYear} All Rights Reserved. Sri Lanka.
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="uppercase tracking-widest text-[10px] font-bold opacity-75">
              Created By
            </span>
            <a
              href="https://isaradilnuka.web.app/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-500 hover:text-emerald-400 font-bold text-base transition-colors hover:underline flex items-center gap-2 group"
            >
              <img
                src="https://isaradilnuka.web.app/titlebar.png"
                alt="Isara Dilnuka Logo"
                className="w-6 h-6 rounded-full object-cover border border-emerald-500/30 shadow-sm group-hover:scale-110 transition-transform"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span>Isara Dilnuka</span>
              <Icons.ExternalLink size={12} />
            </a>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveModal('terms')}
              className="hover:text-emerald-500 transition-colors"
            >
              Terms
            </button>
            <button
              onClick={() => setActiveModal('privacy')}
              className="hover:text-emerald-500 transition-colors"
            >
              Privacy
            </button>
          </div>
        </div>
      </footer>

      {/* Terms & Privacy Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate__animated animate__fadeIn">
          <div
            className="border rounded-[2.5rem] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 md:p-12 relative shadow-2xl animate__animated animate__zoomIn"
            style={{
              backgroundColor: 'var(--modal-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)'
            }}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 p-3 rounded-full border transition-colors opacity-70 hover:opacity-100"
              style={{
                backgroundColor: 'var(--card-glass)',
                borderColor: 'var(--border-color)'
              }}
              aria-label="Close modal"
            >
              <Icons.X size={18} />
            </button>

            <div
              className="flex items-center gap-5 mb-8 pb-6 border-b"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-lg">
                {activeModal === 'terms' ? <Icons.FileText size={26} /> : <Icons.Shield size={26} />}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-heading">
                {activeModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h2>
            </div>

            <div
              className="text-sm leading-relaxed space-y-6"
              style={{ color: 'var(--text-muted)' }}
            >
              {activeModal === 'terms' ? (
                <>
                  <div>
                    <h4
                      className="font-bold text-base mb-2"
                      style={{ color: 'var(--text-main)' }}
                    >
                      1. Educational Purpose
                    </h4>
                    <p>
                      DE Education is a platform designed exclusively for educational assistance for Sri Lankan Advanced Level students. All past papers and marking schemes are shared for study and educational reference.
                    </p>
                  </div>
                  <div>
                    <h4
                      className="font-bold text-base mb-2"
                      style={{ color: 'var(--text-main)' }}
                    >
                      2. User Responsibility
                    </h4>
                    <p>
                      Users are encouraged to download and practice past papers responsibly for examination preparation.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4
                      className="font-bold text-base mb-2"
                      style={{ color: 'var(--text-main)' }}
                    >
                      1. Data Privacy
                    </h4>
                    <p>
                      We do not track or sell personal student browsing data. Past papers and marking schemes are directly accessible.
                    </p>
                  </div>
                  <div>
                    <h4
                      className="font-bold text-base mb-2"
                      style={{ color: 'var(--text-main)' }}
                    >
                      2. Security
                    </h4>
                    <p>
                      Administrative and management features are protected with encryption and biometric authorization.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div
              className="mt-8 pt-6 border-t flex justify-end"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <button
                onClick={() => setActiveModal(null)}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;

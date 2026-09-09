import React from 'react';
import Icons from '../common/Icons';
import usePageTitle from '../../hooks/usePageTitle';

export const AppsTab = ({ appLinks }) => {
  usePageTitle('Download Android & Windows Apps | DE Education.lk');

  const androidApp = appLinks.find((a) => a.platform === 'android');
  const pcApp = appLinks.find((a) => a.platform === 'pc');

  return (
    <div className="max-w-6xl mx-auto animate__animated animate__fadeIn pb-16">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold uppercase tracking-widest mb-4">
          <Icons.Download size={13} /> Official Client Downloads
        </div>
        <h2
          className="text-3xl md:text-5xl font-extrabold mb-4 font-heading"
          style={{ color: 'var(--text-main)' }}
        >
          Download Our Apps
        </h2>
        <p
          className="text-base md:text-lg max-w-2xl mx-auto font-light"
          style={{ color: 'var(--text-muted)' }}
        >
          Enjoy an enhanced student experience with dedicated applications for Android and Windows PC.
          Faster loading, offline paper reading, and smooth performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mb-16">
        {/* Android Card */}
        <div
          className="glass p-8 md:p-12 rounded-3xl md:rounded-[3rem] border transition-all duration-300 group relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 blur-3xl"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-emerald-500 mb-6 border shadow-lg group-hover:scale-110 transition-transform"
              style={{
                backgroundColor: 'var(--card-glass)',
                borderColor: 'var(--border-color)'
              }}
            >
              <i className="fab fa-android text-4xl md:text-5xl"></i>
            </div>

            <h3
              className="text-2xl md:text-3xl font-bold mb-2 font-heading"
              style={{ color: 'var(--text-main)' }}
            >
              Android App
            </h3>
            <p className="text-sm mb-6 font-medium" style={{ color: 'var(--text-muted)' }}>
              For Android Smartphones & Tablets
            </p>

            {androidApp ? (
              <div className="w-full space-y-4">
                <div
                  className="inline-block px-4 py-1 rounded-full text-xs font-mono mb-2 border"
                  style={{
                    backgroundColor: 'var(--card-glass)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--accent)'
                  }}
                >
                  Version: {androidApp.version}
                </div>
                <a
                  href={androidApp.download_link}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:scale-[1.02]"
                >
                  <Icons.Download size={22} /> Download APK
                </a>
              </div>
            ) : (
              <div
                className="w-full py-4 rounded-2xl font-bold border border-dashed text-xs tracking-wider uppercase opacity-60"
                style={{
                  backgroundColor: 'var(--card-glass)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-muted)'
                }}
              >
                Available Soon
              </div>
            )}
          </div>
        </div>

        {/* Windows PC Card */}
        <div
          className="glass p-8 md:p-12 rounded-3xl md:rounded-[3rem] border transition-all duration-300 group relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 blur-3xl"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-blue-500 mb-6 border shadow-lg group-hover:scale-110 transition-transform"
              style={{
                backgroundColor: 'var(--card-glass)',
                borderColor: 'var(--border-color)'
              }}
            >
              <i className="fab fa-windows text-4xl md:text-5xl"></i>
            </div>

            <h3
              className="text-2xl md:text-3xl font-bold mb-2 font-heading"
              style={{ color: 'var(--text-main)' }}
            >
              Desktop App
            </h3>
            <p className="text-sm mb-6 font-medium" style={{ color: 'var(--text-muted)' }}>
              For Windows 10 & 11 PCs / Laptops
            </p>

            {pcApp ? (
              <div className="w-full space-y-4">
                <div
                  className="inline-block px-4 py-1 rounded-full text-xs font-mono mb-2 border text-blue-500"
                  style={{
                    backgroundColor: 'var(--card-glass)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  Version: {pcApp.version}
                </div>
                <a
                  href={pcApp.download_link}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:scale-[1.02]"
                >
                  <Icons.Download size={22} /> Download EXE
                </a>
              </div>
            ) : (
              <div
                className="w-full py-4 rounded-2xl font-bold border border-dashed text-xs tracking-wider uppercase opacity-60"
                style={{
                  backgroundColor: 'var(--card-glass)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-muted)'
                }}
              >
                Available Soon
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div
        className="glass p-6 md:p-8 rounded-[2rem] border flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto shadow-md"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-500 border border-purple-500/20 shrink-0">
            <Icons.Shield size={28} />
          </div>
          <div>
            <h4 className="text-lg font-bold font-heading" style={{ color: 'var(--text-main)' }}>
              100% Secure & Verified
            </h4>
            <p className="text-xs md:text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Our client applications are virus-free, secure, and optimized for Sri Lankan students.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppsTab;

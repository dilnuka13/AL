import React, { useRef, useEffect } from 'react';

export const CameraModal = ({ isOpen, onClose, scanText, videoRef, canvasRef }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 flex flex-col items-center justify-center animate__animated animate__fadeIn p-4 backdrop-blur-md">
      <div className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <span className="text-white font-mono text-xs flex items-center">
          <i className="fas fa-circle text-red-500 animate-pulse mr-2"></i>
          LIVE FEED
        </span>
        <button
          onClick={onClose}
          className="text-white bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm transition-colors"
        >
          Close
        </button>
      </div>

      <div className="relative w-full max-w-md aspect-[3/4] md:aspect-video bg-black overflow-hidden rounded-3xl border-2 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full transform scale-x-[-1]"
        />

        {/* Scan Frame */}
        <div className="absolute inset-0 border-[30px] border-black/50 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-emerald-500 rounded-3xl opacity-60">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1"></div>
        </div>

        {/* Scan line effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan"></div>

        <div className="absolute bottom-6 left-0 w-full text-center px-4">
          <span className="inline-block bg-black/80 backdrop-blur-md text-emerald-400 px-5 py-2.5 rounded-full text-xs font-mono font-bold border border-emerald-500/30 shadow-lg">
            {scanText || 'Initializing Camera...'}
          </span>
        </div>
      </div>
      <p className="text-gray-400 text-xs mt-6 px-4 text-center max-w-sm">
        Please position your face steadily within the frame with adequate lighting.
      </p>
    </div>
  );
};

export default CameraModal;

import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[300] space-y-2 pointer-events-none flex flex-col items-end">
        {toasts.map((t) => {
          const isError = t.type === 'error';
          const isSuccess = t.type === 'success';
          return (
            <div
              key={t.id}
              className={`pointer-events-auto pl-4 pr-6 py-3 rounded-xl shadow-2xl text-sm font-bold animate__animated animate__slideInUp flex items-center gap-3 min-w-[220px] border border-white/10 ${
                isError
                  ? 'bg-red-600 text-white'
                  : isSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white'
              }`}
            >
              <i
                className={`fas ${
                  isError
                    ? 'fa-exclamation-circle text-white'
                    : isSuccess
                    ? 'fa-check-circle text-white'
                    : 'fa-info-circle text-emerald-400'
                }`}
              />
              <span>{t.msg}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return { showToast: (msg) => console.log(msg) };
  }
  return context;
};

export default ToastProvider;

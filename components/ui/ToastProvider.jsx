"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext({ notify: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const notify = useCallback((opts) => {
    const id = Math.random().toString(36).slice(2);
    const toast = { id, variant: opts.variant || 'info', message: opts.message || '', duration: opts.duration || 3000 };
    setToasts((t) => [...t, toast]);
    if (toast.duration > 0) setTimeout(() => remove(id), toast.duration);
  }, [remove]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-96 max-w-[90vw] flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`pointer-events-auto rounded-md px-4 py-3 text-sm shadow-md ${
            t.variant === 'success' ? 'bg-green-600 text-white' :
            t.variant === 'error' ? 'bg-red-600 text-white' :
            t.variant === 'warning' ? 'bg-yellow-500 text-neutral-900' : 'bg-neutral-900 text-white'
          }`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}



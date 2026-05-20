import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Icon, IconName } from './Icon';

interface ToastItem {
  id: string;
  msg: string;
  icon: IconName;
}

type ToastFn = (msg: string, opts?: { icon?: IconName; duration?: number }) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback<ToastFn>((msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, icon: opts.icon ?? 'check' }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), opts.duration ?? 2400);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div className="toast" key={t.id}>
            <Icon name={t.icon} size={16} strokeWidth={2.2} />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

import { useEffect, useState } from 'react';

interface Toast {
  id: number;
  message: string;
}

let toastId = 0;
let addToastFn: ((msg: string) => void) | null = null;

export function showToast(msg: string) {
  addToastFn?.(msg);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (message: string) => {
      const id = ++toastId;
      setToasts(prev => [...prev, { id, message }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };
    return () => { addToastFn = null; };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className="bg-surface-raised border border-primary px-6 py-3 font-mono text-sm animate-slide-in-right">
          {'> '}{t.message}
        </div>
      ))}
    </div>
  );
}

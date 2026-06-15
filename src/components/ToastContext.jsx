/* eslint-disable react-refresh/only-export-components */
/**
 * Toast notification system — a lightweight global toast queue
 * that shows success/error/info/warning notifications.
 * Usage: import { useToast } from './ToastContext' and call addToast(msg, type).
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

/** @typedef {{ id: number, message: string, type: 'success'|'error'|'info'|'warning', duration?: number }} Toast */

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', color: '#10b981', Icon: CheckCircle2 },
  error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  color: '#ef4444', Icon: AlertCircle },
  info:    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', color: '#3b82f6', Icon: Info },
  warning: { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)',  color: '#f59e0b', Icon: AlertTriangle },
};

let _toastId = 0;

/**
 * ToastProvider — wrap your app in this to enable toasts.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState(/** @type {Toast[]} */ ([]));

  /**
   * Add a toast notification.
   * @param {string} message
   * @param {'success'|'error'|'info'|'warning'} [type='info']
   * @param {number} [duration=3500]
   */
  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  /**
   * Remove a toast by id.
   * @param {number} id
   */
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Individual animated toast item.
 * @param {{ toast: Toast, onRemove: (id: number) => void }} props
 */
function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const { Icon } = style;

  useEffect(() => {
    // Animate in
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    const exitTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 350);
    }, toast.duration || 3500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      style={{
        pointerEvents: 'all',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-secondary)',
        border: `1px solid ${style.border}`,
        borderLeft: `4px solid ${style.color}`,
        borderRadius: 14,
        padding: '12px 16px',
        minWidth: 260, maxWidth: 360,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(12px)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(40px)',
        transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <Icon size={18} color={style.color} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
        {toast.message}
      </span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', display: 'flex', padding: 2, borderRadius: 6
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

/**
 * useToast — hook to access addToast from any component.
 * @returns {{ addToast: (msg: string, type?: string, duration?: number) => void }}
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}


import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  LuCircleCheck,
  LuCircleAlert,
  LuInfo,
  LuLoaderCircle,
  LuX,
} from 'react-icons/lu';

const ToastContext = createContext(null);

const icons = {
  success: LuCircleCheck,
  error: LuCircleAlert,
  info: LuInfo,
  loading: LuLoaderCircle,
};

export function ToastProvider({children}) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success', duration) => {
      const id = `${Date.now()}-${Math.random()}`;

      setToasts((current) => [
        ...current,
        {id, message, type, duration},
      ]);

      return id;
    },
    [],
  );

  return (
    <ToastContext.Provider value={{showToast, removeToast}}>
      {children}

      <div className="rch-toast-container" aria-label="Notifications">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({toast, onClose}) {
  const {message, type, duration} = toast;
  const Icon = icons[type] || LuInfo;

  useEffect(() => {
    if (type === 'loading' || duration === 0) return;

    const timer = setTimeout(onClose, duration ?? 2800);
    return () => clearTimeout(timer);
  }, [onClose, type, duration]);

  return (
    <div
      className={`rch-toast rch-toast--${type}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <Icon
        size={21}
        className={type === 'loading' ? 'rch-toast-spinner' : ''}
      />

      <span className="rch-toast-message">{message}</span>

      <button
        type="button"
        className="rch-toast-close"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        <LuX size={17} />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}

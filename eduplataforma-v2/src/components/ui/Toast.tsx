import React from 'react'
import { X } from 'lucide-react'
import { useAppStore } from '../../stores/appStore'

const TOAST_STYLES = {
  info:  'bg-primary-bg dark:bg-primary/20 text-primary border-primary/20',
  xp:    'bg-amber-bg dark:bg-amber/20 text-amber border-amber/20',
  sync:  'bg-mint-bg dark:bg-mint/20 text-mint border-mint/20',
  error: 'bg-danger-bg dark:bg-danger/20 text-danger border-danger/20'
}

export default function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts)
  const removeToast = useAppStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-4 flex flex-col gap-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-modal border animate-slide-up ${TOAST_STYLES[toast.tipo]}`}
        >
          <span className="text-sm font-medium font-body">{toast.mensaje}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

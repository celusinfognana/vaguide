import React from 'react'
import { Check, AlertCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success' }) {
  const bgColor = {
    success: 'bg-accent-success',
    error: 'bg-accent-danger',
    warning: 'bg-accent-warning',
    info: 'bg-accent-chat',
  }[type]

  const Icon = {
    success: Check,
    error: X,
    warning: AlertCircle,
    info: AlertCircle,
  }[type]

  return (
    <div className="fixed bottom-6 right-6 toast-enter z-40">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}>
        <Icon size={20} />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  )
}

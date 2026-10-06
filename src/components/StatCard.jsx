import React from 'react'

export default function StatCard({ label, value, icon: Icon, color = 'bg-blue-50' }) {
  return (
    <div className={`${color} p-4 rounded-lg border border-gray-200`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-secondary">{label}</span>
        {Icon && <Icon size={20} className="text-gray-400" />}
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
    </div>
  )
}

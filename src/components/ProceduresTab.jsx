import React from 'react'
import { Check, Play } from 'lucide-react'

export default function ProceduresTab({ proceduresInCategory, onSelectProcedure, selectedProcedure }) {
  if (!proceduresInCategory || proceduresInCategory.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No procedures in this category</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {proceduresInCategory.map(proc => (
        <div
          key={proc.id}
          className={`p-4 border rounded-xl transition-all h-full flex flex-col ${
            selectedProcedure === proc.id
              ? 'bg-blue-50 border-accent-blue shadow-soft'
              : 'bg-white border-border-light hover:shadow-soft'
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-semibold text-text-primary text-sm leading-snug truncate">{proc.name}</h3>
              {proc.verified && <Check size={16} className="text-accent-success flex-shrink-0" />}
            </div>
            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
              proc.channel === 'chat'
                ? 'bg-accent-chat/10 text-accent-chat'
                : proc.channel === 'call'
                ? 'bg-accent-call/10 text-accent-call'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {proc.channel.charAt(0).toUpperCase() + proc.channel.slice(1)}
            </span>
          </div>

          <p className="text-sm text-text-secondary mb-4 line-clamp-3">{proc.description}</p>

          <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-border-light">
            <span className="text-xs text-text-secondary">{proc.steps?.length || 0} steps</span>
            <button
              onClick={() => onSelectProcedure(proc.id)}
              className="px-3 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
            >
              <Play size={14} />
              Run
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

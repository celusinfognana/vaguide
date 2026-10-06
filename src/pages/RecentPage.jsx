import React from 'react'
import { Clock, ChevronRight } from 'lucide-react'
import { mockRecentItems } from '../data/mockData'

export default function RecentPage({ onPropertySelect }) {
  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2 flex items-center gap-2">
            <Clock size={32} className="text-accent-call" />
            Recent Items
          </h1>
          <p className="text-lg text-text-secondary">
            Quick access to items you've recently viewed.
          </p>
        </div>

        {/* Recent Items List */}
        <div className="space-y-3">
          {mockRecentItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.type === 'property') {
                  onPropertySelect(item.id)
                }
              }}
              className="w-full p-4 bg-white border border-border-light rounded-lg hover:shadow-soft transition-all text-left flex items-center justify-between"
            >
              <div className="flex items-start gap-4 flex-1">
                <Clock size={18} className="text-text-secondary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">{item.name}</h3>
                  <p className="text-sm text-text-secondary mt-1">{item.property}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-secondary whitespace-nowrap">{item.time}</span>
                <ChevronRight size={18} className="text-text-secondary" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

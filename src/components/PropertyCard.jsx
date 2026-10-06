import React from 'react'
import { Star, ChevronRight } from 'lucide-react'

export default function PropertyCard({
  property,
  onSelect,
  onToggleFavorite,
  isFavorite,
}) {
  return (
    <div
      onClick={() => onSelect(property.id)}
      className="p-4 bg-white border border-border-light rounded-lg hover:shadow-medium transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: property.color }}
          ></div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm group-hover:text-accent-blue">
              {property.name}
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              {property.procedureCount} procedures
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(property.id, 'property')
          }}
          className="p-1"
        >
          <Star
            size={16}
            className={isFavorite ? 'fill-accent-warning text-accent-warning' : 'text-gray-300'}
          />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <div className="text-xs">
          <span className="text-text-secondary">Verified: </span>
          <span className="font-medium text-text-primary">
            {property.verifiedCount}/{property.procedureCount}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-accent-success h-1.5 rounded-full"
            style={{ width: `${(property.verifiedCount / property.procedureCount) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border-light">
        <span className="text-xs text-text-secondary">{property.status}</span>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-accent-blue" />
      </div>
    </div>
  )
}

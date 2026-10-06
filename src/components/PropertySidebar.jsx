import React, { useState } from 'react'
import { Search, Star } from 'lucide-react'

export default function PropertySidebar({
  properties,
  selectedProperty,
  onSelectProperty,
  onPropertySelect,
  onToggleFavorite,
  favorites,
}) {
  const [searchQuery, setSearchQuery] = useState('')
 const filteredProperties = properties.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePropertyClick = (propId) => {
    onSelectProperty(propId)
    onPropertySelect()
  }

  return (
    <div className="w-56 bg-white border-r border-border-light flex flex-col mt-16">
      {/* Header */}
      <div className="p-4 border-b border-border-light">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Collections</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-0"
          />
        </div>
      </div>

      {/* Properties List */}
      <div className="flex-1 overflow-y-auto">
        {filteredProperties.length === 0 ? (
          <div className="p-4 text-center text-text-secondary text-sm">
            No properties found
          </div>
        ) : (
          filteredProperties.map(property => (
            <div
              key={property.id}
              onClick={() => handlePropertyClick(property.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handlePropertyClick(property.id)
                }
              }}
              role="button"
              tabIndex={0}
              className={`w-full px-4 py-3 text-left border-l-4 transition-colors cursor-pointer ${
                selectedProperty === property.id
                  ? 'bg-blue-50 border-l-accent-blue'
                  : 'border-l-transparent hover:bg-bg-light'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: property.color }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-text-primary truncate">
                    {property.name}
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    {property.procedureCount} procedures
                  </div>
                  <div className="text-xs text-text-secondary">
                    {property.verifiedCount}/{property.procedureCount} verified
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(property.id, 'property')
                  }}
                  className="flex-shrink-0 p-1"
                >
                  <Star
                    size={16}
                    className={`${
                      favorites[property.id] || property.isFavorite
                        ? 'fill-accent-warning text-accent-warning'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status Bar */}
      <div className="p-3 border-t border-border-light bg-bg-light text-xs text-text-secondary">
        <div>{filteredProperties.length} of {properties.length} properties</div>
      </div>
    </div>
  )
}

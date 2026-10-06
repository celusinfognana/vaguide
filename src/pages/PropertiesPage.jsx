import React, { useState } from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'
import PropertyCard from '../components/PropertyCard'

export default function PropertiesPage({
  properties,
  favorites,
  onPropertySelect,
  onToggleFavorite,
  onShowToast,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const filteredProperties = properties
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'procedures') return b.procedureCount - a.procedureCount
      if (sortBy === 'verified') return b.verifiedCount - a.verifiedCount
      return 0
    })

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Properties</h1>
          <p className="text-lg text-text-secondary">
            Browse and manage property-specific support information.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 flex gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-xs relative">
            <Search size={18} className="absolute left-3 top-2.5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-light border border-border-light rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <button className="px-4 py-2 bg-bg-light border border-border-light rounded-lg text-text-primary hover:bg-gray-100 flex items-center gap-2">
              <Filter size={18} />
              Filter
            </button>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-bg-light border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue appearance-none pr-8"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center'
              }}
            >
              <option value="all">All Properties</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-bg-light border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue appearance-none pr-8"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center'
              }}
            >
              <option value="name">Sort by Name</option>
              <option value="procedures">Sort by Procedures</option>
              <option value="verified">Sort by Verified</option>
            </select>
          </div>
        </div>

        {/* Properties Grid */}
        <div>
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg mb-2">No properties found</p>
              <p className="text-text-secondary">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-text-secondary mb-4">
                Showing {filteredProperties.length} of {properties.length} properties
              </div>
              <div className="grid grid-cols-4 gap-4">
                {filteredProperties.map(property => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onSelect={onPropertySelect}
                    onToggleFavorite={onToggleFavorite}
                    isFavorite={favorites[property.id] || property.isFavorite}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

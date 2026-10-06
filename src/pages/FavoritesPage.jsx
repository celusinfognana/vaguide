import React from 'react'
import { Star } from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import { mockFavorites } from '../data/mockData'

export default function FavoritesPage({
  favorites,
  allProperties,
  onToggleFavorite,
  onShowToast,
}) {
  const favoriteProperties = allProperties.filter(p => p.isFavorite || favorites[p.id])
  const favoriteProcedures = mockFavorites.filter(f => f.type === 'procedure')

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2 flex items-center gap-2">
            <Star size={32} className="text-accent-warning" />
            My Favorites
          </h1>
          <p className="text-lg text-text-secondary">
            Quick access to your saved properties and procedures.
          </p>
        </div>

        {/* Favorite Properties */}
        {favoriteProperties.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Properties</h2>
            <div className="grid grid-cols-4 gap-4">
              {favoriteProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={() => {}}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Favorite Procedures */}
        {favoriteProcedures.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Procedures</h2>
            <div className="space-y-3">
              {favoriteProcedures.map(proc => (
                <div key={proc.id} className="p-4 bg-white border border-border-light rounded-lg hover:shadow-soft transition-all flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star size={18} className="fill-accent-warning text-accent-warning" />
                    <div>
                      <h3 className="font-medium text-text-primary">{proc.name}</h3>
                      <p className="text-sm text-text-secondary">{proc.property}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {favoriteProperties.length === 0 && favoriteProcedures.length === 0 && (
          <div className="text-center py-12">
            <Star size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-text-secondary text-lg mb-2">No favorites yet</p>
            <p className="text-text-secondary">Star items to save them for quick access</p>
          </div>
        )}
      </div>
    </div>
  )
}

import React from 'react'
import { Search, Star, Clock, Zap, AlertCircle } from 'lucide-react'
import StatCard from '../components/StatCard'
import PropertyCard from '../components/PropertyCard'

export default function HomePage({
  allProperties,
  favorites,
  onPropertySelect,
  onToggleFavorite,
  onShowToast,
}) {
  const favoriteProperties = allProperties.filter(p => p.isFavorite || favorites[p.id])
  const recentProperties = allProperties.slice(0, 6)

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Good morning</h1>
          <p className="text-lg text-text-secondary">
            Find the right property procedure and resolve guest requests quickly.
          </p>
        </div>

        {/* Global Search Suggestion */}
        <div className="mb-8 p-6 bg-blue-50 border border-accent-blue rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Search className="text-accent-blue" size={24} />
            <h3 className="text-lg font-semibold text-text-primary">Quick Search Examples</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-text-secondary">
            <p>• "guest wants early check-in"</p>
            <p>• "lock code not working"</p>
            <p>• "guest wants refund"</p>
            <p>• "AC is not cooling"</p>
            <p>• "guest left an item"</p>
            <p>• "late checkout request"</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 border border-accent-blue rounded-lg hover:bg-blue-100 transition-colors text-left">
              <Search className="text-accent-blue mb-2" size={24} />
              <div className="font-medium text-text-primary">Search Procedures</div>
              <div className="text-sm text-text-secondary">Find any workflow</div>
            </button>
            <button className="p-4 bg-green-50 border border-accent-success rounded-lg hover:bg-green-100 transition-colors text-left">
              <Zap className="text-accent-success mb-2" size={24} />
              <div className="font-medium text-text-primary">Browse Properties</div>
              <div className="text-sm text-text-secondary">View all 50+ properties</div>
            </button>
            <button className="p-4 bg-yellow-50 border border-accent-warning rounded-lg hover:bg-yellow-100 transition-colors text-left">
              <Star className="text-accent-warning mb-2" size={24} />
              <div className="font-medium text-text-primary">View Favorites</div>
              <div className="text-sm text-text-secondary">Your saved items</div>
            </button>
            <button className="p-4 bg-purple-50 border border-accent-call rounded-lg hover:bg-purple-100 transition-colors text-left">
              <Clock className="text-accent-call mb-2" size={24} />
              <div className="font-medium text-text-primary">Recent Items</div>
              <div className="text-sm text-text-secondary">Recently viewed</div>
            </button>
          </div>
        </div>

        {/* Recent Properties */}
        {recentProperties.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Recent Properties</h2>
            <div className="grid grid-cols-3 gap-4">
              {recentProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={onPropertySelect}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={favorites[property.id] || property.isFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {/* Frequently Used */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Frequently Used Procedures</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-border-light rounded-lg hover:shadow-medium transition-all cursor-pointer">
              <div className="text-sm font-medium text-text-primary">Early Check-in</div>
              <div className="text-xs text-text-secondary mt-1">AGI Holdings</div>
              <div className="mt-2 inline-block text-xs bg-accent-chat/10 text-accent-chat px-2 py-1 rounded">Chat</div>
            </div>
            <div className="p-4 bg-white border border-border-light rounded-lg hover:shadow-medium transition-all cursor-pointer">
              <div className="text-sm font-medium text-text-primary">Late Check-out</div>
              <div className="text-xs text-text-secondary mt-1">Air MGMT</div>
              <div className="mt-2 inline-block text-xs bg-accent-chat/10 text-accent-chat px-2 py-1 rounded">Chat</div>
            </div>
            <div className="p-4 bg-white border border-border-light rounded-lg hover:shadow-medium transition-all cursor-pointer">
              <div className="text-sm font-medium text-text-primary">Lock Code Not Working</div>
              <div className="text-xs text-text-secondary mt-1">Barron Management</div>
              <div className="mt-2 inline-block text-xs bg-accent-call/10 text-accent-call px-2 py-1 rounded">Call & Chat</div>
            </div>
          </div>
        </div>

        {/* Needs Attention */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-accent-warning" />
            Needs Attention
          </h2>
          <div className="space-y-3">
            <div className="p-4 bg-yellow-50 border border-accent-warning rounded-lg">
              <div className="font-medium text-text-primary">7 procedures need verification</div>
              <div className="text-sm text-text-secondary mt-1">Last updated 2 weeks ago</div>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-300 rounded-lg">
              <div className="font-medium text-text-primary">3 properties have outdated information</div>
              <div className="text-sm text-text-secondary mt-1">Review rules and procedures</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

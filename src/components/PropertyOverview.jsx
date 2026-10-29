import React from 'react'
import { Check, AlertCircle, Eye } from 'lucide-react'

export default function PropertyOverview({ property, overview, proceduresInCategory, onSelectProcedure }) {
  const categories = [...new Set(proceduresInCategory?.map(p => p.category) || [])]

  // Group procedures by category for popular procedures
  const categoryCounts = {}
  proceduresInCategory?.forEach(proc => {
    categoryCounts[proc.category] = (categoryCounts[proc.category] || 0) + 1
  })

  const popularProcedures = proceduresInCategory?.slice(0, 8) || []
  const quickRules = overview?.quickRules || {}
  const quickRuleFields = [
    ['earliestCheckIn', 'Earliest Check-in'],
    ['latestCheckOut', 'Latest Check-out'],
    ['petFee', 'Pet Fee'],
    ['maximumOccupancy', 'Max Overnight'],
  ].filter(([key]) => quickRules[key])

  return (
    <div className="space-y-8">
      {(overview?.summary || overview?.propertyHighlights) && (
        <section>
          {overview.title && <h3 className="text-lg font-semibold text-text-primary mb-3">{overview.title}</h3>}
          {overview.summary && <p className="text-sm text-text-secondary leading-relaxed mb-3">{overview.summary}</p>}
          {overview.propertyHighlights && (
            <>
              {overview.propertyHighlightsTitle && (
                <h4 className="text-sm font-semibold text-text-primary mb-2">{overview.propertyHighlightsTitle}</h4>
              )}
              <ul className="space-y-2 text-sm text-text-secondary">
                {String(overview.propertyHighlights).split('\n').filter(Boolean).map((highlight, index) => (
                  <li key={index} className="leading-relaxed">{highlight}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-accent-blue">
          <div className="text-3xl font-bold text-accent-blue">{property.procedureCount}</div>
          <div className="text-sm text-text-secondary mt-1">Procedures</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-accent-success">
          <div className="text-3xl font-bold text-accent-success">{property.verifiedCount}</div>
          <div className="text-sm text-text-secondary mt-1">Verified</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-accent-warning">
          <div className="text-3xl font-bold text-accent-warning">{property.procedureCount - property.verifiedCount}</div>
          <div className="text-sm text-text-secondary mt-1">Unverified</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-accent-call">
          <div className="text-3xl font-bold text-accent-call">{categories.length}</div>
          <div className="text-sm text-text-secondary mt-1">Categories</div>
        </div>
      </div>

      {quickRuleFields.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Property Quick Rules</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickRuleFields.map(([key, label]) => (
              <div key={key} className="p-3 bg-bg-light rounded-lg border border-border-light">
                <div className="text-sm font-medium text-text-primary">{label}</div>
                <div className="text-lg font-bold text-accent-blue mt-1">{quickRules[key]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Procedures */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Popular Procedures</h3>
        <div className="grid grid-cols-4 gap-3">
          {popularProcedures.map(proc => (
            <button
              key={proc.id}
              onClick={() => onSelectProcedure(proc.id)}
              className="p-3 bg-white border border-border-light rounded-lg hover:shadow-medium transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium text-sm text-text-primary group-hover:text-accent-blue flex-1">
                  {proc.name}
                </div>
                {proc.verified && <Check size={14} className="text-accent-success flex-shrink-0" />}
              </div>
              <div className="text-xs text-text-secondary">
                {proc.category.replace('-', ' ').toUpperCase()}
              </div>
              <div className="mt-2 inline-block text-xs px-2 py-1 rounded bg-opacity-10" style={{
                backgroundColor: proc.channel === 'chat' ? '#3B82F6' : '#8B5CF6',
                color: proc.channel === 'chat' ? '#3B82F6' : '#8B5CF6'
              }}>
                {proc.channel.charAt(0).toUpperCase() + proc.channel.slice(1)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

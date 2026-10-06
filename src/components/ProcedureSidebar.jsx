import React, { useState } from 'react'
import { Search, Check } from 'lucide-react'
import { procedureCategoryGroups } from '../data/workflowData'

export default function ProcedureSidebar({
  property,
  subproperties = [],
  selectedSubproperty,
  onSelectSubproperty,
  procedures,
  selectedCategory,
  onSelectCategory,
  onSelectProcedure,
  selectedProcedure,
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProcedures = procedures.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const proceduresByCategory = {}
  procedures.forEach(proc => {
    if (!proceduresByCategory[proc.category]) {
      proceduresByCategory[proc.category] = []
    }
    proceduresByCategory[proc.category].push(proc)
  })

  const handleCategoryClick = (catId) => {
    onSelectCategory(catId)
  }

  return (
    <div className="w-64 bg-white border-r border-border-light flex flex-col mt-16">
      <div className="p-4 border-b border-border-light">
        <h3 className="text-sm font-semibold text-text-primary mb-2">{property?.name}</h3>
        {subproperties.length > 0 && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-text-secondary mb-1">Subproperties / Collections</label>
            <select
              value={selectedSubproperty || ''}
              onChange={(event) => onSelectSubproperty(event.target.value)}
              className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
              <option value="">{property?.name || 'Property / Collection'}</option>
              {subproperties.map((subproperty) => (
                <option key={subproperty.id} value={subproperty.id}>
                  {subproperty.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {searchQuery ? (
          filteredProcedures.length === 0 ? (
            <div className="p-4 text-center text-text-secondary text-sm">
              No procedures found
            </div>
          ) : (
            <div className="p-2">
              {filteredProcedures.map(proc => (
                <button
                  key={proc.id}
                  onClick={() => onSelectProcedure(proc.id)}
                  className={`w-full px-3 py-2 text-left rounded-lg mb-1 text-sm transition-colors ${
                    selectedProcedure === proc.id
                      ? 'bg-blue-50 text-accent-blue font-medium'
                      : 'text-text-primary hover:bg-bg-light'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 truncate">{proc.name}</div>
                    {proc.verified && <Check size={14} className="text-accent-success flex-shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          )
        ) : (
          procedureCategoryGroups.map(group => (
            <div key={group.id} className="border-b border-border-light last:border-b-0">
              <div className="px-4 py-2 text-sm font-semibold text-text-primary">{group.label}</div>
              {group.categories.map(category => {
                const isSelectedCategory = selectedCategory === category.id
                const categoryProcs = proceduresByCategory[category.id] || []

                return (
                  <div key={category.id} className="last:border-b-0">
                    <button
                      onClick={() => handleCategoryClick(category.id)}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between gap-2 ${
                        isSelectedCategory ? 'bg-blue-50 text-accent-blue font-medium' : 'text-text-primary hover:bg-bg-light'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/80 text-text-secondary">
                        {categoryProcs.length}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

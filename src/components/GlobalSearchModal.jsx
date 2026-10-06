import React, { useState, useMemo } from 'react'
import { Search, X, ChevronRight } from 'lucide-react'

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectProcedure,
  allProperties,
  allProcedures,
  query,
  setQuery,
  scope,
  setScope,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return { recent: [], properties: [], procedures: [] }
    }

    const q = query.toLowerCase()
    const results = {
      recent: [],
      properties: [],
      procedures: [],
    }

    // Search properties
    allProperties.forEach(prop => {
      if (prop.name.toLowerCase().includes(q)) {
        results.properties.push(prop)
      }
    })

    // Search procedures
    Object.entries(allProcedures).forEach(([propId, procs]) => {
      procs.forEach(proc => {
        if (
          proc.name.toLowerCase().includes(q) ||
          proc.keywords.some(k => k.toLowerCase().includes(q)) ||
          proc.description.toLowerCase().includes(q)
        ) {
          results.procedures.push({
            ...proc,
            propertyId: propId,
            propertyName: allProperties.find(p => p.id === propId)?.name,
          })
        }
      })
    })

    return results
  }, [query, allProperties, allProcedures])

  const allResults = [
    ...searchResults.properties,
    ...searchResults.procedures,
  ]

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(Math.min(selectedIndex + 1, allResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(Math.max(selectedIndex - 1, 0))
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      const result = allResults[selectedIndex]
      if (result.propertyId) {
        onSelectProcedure(result.id, result.propertyId)
      } else {
        // Property selected
        setQuery('')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <div
        className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-border-light">
          <div className="relative flex items-center">
            <Search size={20} className="absolute left-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search everything..."
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-12 py-3 text-lg text-text-primary focus:outline-none"
            />
            <button
              onClick={onClose}
              className="absolute right-4 p-2 hover:bg-bg-light rounded"
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* Scope Toggle */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setScope('current')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                scope === 'current'
                  ? 'bg-accent-blue text-white'
                  : 'bg-bg-light text-text-secondary hover:bg-gray-200'
              }`}
            >
              Current Property
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                scope === 'all'
                  ? 'bg-accent-blue text-white'
                  : 'bg-bg-light text-text-secondary hover:bg-gray-200'
              }`}
            >
              All Properties
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {!query.trim() ? (
            <div className="p-8 text-center text-text-secondary">
              <p>Start typing to search...</p>
            </div>
          ) : allResults.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div>
              {/* Properties Section */}
              {searchResults.properties.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-bg-light text-xs font-semibold text-text-secondary uppercase tracking-wide border-b border-border-light">
                    Properties
                  </div>
                  {searchResults.properties.map((prop, idx) => (
                    <button
                      key={prop.id}
                      onClick={() => {
                        setQuery('')
                        onClose()
                      }}
                      className={`w-full px-4 py-3 text-left border-b border-border-light flex items-center justify-between hover:bg-bg-light transition-colors ${
                        idx === selectedIndex ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: prop.color }}
                        ></div>
                        <div>
                          <div className="font-medium text-text-primary">{prop.name}</div>
                          <div className="text-xs text-text-secondary">{prop.procedureCount} procedures</div>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-text-secondary" />
                    </button>
                  ))}
                </div>
              )}

              {/* Procedures Section */}
              {searchResults.procedures.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-bg-light text-xs font-semibold text-text-secondary uppercase tracking-wide border-b border-border-light">
                    Procedures
                  </div>
                  {searchResults.procedures.map((proc, idx) => (
                    <button
                      key={`${proc.propertyId}-${proc.id}`}
                      onClick={() => onSelectProcedure(proc.id, proc.propertyId)}
                      className={`w-full px-4 py-3 text-left border-b border-border-light hover:bg-bg-light transition-colors ${
                        searchResults.properties.length + idx === selectedIndex ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-text-primary">{proc.name}</div>
                          <div className="text-sm text-text-secondary">{proc.propertyName}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          proc.channel === 'chat'
                            ? 'bg-accent-chat/10 text-accent-chat'
                            : proc.channel === 'call'
                            ? 'bg-accent-call/10 text-accent-call'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {proc.channel.charAt(0).toUpperCase() + proc.channel.slice(1)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-bg-light border-t border-border-light text-xs text-text-secondary flex justify-between">
          <span>↑ ↓ Navigate • Enter Select • Esc Close</span>
          <span>{allResults.length} results</span>
        </div>
      </div>
    </div>
  )
}

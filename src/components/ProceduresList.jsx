import React, { useMemo, useState } from 'react'
import { Check, Search } from 'lucide-react'

export default function ProceduresList({ procedures = [], selectedProcedure, onSelectProcedure }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProcedures = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return procedures

    return procedures.filter((procedure) => {
      const searchableText = [
        procedure.name,
        procedure.description,
        procedure.category,
        procedure.sourceCategory,
        ...(Array.isArray(procedure.keywords) ? procedure.keywords : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchableText.includes(query)
    })
  }, [procedures, searchQuery])

  const sections = [
    {
      id: 'general',
      title: 'General Procedures',
      items: filteredProcedures.filter((procedure) => procedure.procedureScope === 'general' || procedure.inheritedFromProperty),
    },
    {
      id: 'subproperty',
      title: 'Subproperty-specific Procedures',
      items: filteredProcedures.filter((procedure) => procedure.procedureScope === 'subproperty'),
    },
    {
      id: 'property',
      title: 'Property-specific Procedures',
      items: filteredProcedures.filter((procedure) => procedure.procedureScope === 'property'),
    },
  ].filter((section) => section.items.length > 0)

  const shouldShowSections = sections.length > 1 || sections.some((section) => section.id !== 'property')
  const proceduresToRender = shouldShowSections ? sections : [{ id: 'all', title: '', items: filteredProcedures }]

  return (
    <aside className="w-64 bg-white border-r border-border-light flex flex-col mt-16">
      <div className="p-4 border-b border-border-light">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Procedures List</h3>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-text-secondary" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search procedures..."
            className="w-full pl-9 pr-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredProcedures.length === 0 ? (
          <div className="p-4 text-center text-text-secondary text-sm">
            No procedures found
          </div>
        ) : (
          proceduresToRender.map((section) => (
            <div key={section.id} className="mb-3 last:mb-0">
              {section.title && shouldShowSections && (
                <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase text-text-secondary">
                  {section.title}
                </div>
              )}
              {section.items.map((procedure) => (
                <button
                  key={procedure.id}
                  type="button"
                  onClick={() => onSelectProcedure(procedure.id)}
                  className={`w-full px-3 py-2 text-left rounded-lg mb-1 text-sm transition-colors ${
                    selectedProcedure === procedure.id
                      ? 'bg-blue-50 text-accent-blue font-medium'
                      : 'text-text-primary hover:bg-bg-light'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 truncate">{procedure.name}</div>
                    {procedure.verified && <Check size={14} className="text-accent-success flex-shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </aside>
  )
}

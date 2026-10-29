import React from 'react'
import { Check } from 'lucide-react'

export default function RulesTab({ rules }) {
  if (!rules || rules.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No rules documented for this property</p>
      </div>
    )
  }

  // Group rules by category
  const rulesByCategory = {}
  rules.forEach(rule => {
    if (!rulesByCategory[rule.category]) {
      rulesByCategory[rule.category] = []
    }
    rulesByCategory[rule.category].push(rule)
  })

  return (
    <div className="space-y-6">
      {Object.entries(rulesByCategory).map(([category, categoryRules]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-text-primary mb-3">{category}</h3>
          <div className="grid grid-cols-2 gap-3">
            {categoryRules.map((rule, idx) => (
              <div key={idx} className="p-4 bg-white border border-border-light rounded-lg hover:shadow-soft transition-all">
                <div className="flex items-start justify-between mb-2">
                  {rule.name && <h4 className="font-medium text-text-primary">{rule.name}</h4>}
                  {rule.verified && <Check size={18} className="text-accent-success flex-shrink-0" />}
                </div>
                <div className={rule.name ? 'text-lg font-bold text-accent-blue mb-2' : 'text-sm text-text-secondary leading-relaxed mb-2'}>
                  {rule.value}
                </div>
                {!rule.verified && (
                  <div className="text-xs text-accent-warning bg-yellow-50 px-2 py-1 rounded inline-block">
                    Not verified
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

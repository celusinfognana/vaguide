import React from 'react'
import { Star, Share2, MoreHorizontal, Check } from 'lucide-react'
import PropertyOverview from '../components/PropertyOverview'
import RulesTab from '../components/RulesTab'
import ContactsTab from '../components/ContactsTab'
import PropertyInfoTab from '../components/PropertyInfoTab'
import ProceduresTab from '../components/ProceduresTab'
import WorkflowRunner from '../components/WorkflowRunner'
import { mockRules, mockContacts, mockPropertyInfo } from '../data/mockData'
import { toWorkflowRunnerProcedure } from '../data/adminStorage'

export default function PropertyWorkspace({
  property,
  subproperty,
  subpropertySections = {},
  propertySections = {},
  selectedProcedure,
  proceduresInCategory,
  allProperties,
  favorites,
  onToggleFavorite,
  onShowToast,
  onProcedureSelect,
  onCategorySelect,
  activeWorkspaceTab,
  onSelectWorkspaceTab,
}) {
  if (!property) {
    return <div className="flex items-center justify-center h-full text-text-secondary">Select a property</div>
  }

  const tabs = [
    { id: 'procedures', label: 'Procedures' },
    { id: 'overview', label: 'Overview' },
    { id: 'rules', label: 'Rules' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'info', label: 'Property Info' },
  ]

  const workspaceEntity = subproperty || property
  const savedSections = subproperty ? subpropertySections[subproperty.id] || {} : null
  const savedPropertySections = subproperty ? null : propertySections[property.id] || {}
  const propertyRules = subproperty ? savedSections.rules || [] : savedPropertySections.rules || mockRules[property.id] || []
  const propertyContacts = subproperty ? savedSections.contacts || [] : savedPropertySections.contacts || mockContacts[property.id] || []
  const propertyInfo = subproperty
    ? savedSections.propertyInfo || {
        name: subproperty.name,
        type: 'Subproperty / Collection',
        occupancy: 'Not set',
      }
    : savedPropertySections.propertyInfo || mockPropertyInfo[property.id]
  const propertyOverview = subproperty ? savedSections.overview : savedPropertySections.overview
  const activeTab = activeWorkspaceTab || 'procedures'
  const currentProcedure = (proceduresInCategory || []).find((p) => p.id === selectedProcedure)
  const runnerProcedure = currentProcedure && currentProcedure.steps?.length
    ? toWorkflowRunnerProcedure(currentProcedure)
    : null

  const renderProcedureContent = () => {
    if (runnerProcedure) {
      return (
        <WorkflowRunner
          procedure={runnerProcedure}
          property={workspaceEntity}
          onComplete={() => {
            onSelectWorkspaceTab('procedures')
          }}
          onShowToast={onShowToast}
        />
      )
    }

    if (currentProcedure) {
      return (
        <div className="max-w-4xl mx-auto px-8 py-8">
          <h1 className="text-3xl font-bold text-text-primary mb-4">{currentProcedure.name}</h1>
          {currentProcedure.description && (
            <p className="text-lg text-text-secondary mb-8 leading-relaxed">{currentProcedure.description}</p>
          )}
          <button
            onClick={() => onShowToast('Procedure completed successfully!')}
            className="px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-all inline-flex items-center gap-2"
          >
            <Check size={18} />
            Complete
          </button>
        </div>
      )
    }

    return (
      <ProceduresTab
        proceduresInCategory={proceduresInCategory}
        onSelectProcedure={(procId) => {
          onProcedureSelect(procId, property.id)
          onSelectWorkspaceTab('procedures')
        }}
        selectedProcedure={selectedProcedure}
      />
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Property Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-border-light">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg flex-shrink-0"
              style={{ backgroundColor: workspaceEntity.color || property.color }}
            ></div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">{workspaceEntity.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm font-medium text-accent-success bg-green-50 px-3 py-1 rounded">
                  {workspaceEntity.status.charAt(0).toUpperCase() + workspaceEntity.status.slice(1)}
                </span>
                <span className="text-sm text-text-secondary">
                  {proceduresInCategory.length} procedures
                </span>
                <span className="text-sm text-text-secondary">
                  {proceduresInCategory.filter((procedure) => procedure.status === 'verified' || procedure.verified).length} verified
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(property.id)}
              className="p-2 hover:bg-bg-light rounded-lg transition-colors"
              title="Add to favorites"
            >
              <Star
                size={20}
                className={favorites[property.id] ? 'fill-accent-warning text-accent-warning' : 'text-text-secondary'}
              />
            </button>
            <button className="p-2 hover:bg-bg-light rounded-lg transition-colors" title="Share">
              <Share2 size={20} className="text-text-secondary" />
            </button>
            <button className="p-2 hover:bg-bg-light rounded-lg transition-colors" title="More options">
              <MoreHorizontal size={20} className="text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-border-light">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onSelectWorkspaceTab(tab.id)}
              className={`pb-4 font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-accent-blue'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <PropertyOverview
            property={{ ...property, ...workspaceEntity, procedureCount: proceduresInCategory.length, verifiedCount: proceduresInCategory.filter((procedure) => procedure.status === 'verified' || procedure.verified).length }}
            overview={propertyOverview}
            proceduresInCategory={proceduresInCategory}
            onSelectProcedure={(procId) => {
              onProcedureSelect(procId, property.id)
              onSelectWorkspaceTab('procedures')
            }}
          />
        )}

        {activeTab === 'rules' && (
          <RulesTab rules={propertyRules} />
        )}

        {activeTab === 'procedures' && renderProcedureContent()}

        {activeTab === 'contacts' && (
          <ContactsTab contacts={propertyContacts} />
        )}

        {activeTab === 'info' && (
          <PropertyInfoTab info={propertyInfo} />
        )}
      </div>
    </div>
  )
}

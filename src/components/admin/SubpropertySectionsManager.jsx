import React, { useState } from 'react'
import { Edit3, Save } from 'lucide-react'
import ProcedureCardsManager from './ProcedureCardsManager'

const tabs = [
  { id: 'procedures', label: 'Procedures' },
  { id: 'overview', label: 'Overview' },
  { id: 'rules', label: 'Rules' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'info', label: 'Property Info' },
]

const toJson = (value) => JSON.stringify(value || [], null, 2)

export default function SubpropertySectionsManager({
  subproperty,
  sections,
  adminRepository,
  onAdminDatabaseChange,
  onShowToast,
  parentProperty,
  procedures,
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const [overview, setOverview] = useState(() => ({
    summary: sections?.overview?.summary || '',
    propertyHighlights: sections?.overview?.propertyHighlights || '',
    adminNotes: sections?.overview?.adminNotes || '',
    earliestCheckIn: sections?.overview?.quickRules?.earliestCheckIn || '',
    latestCheckOut: sections?.overview?.quickRules?.latestCheckOut || '',
    petFee: sections?.overview?.quickRules?.petFee || '',
    maximumOccupancy: sections?.overview?.quickRules?.maximumOccupancy || '',
  }))
  const [jsonValue, setJsonValue] = useState('')
  const [jsonError, setJsonError] = useState('')

  if (activeTab === 'procedures') {
    return (
      <div className="rounded-xl border border-border-light bg-white p-5">
        <div className="flex gap-6 border-b border-border-light mb-6">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`pb-3 text-sm font-medium relative ${activeTab === tab.id ? 'text-accent-blue' : 'text-text-secondary hover:text-text-primary'}`}>
              {tab.label}
              {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue" />}
            </button>
          ))}
        </div>
        <ProcedureCardsManager
          property={parentProperty}
          procedures={procedures}
          subproperties={[subproperty]}
          defaultSubpropertyId={subproperty.id}
          adminRepository={adminRepository}
          onAdminDatabaseChange={onAdminDatabaseChange}
          onShowToast={onShowToast}
        />
      </div>
    )
  }

  const startEditing = () => {
    setJsonError('')
    setJsonValue(toJson(activeTab === 'rules' ? sections?.rules : activeTab === 'contacts' ? sections?.contacts : sections?.propertyInfo))
    setEditing(true)
  }

  const saveSection = (event) => {
    event.preventDefault()
    let value

    if (activeTab === 'overview') {
      value = {
        summary: overview.summary,
        propertyHighlights: overview.propertyHighlights,
        adminNotes: overview.adminNotes,
        quickRules: {
          earliestCheckIn: overview.earliestCheckIn,
          latestCheckOut: overview.latestCheckOut,
          petFee: overview.petFee,
          maximumOccupancy: overview.maximumOccupancy,
        },
      }
    } else {
      try {
        value = JSON.parse(jsonValue)
        if (activeTab === 'rules' || activeTab === 'contacts') {
          if (!Array.isArray(value)) throw new Error('This section must be a JSON array.')
        } else if (!value || Array.isArray(value) || typeof value !== 'object') {
          throw new Error('Property Info must be a JSON object.')
        }
      } catch (error) {
        setJsonError(error.message)
        return
      }
    }

    const section = activeTab === 'info' ? 'propertyInfo' : activeTab
    const nextDatabase = adminRepository.upsertSubpropertySection(subproperty.id, section, value)
    onAdminDatabaseChange(nextDatabase)
    setEditing(false)
    onShowToast(`${tabs.find((tab) => tab.id === activeTab)?.label} saved successfully.`)
  }

  const updateOverview = (field, value) => setOverview((current) => ({ ...current, [field]: value }))
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label

  return (
    <div className="rounded-xl border border-border-light bg-white p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{subproperty.name}</h2>
          <p className="text-sm text-text-secondary mt-1">Manage this subproperty's sections independently.</p>
        </div>
        {!editing && (
          <button onClick={startEditing} className="px-3 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm">
            <Edit3 size={15} />
            Edit {activeLabel}
          </button>
        )}
      </div>

      <div className="flex gap-6 border-b border-border-light mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveTab(tab.id); setEditing(false); setJsonError('') }}
            className={`pb-3 text-sm font-medium relative ${activeTab === tab.id ? 'text-accent-blue' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {tab.label}
            {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue" />}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        editing ? (
          <form onSubmit={saveSection} className="space-y-4">
            <label className="block text-sm font-medium text-text-primary">Summary<textarea value={overview.summary} onChange={(event) => updateOverview('summary', event.target.value)} rows={3} className="mt-1 w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm" /></label>
            <label className="block text-sm font-medium text-text-primary">Highlights<textarea value={overview.propertyHighlights} onChange={(event) => updateOverview('propertyHighlights', event.target.value)} rows={3} className="mt-1 w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm" /></label>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['earliestCheckIn', 'Earliest Check-in'],
                ['latestCheckOut', 'Latest Check-out'],
                ['petFee', 'Pet Fee'],
                ['maximumOccupancy', 'Maximum Occupancy'],
              ].map(([field, label]) => <label key={field} className="text-sm font-medium text-text-primary">{label}<input value={overview[field]} onChange={(event) => updateOverview(field, event.target.value)} className="mt-1 w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm" /></label>)}
            </div>
            <label className="block text-sm font-medium text-text-primary">Admin Notes<textarea value={overview.adminNotes} onChange={(event) => updateOverview('adminNotes', event.target.value)} rows={3} className="mt-1 w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm" /></label>
            <button type="submit" className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"><Save size={16} />Save Overview</button>
          </form>
        ) : (
          <div className="space-y-4 text-sm text-text-secondary"><p>{sections?.overview?.summary || 'No overview summary saved yet.'}</p><p>{sections?.overview?.propertyHighlights || 'No highlights saved yet.'}</p><p>{sections?.overview?.adminNotes || 'No admin notes saved yet.'}</p></div>
        )
      ) : (
        editing ? (
          <form onSubmit={saveSection} className="space-y-4">
            <label className="block text-sm font-medium text-text-primary">{activeLabel} data (JSON)
              <textarea value={jsonValue} onChange={(event) => { setJsonValue(event.target.value); setJsonError('') }} rows={14} className="mt-1 w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm font-mono" />
            </label>
            {jsonError && <p className="text-sm text-accent-danger">{jsonError}</p>}
            <button type="submit" className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"><Save size={16} />Save {activeLabel}</button>
          </form>
        ) : (
          <pre className="p-4 bg-bg-light border border-border-light rounded-lg text-sm text-text-secondary overflow-auto">{toJson(activeTab === 'rules' ? sections?.rules : activeTab === 'contacts' ? sections?.contacts : sections?.propertyInfo)}</pre>
        )
      )}
    </div>
  )
}

import React, { useMemo, useState } from 'react'
import { ArrowLeft, Edit3, Eye, Plus, Search, Save, Trash2, X } from 'lucide-react'
import ProcedureCardsManager from '../components/admin/ProcedureCardsManager'
import SubpropertySectionsManager from '../components/admin/SubpropertySectionsManager'

const emptyForm = {
  name: '',
  code: '',
  status: 'active',
  type: '',
  address: '',
  city: '',
  state: '',
  country: '',
  timezone: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  notes: '',
}

const requiredFields = ['name', 'code']

const emptyOverviewForm = {
  summary: '',
  propertyHighlights: '',
  adminNotes: '',
  earliestCheckIn: '',
  latestCheckOut: '',
  petFee: '',
  maximumOccupancy: '',
}

const emptySubpropertyForm = {
  name: '',
  code: '',
  status: 'active',
  notes: '',
}

const getInitials = (name) =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'PH'

const formatDate = (value) => {
  if (!value) return 'Not saved'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export default function AdminPropertiesPage({
  adminDatabase,
  adminRepository,
  onAdminDatabaseChange,
  onShowToast,
  serverConnected,
  onRetryServerConnection,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingPropertyId, setEditingPropertyId] = useState(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState(null)
  const [selectedDetailTab, setSelectedDetailTab] = useState('overview')
  const [activeView, setActiveView] = useState('list')
  const [selectedSubpropertyId, setSelectedSubpropertyId] = useState(null)
  const [editingOverview, setEditingOverview] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [overviewFormData, setOverviewFormData] = useState(emptyOverviewForm)
  const [subpropertyFormData, setSubpropertyFormData] = useState(emptySubpropertyForm)
  const [editingSubpropertyId, setEditingSubpropertyId] = useState(null)
  const [showSubpropertyForm, setShowSubpropertyForm] = useState(false)
  const [errors, setErrors] = useState({})
  const [subpropertyErrors, setSubpropertyErrors] = useState({})

  const properties = adminDatabase?.properties || []
  const subproperties = adminDatabase?.subproperties || []

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return properties
      .filter((property) => {
        const matchesSearch =
          !query ||
          property.name.toLowerCase().includes(query) ||
          property.code.toLowerCase().includes(query) ||
          [property.city, property.state, property.country].filter(Boolean).join(' ').toLowerCase().includes(query)
        const matchesStatus = statusFilter === 'all' || property.status === statusFilter

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [properties, searchQuery, statusFilter])

  const activeCount = properties.filter((property) => property.status === 'active').length
  const inactiveCount = properties.filter((property) => property.status === 'inactive').length
  const isEditing = Boolean(editingPropertyId)
  const selectedProperty = properties.find((property) => property.id === selectedPropertyId)
  const isOfflineAgiProperty =
    !serverConnected && selectedProperty?.source === 'uploaded-agi-holdings' && activeView !== 'list'
  const selectedOverview = selectedProperty ? adminDatabase?.propertyOverviews?.[selectedProperty.id] : null
  const selectedSubproperties = selectedProperty
    ? subproperties
        .filter((subproperty) => subproperty.parentPropertyId === selectedProperty.id)
        .sort((a, b) => a.name.localeCompare(b.name))
    : []
  const selectedProcedures = selectedProperty
    ? (adminDatabase?.procedures || []).filter((procedure) => procedure.propertyId === selectedProperty.id)
    : []
  const selectedSubproperty = selectedSubproperties.find((subproperty) => subproperty.id === selectedSubpropertyId)
  const selectedSubpropertyProcedures = selectedSubproperty
    ? selectedProcedures.filter((procedure) =>
      (procedure.isGeneralProcedure && !procedure.subpropertyId) ||
      procedure.appliesToAllSubproperties ||
      procedure.subpropertyId === selectedSubproperty.id,
    )
    : []

  const resetForm = () => {
    setEditingPropertyId(null)
    setEditingOverview(false)
    setFormData(emptyForm)
    setErrors({})
  }

  const resetSelection = () => {
    setSelectedPropertyId(null)
    setSelectedDetailTab('overview')
    setEditingOverview(false)
    setActiveView('list')
  }

  const openPropertyPage = (property) => {
    setSelectedPropertyId(property.id)
    setSelectedDetailTab('overview')
    setEditingPropertyId(null)
    setEditingOverview(false)
    setActiveView('property')
    setSelectedSubpropertyId(null)
  }

  const openAddPropertyForm = () => {
    setSelectedPropertyId(null)
    setSelectedDetailTab('overview')
    setEditingOverview(false)
    setEditingPropertyId(null)
    setFormData(emptyForm)
    setErrors({})
    setActiveView('property-form')
  }

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const updateOverviewField = (field, value) => {
    setOverviewFormData((current) => ({ ...current, [field]: value }))
  }

  const updateSubpropertyField = (field, value) => {
    setSubpropertyFormData((current) => ({ ...current, [field]: value }))
    setSubpropertyErrors((current) => ({ ...current, [field]: '' }))
  }

  const resetSubpropertyForm = () => {
    setShowSubpropertyForm(false)
    setEditingSubpropertyId(null)
    setSubpropertyFormData(emptySubpropertyForm)
    setSubpropertyErrors({})
  }

  const startAddSubproperty = () => {
    setShowSubpropertyForm(true)
    setEditingSubpropertyId(null)
    setSubpropertyFormData(emptySubpropertyForm)
    setSubpropertyErrors({})
  }

  const startEditSubproperty = (subproperty) => {
    setShowSubpropertyForm(true)
    setEditingSubpropertyId(subproperty.id)
    setSubpropertyFormData({
      name: subproperty.name || '',
      code: subproperty.code || '',
      status: subproperty.status || 'active',
      notes: subproperty.notes || '',
    })
    setSubpropertyErrors({})
  }

  const validateForm = () => {
    const nextErrors = {}

    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        nextErrors[field] = 'Required'
      }
    })

    const duplicateCode = properties.some(
      (property) =>
        property.id !== editingPropertyId &&
        property.code.trim().toLowerCase() === formData.code.trim().toLowerCase(),
    )

    if (duplicateCode) {
      nextErrors.code = 'Code already exists'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleEdit = (property) => {
    setSelectedPropertyId(null)
    setEditingOverview(false)
    setEditingPropertyId(property.id)
    setActiveView('property-form')
    setFormData({
      name: property.name || '',
      code: property.code || '',
      status: property.status || 'active',
      type: property.type || '',
      address: property.address || '',
      city: property.city || '',
      state: property.state || '',
      country: property.country || '',
      timezone: property.timezone || '',
      contactName: property.contactName || '',
      contactPhone: property.contactPhone || '',
      contactEmail: property.contactEmail || '',
      notes: property.notes || '',
    })
    setErrors({})
  }

  const handleSelectProperty = (property) => {
    openPropertyPage(property)
  }

  const handleSelectProcedureCards = (property) => {
    setSelectedPropertyId(property.id)
    setSelectedDetailTab('procedures')
    setEditingPropertyId(null)
    setEditingOverview(false)
    setActiveView('property')
  }

  const handleEditOverview = () => {
    setOverviewFormData({
      summary: selectedOverview?.summary || '',
      propertyHighlights: selectedOverview?.propertyHighlights || '',
      adminNotes: selectedOverview?.adminNotes || '',
      earliestCheckIn: selectedOverview?.quickRules?.earliestCheckIn || '',
      latestCheckOut: selectedOverview?.quickRules?.latestCheckOut || '',
      petFee: selectedOverview?.quickRules?.petFee || '',
      maximumOccupancy: selectedOverview?.quickRules?.maximumOccupancy || '',
    })
    setEditingOverview(true)
  }

  const handleSaveOverview = (event) => {
    event.preventDefault()
    if (!selectedProperty) return

    const nextDatabase = adminRepository.upsertPropertyOverview(selectedProperty.id, {
      summary: overviewFormData.summary,
      propertyHighlights: overviewFormData.propertyHighlights,
      adminNotes: overviewFormData.adminNotes,
      quickRules: {
        earliestCheckIn: overviewFormData.earliestCheckIn,
        latestCheckOut: overviewFormData.latestCheckOut,
        petFee: overviewFormData.petFee,
        maximumOccupancy: overviewFormData.maximumOccupancy,
      },
    })

    onAdminDatabaseChange(nextDatabase)
    setEditingOverview(false)
    onShowToast('Overview saved successfully.')
  }

  const handleSaveSubproperty = (event) => {
    event.preventDefault()
    if (!selectedProperty) return

    const nextErrors = {}
    if (!subpropertyFormData.name.trim()) nextErrors.name = 'Required'

    const duplicateCode = subpropertyFormData.code.trim()
      ? selectedSubproperties.some(
          (subproperty) =>
            subproperty.id !== editingSubpropertyId &&
            subproperty.code.trim().toLowerCase() === subpropertyFormData.code.trim().toLowerCase(),
        )
      : false

    if (duplicateCode) nextErrors.code = 'Code already exists'

    setSubpropertyErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const payload = {
      name: subpropertyFormData.name.trim(),
      code: subpropertyFormData.code.trim(),
      status: subpropertyFormData.status,
      notes: subpropertyFormData.notes.trim(),
    }

    const nextDatabase = editingSubpropertyId
      ? adminRepository.updateSubproperty(editingSubpropertyId, payload)
      : adminRepository.createSubproperty(selectedProperty.id, payload)

    onAdminDatabaseChange(nextDatabase)
    onShowToast(editingSubpropertyId ? 'Subproperty saved successfully.' : 'Subproperty created successfully.')
    resetSubpropertyForm()
  }

  const handleDeleteSubproperty = (subproperty) => {
    const confirmed = window.confirm(`Delete ${subproperty.name}? Procedures assigned to it will be unassigned.`)
    if (!confirmed) return

    const nextDatabase = adminRepository.deleteSubproperty(subproperty.id)
    onAdminDatabaseChange(nextDatabase)
    onShowToast('Subproperty deleted.')

    if (editingSubpropertyId === subproperty.id) {
      resetSubpropertyForm()
    }
    if (selectedSubpropertyId === subproperty.id) {
      setSelectedSubpropertyId(null)
      setActiveView('property')
    }
  }

  const openSubpropertyPage = (subproperty) => {
    setSelectedSubpropertyId(subproperty.id)
    setActiveView('subproperty')
  }

  const handleSubmit = (event) => {
    console.log('handleSubmit called')  
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      code: formData.code.trim(),
      color: isEditing
        ? properties.find((property) => property.id === editingPropertyId)?.color
        : ['#2563EB', '#22C55E', '#F59E0B', '#8B5CF6', '#06B6D4'][properties.length % 5],
    }

    const nextDatabase = isEditing
      ? adminRepository.updateProperty(editingPropertyId, payload)
      : adminRepository.createProperty(payload)

    onAdminDatabaseChange(nextDatabase)
    onShowToast(isEditing ? 'Property saved successfully.' : 'Property created successfully.')
    resetForm()
  }

  const handleDelete = (property) => {
    const confirmed = window.confirm(`Delete ${property.name}? This also removes its admin procedures.`)
    if (!confirmed) return

    const nextDatabase = adminRepository.deleteProperty(property.id)
    onAdminDatabaseChange(nextDatabase)
    onShowToast('Property deleted.')

    if (editingPropertyId === property.id) {
      resetForm()
    }

    if (selectedPropertyId === property.id) {
      resetSelection()
    }

    if (activeView === 'property' || activeView === 'property-form') {
      setActiveView('list')
    }
  }

  const renderPropertyForm = () => (
    <div className="fixed inset-0 z-40 bg-white overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-2 mb-2"
            >
              <ArrowLeft size={14} />
              Back to Properties
            </button>
            <h1 className="text-3xl font-bold text-text-primary">
              {isEditing ? 'Edit Property' : 'Add Property'}
            </h1>
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setEditingPropertyId(null)
                setFormData(emptyForm)
                setErrors({})
                setActiveView('list')
              }}
              className="p-2 hover:bg-bg-light rounded-lg text-text-secondary"
              title="Cancel editing"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">Property / Collection Name</label>
              <input
                value={formData.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Property name"
                className={`w-full px-3 py-2 bg-bg-light border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue ${
                  errors.name ? 'border-accent-danger' : 'border-border-light'
                }`}
              />
              {errors.name && <div className="text-xs text-accent-danger mt-1">{errors.name}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Property Code</label>
              <input
                value={formData.code}
                onChange={(event) => updateField('code', event.target.value)}
                placeholder="AGI"
                className={`w-full px-3 py-2 bg-bg-light border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue ${
                  errors.code ? 'border-accent-danger' : 'border-border-light'
                }`}
              />
              {errors.code && <div className="text-xs text-accent-danger mt-1">{errors.code}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(event) => updateField('status', event.target.value)}
                className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">Property Type</label>
              <input
                value={formData.type}
                onChange={(event) => updateField('type', event.target.value)}
                placeholder="Residential, Boutique Hotel, Collection..."
                className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">Address</label>
              <input
                value={formData.address}
                onChange={(event) => updateField('address', event.target.value)}
                placeholder="Street address"
                className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">City</label>
              <input
                value={formData.city}
                onChange={(event) => updateField('city', event.target.value)}
                placeholder="City"
                className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">State</label>
              <input
                value={formData.state}
                onChange={(event) => updateField('state', event.target.value)}
                placeholder="State"
                className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Country</label>
              <input
                value={formData.country}
                onChange={(event) => updateField('country', event.target.value)}
                placeholder="Country"
                className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Timezone</label>
              <input
                value={formData.timezone}
                onChange={(event) => updateField('timezone', event.target.value)}
                placeholder="America/New_York"
                className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Contact Name</label>
              <input
                value={formData.contactName}
                onChange={(event) => updateField('contactName', event.target.value)}
                placeholder="Primary contact"
                className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Contact Phone</label>
              <input
                value={formData.contactPhone}
                onChange={(event) => updateField('contactPhone', event.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Contact Email</label>
              <input
                value={formData.contactEmail}
                onChange={(event) => updateField('contactEmail', event.target.value)}
                placeholder="manager@example.com"
                className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border-light">
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className="px-4 py-2 bg-bg-light text-text-primary rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              {isEditing ? 'Save Property' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const renderPropertyPage = () => (
    <div className="fixed inset-0 z-40 bg-white overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => setActiveView('list')}
              className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-2 mb-2"
            >
              <ArrowLeft size={14} />
              Back to Properties
            </button>
            <h1 className="text-3xl font-bold text-text-primary">{selectedProperty.name}</h1>
            <p className="text-sm text-text-secondary mt-1">{selectedProperty.code} • {selectedProperty.status}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedPropertyId(selectedProperty.id)
                setFormData({
                  name: selectedProperty.name || '',
                  code: selectedProperty.code || '',
                  status: selectedProperty.status || 'active',
                  type: selectedProperty.type || '',
                  address: selectedProperty.address || '',
                  city: selectedProperty.city || '',
                  state: selectedProperty.state || '',
                  country: selectedProperty.country || '',
                  timezone: selectedProperty.timezone || '',
                  contactName: selectedProperty.contactName || '',
                  contactPhone: selectedProperty.contactPhone || '',
                  contactEmail: selectedProperty.contactEmail || '',
                  notes: selectedProperty.notes || '',
                })
                setEditingPropertyId(selectedProperty.id)
                setActiveView('property-form')
              }}
              className="px-4 py-2 bg-bg-light text-text-primary rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Edit3 size={16} />
              Edit Property
            </button>
            <button
              onClick={() => handleDelete(selectedProperty)}
              className="px-4 py-2 bg-bg-light text-accent-danger rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        <div className="flex gap-6 border-b border-border-light mb-6">
          <button
            type="button"
            onClick={() => {
              setSelectedDetailTab('overview')
              setEditingOverview(false)
            }}
            className={`pb-3 text-sm font-medium relative ${
              selectedDetailTab === 'overview'
                ? 'text-accent-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Overview
            {selectedDetailTab === 'overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedDetailTab('subproperties')
              setEditingOverview(false)
            }}
            className={`pb-3 text-sm font-medium relative ${
              selectedDetailTab === 'subproperties'
                ? 'text-accent-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Subproperties / Collections
            {selectedDetailTab === 'subproperties' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedDetailTab('procedures')
              setEditingOverview(false)
            }}
            className={`pb-3 text-sm font-medium relative ${
              selectedDetailTab === 'procedures'
                ? 'text-accent-blue'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Procedure Cards
            {selectedDetailTab === 'procedures' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <aside className="rounded-xl border border-border-light bg-bg-light p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Property Details</h2>
            <div className="space-y-4 text-sm text-text-secondary">
              <div><span className="block text-xs uppercase tracking-wide text-text-secondary">Type</span><span className="font-medium text-text-primary">{selectedProperty.type || 'Not set'}</span></div>
              <div><span className="block text-xs uppercase tracking-wide text-text-secondary">Address</span><span className="font-medium text-text-primary">{selectedProperty.address || 'Not set'}</span></div>
              <div><span className="block text-xs uppercase tracking-wide text-text-secondary">Location</span><span className="font-medium text-text-primary">{[selectedProperty.city, selectedProperty.state, selectedProperty.country].filter(Boolean).join(', ') || 'Not set'}</span></div>
              <div><span className="block text-xs uppercase tracking-wide text-text-secondary">Timezone</span><span className="font-medium text-text-primary">{selectedProperty.timezone || 'Not set'}</span></div>
              <div><span className="block text-xs uppercase tracking-wide text-text-secondary">Contact</span><span className="font-medium text-text-primary">{selectedProperty.contactName || 'Not set'}</span></div>
              <div><span className="block text-xs uppercase tracking-wide text-text-secondary">Email</span><span className="font-medium text-text-primary">{selectedProperty.contactEmail || 'Not set'}</span></div>
            </div>

            <div className={selectedDetailTab === 'subproperties' ? 'mt-6 pt-5 border-t border-border-light' : 'hidden'}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="text-sm font-semibold text-text-primary">Subproperties / Collections</h2>
                {!showSubpropertyForm && (
                  <button
                    type="button"
                    onClick={startAddSubproperty}
                    className="px-2.5 py-1.5 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1.5 text-xs"
                  >
                    <Plus size={13} />
                    Add
                  </button>
                )}
              </div>

              {showSubpropertyForm && (
                <form onSubmit={handleSaveSubproperty} className="space-y-3 p-3 bg-white border border-border-light rounded-lg mb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-text-primary">
                      {editingSubpropertyId ? 'Edit Subproperty' : 'Add Subproperty'}
                    </div>
                    <button type="button" onClick={resetSubpropertyForm} className="p-1 hover:bg-bg-light rounded text-text-secondary">
                      <X size={14} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">Name</label>
                    <input
                      value={subpropertyFormData.name}
                      onChange={(event) => updateSubpropertyField('name', event.target.value)}
                      className={`w-full px-3 py-2 bg-bg-light border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue ${
                        subpropertyErrors.name ? 'border-accent-danger' : 'border-border-light'
                      }`}
                    />
                    {subpropertyErrors.name && <div className="text-xs text-accent-danger mt-1">{subpropertyErrors.name}</div>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">Code</label>
                    <input
                      value={subpropertyFormData.code}
                      onChange={(event) => updateSubpropertyField('code', event.target.value)}
                      className={`w-full px-3 py-2 bg-bg-light border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue ${
                        subpropertyErrors.code ? 'border-accent-danger' : 'border-border-light'
                      }`}
                    />
                    {subpropertyErrors.code && <div className="text-xs text-accent-danger mt-1">{subpropertyErrors.code}</div>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">Status</label>
                    <select
                      value={subpropertyFormData.status}
                      onChange={(event) => updateSubpropertyField('status', event.target.value)}
                      className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">Notes</label>
                    <textarea
                      value={subpropertyFormData.notes}
                      onChange={(event) => updateSubpropertyField('notes', event.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={resetSubpropertyForm} className="px-3 py-2 bg-bg-light text-text-primary rounded-lg hover:bg-gray-100 text-xs">Cancel</button>
                    <button type="submit" className="px-3 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 flex items-center gap-1.5 text-xs"><Save size={13} />Save</button>
                  </div>
                </form>
              )}

              {selectedSubproperties.length === 0 ? (
                <p className="text-sm text-text-secondary">No subproperties saved.</p>
              ) : (
                <div className="space-y-2">
                  {selectedSubproperties.map((subproperty) => (
                    <div key={subproperty.id} className="p-3 bg-white border border-border-light rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-text-primary truncate">{subproperty.name}</div>
                          <div className="text-xs text-text-secondary truncate">{subproperty.code || 'No code'} • {subproperty.status}</div>
                        </div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => openSubpropertyPage(subproperty)} className="p-1.5 hover:bg-bg-light rounded text-text-secondary hover:text-accent-blue" title="Manage sections">
                            <Eye size={13} />
                          </button>
                          <button type="button" onClick={() => startEditSubproperty(subproperty)} className="p-1.5 hover:bg-bg-light rounded text-text-secondary hover:text-accent-blue" title="Edit">
                            <Edit3 size={13} />
                          </button>
                          <button type="button" onClick={() => handleDeleteSubproperty(subproperty)} className="p-1.5 hover:bg-bg-light rounded text-text-secondary hover:text-accent-danger" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <section className="space-y-6">
            {selectedDetailTab === 'overview' ? (
            <div className="rounded-xl border border-border-light bg-white p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-semibold text-text-primary">Overview</h2>
                {!editingOverview && (
                  <button
                    onClick={handleEditOverview}
                    className="px-3 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Edit3 size={15} />
                    Edit Overview
                  </button>
                )}
              </div>

              {editingOverview ? (
                <form onSubmit={handleSaveOverview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Overview Summary</label>
                    <textarea value={overviewFormData.summary} onChange={(event) => updateOverviewField('summary', event.target.value)} rows={3} className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Property Highlights</label>
                    <textarea value={overviewFormData.propertyHighlights} onChange={(event) => updateOverviewField('propertyHighlights', event.target.value)} rows={3} className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-text-primary mb-1">Earliest Check-in</label><input value={overviewFormData.earliestCheckIn} onChange={(event) => updateOverviewField('earliestCheckIn', event.target.value)} className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm" /></div>
                    <div><label className="block text-sm font-medium text-text-primary mb-1">Latest Check-out</label><input value={overviewFormData.latestCheckOut} onChange={(event) => updateOverviewField('latestCheckOut', event.target.value)} className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm" /></div>
                    <div><label className="block text-sm font-medium text-text-primary mb-1">Pet Fee</label><input value={overviewFormData.petFee} onChange={(event) => updateOverviewField('petFee', event.target.value)} className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm" /></div>
                    <div><label className="block text-sm font-medium text-text-primary mb-1">Maximum Occupancy</label><input value={overviewFormData.maximumOccupancy} onChange={(event) => updateOverviewField('maximumOccupancy', event.target.value)} className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm" /></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Admin Notes</label>
                    <textarea value={overviewFormData.adminNotes} onChange={(event) => updateOverviewField('adminNotes', event.target.value)} rows={3} className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none" />
                  </div>
                  <div className="flex justify-end gap-3 pt-1">
                    <button type="button" onClick={() => setEditingOverview(false)} className="px-4 py-2 bg-bg-light text-text-primary rounded-lg hover:bg-gray-100">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"><Save size={16} />Save Overview</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-sm text-text-secondary">
                  <div><div className="text-xs uppercase tracking-wide text-text-secondary mb-1">Summary</div><p className="leading-relaxed">{selectedOverview?.summary || 'No overview summary saved yet.'}</p></div>
                  <div><div className="text-xs uppercase tracking-wide text-text-secondary mb-1">Highlights</div><p className="leading-relaxed">{selectedOverview?.propertyHighlights || 'No highlights saved yet.'}</p></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-bg-light rounded-lg border border-border-light"><div className="text-xs uppercase tracking-wide text-text-secondary">Earliest Check-in</div><div className="mt-2 font-medium text-text-primary">{selectedOverview?.quickRules?.earliestCheckIn || 'Not set'}</div></div>
                    <div className="p-3 bg-bg-light rounded-lg border border-border-light"><div className="text-xs uppercase tracking-wide text-text-secondary">Latest Check-out</div><div className="mt-2 font-medium text-text-primary">{selectedOverview?.quickRules?.latestCheckOut || 'Not set'}</div></div>
                    <div className="p-3 bg-bg-light rounded-lg border border-border-light"><div className="text-xs uppercase tracking-wide text-text-secondary">Pet Fee</div><div className="mt-2 font-medium text-text-primary">{selectedOverview?.quickRules?.petFee || 'Not set'}</div></div>
                    <div className="p-3 bg-bg-light rounded-lg border border-border-light"><div className="text-xs uppercase tracking-wide text-text-secondary">Maximum Occupancy</div><div className="mt-2 font-medium text-text-primary">{selectedOverview?.quickRules?.maximumOccupancy || 'Not set'}</div></div>
                  </div>
                  <div><div className="text-xs uppercase tracking-wide text-text-secondary mb-1">Admin Notes</div><p className="leading-relaxed">{selectedOverview?.adminNotes || 'No admin notes saved yet.'}</p></div>
                </div>
              )}
            </div>
            ) : selectedDetailTab === 'subproperties' ? (
            <div className="rounded-xl border border-border-light bg-white p-5">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Subproperties / Collections</h2>
                  <p className="text-sm text-text-secondary mt-1">Manage the subproperties assigned to this property.</p>
                </div>
                {!showSubpropertyForm && (
                  <button
                    type="button"
                    onClick={startAddSubproperty}
                    className="px-3 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus size={15} />
                    Add Subproperty
                  </button>
                )}
              </div>
              {selectedSubproperties.length === 0 ? (
                <p className="text-sm text-text-secondary">No subproperties saved.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedSubproperties.map((subproperty) => (
                    <div key={subproperty.id} className="p-4 border border-border-light rounded-lg bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-medium text-text-primary truncate">{subproperty.name}</h3>
                          <p className="text-xs text-text-secondary mt-1">{subproperty.code || 'No code'} · {subproperty.status}</p>
                        </div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => openSubpropertyPage(subproperty)} className="p-1.5 hover:bg-bg-light rounded text-text-secondary hover:text-accent-blue" title="Manage sections"><Eye size={14} /></button>
                          <button type="button" onClick={() => startEditSubproperty(subproperty)} className="p-1.5 hover:bg-bg-light rounded text-text-secondary hover:text-accent-blue" title="Edit"><Edit3 size={14} /></button>
                          <button type="button" onClick={() => handleDeleteSubproperty(subproperty)} className="p-1.5 hover:bg-bg-light rounded text-text-secondary hover:text-accent-danger" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            ) : (
            <div className="rounded-xl border border-border-light bg-white p-5">
              <ProcedureCardsManager
                property={selectedProperty}
                procedures={selectedProcedures}
                subproperties={selectedSubproperties}
                adminRepository={adminRepository}
                onAdminDatabaseChange={onAdminDatabaseChange}
                onShowToast={onShowToast}
              />
            </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )

  const renderSubpropertyPage = () => (
    <div className="fixed inset-0 z-40 bg-white overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <button
          type="button"
          onClick={() => setActiveView('property')}
          className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={14} />
          Back to {selectedProperty?.name}
        </button>
        {selectedSubproperty && selectedProperty && (
          <SubpropertySectionsManager
            subproperty={selectedSubproperty}
            parentProperty={selectedProperty}
            sections={adminDatabase?.subpropertySections?.[selectedSubproperty.id]}
            procedures={selectedSubpropertyProcedures}
            adminRepository={adminRepository}
            onAdminDatabaseChange={onAdminDatabaseChange}
            onShowToast={onShowToast}
          />
        )}
      </div>
    </div>
  )

  return (
    <div className="h-full overflow-y-auto bg-white">
      {isOfflineAgiProperty && (
        <div className="fixed top-20 right-8 z-[60] flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow">
          <span>Offline copy. Connect to the server to edit and save this collection.</span>
          <button
            type="button"
            onClick={() => setActiveView(activeView === 'subproperty' ? 'property' : 'list')}
            className="rounded-md border border-amber-300 px-3 py-1.5 font-medium hover:bg-amber-100"
          >
            {activeView === 'subproperty' ? 'Back to collection' : 'Back to properties'}
          </button>
          <button
            type="button"
            onClick={onRetryServerConnection}
            className="rounded-md border border-amber-300 px-3 py-1.5 font-medium hover:bg-amber-100"
          >
            Retry connection
          </button>
        </div>
      )}
      <fieldset disabled={isOfflineAgiProperty} className="contents">
      {activeView === 'property-form' && renderPropertyForm()}
      {activeView === 'property' && selectedProperty && renderPropertyPage()}
      {activeView === 'subproperty' && selectedSubproperty && renderSubpropertyPage()}

      {activeView === 'list' && (
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <div className="text-sm font-semibold text-accent-blue mb-2">Manage</div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">Properties / Collections</h1>
            <p className="text-lg text-text-secondary">
              Add and maintain the property records used by admin management.
            </p>
          </div>
          <button
            onClick={() => {
              openAddPropertyForm()
            }}
            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add Property
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg border border-accent-blue">
            <div className="text-3xl font-bold text-accent-blue">{properties.length}</div>
            <div className="text-sm text-text-secondary mt-1">Total Properties</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-accent-success">
            <div className="text-3xl font-bold text-accent-success">{activeCount}</div>
            <div className="text-sm text-text-secondary mt-1">Active</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-accent-warning">
            <div className="text-3xl font-bold text-accent-warning">{inactiveCount}</div>
            <div className="text-sm text-text-secondary mt-1">Inactive</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 items-start">
          <section className="min-w-0">
            <div className="mb-4 flex gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-2.5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search name, code, city, state..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-light border border-border-light rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="px-4 py-2 bg-bg-light border border-border-light rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="bg-white border border-border-light rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr_120px] gap-4 px-4 py-3 bg-bg-light border-b border-border-light text-xs font-semibold text-text-secondary uppercase tracking-wide">
                <div>Property</div>
                <div>Status</div>
                <div>Location</div>
                <div>Procedures</div>
                <div>Updated</div>
                <div className="text-right">Actions</div>
              </div>

              {filteredProperties.length === 0 ? (
                <div className="p-8 text-center text-text-secondary">No properties found.</div>
              ) : (
                filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectProperty(property)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleSelectProperty(property)
                      }
                    }}
                    className={`w-full text-left grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.8fr_120px] gap-4 px-4 py-4 border-b border-border-light last:border-b-0 items-center hover:bg-bg-light ${
                      selectedPropertyId === property.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                        style={{ backgroundColor: property.color }}
                      >
                        {getInitials(property.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-text-primary truncate">{property.name}</div>
                        <div className="text-xs text-text-secondary truncate">{property.code}</div>
                      </div>
                    </div>

                    <div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          property.status === 'active'
                            ? 'bg-green-50 text-accent-success'
                            : 'bg-gray-100 text-text-secondary'
                        }`}
                      >
                        {property.status}
                      </span>
                    </div>

                    <div className="text-sm text-text-secondary truncate">
                      {[property.city, property.state].filter(Boolean).join(', ') || 'Not set'}
                    </div>

                    <div className="text-sm text-text-primary">
                      {property.verifiedCount}/{property.procedureCount}
                    </div>

                    <div className="text-sm text-text-secondary">{formatDate(property.updatedAt)}</div>

                    <div className="flex justify-end gap-1">
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          handleSelectProperty(property)
                        }}
                        className="p-2 hover:bg-white rounded-lg text-text-secondary hover:text-accent-blue"
                        title="Overview"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        disabled={!serverConnected && property.source === 'uploaded-agi-holdings'}
                        onClick={(event) => {
                          event.stopPropagation()
                          handleEdit(property)
                        }}
                        className="p-2 hover:bg-white rounded-lg text-text-secondary hover:text-accent-blue disabled:cursor-not-allowed disabled:opacity-40"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        disabled={!serverConnected && property.source === 'uploaded-agi-holdings'}
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDelete(property)
                        }}
                        className="p-2 hover:bg-white rounded-lg text-text-secondary hover:text-accent-danger disabled:cursor-not-allowed disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {false && <aside className="bg-white border border-border-light rounded-lg p-5">
            {selectedProperty ? (
              <div>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <button
                      onClick={resetSelection}
                      className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1 mb-3"
                    >
                      <ArrowLeft size={14} />
                      Properties
                    </button>
                    <h2 className="text-lg font-semibold text-text-primary">{selectedProperty.name}</h2>
                    <p className="text-sm text-text-secondary mt-1">
                      {selectedDetailTab === 'overview' ? 'Overview' : 'Procedure Cards'}
                    </p>
                  </div>
                  {selectedDetailTab === 'overview' && !editingOverview && (
                    <button
                      onClick={handleEditOverview}
                      className="px-3 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Edit3 size={15} />
                      Edit Overview
                    </button>
                  )}
                </div>

                <div className="flex gap-2 mb-5 border-b border-border-light">
                  <button
                    onClick={() => {
                      setSelectedDetailTab('overview')
                      setEditingOverview(false)
                    }}
                    className={`pb-3 text-sm font-medium relative ${
                      selectedDetailTab === 'overview'
                        ? 'text-accent-blue'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Overview
                    {selectedDetailTab === 'overview' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDetailTab('procedures')
                      setEditingOverview(false)
                    }}
                    className={`pb-3 text-sm font-medium relative ${
                      selectedDetailTab === 'procedures'
                        ? 'text-accent-blue'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Procedure Cards
                    {selectedDetailTab === 'procedures' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue" />
                    )}
                  </button>
                </div>

                {selectedDetailTab === 'overview' && editingOverview ? (
                  <form onSubmit={handleSaveOverview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Overview Summary</label>
                      <textarea
                        value={overviewFormData.summary}
                        onChange={(event) => updateOverviewField('summary', event.target.value)}
                        placeholder="Short operational summary for this collection"
                        rows={3}
                        className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Property Highlights</label>
                      <textarea
                        value={overviewFormData.propertyHighlights}
                        onChange={(event) => updateOverviewField('propertyHighlights', event.target.value)}
                        placeholder="Key amenities, operating notes, or guest-facing details"
                        rows={3}
                        className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                      />
                    </div>

                    <div className="pt-2 border-t border-border-light">
                      <h3 className="text-sm font-semibold text-text-primary mb-3">Quick Rules</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1">Earliest Check-in</label>
                          <input
                            value={overviewFormData.earliestCheckIn}
                            onChange={(event) => updateOverviewField('earliestCheckIn', event.target.value)}
                            placeholder="2:00 PM"
                            className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1">Latest Check-out</label>
                          <input
                            value={overviewFormData.latestCheckOut}
                            onChange={(event) => updateOverviewField('latestCheckOut', event.target.value)}
                            placeholder="11:00 AM"
                            className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1">Pet Fee</label>
                          <input
                            value={overviewFormData.petFee}
                            onChange={(event) => updateOverviewField('petFee', event.target.value)}
                            placeholder="$150 per stay"
                            className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-1">Maximum Occupancy</label>
                          <input
                            value={overviewFormData.maximumOccupancy}
                            onChange={(event) => updateOverviewField('maximumOccupancy', event.target.value)}
                            placeholder="10 guests"
                            className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Admin Notes</label>
                      <textarea
                        value={overviewFormData.adminNotes}
                        onChange={(event) => updateOverviewField('adminNotes', event.target.value)}
                        placeholder="Internal overview notes"
                        rows={3}
                        className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingOverview(false)}
                        className="px-4 py-2 bg-bg-light text-text-primary rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <Save size={16} />
                        Save Overview
                      </button>
                    </div>
                  </form>
                ) : selectedDetailTab === 'overview' ? (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Summary</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {selectedOverview?.summary || 'No overview summary saved yet.'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Property Highlights</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {selectedOverview?.propertyHighlights || 'No highlights saved yet.'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-3">Quick Rules</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-bg-light border border-border-light rounded-lg">
                          <div className="text-xs text-text-secondary">Earliest Check-in</div>
                          <div className="font-semibold text-text-primary mt-1">
                            {selectedOverview?.quickRules?.earliestCheckIn || 'Not set'}
                          </div>
                        </div>
                        <div className="p-3 bg-bg-light border border-border-light rounded-lg">
                          <div className="text-xs text-text-secondary">Latest Check-out</div>
                          <div className="font-semibold text-text-primary mt-1">
                            {selectedOverview?.quickRules?.latestCheckOut || 'Not set'}
                          </div>
                        </div>
                        <div className="p-3 bg-bg-light border border-border-light rounded-lg">
                          <div className="text-xs text-text-secondary">Pet Fee</div>
                          <div className="font-semibold text-text-primary mt-1">
                            {selectedOverview?.quickRules?.petFee || 'Not set'}
                          </div>
                        </div>
                        <div className="p-3 bg-bg-light border border-border-light rounded-lg">
                          <div className="text-xs text-text-secondary">Maximum Occupancy</div>
                          <div className="font-semibold text-text-primary mt-1">
                            {selectedOverview?.quickRules?.maximumOccupancy || 'Not set'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Admin Notes</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {selectedOverview?.adminNotes || 'No admin notes saved yet.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <ProcedureCardsManager
                    property={selectedProperty}
                    procedures={selectedProcedures}
                    adminRepository={adminRepository}
                    onAdminDatabaseChange={onAdminDatabaseChange}
                    onShowToast={onShowToast}
                  />
                )}
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      {isEditing ? 'Edit Property' : 'Add Property'}
                    </h2>
                    <p className="text-sm text-text-secondary mt-1">
                      {isEditing ? 'Update collection details.' : 'Create a new collection record.'}
                    </p>
                  </div>
                  {isEditing && (
                    <button
                      onClick={resetForm}
                      className="p-2 hover:bg-bg-light rounded-lg text-text-secondary"
                      title="Cancel editing"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Property / Collection Name</label>
                <input
                  value={formData.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="Property name"
                  className={`w-full px-3 py-2 bg-bg-light border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue ${
                    errors.name ? 'border-accent-danger' : 'border-border-light'
                  }`}
                />
                {errors.name && <div className="text-xs text-accent-danger mt-1">{errors.name}</div>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Property Code</label>
                  <input
                    value={formData.code}
                    onChange={(event) => updateField('code', event.target.value)}
                    placeholder="AGI"
                    className={`w-full px-3 py-2 bg-bg-light border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue ${
                      errors.code ? 'border-accent-danger' : 'border-border-light'
                    }`}
                  />
                  {errors.code && <div className="text-xs text-accent-danger mt-1">{errors.code}</div>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(event) => updateField('status', event.target.value)}
                    className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Property Type</label>
                <input
                  value={formData.type}
                  onChange={(event) => updateField('type', event.target.value)}
                  placeholder="Residential, Boutique Hotel, Collection..."
                  className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Address</label>
                <input
                  value={formData.address}
                  onChange={(event) => updateField('address', event.target.value)}
                  placeholder="Street address"
                  className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">City</label>
                  <input
                    value={formData.city}
                    onChange={(event) => updateField('city', event.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">State</label>
                  <input
                    value={formData.state}
                    onChange={(event) => updateField('state', event.target.value)}
                    placeholder="State"
                    className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Country</label>
                  <input
                    value={formData.country}
                    onChange={(event) => updateField('country', event.target.value)}
                    placeholder="Country"
                    className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Timezone</label>
                  <input
                    value={formData.timezone}
                    onChange={(event) => updateField('timezone', event.target.value)}
                    placeholder="America/New_York"
                    className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border-light">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Contact</h3>
                <div className="space-y-3">
                  <input
                    value={formData.contactName}
                    onChange={(event) => updateField('contactName', event.target.value)}
                    placeholder="Contact name"
                    className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                  <input
                    value={formData.contactPhone}
                    onChange={(event) => updateField('contactPhone', event.target.value)}
                    placeholder="Contact phone"
                    className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                  <input
                    value={formData.contactEmail}
                    onChange={(event) => updateField('contactEmail', event.target.value)}
                    placeholder="Contact email"
                    className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(event) => updateField('notes', event.target.value)}
                  placeholder="Internal notes for admins"
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-bg-light text-text-primary rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  {isEditing ? 'Save Changes' : 'Save Property'}
                </button>
              </div>
                </form>
              </>
            )}
          </aside>}
        </div>
      </div>
      )}
      </fieldset>
    </div>
  )
}

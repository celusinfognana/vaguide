import React, { useMemo, useState } from 'react'
import { Edit3, GitBranch, Plus, Save, Trash2, X } from 'lucide-react'
import { procedureCategoryGroups } from '../../data/workflowData'
import ProcessFlowBuilder from './ProcessFlowBuilder'

const emptyProcedureForm = {
  name: '',
  subpropertyId: '',
  isGeneralProcedure: false,
  channel: 'chat',
  category: 'chat-reservations',
  description: '',
  keywords: '',
}

const getCategoriesForChannel = (channel) =>
  procedureCategoryGroups.find((group) => group.id === channel)?.categories || []

const getCategoryName = (categoryId) => {
  const category = procedureCategoryGroups
    .flatMap((group) => group.categories)
    .find((item) => item.id === categoryId)

  return category?.name || categoryId
}

const parseKeywords = (keywords) =>
  keywords
    .split(/[\n,]+/)
    .map((keyword) => keyword.trim())
    .filter(Boolean)

const formatKeywords = (keywords) => (Array.isArray(keywords) ? keywords.join(', ') : '')

export default function ProcedureCardsManager({
  property,
  procedures,
  subproperties = [],
  adminRepository,
  onAdminDatabaseChange,
  onShowToast,
  defaultSubpropertyId = '',
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingProcedureId, setEditingProcedureId] = useState(null)
  const [flowProcedureId, setFlowProcedureId] = useState(null)
  const [formData, setFormData] = useState(emptyProcedureForm)
  const [errors, setErrors] = useState({})

  const sortedProcedures = useMemo(
    () => [...procedures].sort((a, b) => a.name.localeCompare(b.name)),
    [procedures],
  )

  const isEditing = Boolean(editingProcedureId)
  const flowProcedure = procedures.find((procedure) => procedure.id === flowProcedureId)
  const availableCategories = getCategoriesForChannel(formData.channel)

  const resetForm = () => {
    setShowForm(false)
    setEditingProcedureId(null)
    setFormData(emptyProcedureForm)
    setErrors({})
  }

  const startAdd = () => {
    setFlowProcedureId(null)
    setShowForm(true)
    setEditingProcedureId(null)
    setFormData({ ...emptyProcedureForm, subpropertyId: defaultSubpropertyId, isGeneralProcedure: false })
    setErrors({})
  }

  const startEdit = (procedure) => {
    setFlowProcedureId(null)
    setShowForm(true)
    setEditingProcedureId(procedure.id)
    setFormData({
      name: procedure.name || '',
      subpropertyId: procedure.subpropertyId || '',
      isGeneralProcedure: Boolean(procedure.isGeneralProcedure) && !procedure.subpropertyId,
      channel: procedure.channel || 'chat',
      category: procedure.category || 'chat-reservations',
      description: procedure.description || '',
      keywords: formatKeywords(procedure.keywords),
    })
    setErrors({})
  }

  const updateField = (field, value) => {
    setFormData((current) => {
      if (field === 'channel') {
        return {
          ...current,
          channel: value,
          category: getCategoriesForChannel(value)[0]?.id || '',
        }
      }

      if (field === 'isGeneralProcedure') {
        return {
          ...current,
          isGeneralProcedure: value,
          subpropertyId: value ? '' : current.subpropertyId || defaultSubpropertyId,
        }
      }

      return { ...current, [field]: value }
    })
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validateForm = () => {
    const nextErrors = {}

    if (!formData.name.trim()) nextErrors.name = 'Required'
    if (!formData.channel) nextErrors.channel = 'Required'
    if (!formData.category) nextErrors.category = 'Required'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!validateForm()) return

    const payload = {
      propertyId: property.id,
      subpropertyId: formData.isGeneralProcedure ? '' : formData.subpropertyId,
      isGeneralProcedure: formData.isGeneralProcedure,
      name: formData.name.trim(),
      channel: formData.channel,
      category: formData.category,
      description: formData.description.trim(),
      keywords: parseKeywords(formData.keywords),
      status: isEditing
        ? procedures.find((procedure) => procedure.id === editingProcedureId)?.status || 'unverified'
        : 'unverified',
    }

    const nextDatabase = isEditing
      ? adminRepository.updateProcedure(editingProcedureId, payload)
      : adminRepository.createProcedure(payload)

    onAdminDatabaseChange(nextDatabase)
    onShowToast(isEditing ? 'Procedure card saved successfully.' : 'Procedure card created successfully.')
    resetForm()
  }

  const handleDelete = (procedure) => {
    const confirmed = window.confirm(`Delete ${procedure.name}?`)
    if (!confirmed) return

    const nextDatabase = adminRepository.deleteProcedure(procedure.id)
    onAdminDatabaseChange(nextDatabase)
    onShowToast('Procedure card deleted.')

    if (editingProcedureId === procedure.id) {
      resetForm()
    }

    if (flowProcedureId === procedure.id) {
      setFlowProcedureId(null)
    }
  }

  if (flowProcedure) {
    return (
      <ProcessFlowBuilder
        property={property}
        procedure={flowProcedure}
        adminRepository={adminRepository}
        onAdminDatabaseChange={onAdminDatabaseChange}
        onShowToast={onShowToast}
        onBack={() => setFlowProcedureId(null)}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Procedure Cards</h3>
          <p className="text-xs text-text-secondary mt-1">{procedures.length} saved for this collection</p>
        </div>
        {!showForm && (
          <button
            onClick={startAdd}
            className="px-3 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus size={15} />
            Add
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-bg-light border border-border-light rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-semibold text-text-primary">{isEditing ? 'Edit Procedure Card' : 'Add Procedure Card'}</h4>
              <p className="text-xs text-text-secondary mt-1">Create the card agents can later use in workflows.</p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 hover:bg-white rounded-lg text-text-secondary"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Procedure Name</label>
            <input
              value={formData.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Early Check-in"
              className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue ${
                errors.name ? 'border-accent-danger' : 'border-border-light'
              }`}
            />
            {errors.name && <div className="text-xs text-accent-danger mt-1">{errors.name}</div>}
          </div>

          <label className="flex items-center gap-3 p-3 bg-white border border-border-light rounded-lg text-sm text-text-primary">
            <input
              type="checkbox"
              checked={formData.isGeneralProcedure}
              onChange={(event) => updateField('isGeneralProcedure', event.target.checked)}
              className="h-4 w-4 rounded border-border-light text-accent-blue focus:ring-accent-blue"
            />
            <span className="font-medium">General Procedure</span>
          </label>

          {subproperties.length > 0 && !formData.isGeneralProcedure && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Subproperty / Collection</label>
              <select
                value={formData.subpropertyId}
                onChange={(event) => updateField('subpropertyId', event.target.value)}
                className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
              >
                <option value="">Unassigned</option>
                {subproperties.map((subproperty) => (
                  <option key={subproperty.id} value={subproperty.id}>
                    {subproperty.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Channel</label>
              <select
                value={formData.channel}
                onChange={(event) => updateField('channel', event.target.value)}
                className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
              >
                <option value="chat">Chat</option>
                <option value="call">Call</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(event) => updateField('category', event.target.value)}
                className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue ${
                  errors.category ? 'border-accent-danger' : 'border-border-light'
                }`}
              >
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && <div className="text-xs text-accent-danger mt-1">{errors.category}</div>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Handle guest requests for early arrival."
              rows={3}
              className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Keywords</label>
            <textarea
              value={formData.keywords}
              onChange={(event) => updateField('keywords', event.target.value)}
              placeholder="early, early check-in, early arrival"
              rows={2}
              className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-white text-text-primary rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </form>
      )}

      {sortedProcedures.length === 0 && !showForm ? (
        <div className="p-6 text-center border border-dashed border-border-light rounded-lg">
          <p className="text-sm text-text-secondary mb-3">No procedure cards have been added yet.</p>
          <button
            onClick={startAdd}
            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2 text-sm"
          >
            <Plus size={15} />
            Add Procedure Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedProcedures.map((procedure) => (
            <div
              key={procedure.id}
              role="button"
              tabIndex={0}
              onClick={() => setFlowProcedureId(procedure.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setFlowProcedureId(procedure.id)
                }
              }}
              className="p-4 bg-white border border-border-light rounded-lg hover:shadow-soft cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-text-primary text-sm truncate">{procedure.name}</h4>
                  <p className="text-xs text-text-secondary mt-1 truncate">{getCategoryName(procedure.category)}</p>
                  {procedure.isGeneralProcedure && !procedure.subpropertyId && (
                    <p className="text-xs text-accent-blue mt-0.5 truncate">General Procedure</p>
                  )}
                  {procedure.subpropertyId && (
                    <p className="text-xs text-text-secondary mt-0.5 truncate">
                      {subproperties.find((subproperty) => subproperty.id === procedure.subpropertyId)?.name || 'Subproperty'}
                    </p>
                  )}
                </div>
                <span
                  className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                    procedure.channel === 'chat'
                      ? 'bg-accent-chat/10 text-accent-chat'
                      : 'bg-accent-call/10 text-accent-call'
                  }`}
                >
                  {procedure.channel === 'chat' ? 'Chat' : 'Call'}
                </span>
              </div>

              <p className="text-sm text-text-secondary line-clamp-3 mb-3">
                {procedure.description || 'No description saved.'}
              </p>

              {procedure.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {procedure.keywords.slice(0, 5).map((keyword) => (
                    <span key={keyword} className="text-[10px] px-2 py-1 bg-bg-light text-text-secondary rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border-light">
                <span className="text-xs text-text-secondary">{procedure.steps?.length || 0} steps</span>
                <div className="flex gap-1">
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      setFlowProcedureId(procedure.id)
                    }}
                    className="px-3 py-2 hover:bg-bg-light rounded-lg text-sm text-text-secondary hover:text-accent-blue flex items-center gap-1"
                    title="Edit process flow"
                  >
                    <GitBranch size={15} />
                    Flow
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      startEdit(procedure)
                    }}
                    className="p-2 hover:bg-bg-light rounded-lg text-text-secondary hover:text-accent-blue"
                    title="Edit"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      handleDelete(procedure)
                    }}
                    className="p-2 hover:bg-bg-light rounded-lg text-text-secondary hover:text-accent-danger"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}




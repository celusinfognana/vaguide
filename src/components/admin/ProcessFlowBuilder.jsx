import React, { useMemo, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, GitBranch, Plus, Save, Trash2, X } from 'lucide-react'

const stepTypes = [
  { value: 'normal', label: 'Normal Step' },
  { value: 'important', label: 'Important' },
  { value: 'warning', label: 'Warning' },
  { value: 'contact', label: 'Contact' },
  { value: 'charge', label: 'Charge' },
  { value: 'cleaner-contact', label: 'Cleaner Contact' },
  { value: 'decision', label: 'Decision / Branch' },
]

const createStep = (order, type = 'normal') => ({
  id: `draft-step-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  order,
  title: '',
  instructions: '',
  type,
  importantMessage: '',
  warningMessage: '',
  contact: {
    name: '',
    phone: '',
    email: '',
    method: '',
  },
  charge: {
    name: '',
    amount: '',
    currency: 'USD',
    whoPays: '',
    amountType: 'informational',
  },
  branches: [],
})

const createBranch = () => ({
  id: `draft-branch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  optionName: '',
  description: '',
  nextStepId: '',
  steps: [],
})

const normalizeOrders = (steps) => steps.map((step, index) => ({ ...step, order: index + 1 }))

const getStepTypeLabel = (type) => stepTypes.find((stepType) => stepType.value === type)?.label || 'Normal Step'

const getValidationErrors = (steps) => {
  const errors = {}

  steps.forEach((step) => {
    if (!step.title.trim()) errors[`${step.id}.title`] = 'Required'
    if (!step.instructions.trim()) errors[`${step.id}.instructions`] = 'Required'

    if (step.type === 'decision') {
      if (step.branches.length < 2) errors[`${step.id}.branches`] = 'Add at least 2 branch options'

      step.branches.forEach((branch) => {
        if (!branch.optionName.trim()) errors[`${step.id}.${branch.id}.optionName`] = 'Required'
        branch.steps.forEach((branchStep) => {
          if (!branchStep.title.trim()) errors[`${step.id}.${branch.id}.${branchStep.id}.title`] = 'Required'
          if (!branchStep.instructions.trim()) {
            errors[`${step.id}.${branch.id}.${branchStep.id}.instructions`] = 'Required'
          }
        })
      })
    }
  })

  return errors
}

export default function ProcessFlowBuilder({
  property,
  procedure,
  adminRepository,
  onAdminDatabaseChange,
  onShowToast,
  onBack,
}) {
  const [steps, setSteps] = useState(() => normalizeOrders(procedure.steps || []))
  const [selectedStepId, setSelectedStepId] = useState(steps[0]?.id || null)
  const [errors, setErrors] = useState({})
  const [showPreview, setShowPreview] = useState(true)

  const selectedStep = useMemo(
    () => steps.find((step) => step.id === selectedStepId) || steps[0] || null,
    [steps, selectedStepId],
  )

  const updateSteps = (updater) => {
    setSteps((current) => {
      const nextSteps = normalizeOrders(typeof updater === 'function' ? updater(current) : updater)
      if (!nextSteps.some((step) => step.id === selectedStepId)) {
        setSelectedStepId(nextSteps[0]?.id || null)
      }
      return nextSteps
    })
  }

  const updateStep = (stepId, updates) => {
    updateSteps((current) =>
      current.map((step) => {
        if (step.id !== stepId) return step
        const nextStep = { ...step, ...updates }
        if (updates.type === 'decision' && step.branches.length === 0) {
          nextStep.branches = [createBranch(), createBranch()]
        }
        if (updates.type && updates.type !== 'decision') {
          nextStep.branches = []
        }
        return nextStep
      }),
    )
    setErrors((current) => ({ ...current, [`${stepId}.title`]: '', [`${stepId}.instructions`]: '' }))
  }

  const addStep = (type = 'normal') => {
    const step = createStep(steps.length + 1, type)
    updateSteps([...steps, step])
    setSelectedStepId(step.id)
  }

  const duplicateStep = (stepId) => {
    const source = steps.find((step) => step.id === stepId)
    if (!source) return

    const duplicate = {
      ...JSON.parse(JSON.stringify(source)),
      id: `draft-step-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: `${source.title || 'Untitled Step'} Copy`,
    }

    updateSteps((current) => {
      const index = current.findIndex((step) => step.id === stepId)
      return [...current.slice(0, index + 1), duplicate, ...current.slice(index + 1)]
    })
    setSelectedStepId(duplicate.id)
  }

  const deleteStep = (stepId) => {
    updateSteps((current) => current.filter((step) => step.id !== stepId))
  }

  const moveStep = (stepId, direction) => {
    updateSteps((current) => {
      const index = current.findIndex((step) => step.id === stepId)
      const targetIndex = index + direction
      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return current

      const nextSteps = [...current]
      const [step] = nextSteps.splice(index, 1)
      nextSteps.splice(targetIndex, 0, step)
      return nextSteps
    })
  }

  const updateBranch = (stepId, branchId, updates) => {
    updateSteps((current) =>
      current.map((step) =>
        step.id === stepId
          ? {
              ...step,
              branches: step.branches.map((branch) =>
                branch.id === branchId ? { ...branch, ...updates } : branch,
              ),
            }
          : step,
      ),
    )
  }

  const addBranch = (stepId) => {
    updateSteps((current) =>
      current.map((step) =>
        step.id === stepId ? { ...step, branches: [...step.branches, createBranch()] } : step,
      ),
    )
  }

  const deleteBranch = (stepId, branchId) => {
    updateSteps((current) =>
      current.map((step) =>
        step.id === stepId
          ? { ...step, branches: step.branches.filter((branch) => branch.id !== branchId) }
          : step,
      ),
    )
  }

  const addBranchStep = (stepId, branchId) => {
    updateSteps((current) =>
      current.map((step) =>
        step.id === stepId
          ? {
              ...step,
              branches: step.branches.map((branch) =>
                branch.id === branchId
                  ? { ...branch, steps: [...branch.steps, createStep(branch.steps.length + 1)] }
                  : branch,
              ),
            }
          : step,
      ),
    )
  }

  const updateBranchStep = (stepId, branchId, branchStepId, updates) => {
    updateSteps((current) =>
      current.map((step) =>
        step.id === stepId
          ? {
              ...step,
              branches: step.branches.map((branch) =>
                branch.id === branchId
                  ? {
                      ...branch,
                      steps: normalizeOrders(
                        branch.steps.map((branchStep) =>
                          branchStep.id === branchStepId ? { ...branchStep, ...updates } : branchStep,
                        ),
                      ),
                    }
                  : branch,
              ),
            }
          : step,
      ),
    )
  }

  const deleteBranchStep = (stepId, branchId, branchStepId) => {
    updateSteps((current) =>
      current.map((step) =>
        step.id === stepId
          ? {
              ...step,
              branches: step.branches.map((branch) =>
                branch.id === branchId
                  ? { ...branch, steps: normalizeOrders(branch.steps.filter((branchStep) => branchStep.id !== branchStepId)) }
                  : branch,
              ),
            }
          : step,
      ),
    )
  }

  const moveBranchStep = (stepId, branchId, branchStepId, direction) => {
    updateSteps((current) =>
      current.map((step) => {
        if (step.id !== stepId) return step

        return {
          ...step,
          branches: step.branches.map((branch) => {
            if (branch.id !== branchId) return branch

            const index = branch.steps.findIndex((branchStep) => branchStep.id === branchStepId)
            const targetIndex = index + direction
            if (index < 0 || targetIndex < 0 || targetIndex >= branch.steps.length) return branch

            const nextBranchSteps = [...branch.steps]
            const [branchStep] = nextBranchSteps.splice(index, 1)
            nextBranchSteps.splice(targetIndex, 0, branchStep)

            return { ...branch, steps: normalizeOrders(nextBranchSteps) }
          }),
        }
      }),
    )
  }

  const saveWorkflow = () => {
    const nextErrors = getValidationErrors(steps)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const nextDatabase = adminRepository.saveWorkflow(procedure.id, steps)
    onAdminDatabaseChange(nextDatabase)
    onShowToast('Process flow saved successfully.')
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="h-16 border-b border-border-light px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={onBack} className="p-2 hover:bg-bg-light rounded-lg text-text-secondary" title="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-text-primary truncate">{procedure.name}</h1>
            <p className="text-sm text-text-secondary truncate">{property.name} / Process Flow Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview((current) => !current)}
            className="px-4 py-2 bg-bg-light text-text-primary rounded-lg hover:bg-gray-100 transition-colors"
          >
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            onClick={saveWorkflow}
            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-hidden grid ${showPreview ? 'grid-cols-[280px_1fr_360px]' : 'grid-cols-[280px_1fr]'}`}>
        <aside className="border-r border-border-light bg-bg-light overflow-y-auto">
          <div className="p-4 border-b border-border-light bg-white">
            <button
              onClick={() => addStep('normal')}
              className="w-full px-3 py-2 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={16} />
              Add Step
            </button>
            <button
              onClick={() => addStep('decision')}
              className="w-full mt-2 px-3 py-2 bg-white border border-border-light text-text-primary rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <GitBranch size={16} />
              Add Branch / Decision
            </button>
          </div>

          <div className="p-3 space-y-2">
            {steps.length === 0 ? (
              <div className="p-4 text-center text-sm text-text-secondary">No steps yet.</div>
            ) : (
              steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setSelectedStepId(step.id)}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    selectedStep?.id === step.id
                      ? 'bg-blue-50 border-accent-blue'
                      : 'bg-white border-border-light hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white border border-border-light text-xs font-semibold text-text-secondary flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text-primary truncate">{step.title || 'Untitled Step'}</div>
                      <div className="text-xs text-text-secondary mt-1">{getStepTypeLabel(step.type)}</div>
                      {step.type === 'decision' && (
                        <div className="text-xs text-accent-blue mt-1">{step.branches.length} branches</div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="overflow-y-auto">
          {selectedStep ? (
            <div className="max-w-3xl mx-auto px-8 py-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-text-primary">Step Editor</h2>
                  <p className="text-sm text-text-secondary mt-1">Write the instructions and choose how this step behaves.</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveStep(selectedStep.id, -1)}
                    className="p-2 hover:bg-bg-light rounded-lg text-text-secondary"
                    title="Move up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveStep(selectedStep.id, 1)}
                    className="p-2 hover:bg-bg-light rounded-lg text-text-secondary"
                    title="Move down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => duplicateStep(selectedStep.id)}
                    className="px-3 py-2 hover:bg-bg-light rounded-lg text-sm text-text-secondary"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => deleteStep(selectedStep.id)}
                    className="p-2 hover:bg-bg-light rounded-lg text-text-secondary hover:text-accent-danger"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Step Title</label>
                  <input
                    value={selectedStep.title}
                    onChange={(event) => updateStep(selectedStep.id, { title: event.target.value })}
                    placeholder="Confirm request"
                    className={`w-full px-3 py-2 bg-bg-light border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue ${
                      errors[`${selectedStep.id}.title`] ? 'border-accent-danger' : 'border-border-light'
                    }`}
                  />
                  {errors[`${selectedStep.id}.title`] && (
                    <div className="text-xs text-accent-danger mt-1">{errors[`${selectedStep.id}.title`]}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Step Type</label>
                  <select
                    value={selectedStep.type}
                    onChange={(event) => updateStep(selectedStep.id, { type: event.target.value })}
                    className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    {stepTypes.map((stepType) => (
                      <option key={stepType.value} value={stepType.value}>
                        {stepType.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    {selectedStep.type === 'decision' ? 'Decision / Question' : 'Instructions'}
                  </label>
                  <textarea
                    value={selectedStep.instructions}
                    onChange={(event) => updateStep(selectedStep.id, { instructions: event.target.value })}
                    placeholder={
                      selectedStep.type === 'decision'
                        ? 'Same-day turnover?'
                        : "Confirm the guest's requested arrival time and reservation details."
                    }
                    rows={4}
                    className={`w-full px-3 py-2 bg-bg-light border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none ${
                      errors[`${selectedStep.id}.instructions`] ? 'border-accent-danger' : 'border-border-light'
                    }`}
                  />
                  {errors[`${selectedStep.id}.instructions`] && (
                    <div className="text-xs text-accent-danger mt-1">{errors[`${selectedStep.id}.instructions`]}</div>
                  )}
                </div>

                {selectedStep.type === 'important' && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Important Message</label>
                    <input
                      value={selectedStep.importantMessage}
                      onChange={(event) => updateStep(selectedStep.id, { importantMessage: event.target.value })}
                      placeholder="Earliest standard check-in is 2:00 PM."
                      className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                  </div>
                )}

                {selectedStep.type === 'warning' && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Warning Message</label>
                    <input
                      value={selectedStep.warningMessage}
                      onChange={(event) => updateStep(selectedStep.id, { warningMessage: event.target.value })}
                      placeholder="Do not approve without property confirmation."
                      className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                  </div>
                )}

                {selectedStep.type === 'contact' && (
                  <div className="grid grid-cols-2 gap-3 p-4 bg-bg-light border border-border-light rounded-lg">
                    <input
                      value={selectedStep.contact.name}
                      onChange={(event) => updateStep(selectedStep.id, { contact: { ...selectedStep.contact, name: event.target.value } })}
                      placeholder="Contact name"
                      className="px-3 py-2 bg-white border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                    <input
                      value={selectedStep.contact.method}
                      onChange={(event) => updateStep(selectedStep.id, { contact: { ...selectedStep.contact, method: event.target.value } })}
                      placeholder="Phone/Text"
                      className="px-3 py-2 bg-white border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                    <input
                      value={selectedStep.contact.phone}
                      onChange={(event) => updateStep(selectedStep.id, { contact: { ...selectedStep.contact, phone: event.target.value } })}
                      placeholder="Phone"
                      className="px-3 py-2 bg-white border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                    <input
                      value={selectedStep.contact.email}
                      onChange={(event) => updateStep(selectedStep.id, { contact: { ...selectedStep.contact, email: event.target.value } })}
                      placeholder="Email"
                      className="px-3 py-2 bg-white border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                  </div>
                )}

                {selectedStep.type === 'charge' && (
                  <div className="grid grid-cols-2 gap-3 p-4 bg-bg-light border border-border-light rounded-lg">
                    <input
                      value={selectedStep.charge.name}
                      onChange={(event) => updateStep(selectedStep.id, { charge: { ...selectedStep.charge, name: event.target.value } })}
                      placeholder="Charge name"
                      className="px-3 py-2 bg-white border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                    <select
                      value={selectedStep.charge.amountType}
                      onChange={(event) => updateStep(selectedStep.id, { charge: { ...selectedStep.charge, amountType: event.target.value } })}
                      className="px-3 py-2 bg-white border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    >
                      <option value="informational">No amount / informational</option>
                      <option value="fixed">Fixed amount</option>
                      <option value="percentage">Percentage</option>
                    </select>
                    <input
                      value={selectedStep.charge.amount}
                      onChange={(event) => updateStep(selectedStep.id, { charge: { ...selectedStep.charge, amount: event.target.value } })}
                      placeholder="Amount"
                      className="px-3 py-2 bg-white border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                    <input
                      value={selectedStep.charge.whoPays}
                      onChange={(event) => updateStep(selectedStep.id, { charge: { ...selectedStep.charge, whoPays: event.target.value } })}
                      placeholder="Who pays"
                      className="px-3 py-2 bg-white border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                  </div>
                )}

                {selectedStep.type === 'decision' && (
                  <div className="space-y-4 p-4 bg-bg-light border border-border-light rounded-lg">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary">Branch Options</h3>
                        {errors[`${selectedStep.id}.branches`] && (
                          <div className="text-xs text-accent-danger mt-1">{errors[`${selectedStep.id}.branches`]}</div>
                        )}
                      </div>
                      <button
                        onClick={() => addBranch(selectedStep.id)}
                        className="px-3 py-2 bg-white border border-border-light rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Plus size={15} />
                        Add Branch
                      </button>
                    </div>

                    {selectedStep.branches.map((branch, branchIndex) => (
                      <div key={branch.id} className="bg-white border border-border-light rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="text-sm font-semibold text-text-primary">Branch {branchIndex + 1}</div>
                          <button
                            onClick={() => deleteBranch(selectedStep.id, branch.id)}
                            className="p-1.5 hover:bg-bg-light rounded-lg text-text-secondary hover:text-accent-danger"
                            title="Delete branch"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <input
                              value={branch.optionName}
                              onChange={(event) => updateBranch(selectedStep.id, branch.id, { optionName: event.target.value })}
                              placeholder="YES - guest checks out same day"
                              className={`w-full px-3 py-2 bg-bg-light border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue ${
                                errors[`${selectedStep.id}.${branch.id}.optionName`] ? 'border-accent-danger' : 'border-border-light'
                              }`}
                            />
                            {errors[`${selectedStep.id}.${branch.id}.optionName`] && (
                              <div className="text-xs text-accent-danger mt-1">
                                {errors[`${selectedStep.id}.${branch.id}.optionName`]}
                              </div>
                            )}
                          </div>
                          <textarea
                            value={branch.description}
                            onChange={(event) => updateBranch(selectedStep.id, branch.id, { description: event.target.value })}
                            placeholder="Describe when this branch applies."
                            rows={2}
                            className="w-full px-3 py-2 bg-bg-light border border-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
                          />

                          <div className="pt-3 border-t border-border-light space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-text-primary">Branch-specific Steps</div>
                              <button
                                onClick={() => addBranchStep(selectedStep.id, branch.id)}
                                className="px-3 py-2 bg-bg-light text-text-primary rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm"
                              >
                                <Plus size={14} />
                                Add Branch Step
                              </button>
                            </div>

                            {branch.steps.length === 0 ? (
                              <div className="text-sm text-text-secondary">No branch-specific steps yet.</div>
                            ) : (
                              branch.steps.map((branchStep, branchStepIndex) => (
                                <div key={branchStep.id} className="p-3 bg-bg-light border border-border-light rounded-lg space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-xs font-semibold text-text-secondary">Step {branchStepIndex + 1}</div>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => moveBranchStep(selectedStep.id, branch.id, branchStep.id, -1)}
                                        className="p-1 hover:bg-white rounded text-text-secondary"
                                        title="Move up"
                                      >
                                        <ArrowUp size={13} />
                                      </button>
                                      <button
                                        onClick={() => moveBranchStep(selectedStep.id, branch.id, branchStep.id, 1)}
                                        className="p-1 hover:bg-white rounded text-text-secondary"
                                        title="Move down"
                                      >
                                        <ArrowDown size={13} />
                                      </button>
                                      <button
                                        onClick={() => deleteBranchStep(selectedStep.id, branch.id, branchStep.id)}
                                        className="p-1 hover:bg-white rounded text-text-secondary hover:text-accent-danger"
                                        title="Delete branch step"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                  <input
                                    value={branchStep.title}
                                    onChange={(event) =>
                                      updateBranchStep(selectedStep.id, branch.id, branchStep.id, { title: event.target.value })
                                    }
                                    placeholder="Decline early check-in"
                                    className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue ${
                                      errors[`${selectedStep.id}.${branch.id}.${branchStep.id}.title`]
                                        ? 'border-accent-danger'
                                        : 'border-border-light'
                                    }`}
                                  />
                                  <textarea
                                    value={branchStep.instructions}
                                    onChange={(event) =>
                                      updateBranchStep(selectedStep.id, branch.id, branchStep.id, { instructions: event.target.value })
                                    }
                                    placeholder="Explain what the admin or agent should do for this branch."
                                    rows={2}
                                    className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none ${
                                      errors[`${selectedStep.id}.${branch.id}.${branchStep.id}.instructions`]
                                        ? 'border-accent-danger'
                                        : 'border-border-light'
                                    }`}
                                  />
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-text-secondary">
              Add a step to start building this process flow.
            </div>
          )}
        </main>

        {showPreview && (
          <aside className="border-l border-border-light bg-bg-light overflow-y-auto">
            <div className="p-5">
              <h2 className="text-lg font-semibold text-text-primary mb-1">Preview</h2>
              <p className="text-sm text-text-secondary mb-5">A visual outline of the process flow.</p>

              {steps.length === 0 ? (
                <div className="p-5 bg-white border border-border-light rounded-lg text-sm text-text-secondary">
                  No steps to preview.
                </div>
              ) : (
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={step.id}>
                      <div className="p-4 bg-white border border-border-light rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-accent-blue text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-text-primary">{step.title || 'Untitled Step'}</div>
                            <div className="text-xs text-text-secondary mt-1">{getStepTypeLabel(step.type)}</div>
                            <p className="text-sm text-text-secondary mt-2">{step.instructions || 'No instructions entered.'}</p>
                          </div>
                        </div>
                      </div>

                      {step.type === 'decision' && step.branches.length > 0 && (
                        <div className="ml-5 mt-3 space-y-3 border-l-2 border-accent-blue pl-4">
                          {step.branches.map((branch) => (
                            <div key={branch.id} className="bg-white border border-border-light rounded-lg p-3">
                              <div className="text-sm font-semibold text-accent-blue">{branch.optionName || 'Branch option'}</div>
                              {branch.description && <p className="text-xs text-text-secondary mt-1">{branch.description}</p>}
                              {branch.steps.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {branch.steps.map((branchStep, branchStepIndex) => (
                                    <div key={branchStep.id} className="p-3 bg-bg-light rounded-lg">
                                      <div className="text-xs font-semibold text-text-secondary">Branch Step {branchStepIndex + 1}</div>
                                      <div className="text-sm font-medium text-text-primary mt-1">
                                        {branchStep.title || 'Untitled branch step'}
                                      </div>
                                      <p className="text-xs text-text-secondary mt-1">
                                        {branchStep.instructions || 'No instructions entered.'}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, X, AlertCircle, Phone, AlertTriangle, Check } from 'lucide-react'

export default function WorkflowRunner({ procedure, property, onComplete, onShowToast }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [visitedSteps, setVisitedSteps] = useState(new Set([0]))

  const currentStep = procedure.steps[currentStepIndex]
  const totalSteps = procedure.steps.length
  const progress = ((currentStepIndex + 1) / totalSteps) * 100

  const handleBranchSelect = (nextStep) => {
    setCurrentStepIndex(nextStep - 1)
    setVisitedSteps(prev => new Set([...prev, nextStep - 1]))
  }

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      const nextIndex = currentStepIndex + 1
      setCurrentStepIndex(nextIndex)
      setVisitedSteps(prev => new Set([...prev, nextIndex]))
    } else {
      onComplete()
      onShowToast('Workflow completed successfully!')
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const alertColors = {
    warning: { bg: 'bg-yellow-50', border: 'border-accent-warning', icon: AlertTriangle, text: 'text-accent-warning' },
    contact: { bg: 'bg-blue-50', border: 'border-accent-chat', icon: Phone, text: 'text-accent-chat' },
    important: { bg: 'bg-orange-50', border: 'border-orange-300', icon: AlertCircle, text: 'text-orange-600' },
  }

  const getAlertStyle = (type) => {
    return alertColors[type] || alertColors.important
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">{procedure.name}</h1>
            <p className="text-text-secondary">{property.name}</p>
          </div>
          <button
            onClick={onComplete}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X size={24} className="text-text-secondary" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-text-primary">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span className="text-sm text-text-secondary">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-border-light">
            <div
              className="h-full bg-gradient-to-r from-accent-blue to-accent-chat transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-border-light p-8 mb-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">{currentStep.title}</h2>
          <p className="text-lg text-text-secondary mb-6 leading-relaxed">{currentStep.instruction}</p>

          {/* Alert if present */}
          {currentStep.alert && (
            <div className={`p-4 rounded-lg border-2 mb-6 ${getAlertStyle(currentStep.alert.type).bg} ${getAlertStyle(currentStep.alert.type).border}`}>
              <div className="flex items-start gap-3">
                {React.createElement(getAlertStyle(currentStep.alert.type).icon, {
                  size: 20,
                  className: getAlertStyle(currentStep.alert.type).text
                })}
                <div>
                  <div className={`font-semibold ${getAlertStyle(currentStep.alert.type).text}`}>
                    {currentStep.alert.type.toUpperCase()}
                  </div>
                  <p className="text-sm text-text-secondary mt-1">{currentStep.alert.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Branches */}
          {currentStep.branches && currentStep.branches.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-text-secondary mb-3">Select an option to continue:</p>
              {currentStep.branches.map((branch, idx) => (
                <button
                  key={idx}
                  onClick={() => handleBranchSelect(branch.nextStep)}
                  className="w-full p-4 bg-blue-50 border-2 border-accent-blue rounded-lg hover:bg-blue-100 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-accent-blue group-hover:scale-125 transition-transform"></div>
                    <span className="font-medium text-accent-blue">{branch.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="px-6 py-3 bg-white border border-border-light rounded-lg text-text-primary hover:bg-bg-light disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (idx < currentStepIndex) {
                    setCurrentStepIndex(idx)
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx < currentStepIndex
                    ? 'bg-accent-success'
                    : idx === currentStepIndex
                    ? 'bg-accent-blue w-3'
                    : 'bg-gray-300'
                }`}
                title={`Step ${idx + 1}`}
              ></button>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
          >
            {currentStepIndex === totalSteps - 1 ? (
              <>
                <Check size={18} />
                Complete
              </>
            ) : (
              <>
                Next Step
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

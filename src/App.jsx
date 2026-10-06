import React, { useEffect, useMemo, useState } from 'react'
import Topbar from './components/Topbar'
import GlobalSidebar from './components/GlobalSidebar'
import ProcedureSidebar from './components/ProcedureSidebar'
import ProceduresList from './components/ProceduresList'
import MainWorkspace from './components/MainWorkspace'
import GlobalSearchModal from './components/GlobalSearchModal'
import Toast from './components/Toast'
import { mockProperties } from './data/mockData'
import { propertyWorkflowProcedures } from './data/workflowData'
import { createAdminRepository, toWorkflowRunnerProcedure } from './data/adminStorage'
import { villakeySourceData } from './data/villakeySourceData'

const normalizeWorkflowProcedure = (procedure) => {
  if (!procedure || !Array.isArray(procedure.steps)) return procedure

  return {
    ...procedure,
    verified: false,
    keywords: Array.isArray(procedure.keywords) ? procedure.keywords : [],
    steps: procedure.steps.map((step, index) => {
      const stepInstruction = step.text || step.instructions || step.instruction || ''
      const branchOptions = Array.isArray(step.branch)
        ? step.branch.map((branch, branchIndex) => ({
            label: branch.label,
            nextStep: index + 1 + branchIndex + 1,
          }))
        : undefined

      const alertType = step.warning ? 'warning' : step.contact ? 'contact' : step.important ? 'important' : null

      return {
        id: index + 1,
        title: step.title,
        instruction: stepInstruction,
        branches: branchOptions,
        alert: alertType
          ? {
              type: alertType,
              message: stepInstruction,
            }
          : undefined,
      }
    }),
  }
}

const workflowProceduresByProperty = Object.fromEntries(
  Object.entries(propertyWorkflowProcedures).map(([propertyId, procedures]) => [
    propertyId,
    (procedures || []).map(normalizeWorkflowProcedure),
  ])
)

const villakeySubproperties = villakeySourceData.subproperties.map((subproperty) => ({
  id: subproperty.id,
  parentPropertyId: villakeySourceData.property.id,
  name: subproperty.name,
  code: subproperty.id.toUpperCase(),
  status: 'active',
  notes: '',
  source: 'uploaded-villakey',
}))

const villakeyPropertyProcedures = (villakeySourceData.sharedProcedures || [])
  .map((procedure) => ({
    ...procedure,
    propertyId: villakeySourceData.property.id,
    subpropertyId: '',
    source: 'uploaded-villakey',
  }))

const villakeySubpropertyProcedures = villakeySourceData.subproperties.flatMap((subproperty) =>
  subproperty.procedures
    .filter((procedure) => procedure.sourceNumber <= 8)
    .map((procedure) => ({
      ...procedure,
      propertyId: villakeySourceData.property.id,
      subpropertyId: subproperty.id,
      source: 'uploaded-villakey',
    })),
)

const villakeySubpropertySections = Object.fromEntries(
  villakeySourceData.subproperties.map((subproperty) => [
    subproperty.id,
    {
      overview: {
        summary: subproperty.overview.summary,
        propertyHighlights: subproperty.overview.importantInformation,
        adminNotes: subproperty.overview.title,
        quickRules: {},
      },
      rules: subproperty.rules,
      contacts: subproperty.contacts,
      propertyInfo: subproperty.propertyInfo,
    },
  ]),
)

const adminSeed = {
  properties: [...mockProperties, { ...villakeySourceData.property, source: 'uploaded-villakey' }],
  subproperties: villakeySubproperties,
  subpropertySections: villakeySubpropertySections,
  propertyOverviews: {
    [villakeySourceData.property.id]: {},
  },
  proceduresByProperty: {
    ...workflowProceduresByProperty,
    [villakeySourceData.property.id]: [...villakeyPropertyProcedures, ...villakeySubpropertyProcedures],
  },
}

const isGeneralProcedure = (procedure) => Boolean(procedure?.isGeneralProcedure) && !procedure?.subpropertyId

const getProceduresForSelection = (procedures = [], selectedSubproperty = '') => {
  const mainProcedures = procedures.filter((procedure) => !procedure.subpropertyId)

  if (!selectedSubproperty) {
    return mainProcedures.map((procedure) => ({
      ...procedure,
      procedureScope: procedure.isGeneralProcedure ? 'general' : 'property',
    }))
  }

  const generalProcedures = mainProcedures
    .filter(isGeneralProcedure)
    .map((procedure) => ({
      ...procedure,
      procedureScope: 'general',
      inheritedFromProperty: true,
    }))
  const subpropertyProcedures = procedures
    .filter((procedure) => procedure.subpropertyId === selectedSubproperty)
    .map((procedure) => ({
      ...procedure,
      procedureScope: 'subproperty',
    }))

  return [...generalProcedures, ...subpropertyProcedures]
}

export default function App() {
  const adminRepository = useMemo(
    () =>
      createAdminRepository({
        seed: adminSeed,
      }),
    [],
  )

  const [currentPage, setCurrentPage] = useState('home')
  const [selectedProperty, setSelectedProperty] = useState('agi-holdings')
  const [selectedProcedure, setSelectedProcedure] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubproperty, setSelectedSubproperty] = useState('')
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('procedures')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchScope, setSearchScope] = useState('current') // 'current' or 'all'
  const [toast, setToast] = useState(null)
  const [favorites, setFavorites] = useState({})
  const [adminDatabase, setAdminDatabase] = useState(() => adminRepository.read())

  const properties = adminDatabase?.properties || []
  const subproperties = adminDatabase?.subproperties || []
  const subpropertiesByProperty = useMemo(() => {
    const grouped = {}
    for (const subproperty of subproperties) {
      grouped[subproperty.parentPropertyId] = grouped[subproperty.parentPropertyId] || []
      grouped[subproperty.parentPropertyId].push(subproperty)
    }

    return Object.fromEntries(
      Object.entries(grouped).map(([propertyId, items]) => [
        propertyId,
        [...items].sort((a, b) => a.name.localeCompare(b.name)),
      ]),
    )
  }, [subproperties])
  const proceduresByProperty = useMemo(() => {
    const grouped = {}
    for (const procedure of adminDatabase?.procedures || []) {
      grouped[procedure.propertyId] = grouped[procedure.propertyId] || []
      grouped[procedure.propertyId].push(procedure)
    }
    return grouped
  }, [adminDatabase])

  useEffect(() => {
    if (!properties.length) return

    const selectedExists = properties.some((property) => property.id === selectedProperty)
    const nextProperty = selectedExists ? selectedProperty : properties[0].id
    const propertySubproperties = subpropertiesByProperty[nextProperty] || []
    const nextSubproperty = propertySubproperties.some(
      (subproperty) => subproperty.id === selectedSubproperty,
    )
      ? selectedSubproperty
      : ''

    if (!selectedExists) {
      setSelectedProperty(nextProperty)
    }
    if (nextSubproperty !== selectedSubproperty) {
      setSelectedSubproperty(nextSubproperty)
    }

    const propertyProcedures = getProceduresForSelection(proceduresByProperty[nextProperty] || [], nextSubproperty)
    const procedureExists = propertyProcedures.some((procedure) => procedure.id === selectedProcedure)
    if (propertyProcedures.length > 0 && !procedureExists) {
      setSelectedProcedure(propertyProcedures[0].id)
      setSelectedCategory(propertyProcedures[0].category || null)
    } else if (propertyProcedures.length === 0 && selectedProcedure) {
      setSelectedProcedure(null)
      setSelectedCategory(null)
    }
  }, [properties, proceduresByProperty, selectedProcedure, selectedProperty, selectedSubproperty, subpropertiesByProperty])

  const handleSelectProperty = (propId) => {
    setSelectedProperty(propId)
    setSelectedSubproperty('')
    setSelectedCategory(null)
    setSelectedProcedure(null)
    setCurrentPage('property-workspace')
    setActiveWorkspaceTab('procedures')
  }

  const handleSelectCategory = (catId) => {
    const categoryProcedures = currentProcedures.filter((procedure) => procedure.category === catId)
    setSelectedCategory(catId)
    setSelectedProcedure(categoryProcedures[0]?.id || null)
    setActiveWorkspaceTab('procedures')
  }

  const handleSelectSubproperty = (subpropertyId) => {
    setSelectedSubproperty(subpropertyId)
    setSelectedCategory(null)
    setSelectedProcedure(null)
    setActiveWorkspaceTab('procedures')
  }

  const handleSelectProcedure = (procId, propId = selectedProperty) => {
    const procedure = (proceduresByProperty[propId] || []).find((proc) => proc.id === procId)
    const propertySubproperties = subpropertiesByProperty[propId] || []
    setSelectedProperty(propId)
    const currentSubpropertyStillApplies = propertySubproperties.some((subproperty) => subproperty.id === selectedSubproperty)
    setSelectedSubproperty(
      procedure?.subpropertyId && propertySubproperties.some((subproperty) => subproperty.id === procedure.subpropertyId)
        ? procedure.subpropertyId
        : procedure?.isGeneralProcedure && propId === selectedProperty && currentSubpropertyStillApplies
          ? selectedSubproperty
          : '',
    )
    setSelectedCategory(procedure?.category || null)
    setSelectedProcedure(procId)
    setCurrentPage('property-workspace')
    setActiveWorkspaceTab('procedures')
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleFavorite = (id, type = 'property') => {
    const property = properties.find((p) => p.id === id)
    const nextFavorite = !(property?.isFavorite ?? favorites[id])

    setFavorites((prev) => ({
      ...prev,
      [id]: nextFavorite,
    }))

    if (type === 'property' && property) {
      const nextDatabase = adminRepository.updateProperty(id, { isFavorite: nextFavorite })
      setAdminDatabase(nextDatabase)
    }

    showToast(nextFavorite ? 'Added to favorites' : 'Removed from favorites')
  }

  const currentPropertyData = properties.find((p) => p.id === selectedProperty)
  const currentSubproperties = subpropertiesByProperty[selectedProperty] || []
  const currentProcedures = getProceduresForSelection(proceduresByProperty[selectedProperty] || [], selectedSubproperty)
  const proceduresInCategory = selectedCategory
    ? currentProcedures.filter((p) => p.category === selectedCategory)
    : currentProcedures

  return (
    <div className="flex flex-col h-screen bg-white">
      <Topbar 
        onSearch={() => setSearchOpen(true)}
        onNotifications={() => console.log('Notifications')}
        properties={properties}
        selectedProperty={selectedProperty}
        onSelectProperty={handleSelectProperty}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Global Navigation Sidebar */}
        <GlobalSidebar 
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />

        {/* Procedures/Cards Sidebar */}
        {currentPage === 'property-workspace' && (
          <ProcedureSidebar
            property={currentPropertyData}
            subproperties={currentSubproperties}
            selectedSubproperty={selectedSubproperty}
            onSelectSubproperty={handleSelectSubproperty}
            procedures={currentProcedures}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onSelectProcedure={(procId) => handleSelectProcedure(procId, selectedProperty)}
            selectedProcedure={selectedProcedure}
          />
        )}

        {currentPage === 'property-workspace' && (
          <ProceduresList
            procedures={proceduresInCategory}
            selectedProcedure={selectedProcedure}
            onSelectProcedure={(procId) => handleSelectProcedure(procId, selectedProperty)}
          />
        )}

        {/* Main Workspace */}
        <MainWorkspace
          currentPage={currentPage}
          selectedProperty={currentPropertyData}
          selectedSubproperty={currentSubproperties.find((subproperty) => subproperty.id === selectedSubproperty)}
          subpropertySections={adminDatabase?.subpropertySections || {}}
          selectedProcedure={selectedProcedure}
          proceduresInCategory={proceduresInCategory}
          allProperties={properties}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onShowToast={showToast}
          onPropertySelect={handleSelectProperty}
          onCategorySelect={handleSelectCategory}
          onProcedureSelect={(procId, propId) => handleSelectProcedure(procId, propId || selectedProperty)}
          onNavigatePage={setCurrentPage}
          searchQuery={searchQuery}
          searchScope={searchScope}
          activeWorkspaceTab={activeWorkspaceTab}
          onSelectWorkspaceTab={setActiveWorkspaceTab}
          adminDatabase={adminDatabase}
          adminRepository={adminRepository}
          onAdminDatabaseChange={setAdminDatabase}
        />
      </div>

      {/* Global Search Modal */}
      {searchOpen && (
        <GlobalSearchModal
          isOpen={searchOpen}
          onClose={() => {
            setSearchOpen(false)
            setSearchQuery('')
          }}
          onSelectProcedure={(procId, propId) => {
            handleSelectProcedure(procId, propId)
            setSearchOpen(false)
            setSearchQuery('')
          }}
          allProperties={properties}
          allProcedures={proceduresByProperty}
          query={searchQuery}
          setQuery={setSearchQuery}
          scope={searchScope}
          setScope={setSearchScope}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
        />
      )}
    </div>
  )
}



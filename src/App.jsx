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
import { casaCitySourceData } from './data/casaCitySourceData'
import airMgmtSourceData from './data/airMgmtSourceData.js'
import agiHoldingsSourceData from './data/agiHoldingsSourceData.js'
import { fetchDatabase, persistDatabase } from './services/api'

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

const uploadedCollectionSources = [
  { data: villakeySourceData, source: 'uploaded-villakey' },
  { data: casaCitySourceData, source: 'uploaded-casa-city' },
  { data: airMgmtSourceData, source: 'uploaded-air-mgmt' },
  { data: agiHoldingsSourceData, source: 'uploaded-agi-holdings' },
]

const buildUploadedCollectionSeed = ({ data, source }) => {
  const collectionOperations = data.collectionOperations
  const propertyInfo = data.propertyInfo || {}
  const additionalInformation = [
    propertyInfo.additionalInformation,
    collectionOperations &&
      [
        'Collection-wide operational details',
        `WhatsApp: ${collectionOperations.whatsappGroup}`,
        `Cleaning Team: ${collectionOperations.cleaningTeam}`,
        `Office Address: ${collectionOperations.officeAddress}`,
        `Operational Systems Referenced: ${collectionOperations.systems.join(', ')}`,
        `Source Scope Note: ${collectionOperations.sourceScopeNote}`,
        `Template category rule: ${collectionOperations.templateCategoryRule}`,
      ].join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n')
  const subproperties = data.subproperties.map((subproperty) => ({
    id: subproperty.id,
    parentPropertyId: data.property.id,
    name: subproperty.name,
    code: subproperty.id.toUpperCase(),
    status: 'active',
    notes: '',
    source,
  }))

  const propertyProcedures = (data.sharedProcedures || []).map((procedure) => ({
    ...procedure,
    propertyId: data.property.id,
    subpropertyId: '',
    source,
  }))

  const subpropertyProcedures = data.subproperties.flatMap((subproperty) =>
    subproperty.procedures.map((procedure) => ({
      ...procedure,
      propertyId: data.property.id,
      subpropertyId: subproperty.id,
      source,
    })),
  )

  const subpropertySections = Object.fromEntries(
    data.subproperties.map((subproperty) => [
      subproperty.id,
      {
        overview: {
          title: subproperty.overview.title,
          summary: subproperty.overview.summary,
          propertyHighlights: subproperty.overview.importantInformation,
          propertyHighlightsTitle: subproperty.overview.propertyHighlightsTitle,
          quickRules: {},
        },
        rules: subproperty.rules,
        contacts: subproperty.contacts,
        propertyInfo: subproperty.propertyInfo,
        sourceVersion: data.property.sourceVersion,
      },
    ]),
  )

  return {
    property: { ...data.property, source, sourceDocument: data.sourceDocument },
    subproperties,
    subpropertySections,
    propertyOverview: data.overview || {},
    propertySections: {
      overview: data.overview || {},
      rules: data.rules || [],
      contacts: data.contacts || [],
      propertyInfo: {
        ...propertyInfo,
        ...(collectionOperations ? { additionalInformation } : {}),
      },
    },
    procedures: [...propertyProcedures, ...subpropertyProcedures],
  }
}

const uploadedCollectionSeeds = uploadedCollectionSources.map(buildUploadedCollectionSeed)
const uploadedPropertyIds = new Set(uploadedCollectionSeeds.map((seed) => seed.property.id))
const uploadedPropertyById = Object.fromEntries(
  uploadedCollectionSeeds.map((seed) => [seed.property.id, seed.property]),
)
const uploadedPropertySections = Object.fromEntries(
  uploadedCollectionSeeds.map((seed) => [seed.property.id, seed.propertySections]),
)

const adminSeed = {
  properties: [
    ...mockProperties.filter((property) => !uploadedPropertyIds.has(property.id)),
    ...uploadedCollectionSeeds.map((seed) => seed.property),
  ],
  subproperties: uploadedCollectionSeeds.flatMap((seed) => seed.subproperties),
  subpropertySections: Object.assign({}, ...uploadedCollectionSeeds.map((seed) => seed.subpropertySections)),
  propertyOverviews: {
    ...Object.fromEntries(uploadedCollectionSeeds.map((seed) => [seed.property.id, seed.propertyOverview])),
  },
  proceduresByProperty: {
    ...workflowProceduresByProperty,
    ...Object.fromEntries(uploadedCollectionSeeds.map((seed) => [seed.property.id, seed.procedures])),
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
    .filter((procedure) => isGeneralProcedure(procedure) || procedure.appliesToAllSubproperties)
    .map((procedure) => ({
      ...procedure,
      procedureScope: isGeneralProcedure(procedure) ? 'general' : 'shared',
      inheritedFromProperty: true,
    }))
  const subpropertyProcedures = procedures
    .filter((procedure) => procedure.subpropertyId === selectedSubproperty)
    .map((procedure) => ({
      ...procedure,
      procedureScope: 'subproperty',
    }))

  return [...subpropertyProcedures, ...generalProcedures]
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
  const [selectedProperty, setSelectedProperty] = useState(() => adminRepository.read().properties[0]?.id || '')
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
  const [serverConnected, setServerConnected] = useState(false)
  const [connectionAttempt, setConnectionAttempt] = useState(0)

  useEffect(() => {
    let active = true
    fetchDatabase().then(async (stored) => {
      if (!active) return
      setServerConnected(true)
      if (stored) {
        adminRepository.replace(stored)
        const merged = adminRepository.mergeSeed()
        setAdminDatabase(merged)
        await persistDatabase(merged)
      } else {
        await persistDatabase(adminRepository.read())
      }
    }).catch((error) => {
      setServerConnected(false)
      console.error('Unable to load database:', error)
      showToast('Unable to connect to the server. Changes may not be saved.', 'error')
    })
    return () => { active = false }
  }, [adminRepository, connectionAttempt])

  const handleAdminDatabaseChange = (nextDatabase) => {
    setAdminDatabase(nextDatabase)
    persistDatabase(nextDatabase).catch((error) => {
      console.error('Unable to save database:', error)
      showToast('Unable to save changes to the server.', 'error')
    })
  }


  const properties = (adminDatabase?.properties || []).map((property) =>
    uploadedPropertyById[property.id]
      ? {
          ...uploadedPropertyById[property.id],
          ...property,
          isFavorite: property.isFavorite,
        }
      : property,
  )
  const propertySections = Object.fromEntries(
    Object.entries(uploadedPropertySections).map(([propertyId, sections]) => [
      propertyId,
      {
        ...sections,
        overview: adminDatabase?.propertyOverviews?.[propertyId] || sections.overview,
      },
    ]),
  )
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
      handleAdminDatabaseChange(nextDatabase)
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
          propertySections={propertySections}
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
          onOpenSearch={() => setSearchOpen(true)}
          searchQuery={searchQuery}
          searchScope={searchScope}
          activeWorkspaceTab={activeWorkspaceTab}
          onSelectWorkspaceTab={setActiveWorkspaceTab}
          adminDatabase={adminDatabase}
          adminRepository={adminRepository}
          onAdminDatabaseChange={handleAdminDatabaseChange}
          isReadOnlyOfflineCollection={selectedProperty === agiHoldingsSourceData.property.id && !serverConnected}
          onRetryServerConnection={() => setConnectionAttempt((attempt) => attempt + 1)}
          serverConnected={serverConnected}
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
          allSubproperties={subproperties}
          allProcedures={proceduresByProperty}
          currentPropertyId={selectedProperty}
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

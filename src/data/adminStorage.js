const STORAGE_KEY = 'propertySupportHub.adminDatabase.v1'
const DATABASE_VERSION = 1

const PROPERTY_DEFAULTS = {
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
  color: '#2563EB',
  isFavorite: false,
}

const SUBPROPERTY_DEFAULTS = {
  parentPropertyId: '',
  name: '',
  code: '',
  status: 'active',
  notes: '',
}

const OVERVIEW_DEFAULTS = {
  summary: '',
  propertyHighlights: '',
  adminNotes: '',
  quickRules: {
    earliestCheckIn: '',
    latestCheckOut: '',
    petFee: '',
    maximumOccupancy: '',
  },
  popularProcedureIds: [],
  recentProcedureIds: [],
}

const SUBPROPERTY_SECTION_DEFAULTS = {
  overview: {
    ...OVERVIEW_DEFAULTS,
    quickRules: { ...OVERVIEW_DEFAULTS.quickRules },
  },
  rules: [],
  contacts: [],
  propertyInfo: {},
}

const PROCEDURE_DEFAULTS = {
  propertyId: '',
  subpropertyId: '',
  isGeneralProcedure: false,
  channel: 'chat',
  category: '',
  name: '',
  description: '',
  keywords: [],
  status: 'unverified',
  steps: [],
}

const STEP_DEFAULTS = {
  title: '',
  instructions: '',
  type: 'normal',
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
}

const BRANCH_DEFAULTS = {
  optionName: '',
  description: '',
  nextStepId: '',
  steps: [],
}

const now = () => new Date().toISOString()

const makeId = (prefix) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const clone = (value) => JSON.parse(JSON.stringify(value))

const toArray = (value) => (Array.isArray(value) ? value : [])

const createEmptyDatabase = () => ({
  version: DATABASE_VERSION,
  properties: [],
  subproperties: [],
  propertyOverviews: {},
  subpropertySections: {},
  procedures: [],
  createdAt: now(),
  updatedAt: now(),
})

const getStorage = (storageOverride) => {
  if (storageOverride) return storageOverride
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
  return null
}

const normalizeProperty = (property) => {
  const name = property.name || property.propertyName || ''
  const id = property.id || slugify(property.code || name) || makeId('property')

  return {
    ...PROPERTY_DEFAULTS,
    ...property,
    id,
    name,
    code: property.code || property.propertyCode || id.toUpperCase(),
    procedureCount: Number(property.procedureCount || 0),
    verifiedCount: Number(property.verifiedCount || 0),
    createdAt: property.createdAt || now(),
    updatedAt: property.updatedAt || now(),
  }
}

const normalizeSubproperty = (subproperty) => {
  const name = subproperty.name || ''
  const id = subproperty.id || slugify(`${subproperty.parentPropertyId}-${subproperty.code || name}`) || makeId('subproperty')

  return {
    ...SUBPROPERTY_DEFAULTS,
    ...subproperty,
    id,
    name,
    code: subproperty.code || '',
    createdAt: subproperty.createdAt || now(),
    updatedAt: subproperty.updatedAt || now(),
  }
}

const normalizeBranch = (branch) => ({
  ...BRANCH_DEFAULTS,
  ...branch,
  id: branch.id || makeId('branch'),
  optionName: branch.optionName || branch.label || '',
  nextStepId: branch.nextStepId || branch.nextStep || '',
  steps: toArray(branch.steps).map(normalizeStep),
  createdAt: branch.createdAt || now(),
  updatedAt: branch.updatedAt || now(),
})

const normalizeStep = (step, index = 0) => {
  const type =
    step.type ||
    (step.branches || step.branch ? 'decision' : '') ||
    (step.warning ? 'warning' : '') ||
    (step.contactCleaner ? 'cleaner-contact' : '') ||
    (step.contact ? 'contact' : '') ||
    (step.charge ? 'charge' : '') ||
    (step.important ? 'important' : '') ||
    'normal'

  return {
    ...STEP_DEFAULTS,
    ...step,
    id: step.id || makeId('step'),
    order: Number.isFinite(step.order) ? step.order : index + 1,
    title: step.title || '',
    instructions: step.instructions || step.instruction || step.text || '',
    type,
    branches: toArray(step.branches || step.branch).map(normalizeBranch),
    createdAt: step.createdAt || now(),
    updatedAt: step.updatedAt || now(),
  }
}

const normalizeProcedure = (procedure) => ({
  ...PROCEDURE_DEFAULTS,
  ...procedure,
  id: procedure.id || slugify(procedure.name) || makeId('procedure'),
  isGeneralProcedure: procedure.isGeneralProcedure ?? !procedure.subpropertyId,
  description: procedure.description || procedure.shortDescription || '',
  keywords: toArray(procedure.keywords),
  status: procedure.status || (procedure.verified ? 'verified' : 'unverified'),
  verified: procedure.status ? procedure.status === 'verified' : Boolean(procedure.verified),
  steps: toArray(procedure.steps).map(normalizeStep),
  createdAt: procedure.createdAt || now(),
  updatedAt: procedure.updatedAt || now(),
})

const recalculatePropertyStats = (database) => {
  const proceduresByProperty = database.procedures.reduce((groups, procedure) => {
    groups[procedure.propertyId] = groups[procedure.propertyId] || []
    groups[procedure.propertyId].push(procedure)
    return groups
  }, {})

  database.properties = database.properties.map((property) => {
    const procedures = proceduresByProperty[property.id] || []
    return {
      ...property,
      procedureCount: procedures.length,
      verifiedCount: procedures.filter((procedure) => procedure.status === 'verified' || procedure.verified).length,
    }
  })

  return database
}

const isLegacyVillaKeyEntry = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  return normalized.includes('villakey') || normalized.includes('villa key')
}

const isImportedVillaKeyEntry = (value) => value?.source === 'uploaded-villakey'

const sanitizeLegacyVillaKeyData = (database) => {
  const preservedProperties = toArray(database?.properties).filter(
    (property) => isImportedVillaKeyEntry(property) || (!isLegacyVillaKeyEntry(property?.id) && !isLegacyVillaKeyEntry(property?.name) && !isLegacyVillaKeyEntry(property?.code)),
  )
  const preservedPropertyIds = new Set(preservedProperties.map((property) => property.id))

  const preservedSubproperties = toArray(database?.subproperties).filter(
    (subproperty) =>
      (isImportedVillaKeyEntry(subproperty) || (!isLegacyVillaKeyEntry(subproperty?.parentPropertyId) &&
      !isLegacyVillaKeyEntry(subproperty?.id) &&
      !isLegacyVillaKeyEntry(subproperty?.name) &&
      !isLegacyVillaKeyEntry(subproperty?.code) &&
      preservedPropertyIds.has(subproperty?.parentPropertyId || ''))),
  )
  const preservedSubpropertyIds = new Set(preservedSubproperties.map((subproperty) => subproperty.id))

  const preservedPropertyOverviews = Object.fromEntries(
    Object.entries(database?.propertyOverviews || {}).filter(([propertyId]) => preservedPropertyIds.has(propertyId)),
  )

  const preservedProcedures = toArray(database?.procedures).filter(
    (procedure) =>
      (isImportedVillaKeyEntry(procedure) || (!isLegacyVillaKeyEntry(procedure?.propertyId) &&
      !isLegacyVillaKeyEntry(procedure?.subpropertyId) &&
      !isLegacyVillaKeyEntry(procedure?.id) &&
      !isLegacyVillaKeyEntry(procedure?.name) &&
      !isLegacyVillaKeyEntry(procedure?.description) &&
      preservedPropertyIds.has(procedure?.propertyId || ''))),
  )

  const preservedSubpropertySections = Object.fromEntries(
    Object.entries(database?.subpropertySections || {}).filter(([subpropertyId]) => preservedSubpropertyIds.has(subpropertyId)),
  )

  return {
    ...database,
    properties: preservedProperties,
    subproperties: preservedSubproperties,
    propertyOverviews: preservedPropertyOverviews,
    subpropertySections: preservedSubpropertySections,
    procedures: preservedProcedures,
  }
}

const ensureDatabase = (database) => {
  const prepared = {
    ...createEmptyDatabase(),
    ...database,
    version: DATABASE_VERSION,
    properties: toArray(database?.properties).map(normalizeProperty),
    subproperties: toArray(database?.subproperties).map(normalizeSubproperty),
    propertyOverviews: database?.propertyOverviews || {},
    subpropertySections: database?.subpropertySections || {},
    procedures: toArray(database?.procedures).map(normalizeProcedure),
    updatedAt: database?.updatedAt || now(),
  }

  prepared.properties.forEach((property) => {
    prepared.propertyOverviews[property.id] = {
      ...OVERVIEW_DEFAULTS,
      ...(prepared.propertyOverviews[property.id] || {}),
      propertyId: property.id,
      updatedAt: prepared.propertyOverviews[property.id]?.updatedAt || now(),
    }
  })

  prepared.subproperties.forEach((subproperty) => {
    const existingSections = prepared.subpropertySections[subproperty.id] || {}
    prepared.subpropertySections[subproperty.id] = {
      ...SUBPROPERTY_SECTION_DEFAULTS,
      ...existingSections,
      overview: {
        ...OVERVIEW_DEFAULTS,
        ...(existingSections.overview || {}),
        propertyId: subproperty.id,
        updatedAt: existingSections.overview?.updatedAt || now(),
      },
      rules: toArray(existingSections.rules),
      contacts: toArray(existingSections.contacts),
      propertyInfo: existingSections.propertyInfo || {},
    }
  })

  return recalculatePropertyStats(prepared)
}

export const buildInitialAdminDatabase = ({
  properties = [],
  subproperties = [],
  subpropertySections = {},
  proceduresByProperty = {},
  propertyOverviews = {},
} = {}) => {
  const procedures = Object.entries(proceduresByProperty).flatMap(([propertyId, propertyProcedures]) =>
    toArray(propertyProcedures).map((procedure) => ({ ...procedure, propertyId })),
  )

  return ensureDatabase({
    ...createEmptyDatabase(),
    properties,
    subproperties,
    propertyOverviews,
    subpropertySections,
    procedures,
  })
}

const mergeSeedDatabase = (database, seed) => {
  if (!seed) return { database, changed: false }

  const seedDatabase = buildInitialAdminDatabase(seed)
  const existingPropertyIds = new Set(database.properties.map((property) => property.id))
  const existingSubpropertyIds = new Set(database.subproperties.map((subproperty) => subproperty.id))
  const existingProcedureKeys = new Set(
    database.procedures.map((procedure) => `${procedure.propertyId}:${procedure.id}`),
  )
  const missingProperties = seedDatabase.properties.filter((property) => !existingPropertyIds.has(property.id))
  const missingSubproperties = seedDatabase.subproperties.filter((subproperty) => !existingSubpropertyIds.has(subproperty.id))
  const missingProcedures = seedDatabase.procedures.filter(
    (procedure) => !existingProcedureKeys.has(`${procedure.propertyId}:${procedure.id}`),
  )
  const missingSubpropertySections = Object.fromEntries(
    Object.entries(seedDatabase.subpropertySections).filter(([subpropertyId]) => !database.subpropertySections[subpropertyId]),
  )
  const missingOverviews = Object.fromEntries(
    Object.entries(seedDatabase.propertyOverviews).filter(
      ([propertyId]) => !database.propertyOverviews[propertyId],
    ),
  )

  if (
    missingProperties.length === 0 &&
    missingSubproperties.length === 0 &&
    missingProcedures.length === 0 &&
    Object.keys(missingSubpropertySections).length === 0 &&
    Object.keys(missingOverviews).length === 0
  ) {
    return { database, changed: false }
  }

  return {
    changed: true,
    database: ensureDatabase({
      ...database,
      properties: [...database.properties, ...missingProperties],
      subproperties: [...database.subproperties, ...missingSubproperties],
      subpropertySections: {
        ...database.subpropertySections,
        ...missingSubpropertySections,
      },
      propertyOverviews: {
        ...database.propertyOverviews,
        ...missingOverviews,
      },
      procedures: [...database.procedures, ...missingProcedures],
      updatedAt: now(),
    }),
  }
}

export const loadAdminDatabase = ({ storage, seed } = {}) => {
  const activeStorage = getStorage(storage)

  if (!activeStorage) {
    return seed ? buildInitialAdminDatabase(seed) : createEmptyDatabase()
  }

  const saved = activeStorage.getItem(STORAGE_KEY)
  if (!saved) {
    const initialDatabase = seed ? buildInitialAdminDatabase(seed) : createEmptyDatabase()
    activeStorage.setItem(STORAGE_KEY, JSON.stringify(initialDatabase))
    return initialDatabase
  }

  try {
    const database = ensureDatabase(sanitizeLegacyVillaKeyData(JSON.parse(saved)))
    const merged = mergeSeedDatabase(database, seed)
    if (merged.changed) {
      activeStorage.setItem(STORAGE_KEY, JSON.stringify(merged.database))
    }
    return merged.database
  } catch {
    const initialDatabase = seed ? buildInitialAdminDatabase(seed) : createEmptyDatabase()
    activeStorage.setItem(STORAGE_KEY, JSON.stringify(initialDatabase))
    return initialDatabase
  }
}

export const saveAdminDatabase = (database, { storage } = {}) => {
  const activeStorage = getStorage(storage)
  const prepared = ensureDatabase({ ...database, updatedAt: now() })

  if (activeStorage) {
    activeStorage.setItem(STORAGE_KEY, JSON.stringify(prepared))
  }

  return prepared
}

export const clearAdminDatabase = ({ storage } = {}) => {
  const activeStorage = getStorage(storage)
  if (activeStorage) activeStorage.removeItem(STORAGE_KEY)
}

export const createAdminRepository = ({ storage, seed } = {}) => {
  let database = loadAdminDatabase({ storage, seed })

  const persist = (nextDatabase) => {
    database = saveAdminDatabase(nextDatabase, { storage })
    return clone(database)
  }

  const read = () => clone(database)

  const createProperty = (input) => {
    const property = normalizeProperty({
      ...input,
      id: input.id || slugify(input.code || input.name) || makeId('property'),
      createdAt: now(),
      updatedAt: now(),
    })

    return persist({
      ...database,
      properties: [...database.properties, property],
      propertyOverviews: {
        ...database.propertyOverviews,
        [property.id]: {
          ...OVERVIEW_DEFAULTS,
          ...(input.overview || {}),
          propertyId: property.id,
          createdAt: now(),
          updatedAt: now(),
        },
      },
    })
  }

  const updateProperty = (propertyId, updates) => {
    return persist({
      ...database,
      properties: database.properties.map((property) =>
        property.id === propertyId
          ? normalizeProperty({ ...property, ...updates, id: propertyId, updatedAt: now() })
          : property,
      ),
    })
  }

  const deleteProperty = (propertyId) => {
    const propertyOverviews = { ...database.propertyOverviews }
    delete propertyOverviews[propertyId]
    const subpropertySections = { ...database.subpropertySections }
    database.subproperties
      .filter((subproperty) => subproperty.parentPropertyId === propertyId)
      .forEach((subproperty) => delete subpropertySections[subproperty.id])

    return persist({
      ...database,
      properties: database.properties.filter((property) => property.id !== propertyId),
      subproperties: database.subproperties.filter((subproperty) => subproperty.parentPropertyId !== propertyId),
      propertyOverviews,
      subpropertySections,
      procedures: database.procedures.filter((procedure) => procedure.propertyId !== propertyId),
    })
  }

  const createSubproperty = (propertyId, input) => {
    const subproperty = normalizeSubproperty({
      ...input,
      parentPropertyId: propertyId,
      id: input.id || slugify(`${propertyId}-${input.code || input.name}`) || makeId('subproperty'),
      createdAt: now(),
      updatedAt: now(),
    })

    return persist({
      ...database,
      subproperties: [...database.subproperties, subproperty],
      subpropertySections: {
        ...database.subpropertySections,
        [subproperty.id]: {
          ...SUBPROPERTY_SECTION_DEFAULTS,
          overview: {
            ...OVERVIEW_DEFAULTS,
            ...(input.overview || {}),
            propertyId: subproperty.id,
            createdAt: now(),
            updatedAt: now(),
          },
          rules: toArray(input.rules),
          contacts: toArray(input.contacts),
          propertyInfo: input.propertyInfo || {},
        },
      },
    })
  }

  const updateSubproperty = (subpropertyId, updates) => {
    return persist({
      ...database,
      subproperties: database.subproperties.map((subproperty) =>
        subproperty.id === subpropertyId
          ? normalizeSubproperty({ ...subproperty, ...updates, id: subpropertyId, updatedAt: now() })
          : subproperty,
      ),
    })
  }

  const deleteSubproperty = (subpropertyId) => {
    const subpropertySections = { ...database.subpropertySections }
    delete subpropertySections[subpropertyId]

    return persist({
      ...database,
      subproperties: database.subproperties.filter((subproperty) => subproperty.id !== subpropertyId),
      subpropertySections,
      procedures: database.procedures.map((procedure) =>
        procedure.subpropertyId === subpropertyId
          ? normalizeProcedure({ ...procedure, subpropertyId: '', updatedAt: now() })
          : procedure,
      ),
    })
  }

  const upsertPropertyOverview = (propertyId, overview) => {
    return persist({
      ...database,
      propertyOverviews: {
        ...database.propertyOverviews,
        [propertyId]: {
          ...OVERVIEW_DEFAULTS,
          ...(database.propertyOverviews[propertyId] || {}),
          ...overview,
          propertyId,
          updatedAt: now(),
        },
      },
    })
  }

  const upsertSubpropertySection = (subpropertyId, section, value) => {
    const subproperty = database.subproperties.find((item) => item.id === subpropertyId)
    if (!subproperty) return read()

    const current = database.subpropertySections[subpropertyId] || SUBPROPERTY_SECTION_DEFAULTS
    const nextValue = section === 'overview'
      ? {
          ...OVERVIEW_DEFAULTS,
          ...(current.overview || {}),
          ...value,
          propertyId: subpropertyId,
          updatedAt: now(),
        }
      : section === 'rules' || section === 'contacts'
        ? toArray(value)
        : value || {}

    return persist({
      ...database,
      subpropertySections: {
        ...database.subpropertySections,
        [subpropertyId]: {
          ...SUBPROPERTY_SECTION_DEFAULTS,
          ...current,
          [section]: nextValue,
        },
      },
    })
  }

  const createProcedure = (input) => {
    const baseId = input.id || `${slugify(input.propertyId)}-${slugify(input.name)}` || makeId('procedure')
    const id = database.procedures.some((procedure) => procedure.id === baseId) ? makeId('procedure') : baseId
    const procedure = normalizeProcedure({
      ...input,
      id,
      createdAt: now(),
      updatedAt: now(),
    })

    return persist({
      ...database,
      procedures: [...database.procedures, procedure],
    })
  }

  const updateProcedure = (procedureId, updates) => {
    return persist({
      ...database,
      procedures: database.procedures.map((procedure) =>
        procedure.id === procedureId
          ? normalizeProcedure({ ...procedure, ...updates, id: procedureId, updatedAt: now() })
          : procedure,
      ),
    })
  }

  const deleteProcedure = (procedureId) => {
    return persist({
      ...database,
      procedures: database.procedures.filter((procedure) => procedure.id !== procedureId),
    })
  }

  const duplicateProcedure = (procedureId, overrides = {}) => {
    const source = database.procedures.find((procedure) => procedure.id === procedureId)
    if (!source) return read()

    const duplicate = normalizeProcedure({
      ...clone(source),
      ...overrides,
      id: overrides.id || makeId('procedure'),
      name: overrides.name || `${source.name} Copy`,
      createdAt: now(),
      updatedAt: now(),
    })

    return persist({
      ...database,
      procedures: [...database.procedures, duplicate],
    })
  }

  const saveWorkflow = (procedureId, steps) => {
    return updateProcedure(procedureId, {
      steps: toArray(steps).map(normalizeStep),
      updatedAt: now(),
    })
  }

  const addProcedureStep = (procedureId, step) => {
    const procedure = database.procedures.find((item) => item.id === procedureId)
    if (!procedure) return read()

    return saveWorkflow(procedureId, [...procedure.steps, normalizeStep(step, procedure.steps.length)])
  }

  const updateProcedureStep = (procedureId, stepId, updates) => {
    const procedure = database.procedures.find((item) => item.id === procedureId)
    if (!procedure) return read()

    return saveWorkflow(
      procedureId,
      procedure.steps.map((step) =>
        step.id === stepId ? normalizeStep({ ...step, ...updates, id: stepId, updatedAt: now() }) : step,
      ),
    )
  }

  const deleteProcedureStep = (procedureId, stepId) => {
    const procedure = database.procedures.find((item) => item.id === procedureId)
    if (!procedure) return read()

    return saveWorkflow(
      procedureId,
      procedure.steps
        .filter((step) => step.id !== stepId)
        .map((step, index) => ({ ...step, order: index + 1 })),
    )
  }

  const addBranch = (procedureId, stepId, branch) => {
    const procedure = database.procedures.find((item) => item.id === procedureId)
    if (!procedure) return read()

    return saveWorkflow(
      procedureId,
      procedure.steps.map((step) =>
        step.id === stepId
          ? normalizeStep({
              ...step,
              type: 'decision',
              branches: [...toArray(step.branches), normalizeBranch(branch)],
              updatedAt: now(),
            })
          : step,
      ),
    )
  }

  const updateBranch = (procedureId, stepId, branchId, updates) => {
    const procedure = database.procedures.find((item) => item.id === procedureId)
    if (!procedure) return read()

    return saveWorkflow(
      procedureId,
      procedure.steps.map((step) =>
        step.id === stepId
          ? normalizeStep({
              ...step,
              branches: toArray(step.branches).map((branch) =>
                branch.id === branchId ? normalizeBranch({ ...branch, ...updates, id: branchId, updatedAt: now() }) : branch,
              ),
            })
          : step,
      ),
    )
  }

  const deleteBranch = (procedureId, stepId, branchId) => {
    const procedure = database.procedures.find((item) => item.id === procedureId)
    if (!procedure) return read()

    return saveWorkflow(
      procedureId,
      procedure.steps.map((step) =>
        step.id === stepId
          ? normalizeStep({
              ...step,
              branches: toArray(step.branches).filter((branch) => branch.id !== branchId),
            })
          : step,
      ),
    )
  }

  const addBranchStep = (procedureId, stepId, branchId, branchStep) => {
    const procedure = database.procedures.find((item) => item.id === procedureId)
    if (!procedure) return read()

    return saveWorkflow(
      procedureId,
      procedure.steps.map((step) =>
        step.id === stepId
          ? normalizeStep({
              ...step,
              branches: toArray(step.branches).map((branch) =>
                branch.id === branchId
                  ? normalizeBranch({
                      ...branch,
                      steps: [...toArray(branch.steps), normalizeStep(branchStep, branch.steps.length)],
                      updatedAt: now(),
                    })
                  : branch,
              ),
            })
          : step,
      ),
    )
  }

  const updateBranchStep = (procedureId, stepId, branchId, branchStepId, updates) => {
    const procedure = database.procedures.find((item) => item.id === procedureId)
    if (!procedure) return read()

    return saveWorkflow(
      procedureId,
      procedure.steps.map((step) =>
        step.id === stepId
          ? normalizeStep({
              ...step,
              branches: toArray(step.branches).map((branch) =>
                branch.id === branchId
                  ? normalizeBranch({
                      ...branch,
                      steps: toArray(branch.steps).map((branchStep) =>
                        branchStep.id === branchStepId
                          ? normalizeStep({ ...branchStep, ...updates, id: branchStepId, updatedAt: now() })
                          : branchStep,
                      ),
                    })
                  : branch,
              ),
            })
          : step,
      ),
    )
  }

  const deleteBranchStep = (procedureId, stepId, branchId, branchStepId) => {
    const procedure = database.procedures.find((item) => item.id === procedureId)
    if (!procedure) return read()

    return saveWorkflow(
      procedureId,
      procedure.steps.map((step) =>
        step.id === stepId
          ? normalizeStep({
              ...step,
              branches: toArray(step.branches).map((branch) =>
                branch.id === branchId
                  ? normalizeBranch({
                      ...branch,
                      steps: toArray(branch.steps)
                        .filter((branchStep) => branchStep.id !== branchStepId)
                        .map((branchStep, index) => ({ ...branchStep, order: index + 1 })),
                    })
                  : branch,
              ),
            })
          : step,
      ),
    )
  }

  return {
    read,
    createProperty,
    updateProperty,
    deleteProperty,
    createSubproperty,
    updateSubproperty,
    deleteSubproperty,
    upsertPropertyOverview,
    upsertSubpropertySection,
    createProcedure,
    updateProcedure,
    deleteProcedure,
    duplicateProcedure,
    saveWorkflow,
    addProcedureStep,
    updateProcedureStep,
    deleteProcedureStep,
    addBranch,
    updateBranch,
    deleteBranch,
    addBranchStep,
    updateBranchStep,
    deleteBranchStep,
  }
}

export const toWorkflowRunnerProcedure = (procedure) => ({
  ...procedure,
  verified: procedure.status === 'verified' || Boolean(procedure.verified),
  description: procedure.description || '',
  steps: toArray(procedure.steps).map((step, index) => ({
    id: index + 1,
    title: step.title,
    instruction: step.instructions || step.instruction || '',
    branches: toArray(step.branches).map((branch) => ({
      label: branch.optionName,
      nextStep: Number(branch.nextStepId) || index + 2,
    })),
    alert:
      step.type && !['normal', 'decision'].includes(step.type)
        ? {
            type: step.type,
            message:
              step.warningMessage ||
              step.importantMessage ||
              step.instructions ||
              step.charge?.name ||
              step.contact?.name ||
              '',
          }
        : undefined,
  })),
})

export const adminStorageConfig = {
  key: STORAGE_KEY,
  version: DATABASE_VERSION,
}



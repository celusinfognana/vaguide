import assert from 'node:assert/strict'
import {
  createAdminRepository,
  clearAdminDatabase,
  adminStorageConfig,
} from '../src/data/adminStorage.js'

const createMemoryStorage = () => {
  const data = new Map()

  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  }
}

const storage = createMemoryStorage()
clearAdminDatabase({ storage })

let repository = createAdminRepository({ storage })

repository.createProperty({
  name: 'Test Collection',
  code: 'TEST',
  status: 'active',
  type: 'Residential',
  address: '100 Test Street',
  city: 'Austin',
  state: 'TX',
  country: 'United States',
  timezone: 'America/Chicago',
  contactName: 'Alex Admin',
  contactPhone: '+1 555 0100',
  contactEmail: 'alex@example.com',
  notes: 'Created by storage test.',
})

let database = repository.read()
const property = database.properties.find((item) => item.code === 'TEST')
assert.ok(property, 'property is created')
assert.equal(property.name, 'Test Collection')

repository.upsertPropertyOverview(property.id, {
  summary: 'A test property collection overview.',
  propertyHighlights: 'Close to downtown with flexible arrivals.',
  adminNotes: 'Use this record for admin overview persistence checks.',
  quickRules: {
    earliestCheckIn: '2:00 PM',
    latestCheckOut: '11:00 AM',
    petFee: '$100',
    maximumOccupancy: '8',
  },
})

database = repository.read()
assert.equal(database.propertyOverviews[property.id].summary, 'A test property collection overview.')
assert.equal(database.propertyOverviews[property.id].quickRules.petFee, '$100')

repository.updateProperty(property.id, {
  name: 'Updated Test Collection',
  contactPhone: '+1 555 0199',
})

database = repository.read()
assert.equal(database.properties.find((item) => item.id === property.id).name, 'Updated Test Collection')

repository.createSubproperty(property.id, {
  name: 'Building A',
  code: 'BLDG-A',
  status: 'active',
  notes: 'First test subproperty.',
})

database = repository.read()
const subproperty = database.subproperties.find((item) => item.parentPropertyId === property.id && item.code === 'BLDG-A')
assert.ok(subproperty, 'subproperty is created')
assert.equal(subproperty.name, 'Building A')

repository.upsertSubpropertySection(subproperty.id, 'overview', {
  summary: 'Building A overview.',
  quickRules: { earliestCheckIn: '3:00 PM' },
})
repository.upsertSubpropertySection(subproperty.id, 'rules', [
  { category: 'Access', name: 'Lock Type', value: 'Keypad', verified: true },
])
repository.upsertSubpropertySection(subproperty.id, 'contacts', [
  { id: 'building-contact', name: 'Building Contact', phone: '555-0100' },
])
repository.upsertSubpropertySection(subproperty.id, 'propertyInfo', {
  name: 'Building A',
  type: 'Apartment',
})

database = repository.read()
assert.equal(database.subpropertySections[subproperty.id].overview.summary, 'Building A overview.')
assert.equal(database.subpropertySections[subproperty.id].rules[0].value, 'Keypad')
assert.equal(database.subpropertySections[subproperty.id].contacts[0].name, 'Building Contact')
assert.equal(database.subpropertySections[subproperty.id].propertyInfo.type, 'Apartment')
assert.equal(database.propertyOverviews[property.id].summary, 'A test property collection overview.')

repository.updateSubproperty(subproperty.id, {
  name: 'Building Alpha',
  notes: 'Renamed test subproperty.',
})

database = repository.read()
assert.equal(database.subproperties.find((item) => item.id === subproperty.id).name, 'Building Alpha')

repository.createProcedure({
  propertyId: property.id,
  subpropertyId: subproperty.id,
  channel: 'chat',
  category: 'chat-prearrival',
  name: 'Early Check-in',
  description: 'Handle guest early arrival requests.',
  keywords: ['early', 'early check-in', 'arrive early'],
  status: 'unverified',
})

database = repository.read()
const procedure = database.procedures.find((item) => item.propertyId === property.id && item.name === 'Early Check-in')
assert.ok(procedure, 'procedure is created')
assert.equal(procedure.subpropertyId, subproperty.id)
assert.equal(database.properties.find((item) => item.id === property.id).procedureCount, 1)

repository.addProcedureStep(procedure.id, {
  title: 'Confirm Request',
  instructions: 'Confirm the requested arrival time and reservation details.',
  type: 'normal',
})

repository.addProcedureStep(procedure.id, {
  title: 'Same-day turnover?',
  instructions: 'Determine whether another guest checks out the same day.',
  type: 'decision',
})

database = repository.read()
let updatedProcedure = database.procedures.find((item) => item.id === procedure.id)
assert.equal(updatedProcedure.steps.length, 2)

const decisionStep = updatedProcedure.steps[1]
repository.addBranch(procedure.id, decisionStep.id, {
  optionName: 'YES',
  description: 'Guest checks out the same day.',
  nextStepId: 'decline',
})

repository.addBranch(procedure.id, decisionStep.id, {
  optionName: 'NO',
  description: 'No same-day checkout.',
  nextStepId: 'continue',
})

database = repository.read()
updatedProcedure = database.procedures.find((item) => item.id === procedure.id)
const updatedDecisionStep = updatedProcedure.steps.find((step) => step.id === decisionStep.id)
assert.equal(updatedDecisionStep.branches.length, 2)

const yesBranch = updatedDecisionStep.branches[0]
repository.addBranchStep(procedure.id, decisionStep.id, yesBranch.id, {
  title: 'Decline early check-in',
  instructions: 'Explain that early check-in is not available for same-day turnovers.',
  type: 'warning',
})

database = repository.read()
updatedProcedure = database.procedures.find((item) => item.id === procedure.id)
let updatedYesBranch = updatedProcedure.steps[1].branches.find((branch) => branch.id === yesBranch.id)
assert.equal(updatedYesBranch.steps.length, 1)

repository.updateBranchStep(procedure.id, decisionStep.id, yesBranch.id, updatedYesBranch.steps[0].id, {
  instructions: 'Politely decline because a same-day turnover blocks early check-in.',
})

database = repository.read()
updatedProcedure = database.procedures.find((item) => item.id === procedure.id)
updatedYesBranch = updatedProcedure.steps[1].branches.find((branch) => branch.id === yesBranch.id)
assert.match(updatedYesBranch.steps[0].instructions, /Politely decline/)

repository.updateProcedure(procedure.id, {
  status: 'verified',
})

database = repository.read()
assert.equal(database.procedures.find((item) => item.id === procedure.id).status, 'verified')
assert.equal(database.properties.find((item) => item.id === property.id).verifiedCount, 1)

repository.duplicateProcedure(procedure.id, {
  name: 'Early Check-in Copy',
})

database = repository.read()
assert.equal(database.procedures.filter((item) => item.propertyId === property.id).length, 2)

repository = createAdminRepository({ storage })
database = repository.read()
assert.equal(database.properties.find((item) => item.id === property.id).name, 'Updated Test Collection')
assert.equal(database.propertyOverviews[property.id].propertyHighlights, 'Close to downtown with flexible arrivals.')
assert.equal(database.procedures.filter((item) => item.propertyId === property.id).length, 2)
assert.ok(storage.getItem(adminStorageConfig.key), 'database is saved in storage')

const copiedProcedure = database.procedures.find((item) => item.name === 'Early Check-in Copy')
repository.deleteProcedure(copiedProcedure.id)
database = repository.read()
assert.equal(database.procedures.filter((item) => item.propertyId === property.id).length, 1)

repository.deleteSubproperty(subproperty.id)
database = repository.read()
assert.equal(database.subproperties.some((item) => item.id === subproperty.id), false)
assert.equal(database.subpropertySections[subproperty.id], undefined)
assert.equal(database.procedures.find((item) => item.id === procedure.id).subpropertyId, '')

repository.deleteProperty(property.id)
database = repository.read()
assert.equal(database.properties.some((item) => item.id === property.id), false)
assert.equal(database.procedures.some((item) => item.propertyId === property.id), false)
assert.equal(database.subproperties.some((item) => item.parentPropertyId === property.id), false)
assert.equal(database.propertyOverviews[property.id], undefined)

const migrationStorage = createMemoryStorage()
let migrationRepository = createAdminRepository({ storage: migrationStorage })
migrationRepository.createProperty({
  id: 'versioned-source',
  name: 'Old Source Name',
  code: 'OLD',
  source: 'versioned-source',
})

const legacyDatabase = JSON.parse(migrationStorage.getItem(adminStorageConfig.key))
legacyDatabase.propertyOverviews['versioned-source'] = {
  summary: 'Old source overview',
  propertyHighlights: 'Old source highlights',
}
migrationStorage.setItem(adminStorageConfig.key, JSON.stringify(legacyDatabase))

const sourceSeed = {
  properties: [{
    id: 'versioned-source',
    name: 'Current Source Name',
    code: 'CURRENT',
    source: 'versioned-source',
    sourceVersion: 1,
  }],
  propertyOverviews: {
    'versioned-source': {
      summary: 'Current source overview',
      propertyHighlights: 'Current source highlights',
      sourceVersion: 1,
    },
  },
}
migrationRepository = createAdminRepository({ storage: migrationStorage, seed: sourceSeed })
database = migrationRepository.read()
assert.equal(database.properties.find((item) => item.id === 'versioned-source').name, 'Current Source Name')
assert.equal(database.propertyOverviews['versioned-source'].summary, 'Current source overview')

migrationRepository.upsertPropertyOverview('versioned-source', {
  summary: 'User-edited source overview',
})
migrationRepository.updateProperty('versioned-source', {
  name: 'User Edited Source Name',
})
migrationRepository = createAdminRepository({
  storage: migrationStorage,
  seed: {
    ...sourceSeed,
    properties: [{ ...sourceSeed.properties[0], name: 'Newer Source Name', sourceVersion: 2 }],
    propertyOverviews: {
      'versioned-source': {
        summary: 'Newer source overview',
        sourceVersion: 2,
      },
    },
  },
})
database = migrationRepository.read()
assert.equal(database.propertyOverviews['versioned-source'].summary, 'User-edited source overview')
assert.equal(database.properties.find((item) => item.id === 'versioned-source').name, 'User Edited Source Name')

console.log('adminStorage CRUD persistence test passed')

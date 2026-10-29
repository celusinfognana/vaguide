import agiHoldingsSourceText from './agiHoldingsSource.txt?raw'

const normalizeWhitespace = (value) => String(value || '').replace(/\s+/g, ' ').trim()

const cleanValue = (value) =>
  normalizeWhitespace(value)
    .replace(/\s*### Process Flow\s*$/, '')
    .replace(/\s*##\s*$/, '')
    .replace(/\s+#$/, '')

const getSections = (source) => {
  const headings = [...source.matchAll(/^# (\d+)\./gm)]

  return Object.fromEntries(
    headings.map((heading, index) => {
      const end = headings[index + 1]?.index ?? source.length
      return [heading[1], source.slice(heading.index, end)]
    }),
  )
}

const getSubsections = (source) => {
  const headings = [...source.matchAll(/^## (.+)$/gm)]

  return headings.map((heading, index) => {
    const end = headings[index + 1]?.index ?? source.length
    return source.slice(heading.index, end)
  })
}

const getFields = (source) => {
  const parts = source.split('**')
  const fields = []

  for (let index = 1; index < parts.length; index += 2) {
    fields.push({
      name: normalizeWhitespace(parts[index]).replace(/:$/, ''),
      value: cleanValue(parts[index + 1]),
      rawValue: String(parts[index + 1] || '').trim(),
    })
  }

  return fields
}

const getField = (fields, name) =>
  fields.find((field) => field.name.toLowerCase() === name.toLowerCase())?.value || ''

const getRawField = (fields, name) =>
  fields.find((field) => field.name.toLowerCase() === name.toLowerCase())?.rawValue || ''

const getBulletItems = (source) => {
  const items = []
  let current = ''

  const saveCurrent = () => {
    if (current) items.push(normalizeWhitespace(current))
    current = ''
  }

  source.split(/\r?\n/).forEach((line) => {
    const bullet = line.match(/^\s*-\s+(.*)$/)
    if (bullet) {
      saveCurrent()
      current = bullet[1]
    } else if (!line.trim()) {
      saveCurrent()
    } else if (current) {
      current += ` ${line.trim()}`
    }
  })
  saveCurrent()

  return items
}

const getNamedSection = (source, startPattern, endPattern) => {
  const start = source.search(startPattern)
  if (start < 0) return ''

  const end = source.slice(start).search(endPattern)
  return source.slice(start, end < 0 ? undefined : start + end)
}

const categoryIds = {
  reservations: 'chat-reservations',
  'check-in / check-out': 'chat-prearrival',
  'access / lockouts': 'chat-access',
  'during stay': 'chat-stay',
  maintenance: 'chat-maintenance',
  cleaning: 'chat-cleaning',
  'payments / refunds': 'chat-payments',
  'pets / visitors': 'chat-pets',
  'occupancy / events': 'chat-occupancy',
  'post-stay': 'chat-poststay',
  'other requests': 'chat-other',
  'maintenance or access / lockouts, as applicable': 'call-maintenance',
  emergency: 'call-emergency',
  lockouts: 'call-lockouts',
}

const slugify = (value) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const parseProcedureSteps = (fields, procedureName) =>
  fields.flatMap((field) => {
    const step = field.name.match(/^Step\s+(\d+)\s*[—-]\s*(.*?)\s*\[(Normal|Important|Warning|Contact|Charge)\]$/i)
    if (step) {
      return [{
        id: `${slugify(procedureName)}-step-${step[1]}`,
        order: Number(step[1]),
        title: step[2],
        instructions: field.value,
        type: step[3].toLowerCase(),
      }]
    }

    if (field.name === 'Procedure Completion') {
      return [{
        id: `${slugify(procedureName)}-completion`,
        order: fields.filter((item) => /^Step\s+\d+/.test(item.name)).length + 1,
        title: field.name,
        instructions: field.value,
        type: 'normal',
      }]
    }

    return []
  })

const parseProcedures = (source, { general = false } = {}) =>
  getSubsections(source)
    .map((block) => {
      const fields = getFields(block)
      const procedureName = getField(fields, 'Procedure Name')
      if (!procedureName || !getField(fields, 'General Procedure')) return null

      const sourceHeading = normalizeWhitespace(block.match(/^##\s*([\s\S]*?)\r?\n\r?\n/)?.[1])
      const channelText = getField(fields, 'Channel')
      const sourceCategory = getField(fields, 'Category')
      const category = categoryIds[sourceCategory.toLowerCase()] || 'chat-other'
      const isCall = channelText.toLowerCase().startsWith('call')

      return {
        id: `agi-${slugify(procedureName)}`,
        name: procedureName,
        sourceHeading,
        isGeneralProcedure: general,
        channel: isCall ? 'call' : 'chat',
        sourceChannel: channelText,
        category,
        sourceCategory,
        description: getField(fields, 'Description'),
        keywords: getField(fields, 'Keywords').split(',').map((keyword) => keyword.trim()).filter(Boolean),
        status: 'unverified',
        sourceGeneralProcedureStatus: getField(fields, 'General Procedure'),
        steps: parseProcedureSteps(fields, procedureName),
      }
    })
    .filter(Boolean)

const sections = getSections(agiHoldingsSourceText)
const mainSection = sections['1'] || ''
const procedureSection = sections['3'] || ''
const subpropertySection = sections['4'] || ''
const specificProcedureSection = sections['5'] || ''
const additionalSections = [sections['6'], sections['7']].filter(Boolean).join('\n\n')

const mainFields = getFields(mainSection)
const mainOverviewMatch = mainSection.match(
  /\*\*Overview\s*:\s*\*\*([\s\S]*?)(?=^## Important Property)/m,
)
const importantInformationSection = getNamedSection(
  mainSection,
  /^## Important Property/m,
  /^## Rules/m,
)
const rulesSection = getNamedSection(mainSection, /^## Rules/m, /^## Contacts/m)
const mainContactsSection = getNamedSection(mainSection, /^## Contacts/m, /^#\s*$/m)
const importantInformation = getBulletItems(importantInformationSection)
const rules = getBulletItems(rulesSection).map((value) => ({
  category: 'Rules',
  value,
  verified: false,
}))

const contactFieldNames = {
  'Contact Name': 'name',
  Role: 'role',
  Phone: 'phone',
  Email: 'email',
  'When to Contact': 'whenToContact',
}

const contacts = []
let currentContact = null
getFields(mainContactsSection).forEach((field) => {
  const property = contactFieldNames[field.name]
  if (!property) return

  if (property === 'name') {
    currentContact = { id: `agi-contact-${contacts.length + 1}`, preferred: '' }
    contacts.push(currentContact)
  }
  if (currentContact) currentContact[property] = field.value
})

const subproperties = getSubsections(subpropertySection)
  .map((block) => {
    const fields = getFields(block)
    const name = getRawField(fields, 'Subproperty / Collection Name')
    if (!name) return null

    const id = `agi-${slugify(name)}`
    const description = getField(fields, 'Description')
    const address = getField(fields, 'Property Information')
    const subpropertyRules = getField(fields, 'Rules')
    const contactsInstruction = getField(fields, 'Contacts')

    return {
      id,
      name,
      code: id.toUpperCase(),
      description,
      overview: {
        title: getField(fields, 'Overview Title'),
        summary: getField(fields, 'Overview'),
        propertyHighlightsTitle: 'Important Information',
        importantInformation: getField(fields, 'Important Information'),
      },
      rules: [{
        category: 'Rules',
        value: subpropertyRules,
        verified: false,
      }],
      contacts: contacts.map((contact) => ({ ...contact })),
      propertyInfo: {
        name,
        type: 'Subproperty / Collection',
        address,
        description,
        contactInstructions: contactsInstruction,
      },
      procedures: [],
    }
  })
  .filter(Boolean)

const specificProcedures = parseProcedures(specificProcedureSection)
const subpropertyMatches = [
  ['5215 E Beck Lane', '(Beck Ln) 5215 beck'],
  ['6734 E Grandview', '6734 E Grandview Dr'],
  ['15238 N 49th', '(49th)15238'],
  ['5009 E Cactus Rd', '(50th) house'],
  ['16419 N 64th Place', 'Kings Villa 64th Pl'],
]

specificProcedures.forEach((procedure) => {
  const title = procedure.sourceHeading.toLowerCase()
  const match = subpropertyMatches.find(([address]) => title.includes(address.toLowerCase()))

  if (match) {
    const subproperty = subproperties.find((item) => item.name === match[1])
    if (subproperty) {
      procedure.subpropertyId = subproperty.id
      subproperty.procedures.push(procedure)
    }
  } else if (title.includes('5701 e cactus')) {
    const subproperty = subproperties.find((item) => normalizeWhitespace(item.name) === '5701 E Cactus Road')
    if (subproperty) {
      procedure.subpropertyId = subproperty.id
      subproperty.procedures.push(procedure)
    }
  } else if (title.includes('all listed properties')) {
    procedure.appliesToAllSubproperties = true
  }
})

const generalProcedures = parseProcedures(procedureSection, { general: true })
const allPropertyProcedures = specificProcedures.filter((procedure) => procedure.appliesToAllSubproperties)
const overview = {
  title: getField(mainFields, 'Overview Title'),
  summary: normalizeWhitespace(mainOverviewMatch?.[1]),
  propertyHighlightsTitle: 'Important Property Information',
  propertyHighlights: importantInformation.join('\n'),
  adminNotes: additionalSections,
  quickRules: {},
  sourceVersion: 1,
}

const property = {
  id: 'agi-holdings-paul-chopra',
  name: 'AGI HOLDINGS (PAUL CHOPRA)',
  code: 'AGI HOLDINGS',
  status: 'active',
  type: 'Property / Collection',
  color: '#2563EB',
  description: getField(mainFields, 'Property Description'),
  sourceVersion: 1,
}

const propertyInfo = {
  name: property.name,
  type: property.type,
  description: property.description,
  signature: getField(mainFields, 'Signature'),
  operationalSystems: getField(mainFields, 'Operational systems mentioned'),
  additionalInformation: additionalSections,
  sourceDocument: agiHoldingsSourceText,
}

if (
  getField(mainFields, 'Property / Collection Name') !== 'AGI Holdings (Paul Chopra)' ||
  property.name !== 'AGI HOLDINGS (PAUL CHOPRA)' ||
  !overview.summary ||
  subproperties.length !== 8 ||
  generalProcedures.length !== 21 ||
  specificProcedures.length !== 8 ||
  contacts.length !== 3
) {
  throw new Error('AGI Holdings source data could not be fully parsed.')
}

export default {
  property,
  overview,
  subproperties,
  sharedProcedures: [...generalProcedures, ...allPropertyProcedures],
  rules,
  contacts,
  propertyInfo,
  sourceDocument: agiHoldingsSourceText,
}

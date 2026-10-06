import fs from 'node:fs'

const sourcePath = 'C:/Users/celusflacher.m/.codex/attachments/03bdf0d7-d2da-467e-99e2-2363a703ef45/Pasted text.txt'
const outputPath = 'src/data/villakeySourceData.js'

const source = fs.readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
const blocks = source.split(/^Sub PROPERTY \/ COLLECTION CONTENT\s*$/m).slice(1).map((block) => block.trim())

const valueAfter = (lines, prefix) => {
  const line = lines.find((item) => item.startsWith(prefix))
  return line ? line.slice(prefix.length).trim() : ''
}

const slugify = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const categoryId = (category) => {
  const value = String(category || '').toLowerCase()
  if (value.includes('check')) return 'chat-prearrival'
  if (value.includes('gate') || value.includes('access') || value.includes('lock')) return 'chat-access'
  if (value.includes('maintenance')) return 'chat-maintenance'
  if (value.includes('clean')) return 'chat-cleaning'
  if (value.includes('payment') || value.includes('fee') || value.includes('refund')) return 'chat-payments'
  if (value.includes('pet') || value.includes('visitor')) return 'chat-pets'
  if (value.includes('occupancy') || value.includes('event')) return 'chat-occupancy'
  if (value.includes('parking') || value.includes('pool') || value.includes('spa')) return 'chat-stay'
  if (value.includes('post')) return 'chat-poststay'
  return 'chat-other'
}

const channel = (value) => {
  const normalized = String(value || '').toLowerCase()
  if (normalized.includes('chat')) return normalized.includes('call') ? 'chat, call' : 'chat'
  if (normalized.includes('call')) return 'call'
  return 'internal'
}

const parseProcedure = (lines, number, subpropertyId) => {
  const isIndexOnly = lines.length === 1 && lines[0].includes('—')
  if (isIndexOnly) {
    const line = lines[0]
    const match = line.match(/^Procedure (\d+)\s+—\s+(.*?)\s+\|\s+Category:\s*(.*?)\s+\|\s+Channel:\s*(.*)$/)
    const [, index, name, sourceCategory, sourceChannel] = match || []
    return {
      id: `villakey-${subpropertyId}-procedure-${number}`,
      sourceNumber: Number(index || number),
      name: name || line,
      category: categoryId(sourceCategory),
      sourceCategory: sourceCategory || '',
      channel: channel(sourceChannel),
      description: '',
      keywords: [name || line, sourceCategory || ''].filter(Boolean),
      status: 'unverified',
      verified: false,
      steps: [],
    }
  }

  const name = valueAfter(lines, 'Procedure Name:')
  const sourceCategory = valueAfter(lines, 'Category:')
  const sourceChannel = valueAfter(lines, 'Channel:')
  const description = valueAfter(lines, 'Description:')
  const keywords = valueAfter(lines, 'Keywords:')
  const steps = []
  let currentStep = null
  let completionInstruction = ''

  for (const line of lines) {
    const stepMatch = line.match(/^Step (\d+):\s*(.*)$/)
    if (stepMatch) {
      if (currentStep) steps.push(currentStep)
      currentStep = {
        id: `villakey-${subpropertyId}-procedure-${number}-step-${stepMatch[1]}`,
        order: Number(stepMatch[1]),
        title: stepMatch[2].trim(),
        instructions: '',
        type: 'normal',
        branches: [],
      }
      continue
    }

    if (line.startsWith('Step Type:')) {
      if (currentStep) currentStep.type = line.slice('Step Type:'.length).trim().toLowerCase()
      continue
    }

    if (line.startsWith('Procedure Completion')) {
      if (currentStep) {
        steps.push(currentStep)
        currentStep = null
      }
      continue
    }

    if (line.startsWith('Completion Message / Instruction:')) {
      completionInstruction = line.slice('Completion Message / Instruction:'.length).trim()
      continue
    }

    if (currentStep && line.trim().startsWith('•')) {
      const instruction = line.trim()
      currentStep.instructions = currentStep.instructions ? `${currentStep.instructions}\n${instruction}` : instruction
    }
  }

  if (currentStep) steps.push(currentStep)

  return {
    id: `villakey-${subpropertyId}-procedure-${number}`,
    sourceNumber: Number(number),
    name: name || `Procedure ${number}`,
    category: categoryId(sourceCategory),
    sourceCategory,
    channel: channel(sourceChannel),
    description,
    keywords: keywords ? keywords.split(',').map((item) => item.trim()).filter(Boolean) : [name].filter(Boolean),
    status: 'unverified',
    verified: false,
    steps,
    completionInstruction,
  }
}

const parseBlock = (block) => {
  const lines = block.split('\n').map((line) => line.replace(/\s+$/, ''))
  const name = valueAfter(lines, 'Sub Property / Collection Name:')
  const id = slugify(name)
  const procedureStarts = []
  lines.forEach((line, index) => {
    if (/^Procedure \d+(?:\s+—\s+|$)/.test(line)) procedureStarts.push({ index, number: line.match(/^Procedure (\d+)/)[1] })
  })
  const procedures = []
  for (let index = 0; index < procedureStarts.length; index += 1) {
    const start = procedureStarts[index]
    const end = procedureStarts[index + 1]?.index || lines.findIndex((line, lineIndex) => lineIndex > start.index && line === '4. PROPERTY CONTACTS')
    procedures.push(parseProcedure(lines.slice(start.index, end > -1 ? end : lines.length), start.number, id))
  }

  const contactName = valueAfter(lines, 'Community / HOA:')
  const contactPhone = valueAfter(lines, 'HOA Emergency Phone:')
  const rulesText = valueAfter(lines, '5. PROPERTY RULES:') || valueAfter(lines, '5. PROPERTY RULES')
  const contacts = contactName || contactPhone
    ? [{ id: `${id}-hoa`, name: contactName, role: 'Community / HOA', phone: contactPhone, email: '', preferred: 'phone' }]
    : []

  const contactIndex = lines.findIndex((line) => line === '4. PROPERTY CONTACTS')
  const additionalInfoIndex = lines.findIndex((line) => line === '6. ADDITIONAL INFORMATION')
  const additionalInformation = additionalInfoIndex >= 0 ? lines.slice(additionalInfoIndex + 1).join('\n').trim() : ''

  return {
    id,
    name,
    property: {
      description: valueAfter(lines, 'Property Description:'),
      address: valueAfter(lines, 'Address:'),
      type: valueAfter(lines, 'Type of Unit:'),
      tags: valueAfter(lines, 'Tags:'),
    },
    overview: {
      title: valueAfter(lines, 'Overview Title:'),
      summary: valueAfter(lines, 'Overview:'),
      importantInformation: valueAfter(lines, 'Important Property Information:'),
    },
    contacts,
    rules: rulesText ? [{ category: 'Property Rules', name: 'Property/community rules', value: rulesText, verified: false }] : [],
    propertyInfo: {
      name,
      type: valueAfter(lines, 'Type of Unit:'),
      address: valueAfter(lines, 'Address:'),
      description: valueAfter(lines, 'Property Description:'),
      tags: valueAfter(lines, 'Tags:'),
      additionalInformation,
    },
    procedures,
    sourceLineCount: lines.length,
    contactIndex,
  }
}

const parsedBlocks = blocks.map(parseBlock)
const sharedProcedures = (parsedBlocks[0]?.procedures || []).filter((procedure) => procedure.sourceNumber > 8)
const subproperties = parsedBlocks.map((subproperty) => ({
  ...subproperty,
  procedures: subproperty.procedures.filter((procedure) => procedure.sourceNumber <= 8),
}))
const output = `export const villakeySourceData = ${JSON.stringify({
  property: { id: 'villakey', name: 'Villakey', code: 'VILLAKEY', status: 'active', type: 'Collection', color: '#2563EB' },
  sharedProcedures,
  subproperties,
}, null, 2)}\n`
fs.writeFileSync(outputPath, output)
console.log(`Imported ${subproperties.length} Villakey subproperties, ${sharedProcedures.length} shared cards, and ${subproperties.reduce((count, item) => count + item.procedures.length, 0)} detailed cards.`)

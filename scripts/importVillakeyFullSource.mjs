import fs from 'node:fs'

const sourcePath = 'C:/Users/celusflacher.m/.codex/attachments/5d59d313-db49-4f82-8892-fc7e393c769b/Pasted text.txt'
const outputPath = 'src/data/villakeySourceData.js'

const source = fs.readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
const lines = source.split('\n').map((line) => line.replace(/\s+$/, ''))

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const categoryId = (category) => {
  const value = String(category || '').toLowerCase()
  if (value.includes('check') || value.includes('arrival') || value.includes('departure')) return 'chat-prearrival'
  if (value.includes('gate') || value.includes('access') || value.includes('lock')) return 'chat-access'
  if (value.includes('maintenance') || value.includes('safety') || value.includes('emergency')) return 'chat-maintenance'
  if (value.includes('clean') || value.includes('pest')) return 'chat-cleaning'
  if (value.includes('payment') || value.includes('fee') || value.includes('refund') || value.includes('discount')) return 'chat-payments'
  if (value.includes('pet') || value.includes('visitor') || value.includes('service animal')) return 'chat-pets'
  if (value.includes('occupancy') || value.includes('event') || value.includes('conduct')) return 'chat-occupancy'
  if (value.includes('parking') || value.includes('pool') || value.includes('spa') || value.includes('amenit')) return 'chat-stay'
  if (value.includes('post')) return 'chat-poststay'
  return 'chat-other'
}

const channel = (value) => {
  const normalized = String(value || '').toLowerCase()
  const hasChat = normalized.includes('chat') && !normalized.includes('☐ chat')
  const hasCall = normalized.includes('call') && !normalized.includes('☐ call')
  if (hasChat && hasCall) return 'chat, call'
  if (hasChat) return 'chat'
  if (hasCall) return 'call'
  return 'internal'
}

const valueAfter = (sectionLines, prefix) => {
  const line = sectionLines.find((item) => item.startsWith(prefix))
  return line ? line.slice(prefix.length).trim() : ''
}

const valuesAfter = (sectionLines, prefix) =>
  sectionLines
    .filter((item) => item.startsWith(prefix))
    .map((item) => item.slice(prefix.length).trim())
    .filter(Boolean)

const findIndex = (sectionLines, tester, fromIndex = 0) => {
  for (let index = fromIndex; index < sectionLines.length; index += 1) {
    if (tester(sectionLines[index], index)) return index
  }
  return -1
}

const cleanInstructionLines = (items) => {
  const cleaned = []
  for (const item of items) {
    const trimmed = item.trim()
    if (!trimmed) continue
    if (/^(Branch \/ Decision|Decision Question:|Branch [AB] —|Condition:|Steps:|Procedure Completion)$/u.test(trimmed)) continue
    if (trimmed.startsWith('Completion Message / Instruction:')) continue
    cleaned.push(trimmed)
  }
  return cleaned.join('\n')
}

const parseStepType = (line) => {
  const value = String(line || '').toLowerCase()
  if (value.includes('☒ warning')) return 'warning'
  if (value.includes('☒ important')) return 'important'
  if (value.includes('☒ contact')) return 'contact'
  if (value.includes('☒ charge')) return 'charge'
  return 'normal'
}

const parseBranches = (procedureLines, procedureId) => {
  const branchStart = findIndex(procedureLines, (line) => line === 'Branch / Decision')
  if (branchStart < 0) return []

  const completionStart = findIndex(procedureLines, (line) => line === 'Procedure Completion', branchStart + 1)
  const branchLines = procedureLines.slice(branchStart, completionStart < 0 ? procedureLines.length : completionStart)
  const branches = []
  for (let index = 0; index < branchLines.length; index += 1) {
    const branchMatch = branchLines[index].match(/^Branch ([A-Z]) — (.*)$/u)
    if (!branchMatch) continue

    const nextBranch = findIndex(branchLines, (line) => /^Branch [A-Z] — /u.test(line), index + 1)
    const end = nextBranch < 0 ? branchLines.length : nextBranch
    const current = branchLines.slice(index + 1, end)
    const condition = valueAfter(current, 'Condition:')
    const stepIndex = current.findIndex((line) => line.startsWith('Steps:'))
    const inlineSteps = stepIndex >= 0 ? current[stepIndex].slice('Steps:'.length).trim() : ''
    const remainingSteps = stepIndex >= 0 ? cleanInstructionLines(current.slice(stepIndex + 1)) : ''
    const steps = [inlineSteps, remainingSteps].filter(Boolean).join('\n')
    branches.push({
      id: `${procedureId}-branch-${branchMatch[1].toLowerCase()}`,
      optionName: branchMatch[2].trim(),
      description: condition,
      steps: steps ? [{ title: branchMatch[2].trim(), instructions: steps, type: 'normal' }] : [],
    })
  }

  return branches
}

const parseProcedure = (procedureLines, fallbackNumber, scopeId, isGeneralProcedure) => {
  const header = procedureLines[0] || ''
  const headerNumber = header.match(/^(?:General )?Procedure (\d+)/)?.[1] || fallbackNumber
  const name = valueAfter(procedureLines, 'Procedure Name:') || header.replace(/^(?:General )?Procedure \d+\s*/u, '').trim()
  const sourceCategory = valueAfter(procedureLines, 'Category:')
  const sourceChannel = valueAfter(procedureLines, 'Channel:')
  const description = valueAfter(procedureLines, 'Description:')
  const keywordText = valueAfter(procedureLines, 'Keywords:')
  const procedureId = `villakey-${scopeId}-procedure-${String(headerNumber).padStart(3, '0')}`
  const steps = []

  for (let index = 0; index < procedureLines.length; index += 1) {
    const stepMatch = procedureLines[index].match(/^Step (\d+)$/u)
    if (!stepMatch) continue

    const nextStep = findIndex(procedureLines, (line) => /^Step \d+$/u.test(line), index + 1)
    const branchStart = findIndex(procedureLines, (line) => line === 'Branch / Decision', index + 1)
    const completionStart = findIndex(procedureLines, (line) => line === 'Procedure Completion', index + 1)
    const candidates = [nextStep, branchStart, completionStart].filter((item) => item >= 0)
    const end = candidates.length ? Math.min(...candidates) : procedureLines.length
    const stepLines = procedureLines.slice(index + 1, end)
    const order = Number(stepMatch[1])
    const instructionIndex = stepLines.findIndex((line) => line.startsWith('Instructions:'))
    const inlineInstruction = instructionIndex >= 0 ? stepLines[instructionIndex].slice('Instructions:'.length).trim() : ''
    const instructionLines = instructionIndex >= 0 ? stepLines.slice(instructionIndex + 1) : []
    const instructions = [inlineInstruction, cleanInstructionLines(instructionLines)].filter(Boolean).join('\n')

    steps.push({
      id: `${procedureId}-step-${order}`,
      order,
      title: valueAfter(stepLines, 'Step Title:'),
      instructions,
      type: parseStepType(stepLines.join(' ')),
      branches: [],
    })
  }

  const branches = parseBranches(procedureLines, procedureId)
  if (branches.length && steps.length) steps[steps.length - 1].branches = branches

  return {
    id: procedureId,
    sourceNumber: Number(headerNumber),
    name,
    isGeneralProcedure,
    category: categoryId(sourceCategory),
    sourceCategory,
    channel: channel(sourceChannel),
    description,
    keywords: keywordText ? keywordText.split(',').map((item) => item.trim()).filter(Boolean) : [name].filter(Boolean),
    status: 'unverified',
    verified: false,
    steps,
    completionInstruction: valueAfter(procedureLines, 'Completion Message / Instruction:'),
  }
}

const splitProcedures = (sectionLines, headerRegex, scopeId, isGeneralProcedure) => {
  const starts = []
  sectionLines.forEach((line, index) => {
    if (headerRegex.test(line)) starts.push(index)
  })

  return starts.map((start, index) => {
    const end = starts[index + 1] ?? sectionLines.length
    return parseProcedure(sectionLines.slice(start, end), index + 1, scopeId, isGeneralProcedure)
  })
}

const parseRules = (sectionLines) =>
  valuesAfter(sectionLines, 'Rule:').map((value, index) => ({
    id: `rule-${index + 1}`,
    category: 'Rule',
    name: value,
    value,
    verified: false,
  }))

const parseContacts = (sectionLines, scopeId) => {
  const starts = []
  sectionLines.forEach((line, index) => {
    if (line.startsWith('Contact Name:')) starts.push(index)
  })

  return starts.map((start, index) => {
    const end = starts[index + 1] ?? sectionLines.length
    const contactLines = sectionLines.slice(start, end)
    return {
      id: `${scopeId}-contact-${index + 1}`,
      name: valueAfter(contactLines, 'Contact Name:'),
      role: valueAfter(contactLines, 'Role:'),
      phone: valueAfter(contactLines, 'Phone:'),
      email: valueAfter(contactLines, 'Email:'),
      whenToContact: valueAfter(contactLines, 'When to Contact:'),
      preferred: '',
    }
  })
}

const parseMainProperty = () => {
  const generalStart = lines.findIndex((line) => line === '3. GENERAL PROCEDURES')
  const mainLines = lines.slice(0, generalStart)
  const additionalStart = lines.findIndex((line) => line === '7. ADDITIONAL INFORMATION')
  const additionalInformation = additionalStart >= 0 ? lines.slice(additionalStart + 1).join('\n').trim() : ''

  return {
    property: {
      id: 'villakey',
      name: valueAfter(mainLines, 'Property / Collection Name:') || 'Villakey',
      code: 'VILLAKEY',
      status: 'active',
      type: 'Collection',
      color: '#2563EB',
      description: valueAfter(mainLines, 'Property Description:'),
    },
    overview: {
      title: valueAfter(mainLines, 'Overview Title:'),
      summary: valueAfter(mainLines, 'Overview:'),
      importantInformation: valueAfter(mainLines, 'Important Property Information:'),
    },
    rules: parseRules(mainLines),
    contacts: parseContacts(mainLines, 'villakey'),
    propertyInfo: {
      information: valueAfter(mainLines, 'Property Information:'),
      additionalInformation,
    },
  }
}

const parseSubproperty = (sectionLines, number) => {
  const name = valueAfter(sectionLines, 'Subproperty / Collection Name:')
  const id = slugify(name) || `subproperty-${number}`
  const procedureStart = findIndex(sectionLines, (line) => line === '5. SUBPROPERTY / COLLECTION PROCEDURES')
  const detailLines = procedureStart >= 0 ? sectionLines.slice(0, procedureStart) : sectionLines
  const procedureLines = procedureStart >= 0 ? sectionLines.slice(procedureStart + 1) : []

  return {
    id,
    name,
    property: {
      description: valueAfter(detailLines, 'Description:'),
    },
    overview: {
      title: valueAfter(detailLines, 'Overview Title:'),
      summary: valueAfter(detailLines, 'Overview:'),
      importantInformation: valueAfter(detailLines, 'Important Information:'),
    },
    contacts: parseContacts(detailLines, id),
    rules: parseRules(detailLines),
    propertyInfo: {
      name,
      description: valueAfter(detailLines, 'Description:'),
      information: valueAfter(detailLines, 'Property Information:'),
    },
    procedures: splitProcedures(procedureLines, /^Procedure \d+$/u, id, false),
    sourceLineCount: sectionLines.length,
  }
}

const main = parseMainProperty()
const generalStart = lines.findIndex((line) => line === '3. GENERAL PROCEDURES')
const subcollectionsStart = lines.findIndex((line) => line === '4. SUBPROPERTY / SUBCOLLECTIONS')
const additionalStart = lines.findIndex((line) => line === '7. ADDITIONAL INFORMATION')
const generalLines = lines.slice(generalStart + 1, subcollectionsStart)
const subpropertyLines = lines.slice(subcollectionsStart + 1, additionalStart >= 0 ? additionalStart : lines.length)

const subpropertyStarts = []
subpropertyLines.forEach((line, index) => {
  if (/^Subproperty \/ Collection \d+$/u.test(line)) subpropertyStarts.push(index)
})

const subproperties = subpropertyStarts.map((start, index) => {
  const end = subpropertyStarts[index + 1] ?? subpropertyLines.length
  return parseSubproperty(subpropertyLines.slice(start, end), index + 1)
})

const sharedProcedures = splitProcedures(generalLines, /^General Procedure \d+$/u, 'general', true)

const output = `export const villakeySourceData = ${JSON.stringify(
  {
    ...main,
    sharedProcedures,
    subproperties,
  },
  null,
  2,
)}\n`

fs.writeFileSync(outputPath, output)
console.log(`Imported ${subproperties.length} Villakey subproperties and ${sharedProcedures.length} general procedures.`)

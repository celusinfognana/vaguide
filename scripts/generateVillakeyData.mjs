import fs from 'node:fs'

const sourcePath =
  'C:/Users/celusflacher.m/.codex/attachments/5b60c7d5-c030-46ac-a29e-2c4960ec22af/pasted-text.txt'
const outputPath = 'src/data/villakeyWorkflowData.js'

const categoryMap = (category) => {
  const value = String(category || '').toLowerCase()

  if (value.includes('check')) return 'chat-prearrival'
  if (value.includes('gate') || value.includes('access') || value.includes('lock')) return 'chat-access'
  if (value.includes('maintenance')) return 'chat-maintenance'
  if (value.includes('clean')) return 'chat-cleaning'
  if (value.includes('payment') || value.includes('fee') || value.includes('refund')) return 'chat-payments'
  if (value.includes('pet') || value.includes('visitor')) return 'chat-pets'
  if (value.includes('occupancy') || value.includes('event')) return 'chat-occupancy'
  if (value.includes('parking') || value.includes('pool') || value.includes('spa')) return 'chat-stay'
  if (value.includes('communication')) return 'chat-other'
  if (value.includes('post')) return 'chat-poststay'

  return 'chat-other'
}

const channelFromLine = (line) => {
  if (line.includes('☒ Chat')) return 'chat'
  if (line.includes('☒ Call')) return 'call'
  return 'internal'
}

const splitCsv = (value) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : []

const sourceText = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n')
const blocks = sourceText.split(/(?=^PROC-\d+: )/m).filter(Boolean)

const procedures = blocks.map((block, index) => {
  const lines = block.split('\n')
  const header = lines[0].match(/^PROC-(\d+):\s*(.*)$/) || []
  const number = header[1] || String(index + 1).padStart(3, '0')
  const procedureId = `villakey-proc-${number}`
  const getField = (prefix) => {
    const line = lines.find((item) => item.startsWith(prefix))
    return line ? line.slice(prefix.length).trim() : ''
  }

  const name = getField('Procedure Name:') || header[2] || `Procedure ${number}`
  const sourceCategory = getField('Category:')
  const scope = getField('Property / Community Scope:')
  const description = getField('Description:') || `Source procedure for ${name}.`
  const channelLine = lines.find((line) => line.startsWith('Channel:')) || ''
  const keywords = [
    ...new Set([scope, sourceCategory, ...splitCsv(getField('Keywords:'))].filter(Boolean)),
  ]
  const steps = []
  let currentStep = null

  for (const line of lines.slice(1)) {
    if (line === 'Branch / Decision' || line === 'Procedure Completion') {
      if (currentStep) {
        steps.push(currentStep)
        currentStep = null
      }
      continue
    }

    if (line.startsWith('Step Type:')) {
      continue
    }

    if (line.startsWith('Step ')) {
      if (currentStep) steps.push(currentStep)
      currentStep = {
        title: line.replace(/^Step \d+:\s*/, '').trim() || `Step ${steps.length + 1}`,
        instructions: [],
      }
      continue
    }

    if (line.startsWith('Instructions:')) {
      if (!currentStep) {
        currentStep = {
          title: `Step ${steps.length + 1}`,
          instructions: [],
        }
      }
      currentStep.instructions.push(line.slice('Instructions:'.length).trim())
    }
  }

  if (currentStep) steps.push(currentStep)

  return {
    id: procedureId,
    name,
    category: categoryMap(sourceCategory),
    sourceCategory,
    scope,
    channel: channelFromLine(channelLine),
    description,
    keywords,
    status: 'unverified',
    verified: false,
    sourceText: block.trim(),
    steps:
      steps.length > 0
        ? steps.map((step, stepIndex) => ({
            id: `${procedureId}-step-${stepIndex + 1}`,
            title: step.title,
            instructions: step.instructions.join('\n') || step.title,
            type: 'normal',
          }))
        : [
            {
              id: `${procedureId}-step-1`,
              title: 'Source Procedure',
              instructions: 'No process flow steps were provided in the source procedure.',
              type: 'normal',
            },
          ],
  }
})

fs.writeFileSync(
  outputPath,
  `export const villakeyProcedures = ${JSON.stringify(procedures, null, 2)}\n`,
)

console.log(`Wrote ${procedures.length} VillaKey procedures to ${outputPath}`)

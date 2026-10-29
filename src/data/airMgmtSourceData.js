import airMgmtSourceText from './airMgmtSource.txt?raw'

const sourceDocument = `AIR MANAGEMENT (AIR MGMT)
PROPERTY / COLLECTION CONTENT
Consolidated operations knowledge base
Prepared from the supplied compiled procedures and property listing (78 listed properties).
Source-grounding note: instructions are organized from the supplied source. Where the source contains conflicting or time-sensitive instructions, the conflict is retained and called out for client confirmation rather than silently resolved.`

const listingNames = [
  '101.DN','201.CB','202. WP','204.CB','206.CB','208.CB','210.CB','212.CB','214.CB','216.CB',
  '218.CB','220.CB','222.CB','224.CB','226.CB','228.CB','230.CB','232.CB','234.CB','236.CB',
  '238.CB','240.CB','242.CB','244.CB','246.CB','248.CB','250.CB','252.CB','254.CB','256.CB',
  '258.CB','260.CB','262.CB','264.CB','266.CB','268.CB','270.CB','272.CB','274.CB','276.CB',
  '278.CB','280.CB','282.CB','284.CB','286.CB','288.CB','290.CB','292.CB','294.CB','296.CB',
  '298.CB','300.CB','302.CB','304.CB','306.CB','308.CB','310.CB','312.CB','314.CB','316.CB',
  '318.CB','320.CB','322.CB','STS.515','SW.207','TL. 101B','TL. 303B','TL.302D','TPC. 205E','TPC.202A',
  'TPC.303F','TW. 3422','TW.3232','TW.3305','TW.3322','TW.3424','UO. 2862','YV. 204',
]

const subproperties = listingNames.map((name) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  name,
  code: name,
  overview: {
    title: 'Listing-specific information',
    summary: 'Follow the AIR MGMT General Procedures and the listing-specific instructions below, if any.',
    propertyHighlights: 'See the property-specific notes and exceptions in Section 5 and Additional Information.',
  },
  rules: [{ category: 'Rules', name: 'Apply the AIR MGMT general rules and any listing-specific exception documented in the source.', value: 'Apply the AIR MGMT general rules and any listing-specific exception documented in the source.' }],
  contacts: [{ name: 'Use AIR MGMT contacts in Section 2 unless the source specifies another contact for this listing.' }],
  propertyInfo: {},
  procedures: [],
}))

const categoryIds = {
  reservations: 'chat-reservations',
  'check-in / check-out': 'chat-prearrival',
  emergency: 'call-emergency',
  'access / lockouts': 'chat-access',
  'guest calls': 'call-guest',
  maintenance: 'chat-maintenance',
  cleaning: 'chat-cleaning',
  'payments / refunds': 'chat-payments',
  'pets / visitors': 'chat-pets',
  'occupancy / events': 'chat-occupancy',
  'other requests': 'chat-other',
  'during stay': 'chat-stay',
  'post-stay': 'chat-poststay',
  management: 'call-management',
  'host / owner': 'call-host',
  lockouts: 'call-lockouts',
}

const parseSharedProcedures = (source) => {
  const lines = source.split(/\r?\n/)
  const sectionStart = lines.findIndex((line) => line.trim() === '3. GENERAL PROCEDURES')
  const sectionEnd = lines.findIndex((line, index) => index > sectionStart && line.trim().startsWith('4. SUBPROPERTY'))
  if (sectionStart < 0 || sectionEnd < 0) return []

  const sectionLines = lines.slice(sectionStart, sectionEnd)
  const headers = sectionLines.flatMap((line, index) =>
    line.startsWith('General Procedure: YES') ? [index] : [],
  )

  return headers.map((headerIndex, procedureIndex) => {
    let titleIndex = headerIndex - 1
    while (titleIndex >= 0 && !sectionLines[titleIndex].trim()) titleIndex -= 1
    const endIndex = procedureIndex + 1 < headers.length ? headers[procedureIndex + 1] : sectionLines.length
    const block = sectionLines.slice(headerIndex, endIndex)
    const getField = (field) => block.find((line) => line.startsWith(`${field}:`))?.slice(field.length + 1).trim() || ''
    const name = sectionLines[titleIndex]?.trim() || ''
    const channelText = getField('Channel')
    const channel = channelText.toLowerCase().includes('chat') ? 'chat' : 'call'
    const categoryText = getField('Category').toLowerCase()
    const category = categoryIds[categoryText] || (channel === 'chat' ? 'chat-other' : 'call-guest')
    const steps = []

    block.forEach((line) => {
      const stepMatch = line.match(/^Step\s+(\d+)\s+(.+?)\s+\[(Normal|Important|Warning|Contact)\]:\s*(.*)$/)
      if (stepMatch) {
        steps.push({
          id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-step-${stepMatch[1]}`,
          order: Number(stepMatch[1]),
          title: stepMatch[2].replace(/^(?:—|â[^\s]*)\s*/, '').trim(),
          instructions: stepMatch[4],
          type: stepMatch[3].toLowerCase(),
        })
        return
      }

      if (line.startsWith('Procedure Completion:')) {
        steps.push({
          id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-completion`,
          order: steps.length + 1,
          title: 'Procedure Completion',
          instructions: line.slice('Procedure Completion:'.length).trim(),
          type: 'normal',
        })
      }
    })

    return {
      id: `air-mgmt-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      name,
      isGeneralProcedure: true,
      channel,
      category,
      description: getField('Description'),
      keywords: getField('Keywords').split(',').map((keyword) => keyword.trim()).filter(Boolean),
      status: 'unverified',
      steps,
    }
  })
}

const sharedProcedures = parseSharedProcedures(airMgmtSourceText)

export default {
  property: {
    id: 'air-management-air-mgmt',
    name: 'AIR MANAGEMENT (AIR MGMT)',
    code: 'AIR MGMT',
    status: 'active',
    type: 'Collection',
    color: '#2563EB',
    description: 'Short-term rental property collection managed by AIR MGMT, including Steamboat Springs and other Colorado properties, as well as Florida properties.',
  },
  overview: {
    title: 'AIR MGMT — General Operations',
    summary: 'Central procedures for guest communication, screening and reservations, access and lockouts, emergencies, maintenance, cleaning, check-in/check-out, payments, refunds, property information and operational reporting.',
    propertyHighlights: 'General procedures apply to the main collection and its subproperties unless the source specifies a property-specific exception.',
    adminNotes: sourceDocument,
  },
  subproperties,
  sharedProcedures,
  rules: [
    {
      id: 'air-mgmt-rule-1',
      category: 'Guest Communication',
      name: 'Keep guest communication on-platform',
      value: 'All communication with guests must remain within Airbnb/the booking platform; do not promise off-platform text or email communication.',
      verified: false,
    },
    {
      id: 'air-mgmt-rule-2',
      category: 'Occupancy & Conduct',
      name: 'No parties, events, or over-occupancy',
      value: 'No parties or events are allowed. Over-occupancy is not allowed.',
      verified: false,
    },
    {
      id: 'air-mgmt-rule-3',
      category: 'Occupancy & Conduct',
      name: 'Visitors must stay within maximum occupancy',
      value: 'Visitors are allowed only within maximum occupancy; escalate concerns or pushback to the host.',
      verified: false,
    },
    {
      id: 'air-mgmt-rule-4',
      category: 'Bookings',
      name: 'No pre-booking property viewings',
      value: 'Guests cannot view the property before booking.',
      verified: false,
    },
    {
      id: 'air-mgmt-rule-5',
      category: 'Bookings',
      name: 'Maximum stay length',
      value: 'Long-term stays exceeding 30 days are not permitted.',
      verified: false,
    },
    {
      id: 'air-mgmt-rule-6',
      category: 'Bookings',
      name: 'Filming and photoshoots',
      value: 'Filming/photoshoots may be booked at the standard nightly rate without discounts, subject to occupancy requirements.',
      verified: false,
    },
    {
      id: 'air-mgmt-rule-7',
      category: 'Bookings',
      name: 'Minimum-night exceptions',
      value: 'Minimum-night exceptions require host approval and should help fill a gap between reservations.',
      verified: false,
    },
    {
      id: 'air-mgmt-rule-8',
      category: 'Bookings',
      name: 'Blocked calendar dates',
      value: 'Do not accept bookings on blocked calendar dates.',
      verified: false,
    },
    {
      id: 'air-mgmt-rule-9',
      category: 'Reservation Changes',
      name: 'Handle modifications through the booking platform',
      value: 'Reservation modifications must be handled through the booking platform; source restrictions on date changes are detailed in the cancellation procedure.',
      verified: false,
    },
  ],
  contacts: [
    {
      id: 'air-mgmt-contact-1',
      name: 'AIR MGMT / Host Operations',
      role: 'Host / property operations',
      phone: '970-819-6157',
      email: 'contact@airmgmt.co',
      whenToContact: 'Maintenance, property issues, host coordination and urgent escalation.',
      preferred: 'phone',
    },
    {
      id: 'air-mgmt-contact-2',
      name: 'Zak',
      role: 'Secondary emergency contact',
      phone: '970-819-8325',
      email: 'Not provided',
      whenToContact: 'If the first emergency number is not answered after three calls.',
      preferred: 'phone',
    },
    {
      id: 'air-mgmt-contact-3',
      name: 'Mathew',
      role: 'Third emergency contact / cleaning and property support',
      phone: '970-918-7016',
      email: 'Not provided',
      whenToContact: 'If the first and secondary emergency contacts are not reached; cleaning issues/missing amenities via WhatsApp.',
      preferred: 'phone',
    },
    {
      id: 'air-mgmt-contact-4',
      name: 'Strong Arm Security',
      role: 'After-hours front-desk entry support',
      phone: '970-819-6161',
      email: 'Not provided',
      whenToContact: 'Guest arrives after the front desk closes at applicable front-desk properties.',
      preferred: 'phone',
    },
    {
      id: 'air-mgmt-contact-5',
      name: 'Google Voice',
      role: 'Guest-call number',
      phone: '(970) 236-6118',
      email: 'contact@airmgmt.co',
      whenToContact: 'Use to call guests/contacts; if Google Voice fails, use WhatsApp.',
      preferred: 'phone',
    },
  ],
  propertyInfo: {
    name: 'AIR MANAGEMENT (AIR MGMT)',
    type: 'Collection',
    description: 'Short-term rental property collection managed by AIR MGMT, including Steamboat Springs and other Colorado properties, as well as Florida properties.',
    masterPropertyList: '78 properties supplied in AIR MGMT PROPERTY LISTING.csv. The complete nickname/address list appears in Section 4.',
    primaryOperationalSystems: 'Guesty, Airbnb, Google Voice, WhatsApp, Breezeway (Steamboat Springs housekeeping status), Site Audit Pro, INTO AI, and AIR MGMT team-zone refund request form.',
    teamZone: 'https://airmgmt.co/team-zone',
    siteAuditPro: 'https://cloud.siteauditpro.com/folders/81k5aGyYMp7zRlrNdDSb',
    petProcessManual: 'https://docs.google.com/spreadsheets/d/15mmiL2NSlJpvarPsJfad8fd1unH0vsxQwXHSEzedLvQ/edit?pli=1#gid=840435471',
  },
  sourceDocument,
}

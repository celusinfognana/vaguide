export const mockProperties = [
  {
    id: 'agi-holdings',
    name: 'AGI Holdings',
    color: '#EF4444',
    status: 'active',
    procedureCount: 31,
    verifiedCount: 0,
    lastUpdated: '2026-08-15',
    isFavorite: false,
  },
  {
    id: 'air-mgmt',
    name: 'Air MGMT',
    color: '#3B82F6',
    status: 'active',
    procedureCount: 28,
    verifiedCount: 8,
    lastUpdated: '2026-08-20',
    isFavorite: true,
  },
  {
    id: 'barron-mgmt',
    name: 'Barron Management',
    color: '#22C55E',
    status: 'active',
    procedureCount: 25,
    verifiedCount: 15,
    lastUpdated: '2026-08-18',
    isFavorite: false,
  },
  {
    id: 'beam-barrel',
    name: 'Beam & Barrel LLC',
    color: '#8B5CF6',
    status: 'active',
    procedureCount: 22,
    verifiedCount: 10,
    lastUpdated: '2026-08-22',
    isFavorite: true,
  },
  {
    id: 'bold-sun',
    name: 'BOLD SUN',
    color: '#F59E0B',
    status: 'active',
    procedureCount: 19,
    verifiedCount: 5,
    lastUpdated: '2026-08-10',
    isFavorite: false,
  },
  {
    id: 'book-vi',
    name: 'Book VI',
    color: '#06B6D4',
    status: 'active',
    procedureCount: 21,
    verifiedCount: 12,
    lastUpdated: '2026-08-21',
    isFavorite: false,
  },
  {
    id: 'bow-vacation',
    name: 'Bow Vacation Property',
    color: '#EC4899',
    status: 'active',
    procedureCount: 18,
    verifiedCount: 7,
    lastUpdated: '2026-08-19',
    isFavorite: false,
  },
  {
    id: 'bueno-bueno',
    name: 'Bueno Bueno',
    color: '#14B8A6',
    status: 'active',
    procedureCount: 24,
    verifiedCount: 14,
    lastUpdated: '2026-08-17',
    isFavorite: false,
  },
  {
    id: 'casa-city',
    name: 'CASA CITY',
    color: '#F97316',
    status: 'active',
    procedureCount: 26,
    verifiedCount: 11,
    lastUpdated: '2026-08-16',
    isFavorite: false,
  },
  {
    id: 'coastal-dreams',
    name: 'Coastal Dreams',
    color: '#0EA5E9',
    status: 'active',
    procedureCount: 20,
    verifiedCount: 9,
    lastUpdated: '2026-08-14',
    isFavorite: false,
  },
  {
    id: 'downtown-lofts',
    name: 'Downtown Lofts',
    color: '#A855F7',
    status: 'active',
    procedureCount: 23,
    verifiedCount: 13,
    lastUpdated: '2026-08-13',
    isFavorite: false,
  },
  {
    id: 'emerald-estates',
    name: 'Emerald Estates',
    color: '#10B981',
    status: 'active',
    procedureCount: 27,
    verifiedCount: 16,
    lastUpdated: '2026-08-12',
    isFavorite: false,
  },
];

export const mockCategories = [
  { id: 'reservations', name: 'Reservations', icon: 'calendar' },
  { id: 'checkin-checkout', name: 'Check-in / Check-out', icon: 'key' },
  { id: 'access-lockouts', name: 'Access / Lockouts', icon: 'lock' },
  { id: 'during-stay', name: 'During Stay', icon: 'users' },
  { id: 'maintenance', name: 'Maintenance', icon: 'wrench' },
  { id: 'cleaning', name: 'Cleaning', icon: 'sparkles' },
  { id: 'payments-refunds', name: 'Payments / Refunds', icon: 'creditCard' },
  { id: 'pets-visitors', name: 'Pets / Visitors', icon: 'paw' },
  { id: 'occupancy', name: 'Occupancy / Events', icon: 'users' },
  { id: 'emergency', name: 'Emergency', icon: 'alert' },
  { id: 'post-stay', name: 'Post-Stay', icon: 'clipboard' },
  { id: 'other-requests', name: 'Other Requests', icon: 'helpCircle' },
];

export const mockProcedures = {
  'agi-holdings': [
    {
      id: 'early-checkin',
      name: 'Early Check-in',
      category: 'checkin-checkout',
      description: 'Guest wants to arrive before the standard 2:00 PM check-in time',
      keywords: ['early', 'check-in', 'arrival', 'before', 'time'],
      channel: 'chat',
      verified: false,
      steps: [
        {
          id: 1,
          title: 'Confirm Request',
          instruction: 'Ask the guest what time they would like to arrive.',
        },
        {
          id: 2,
          title: 'Check Cleaner Status',
          instruction: 'Early check-in is normally limited to 1-2 hours early. Is there a same-day checkout?',
          branches: [
            { label: 'YES - same-day turnover', nextStep: 3 },
            { label: 'NO - no same-day checkout', nextStep: 4 },
          ],
        },
        {
          id: 3,
          title: 'Decline Request',
          instruction: 'Early check-in with same-day turnover is not permitted.',
          alert: { type: 'warning', message: 'Same-day turnovers do not allow early check-in' },
        },
        {
          id: 4,
          title: 'Contact Cleaner',
          instruction: 'Contact the cleaner to confirm they can prepare the property early.',
          alert: { type: 'contact', message: 'Cleaner coordination is required' },
        },
      ],
    },
    {
      id: 'late-checkout',
      name: 'Late Check-out',
      category: 'checkin-checkout',
      description: 'Guest wants to extend their checkout time beyond 12:00 PM',
      keywords: ['late', 'checkout', 'extension', 'extra', 'hours'],
      channel: 'chat',
      verified: false,
      steps: [
        {
          id: 1,
          title: 'Confirm Request',
          instruction: 'Ask the guest what time they would like to check out.',
        },
        {
          id: 2,
          title: 'Check Incoming Reservation',
          instruction: 'Is there an incoming guest reservation today?',
          branches: [
            { label: 'YES - incoming guest', nextStep: 3 },
            { label: 'NO - no incoming guest', nextStep: 4 },
          ],
        },
        {
          id: 3,
          title: 'Contact Cleaner',
          instruction: 'Check with cleaner if they can accommodate late checkout and prepare for incoming guest.',
          alert: { type: 'contact', message: 'Cleaner coordination is required' },
        },
        {
          id: 4,
          title: 'Approve Request',
          instruction: 'Approve late checkout and confirm with guest.',
        },
      ],
    },
    {
      id: 'lock-code-not-working',
      name: 'Lock Code Not Working',
      category: 'access-lockouts',
      description: 'Guest is unable to access the property with their lock code',
      keywords: ['lock', 'code', 'door', 'access', 'not', 'working'],
      channel: 'both',
      verified: true,
      steps: [
        {
          id: 1,
          title: 'Verify Guest Identity',
          instruction: 'Ask for reservation details and confirm they are the current guest.',
        },
        {
          id: 2,
          title: 'Troubleshoot Lock Code',
          instruction: 'Have guest try the lock code again. Is it working now?',
          branches: [
            { label: 'YES - working', nextStep: 3 },
            { label: 'NO - still not working', nextStep: 4 },
          ],
        },
        {
          id: 3,
          title: 'Issue Resolved',
          instruction: 'Confirm access and ask guest to let you know if issues occur again.',
        },
        {
          id: 4,
          title: 'Contact Emergency Service',
          instruction: 'Guest cannot access property. Contact emergency lockout service.',
          alert: { type: 'contact', message: 'Emergency access required' },
        },
      ],
    },
    {
      id: 'refund-request',
      name: 'Refund Request',
      category: 'payments-refunds',
      description: 'Guest is requesting a refund for their stay',
      keywords: ['refund', 'money', 'back', 'return', 'reimbursement'],
      channel: 'chat',
      verified: false,
      steps: [
        {
          id: 1,
          title: 'Understand Issue',
          instruction: 'Ask guest what their concern is.',
        },
        {
          id: 2,
          title: 'Document Issue',
          instruction: 'Get details about what went wrong during their stay.',
        },
        {
          id: 3,
          title: 'Policy Check',
          instruction: 'Refund requests should not be independently approved.',
          alert: { type: 'warning', message: 'Escalate to management for approval' },
        },
      ],
    },
    {
      id: 'ac-heating',
      name: 'AC / Heating',
      category: 'maintenance',
      description: 'Guest reports issues with air conditioning or heating',
      keywords: ['AC', 'heating', 'temperature', 'cooling', 'cold', 'hot'],
      channel: 'both',
      verified: false,
      steps: [
        {
          id: 1,
          title: 'Assess Temperature Issue',
          instruction: 'Is the temperature too hot or too cold?',
          branches: [
            { label: 'Too hot - AC not cooling', nextStep: 2 },
            { label: 'Too cold - heating issue', nextStep: 3 },
          ],
        },
        {
          id: 2,
          title: 'Check AC Unit',
          instruction: 'Walk through basic troubleshooting: thermostat settings, filters, etc.',
        },
        {
          id: 3,
          title: 'Schedule Maintenance',
          instruction: 'If issue persists, contact maintenance team for immediate service.',
          alert: { type: 'contact', message: 'Maintenance required' },
        },
      ],
    },
  ],
  'air-mgmt': [
    {
      id: 'early-checkin-air',
      name: 'Early Check-in',
      category: 'checkin-checkout',
      description: 'Guest wants early check-in access',
      keywords: ['early', 'check-in'],
      channel: 'chat',
      verified: true,
      steps: [
        {
          id: 1,
          title: 'Check Availability',
          instruction: 'Verify if early check-in is available for this date.',
        },
      ],
    },
  ],
};

export const mockRules = {
  'agi-holdings': [
    { category: 'Check-in / Check-out', name: 'Earliest Check-in', value: '2:00 PM', verified: true },
    { category: 'Check-in / Check-out', name: 'Latest Check-out', value: '12:00 PM', verified: true },
    { category: 'Check-in / Check-out', name: 'Early Check-in Fee', value: 'Complimentary', verified: false },
    { category: 'Access', name: 'Lock Type', value: 'Smart Lock', verified: true },
    { category: 'Pets', name: 'Pet Fee', value: '$150 per stay', verified: true },
    { category: 'Occupancy', name: 'Maximum Guests', value: '10', verified: true },
    { category: 'Payments', name: 'Tax Rate', value: '13%', verified: true },
    { category: 'Payments', name: 'Security Deposit', value: 'Not required', verified: true },
  ],
};

export const mockContacts = {
  'agi-holdings': [
    {
      id: 'contact-1',
      name: 'Sarah Johnson',
      role: 'Primary Property Contact',
      phone: '(555) 123-4567',
      email: 'sarah@agi-holdings.com',
      preferred: 'phone',
    },
    {
      id: 'contact-2',
      name: 'Mike Thompson',
      role: 'Cleaner',
      phone: '(555) 234-5678',
      email: 'mike@cleaners.com',
      preferred: 'text',
    },
    {
      id: 'contact-3',
      name: 'Emergency Maintenance',
      role: 'Maintenance',
      phone: '(555) 345-6789',
      email: 'maintenance@agi-holdings.com',
      preferred: 'phone',
    },
  ],

};

export const mockPropertyInfo = {
  'agi-holdings': {
    name: 'AGI Holdings',
    type: 'Residential',
    address: '123 Main Street, Downtown',
    occupancy: '10 guests',
    checkIn: '2:00 PM',
    checkOut: '12:00 PM',
    petPolicy: '$150 per stay',
    parking: 'Available',
    amenities: 'WiFi, Kitchen, AC, Washer/Dryer',
    guestInstructions: 'See lock for entry code. WiFi password on kitchen counter.',
  },
};

export const mockFavorites = [
  { id: 'agi-holdings', type: 'property', name: 'AGI Holdings' },
  { id: 'early-checkin', type: 'procedure', name: 'Early Check-in', property: 'AGI Holdings' },
  { id: 'lock-code-not-working', type: 'procedure', name: 'Lock Code Not Working', property: 'AGI Holdings' },
];

export const mockRecentItems = [
  { id: 'early-checkin', type: 'procedure', name: 'Early Check-in', property: 'AGI Holdings', time: '2 minutes ago' },
  { id: 'lock-code-not-working', type: 'procedure', name: 'Lock Code Not Working', property: 'Air MGMT', time: '15 minutes ago' },
  { id: 'refund-request', type: 'procedure', name: 'Refund Request', property: 'AGI Holdings', time: '30 minutes ago' },
];

export const mockNotifications = [
  { id: 1, type: 'update', title: 'Procedure updated', description: 'Early Check-in was updated', time: '1 hour ago' },
  { id: 2, type: 'verification', title: 'Verification required', description: '7 procedures need review', time: '3 hours ago' },
  { id: 3, type: 'info', title: 'New property added', description: 'Downtown Lofts has been added', time: '1 day ago' },
];

export const searchSuggestions = [
  'guest wants early check-in',
  'lock code not working',
  'guest wants refund',
  'AC is not cooling',
  'guest left an item',
  'late checkout request',
  'pet request',
  'parking question',
  'maintenance issue',
  'cleaning problem',
];

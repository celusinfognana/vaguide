export const mockProperties = [
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

export const mockProcedures = {};

export const mockRules = {};

export const mockContacts = {};
export const mockPropertyInfo = {};
export const mockFavorites = [];
export const mockRecentItems = [];

export const mockNotifications = [
  { id: 1, type: 'update', title: 'Procedure updated', description: 'Early Check-in was updated', time: '1 hour ago' },
  { id: 2, type: 'verification', title: 'Verification required', description: '7 procedures need review', time: '3 hours ago' },
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

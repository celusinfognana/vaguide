# Quick Start Guide - Property Support Hub

## What Has Been Built

A complete, **production-quality frontend UI** for Property Support Hub - an internal web application for property support agents managing 50+ properties.

The application is 100% UI/frontend only:
- ✅ No backend or server code
- ✅ No database
- ✅ No real API calls
- ✅ No authentication logic
- ✅ Uses realistic mock data and local state only

## Installation & Running

### Step 1: Install Dependencies
```bash
cd "VA userguide"
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Navigate to: **http://localhost:3000**

You should see the Property Support Hub application loaded with the Home dashboard.

## Application Overview

### Main Layout (4 Panels)

When you navigate to a property, you'll see:

```
┌─────────────────────────────────────────────────────────────┐
│  LOGO    Global Search: "What does the guest need..."  USER  │
├──────┬──────────────┬────────────────┬───────────────────────┤
│      │              │                │                       │
│ NAV  │ PROPERTIES   │ PROCEDURES     │ MAIN WORKSPACE        │
│      │              │                │                       │
│ Home │ AGI Holdings │ Check-in/Out   │ AGI Holdings Overview │
│ Prop │ Air MGMT     │ Access Issues  │ Rules | Procedures    │
│ Fav  │ Barron Mgmt  │ Maintenance    │ Contacts | Info       │
│ Rec  │ ...          │ ...            │                       │
│      │              │                │                       │
└──────┴──────────────┴────────────────┴───────────────────────┘
```

### Navigation

1. **Global Sidebar** (Left, Dark): Home, Properties, Favorites, Recent
2. **Property Sidebar** (Left, White): Browse 50+ properties
3. **Procedure Sidebar** (Center): Browse procedures by category
4. **Main Workspace** (Right): View details and run workflows

## Key Features to Try

### 1. Home Dashboard
- **URL**: Click "Home" in left navigation
- See quick actions, recent properties, and frequently used procedures

### 2. Browse Properties
- **Click**: "Properties" in left navigation
- Search, filter, and sort through all properties
- Click any property card to view details

### 3. Property Workspace
- **Click**: Any property (e.g., "AGI Holdings")
- View 5 tabs: Overview, Rules, Procedures, Contacts, Property Info
- See property-specific rules and procedures

### 4. Run Workflow
- **In Property Workspace**: Click any procedure card (e.g., "Early Check-in")
- Click the "Run" button
- Follow interactive workflow with step-by-step instructions
- Select branches when prompted
- Complete the workflow

### 5. Global Search
- **Press**: `Ctrl + K` (or `Cmd + K` on Mac)
- Search for procedures, properties, or keywords
- Use arrow keys to navigate results
- Press Enter to open a result
- Works across all properties or current property

### 6. Manage Favorites
- **Click**: ⭐ star icon on any property or procedure
- View in "Favorites" page from left navigation
- Quick access to your most-used items

### 7. View Recent Items
- **Click**: "Recent" in left navigation
- See recently viewed procedures and properties

## Sample Data

The application comes pre-loaded with realistic mock data:

### Properties (12 included, easily expanded to 50+)
- AGI Holdings
- Air MGMT
- Barron Management
- Beam & Barrel LLC
- BOLD SUN
- Book VI
- Bow Vacation Property
- Bueno Bueno
- Casa City
- Coastal Dreams
- Downtown Lofts
- Emerald Estates

### Procedures Per Property (5-31 procedures each)
- Check-in / Check-out (Early Check-in, Late Check-out, etc.)
- Access / Lockouts (Lock Code Not Working, etc.)
- Maintenance (AC/Heating, Water Leak, etc.)
- Payments / Refunds (Refund Request, etc.)
- And 8+ more categories

### Property Rules
- Check-in/Checkout times
- Pet fees and policies
- Maximum occupancy
- Tax rates
- Parking information

## Workflow Example: "Early Check-in"

1. **Select Property**: Click "AGI Holdings"
2. **Select Procedure**: Scroll to "Check-in / Check-out" category
3. **Click**: "Early Check-in" card
4. **Click**: "Run" button
5. **Follow Steps**:
   - Step 1: Ask guest arrival time
   - Step 2: Check if same-day turnover
   - Step 3-4: Based on selection, either decline or contact cleaner
6. **Complete**: Click "Complete" on final step

## Search Examples

Try these searches in the Global Search (Ctrl+K):

- `early check-in` → Find Early Check-in procedures
- `lock code` → Find Lock Code procedures
- `refund` → Find Refund Request procedures
- `AC` → Find AC/Heating procedures
- `AGI` → Find AGI Holdings property

## Design Highlights

- **Clean, Modern**: Minimal design with strong information hierarchy
- **High Density**: Lots of information without feeling crowded
- **Professional**: SaaS dashboard aesthetic
- **Responsive**: Works on desktop, tablet, and mobile
- **Fast**: Smooth animations and transitions (150-250ms)
- **Accessible**: Keyboard navigation, focus states, semantic HTML

## Color Scheme

- **Primary Blue**: #2563EB (Actions, links, focus)
- **Success Green**: #22C55E (Verified, success messages)
- **Warning Orange**: #F59E0B (Needs attention, not verified)
- **Danger Red**: #EF4444 (Errors, urgent)
- **Chat Blue**: #3B82F6 (Chat procedures)
- **Call Purple**: #8B5CF6 (Call procedures)
- **Dark Nav**: #181A1B (Left navigation)
- **Light Background**: #F8F9FA (Secondary backgrounds)

## File Structure

```
VA userguide/
├── src/
│   ├── components/          # 15+ reusable components
│   ├── pages/              # 5 main pages
│   ├── data/               # Mock data
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
├── .env.example
├── .gitignore
└── QUICK_START.md (this file)
```

## Customization

### Adding More Properties

Edit `src/data/mockData.jsx`:

```javascript
export const mockProperties = [
  // ... existing properties ...
  {
    id: 'my-property',
    name: 'My New Property',
    color: '#10B981',
    status: 'active',
    procedureCount: 25,
    verifiedCount: 15,
    lastUpdated: '2026-08-20',
    isFavorite: false,
  },
]
```

Then add procedures, rules, and contacts for the new property.

### Changing Colors

Edit `tailwind.config.js` to modify the color scheme.

### Modifying Procedures

Edit `src/data/mockData.jsx` `mockProcedures` object to add/remove/modify workflows.

## Technology Stack

- **React 18**: Component-based UI library
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **PostCSS & Autoprefixer**: CSS processing

## Performance Notes

- Development build: ~5MB (uncompressed)
- Production build: ~150KB (minified + gzipped)
- Fast HMR (Hot Module Replacement) during development
- Optimized component rendering with React hooks

## Known Limitations (UI Only)

- No backend integration (currently mock data only)
- No real search results beyond mock data
- No database persistence (state resets on refresh)
- No authentication or user accounts
- No API calls or real-time updates
- No file upload/download
- No email or SMS sending
- Contact buttons (Call, Text, Email) don't actually perform actions

## Next Steps for Production

To convert this to a production application, you would need:

1. **Backend API**: Node.js/Express, Django, or similar
2. **Database**: PostgreSQL, MongoDB, or similar
3. **Authentication**: JWT tokens, OAuth, or similar
4. **Real Search**: Full-text search implementation
5. **Notifications**: Real-time notification system
6. **Activity Log**: Audit trail system
7. **File Storage**: Document/procedure version storage
8. **Deployment**: Docker, AWS, Heroku, or similar

## Support & Questions

Refer to `README.md` for full project documentation.

## Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

---

**Enjoy exploring Property Support Hub!**

Start with the Home page, then browse properties, and try running a workflow to get familiar with the application.

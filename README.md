# Property Support Hub

A complete, production-quality frontend UI for an internal property support team knowledge and workflow management application.

## Features

- 🏠 **Property Management**: Manage 50+ properties with property-specific workflows
- 🔍 **Global Search**: Powerful search across properties, procedures, and keywords
- 📋 **Workflow Runner**: Interactive step-by-step workflow execution with branches
- 📚 **Knowledge Base**: Comprehensive procedure documentation and rules
- 💾 **Mock Data**: Realistic mock data structure supporting scalable architecture
- 📱 **Responsive Design**: Desktop-first with mobile and tablet support
- ⚡ **Fast Performance**: Optimized React components with Tailwind CSS

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Topbar.jsx
│   ├── GlobalSidebar.jsx
│   ├── PropertySidebar.jsx
│   ├── ProcedureSidebar.jsx
│   ├── MainWorkspace.jsx
│   ├── GlobalSearchModal.jsx
│   ├── Toast.jsx
│   ├── PropertyCard.jsx
│   ├── StatCard.jsx
│   ├── PropertyOverview.jsx
│   ├── RulesTab.jsx
│   ├── ProceduresTab.jsx
│   ├── ContactsTab.jsx
│   ├── PropertyInfoTab.jsx
│   └── WorkflowRunner.jsx
├── pages/               # Page components
│   ├── HomePage.jsx
│   ├── PropertiesPage.jsx
│   ├── PropertyWorkspace.jsx
│   ├── FavoritesPage.jsx
│   └── RecentPage.jsx
├── data/                # Mock data
│   └── mockData.jsx
├── App.jsx              # Main app component
├── main.jsx             # Entry point
└── index.css            # Global styles

public/
├── index.html           # HTML template
package.json
tailwind.config.js
vite.config.js
postcss.config.js
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn

### Installation

```bash
cd "VA userguide"
npm install
```

### Development

```bash
npm run dev
```

The application will start at http://localhost:3000

### Build

```bash
npm run build
```

## Architecture

### 4-Panel Layout
1. **Global Navigation Sidebar**: Main navigation (Home, Properties, Favorites, Recent)
2. **Collections/Properties Sidebar**: Property selection and filtering
3. **Procedures/Cards Sidebar**: Category and procedure selection
4. **Main Workspace**: Dynamic content area for current selection

### State Management
- React hooks (useState) for local state
- Mock data structure designed for 50+ properties
- Favorites and recent items tracking with local state

### Components
- **Topbar**: Fixed header with global search and notifications
- **Sidebars**: Independent scrolling sections
- **WorkflowRunner**: Interactive workflow execution with branching logic
- **Search Modal**: Command-palette style global search with keyboard navigation
- **Toast Notifications**: Non-intrusive status messages

## Mock Data Structure

The application uses realistic mock data organized by property with:
- 12 sample properties (easily expandable to 50+)
- 12 procedure categories
- 50+ procedures with multi-step workflows
- Property-specific rules and contacts
- Favorites and recent items tracking

## Design System

### Colors
- **Primary Accent**: #2563EB (Blue)
- **Success**: #22C55E (Green)
- **Warning**: #F59E0B (Orange)
- **Danger**: #EF4444 (Red)
- **Chat**: #3B82F6 (Light Blue)
- **Call**: #8B5CF6 (Purple)
- **Background**: #FFFFFF / #F8F9FA
- **Dark Nav**: #181A1B
- **Text Primary**: #171717
- **Text Secondary**: #6B7280

### Typography
- Clean, modern sans-serif
- Strong hierarchy with font weights
- Readable line heights and spacing

## Features Implemented

✅ **Home Screen**: Dashboard with quick actions, recent properties, frequently used procedures
✅ **Properties Screen**: Browse and manage 50+ properties with search and filters
✅ **Property Workspace**: Detailed property view with tabs for Overview, Rules, Procedures, Contacts, Info
✅ **Workflow Runner**: Interactive step-by-step procedure execution with branches
✅ **Global Search**: Powerful search with keyboard navigation and property-aware filtering
✅ **Favorites**: Star/un-star properties and procedures
✅ **Recent Items**: Track and quickly access recently viewed items
✅ **Rules Management**: Property-specific rules display
✅ **Contacts**: Contact information with quick actions (Call, Text, Email, Copy)
✅ **Responsive Design**: Desktop-first with tablet/mobile support
✅ **Toast Notifications**: Success, error, warning messages
✅ **Loading States**: Skeleton screens and smooth transitions
✅ **Accessibility**: Semantic HTML, keyboard navigation, ARIA labels

## Interactions

- Property selection updates all dependent sections
- Category selection filters procedures
- Procedure selection enables workflow runner
- Branch selection in workflow updates step flow
- Global search with Ctrl+K shortcut
- Favorites toggle with visual feedback
- Toast notifications on user actions

## Future Enhancements

- Procedure verification workflow
- Procedure version history
- Report issue functionality
- Activity/audit log
- Management/admin screens
- Add/edit property forms
- Procedure editor/builder
- Real API integration
- Authentication (currently UI only)
- Database integration

## Performance Notes

- Built with React for component reusability
- Tailwind CSS for optimized styling
- No external dependencies beyond React and Lucide icons
- Vite for fast development and production builds
- All data is mock/local - no backend required

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## License

Internal use only

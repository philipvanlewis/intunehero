# Application Architecture

## Overview

This is a **client-side only** Next.js 14 application with **TypeScript** for type safety and **Tailwind CSS** for styling. The application is structured using React hooks for state management and component composition for UI construction.

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | Modern React framework with SSR |
| **Language** | TypeScript 5.4 | Type-safe JavaScript |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS framework |
| **Auth** | MSAL Browser 3.14 | Microsoft Azure AD authentication |
| **Export** | JSZip 3.10 | ZIP file generation |
| **Runtime** | Node.js 18+ | Development and build tool |

## Architectural Pattern

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                   │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │           Next.js App Router                   │ │
│  │                                                │ │
│  │  ┌──────────────┐                             │ │
│  │  │   app/       │  (Pages & Layout)           │ │
│  │  │  ├─ page.tsx │  Main application state    │ │
│  │  │  └─ layout   │  Root HTML                 │ │
│  │  └──────────────┘                             │ │
│  │                                                │ │
│  │  ┌──────────────┐                             │ │
│  │  │ components/  │  (React Components)         │ │
│  │  │  ├─ layout   │  Headers, sidebars         │ │
│  │  │  ├─ setup    │  Auth/setup flow          │ │
│  │  │  ├─ dashboard│  Main content area        │ │
│  │  │  ├─ modals   │  Popups & dialogs         │ │
│  │  │  └─ ui       │  Reusable primitives      │ │
│  │  └──────────────┘                             │ │
│  │                                                │ │
│  │  ┌──────────────┐                             │ │
│  │  │   lib/       │  (Utilities & Services)    │ │
│  │  │  ├─ auth     │  MSAL configuration       │ │
│  │  │  ├─ api      │  Graph API functions      │ │
│  │  │  ├─ utils    │  Filters, exports         │ │
│  │  │  └─ types.ts │  TypeScript definitions   │ │
│  │  └──────────────┘                             │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
└─────────────────────────────────────────────────────┘
         │
         │ HTTPS Calls (when API wired up)
         │
┌─────────────────────────────────────────────────────┐
│         Microsoft Graph API (External)               │
│  - /deviceManagement/configurationPolicies          │
│  - /deviceManagement/deviceManagementScripts        │
│  - /deviceManagement/deviceCompliancePolicies       │
│  - /deviceAppManagement/mobileApps                  │
└─────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow

```
User Input (Login Button)
    ↓
handleLogin() [app/page.tsx]
    ↓
loginWithPopup() [lib/auth/msal.ts] ← STUB - Wire to real MSAL
    ↓
Azure AD (Microsoft Login)
    ↓
Return auth token
    ↓
setIsAuthenticated(true)
    ↓
Show Dashboard
```

### Data Loading Flow

```
User clicks "Continue"
    ↓
handleLogin()
    ↓
loadAllData() [app/page.tsx]
    ↓
API Calls (stubbed in lib/api/graph.ts)
├─ loadConfigurationProfiles()
├─ loadPowerShellScripts()
├─ loadCompliancePolicies()
└─ loadApplications()
    ↓
setAllData()
    ↓
renderAllTabs()
    ↓
Display data in dashboard
```

### Selection & Export Flow

```
User checks checkbox
    ↓
handleSelectItem()
    ↓
setSelectedItems(Set)
    ↓
updateSelectionUI()
    ↓
Enable export buttons
    ↓
User clicks export button
    ↓
getSelectedData()
    ↓
Export function (JSON/HTML/ZIP)
    ↓
downloadBlob()
    ↓
Browser downloads file
```

## Component Hierarchy

```
App (page.tsx)
│
├── Header
│   ├── Login Button (or User info + Logout)
│
├── Sidebar
│   ├── App Info Card
│   ├── Quick Links
│   └── Status Panel
│
└── Main Content
    │
    ├── Setup View (if not authenticated)
    │   ├── AdminWarning
    │   ├── AutomatedSetup
    │   │   └── ProgressTracker
    │   ├── ManualSetupAccordion
    │   └── ClientIdInput
    │
    └── Dashboard (if authenticated)
        ├── SelectionToolbar
        │   ├── "Selected X" counter
        │   ├── Select All / Clear buttons
        │   └── Export buttons (JSON, HTML, ZIP)
        │
        ├── SearchFilterBar
        │   ├── Search input
        │   └── Platform dropdown
        │
        ├── Tabs
        │   ├── Profiles tab
        │   ├── Scripts tab
        │   ├── Compliance tab
        │   └── Apps tab
        │
        ├── ResourceCard (repeated for each item)
        │   ├── Checkbox
        │   ├── Item info
        │   └── View Details button
        │
        └── DetailModal (when opened)
            ├── Item details
            ├── Add/Remove from selection
            └── Download button
```

## State Management

### Application State Structure

```typescript
Interface AppState {
  // Authentication
  isAuthenticated: boolean
  currentUser: string
  clientId: string

  // Setup
  setupProgress: number        // 0-100
  setupStep: number            // Current step
  showSetupProgress: boolean   // Show progress tracker
  setupError: string           // Error message
  generatedClientId: string    // From automation
  setupSuccess: boolean        // Setup completed

  // Data
  allData: {
    profiles: ConfigurationProfile[]
    scripts: PowerShellScript[]
    compliance: CompliancePolicy[]
    apps: MobileApp[]
  }
  isLoadingData: boolean

  // UI
  selectedItems: Set<string>   // Format: "type-id"
  activeTab: 'profiles' | 'scripts' | 'compliance' | 'apps'
  searchTerm: string
  platformFilter: string

  // Modal
  modalItem: ResourceItem | undefined
  isModalOpen: boolean
}
```

### State Update Patterns

```typescript
// Update single state
const [value, setValue] = useState(initialValue)
setValue(newValue)

// Update nested state
const [data, setData] = useState({...})
setData({...data, nested: newValue})

// Update Set
const [selected, setSelected] = useState(new Set())
const newSet = new Set(selected)
newSet.add(item)
setSelected(newSet)

// Batch updates
const [all, setAll] = useState({
  profiles: [],
  scripts: [],
  compliance: [],
  apps: []
})
```

## Component Responsibilities

### Layout Components
- **Header**: Display authentication status, login/logout
- **Sidebar**: Show app info, quick links, status indicators

### Setup Components
- **AdminWarning**: Display permissions requirement
- **AutomatedSetup**: UI for one-click setup
- **ProgressTracker**: Visualize setup progress
- **ClientIdInput**: Input for Azure AD app ID
- **ManualSetupAccordion**: Collapsible setup guide

### Dashboard Components
- **Tabs**: Switch between resource types
- **SearchFilterBar**: Search and filter controls
- **SelectionToolbar**: Selection counter and export buttons
- **ResourceCard**: Display individual resource

### Modal Components
- **DetailModal**: Full-screen detail view

### UI Primitives
- **Button**: Reusable button (variants, sizes, states)
- **Card**: Container with styling options
- **Input**: Form input with validation
- **Badge**: Label/status indicator

## Service Layer

### Authentication (`lib/auth/msal.ts`)
- Initializes MSAL
- Handles login/logout
- Token acquisition
- Client ID persistence

**Status**: Stubbed - Ready for real MSAL implementation

### API (`lib/api/graph.ts`)
- Graph API endpoints
- Data transformations
- Error handling

**Status**: Stubbed - Ready for real Graph API calls

### Utilities
- **Filters** (`lib/utils/filters.ts`)
  - Search filtering
  - Platform filtering
  - Date formatting

- **Exports** (`lib/utils/exports.ts`)
  - JSON export
  - HTML report generation
  - ZIP creation
  - Blob downloading

## Type System

All components use TypeScript interfaces from `lib/types.ts`:

```typescript
// Resource Types
ConfigurationProfile
PowerShellScript
CompliancePolicy
MobileApp

// State Types
AuthAccount
AllData
ExportData
SetupState
DashboardState
ModalState

// UI Types
(Props interfaces for each component)
```

## Data Transformations

### Load → Display
```
Graph API Response
    ↓
Parse to TypeScript types
    ↓
Store in allData state
    ↓
Filter by search/platform
    ↓
Render in ResourceCards
```

### Select → Export
```
User selects items
    ↓
Store IDs in selectedItems Set
    ↓
User clicks export
    ↓
getSelectedData() extracts selected items
    ↓
Export function formats data
    ↓
downloadBlob() triggers browser download
```

## Error Handling

Current error handling uses:
1. Try/catch blocks for async operations
2. Error state variables (e.g., `setupError`)
3. Error message display in UI
4. Graceful fallbacks (empty states)

Example:
```typescript
try {
  const data = await loadAllData()
  setAllData(data)
} catch (error) {
  setError(error.message)
  // Show error UI
}
```

## Performance Considerations

### Memoization
```typescript
const filteredData = useMemo(() => getFilteredData(), [
  activeTab,
  searchTerm,
  platformFilter,
  allData,
])
```

### Callback Optimization
```typescript
const handler = useCallback(() => {
  // Handler logic
}, [dependencies])
```

### CSS Performance
- Tailwind purges unused styles
- CSS animations use GPU acceleration
- No large inline styles
- Efficient class concatenation

## Styling Architecture

### Tailwind Configuration
```
tailwind.config.ts
    ↓
Custom color palette
Custom animations
Custom spacing
    ↓
app/globals.css
    ↓
@tailwind directives
Global utilities
    ↓
Components use Tailwind classes
```

### Color System
- **Backgrounds**: `bg-primary`, `bg-secondary`
- **Cards**: `card-light`, `card-muted`
- **Brand**: `brand-primary`, `brand-dark`, `brand-light`
- **Status**: `status-success`, `status-warning`, `status-error`

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Sidebar hidden on mobile, shown on lg+
- Cards stack on mobile, side-by-side on desktop

## Build & Deployment

### Development
```
npm run dev
    ↓
Next.js dev server
Hot module reload
TypeScript checking
    ↓
http://localhost:3000
```

### Production
```
npm run build
    ↓
TypeScript compilation
Tailwind purging
Code splitting
    ↓
.next/ folder
    ↓
npm start
    ↓
Optimized Next.js server
```

## Future Architecture Enhancements

### Backend Integration
```
Add API layer
    ↓
Replace stubbed functions
    ↓
Add caching/persistence
    ↓
Add authentication tokens
```

### State Management Enhancement
```
Current: React hooks
Optional: Redux/Zustand/Jotai
Benefit: Complex state, time-travel debugging
```

### Testing Strategy
```
Unit: Component tests (React Testing Library)
Integration: User flows (Cypress)
E2E: Full app tests (Playwright)
```

### Analytics
```
Add page view tracking
User interaction tracking
Error reporting
Performance metrics
```

## Security Considerations

### Current
- Client-side only (no server exposure)
- No sensitive data stored
- Token handling via MSAL
- localStorage for client ID only

### Future Enhancements
- Add CSRF protection
- Implement CSP headers
- Add input validation
- Audit logging
- Rate limiting on API calls

---

**Last Updated**: November 2024
**Architecture Version**: 1.0
**Complexity**: Low to Medium
**Scalability**: Suitable for enterprise apps

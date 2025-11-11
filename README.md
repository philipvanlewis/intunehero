# Intune Configuration Reporter

A modern, full-featured Next.js 14 application for managing, exporting, and reporting on Microsoft Intune configurations.

## Features

- **One-Click Automated Setup**: Create Azure AD apps, configure permissions, and grant consent directly from the UI
- **Manual Setup Guide**: Step-by-step instructions for manual Azure AD configuration
- **Dashboard Interface**: Browse and manage:
  - Configuration Profiles
  - PowerShell Scripts
  - Compliance Policies
  - Applications
- **Advanced Search & Filtering**: Find configurations by name, description, or platform
- **Multi-Format Exports**:
  - Download as JSON
  - Generate HTML reports
  - Create ZIP archives with scripts and data
- **Selection Management**: Select multiple items and export them together
- **Detail Modal**: View comprehensive details for any configuration item
- **Responsive Design**: Works seamlessly on desktop and tablet devices

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Authentication**: [MSAL Browser](https://github.com/AzureAD/microsoft-authentication-library-for-js) (ready for integration)
- **Export**: [JSZip](https://stuk.github.io/jszip/) for ZIP generation
- **Runtime**: Node.js 18+

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## Project Structure

```
intunehero/
├── app/
│   ├── page.tsx              # Main application page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── layout/               # Header, Sidebar
│   ├── setup/                # Setup flow components
│   ├── dashboard/            # Dashboard components (tabs, cards, toolbar)
│   ├── modals/               # Detail modal
│   └── ui/                   # Reusable primitives (Button, Card, Input, Badge)
├── lib/
│   ├── auth/msal.ts          # Authentication (stubbed)
│   ├── api/graph.ts          # Graph API (stubbed)
│   ├── utils/                # Utilities (filters, exports)
│   └── types.ts              # TypeScript definitions
├── tailwind.config.ts        # Theme configuration
└── package.json              # Dependencies
```

## API Integration

The application uses **stubbed API functions**. To integrate with Microsoft Graph:

1. **Authentication**: Update `lib/auth/msal.ts`
   - Implement `initializeMSAL()` with real MSAL setup
   - Implement `loginWithPopup()` and `acquireToken()`

2. **Data Loading**: Update `lib/api/graph.ts`
   - Implement Graph API endpoints
   - Connect to `/deviceManagement/*` endpoints
   - Handle authentication tokens

Example:
```typescript
export async function loadConfigurationProfiles() {
  const token = await acquireToken();
  const response = await fetch(
    'https://graph.microsoft.com/v1.0/deviceManagement/configurationPolicies',
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.json();
}
```

## Configuration

### Theme Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  'bg-primary': '#0f1419',      // Dark background
  'brand-primary': '#6366f1',   // Purple accent
  'status-success': '#10b981',  // Green
  'status-warning': '#f59e0b',  // Amber
}
```

## Development

```bash
# Type checking
npx tsc --noEmit

# Build for production
npm run build
npm start
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

Private and confidential
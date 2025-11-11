# Quick Start Guide

## Installation (5 minutes)

```bash
# 1. Ensure you have Node.js 18+ installed
node --version

# 2. Navigate to the project
cd intunehero

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

## Using the App

### Setup Phase (First Time)

1. **Read the warning**: "Admin Permission Required" at the top
2. **Choose setup method**:
   - **Automated**: Click "Automate Setup Now" (requires admin role)
   - **Manual**: Click "Manual Setup Guide" and follow the 5 steps
3. **Enter Client ID**: Paste your Azure AD Application (client) ID
4. **Click "Continue with Client ID"** to log in

### Dashboard Phase (After Setup)

1. **View your data**: Browse through 4 tabs
   - Configuration Profiles
   - PowerShell Scripts
   - Compliance Policies
   - Applications

2. **Find items**: Use search box or platform filter

3. **Select items**: Check the boxes next to items you want

4. **Export data**: Choose format
   - **JSON**: Structured data format
   - **HTML Report**: Formatted report for sharing
   - **ZIP**: Includes JSON, scripts, and HTML

## Common Tasks

### Export a Single Item
1. Click "View Details" on the item
2. Click "Download" in the modal

### Export All Items of One Type
1. Click on a tab (e.g., "Configuration Profiles")
2. Click "Select All" button
3. Choose export format (JSON, HTML, or ZIP)

### Export Specific Items
1. Check boxes next to items you want
2. The "Selected" counter updates
3. Click the export button for your format

### Find an Item
1. Type in the "Search configurations..." box
2. Results filter in real-time
3. Or use the "All Platforms" dropdown to filter by device type

## File Locations

**Key Files to Modify**

| File | Purpose |
|------|---------|
| `lib/auth/msal.ts` | Add real Azure AD authentication |
| `lib/api/graph.ts` | Add real Graph API calls |
| `tailwind.config.ts` | Change colors and theme |
| `app/page.tsx` | Main app logic and UI |
| `components/` | Individual UI components |

## Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Production
npm run build        # Build for production
npm start            # Run production build

# Quality
npm run lint         # Check code with ESLint
npx tsc --noEmit    # Type check
```

## Troubleshooting

### "npm install" fails
```bash
# Try clearing npm cache
npm cache clean --force
npm install
```

### "Cannot find module" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Tailwind styles not showing
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Port 3000 already in use
```bash
# Use a different port
npm run dev -- -p 3001
```

## API Integration Checklist

Before connecting real APIs:

- [ ] Get Azure AD client credentials from Azure Portal
- [ ] Verify your API permissions in Azure AD
- [ ] Test authentication with Graph Explorer
- [ ] Update `lib/auth/msal.ts` with real MSAL code
- [ ] Update `lib/api/graph.ts` with real API calls
- [ ] Test data loading in the dashboard
- [ ] Verify export functionality
- [ ] Test on different browsers

## Default Demo Data

When you click "Continue with Client ID", the app loads demo data:

**Profiles**
- Windows 11 Security Baseline
- iOS Device Configuration

**Scripts**
- Update Windows Defender Definitions

**Compliance**
- Windows 10 Compliance Policy

**Apps**
- Microsoft Office 365

This is hardcoded in `app/page.tsx` in the `loadDemoData()` function.

## Configuration

### Change Theme Colors

Edit `tailwind.config.ts`:
```typescript
colors: {
  'bg-primary': '#0f1419',        // Dark background
  'brand-primary': '#6366f1',     // Purple accent
  'status-success': '#10b981',    // Green
  'status-warning': '#f59e0b',    // Amber
  'status-error': '#ef4444',      // Red
}
```

### Change Page Title

Edit `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'My Custom Title',
  description: 'My description',
};
```

## Component Structure

```
User clicks button
       ↓
Component handler fires (onClick, onChange, etc)
       ↓
useState updates component state
       ↓
Component re-renders with new state
       ↓
User sees UI update
```

## Environment Variables

Currently not needed. When adding backend:

```bash
# .env.local
NEXT_PUBLIC_GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0
NEXT_PUBLIC_AZURE_TENANT_ID=your-tenant-id
NEXT_PUBLIC_AZURE_CLIENT_ID=your-client-id
```

## Deployment

### To Vercel (Free, Recommended)
```bash
npm install -g vercel
vercel
# Follow prompts
```

### To Azure App Service
```bash
npm run build
# Deploy the .next folder to App Service
```

### To Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Getting Help

1. **Check README.md** for full documentation
2. **Check IMPLEMENTATION_SUMMARY.md** for architecture details
3. **Search component files** for TypeScript interfaces
4. **Check console errors** (F12 → Console tab)
5. **Review Next.js docs**: https://nextjs.org/docs
6. **Review Tailwind docs**: https://tailwindcss.com/docs

## Next Steps

1. Get your Azure AD credentials
2. Wire up MSAL authentication (lib/auth/msal.ts)
3. Wire up Graph API (lib/api/graph.ts)
4. Test with real data
5. Customize branding/colors
6. Deploy to production

## Tips & Tricks

- **Save client ID**: It's automatically saved to localStorage
- **Demo data**: Click login to see demo data
- **Export anywhere**: Exports work fully in-browser, no server needed
- **Edit components**: Hot reload means changes show instantly
- **Type checking**: Run `npx tsc --noEmit` to catch type errors early
- **Performance**: Check DevTools Network tab for slow loads

---

**Last Updated**: November 2024
**Next.js Version**: 14.2.3
**Node.js Required**: 18 or higher

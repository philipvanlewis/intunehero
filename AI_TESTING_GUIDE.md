# Phase 1 AI Features Testing Guide

Welcome! This guide explains how to test the AI features implemented in Phase 1 Week 1 of IntuneHero.

## Quick Start

### 1. Enable AI Features

Create or update `.env.local` with:

```env
# Enable AI features
NEXT_PUBLIC_AI_ENABLED=true

# Choose your AI provider
NEXT_PUBLIC_AI_PROVIDER=openai

# Option A: OpenAI
OPENAI_API_KEY=sk-your-key-here

# Option B: Azure OpenAI (alternative)
# AZURE_OPENAI_API_KEY=your-key
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
# AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
```

### 2. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000`

### 3. Find the AI Chat Widget

Look for the **blue chat button** in the bottom-right corner of the dashboard.

## Testing Features

### ✅ Test 1: AI Chat Widget Visibility

**Expected Result:**
- Blue floating chat button appears in bottom-right
- Button shows chat icon
- Clicking button opens chat panel
- Chat shows welcome message and quick suggestions
- Panel can be closed with X button

**Troubleshooting:**
- Widget hidden if `NEXT_PUBLIC_AI_ENABLED=false`
- Check browser console for errors (F12 → Console)

---

### ✅ Test 2: Search Functionality

**How to Test:**
1. Sign in to the dashboard (or test with sample data)
2. Open AI chat widget
3. Type: `"Find Windows security policies"`
4. Observe the search results

**Expected Result:**
- AI recognizes search intent
- Returns relevant configurations
- Shows name, type, and platform
- Results ranked by relevance

**Sample Queries to Try:**
- `"Show me all encryption policies"`
- `"Find BitLocker configurations"`
- `"What iOS restrictions do we have?"`
- `"Search for Android policies"`

---

### ✅ Test 3: Explain Configuration

**How to Test:**
1. Open AI chat widget
2. Type: `"Explain the Windows 11 Security Baseline"`
3. Or: `"What does BitLocker encryption do?"`
4. Or: `"Tell me about iOS device restrictions"`

**Expected Result:**
- AI explains the configuration in plain English
- Describes purpose and what it does
- Lists affected device types
- Explains business impact

---

### ✅ Test 4: Get Recommendations

**How to Test:**
1. Open AI chat widget
2. Type: `"What security recommendations do you have?"`
3. Or: `"Should we apply Windows Defender settings?"`
4. Or: `"What are best practices for mobile device security?"`

**Expected Result:**
- AI provides security recommendations
- Shows priority levels (Critical, High, Medium, Low)
- Explains reasoning
- Suggests actions

---

### ✅ Test 5: Compare Configurations

**How to Test:**
1. Open AI chat widget
2. Type: `"Compare Windows security policies"`
3. Or: `"What's the difference between iOS and Android policies?"`

**Expected Result:**
- AI identifies configurations to compare
- Lists key differences
- Shows similarities
- Recommends when to use each

---

### ✅ Test 6: Export Assistance

**How to Test:**
1. Select some configurations in the dashboard
2. Open AI chat widget
3. Type: `"Help me export these configurations"`

**Expected Result:**
- AI recognizes selected items
- Suggests best export format
- Recommends what else to include
- Provides next steps guidance

---

## Sample Data

The app includes realistic sample data for testing:

### Profiles (Configurations)
- ✓ Windows 11 Security Baseline
- ✓ iOS Device Restrictions
- ✓ BitLocker Encryption Policy
- ✓ Android Enterprise Work Profile
- ✓ Password Policy - Corporate Standard

### Scripts
- ✓ Windows Defender Update Check
- ✓ Registry Hardening - Disable USB
- ✓ Edge Browser Privacy Configuration

### Compliance Policies
- ✓ Windows 10/11 Compliance Policy
- ✓ iOS Compliance Policy
- ✓ Android Compliance Policy

### Apps
- ✓ Microsoft Teams
- ✓ Microsoft Outlook
- ✓ Microsoft OneDrive
- ✓ Slack

## Testing with Real Data

### Option 1: Sign In with Microsoft 365
The dashboard will load your actual Intune configurations from Microsoft Graph if you have appropriate credentials.

### Option 2: Use Sample Data
Sample data is built-in for testing without authentication.

## Architecture Overview

```
Layout.tsx (CopilotProvider wrapper)
    ↓
Page.tsx (Dashboard + AIChatWidget)
    ↓
AIChatWidget (Floating chat interface)
    ↓
CopilotKit Runtime (/api/copilot)
    ↓
OpenAI API or Azure OpenAI
```

## Key Files

- **Components:**
  - `components/ai/AIChatWidget.tsx` - Chat interface
  - `components/ai/CopilotProvider.tsx` - Provider wrapper

- **AI Infrastructure:**
  - `lib/ai/types.ts` - TypeScript interfaces
  - `lib/ai/prompts.ts` - System prompts
  - `lib/ai/context.ts` - Context management
  - `lib/ai/actions.ts` - AI action handlers
  - `lib/ai/copilot-config.ts` - Configuration

- **Backend:**
  - `app/api/copilot/route.ts` - API endpoint

- **Sample Data:**
  - `lib/utils/sample-data.ts` - Test data

## Environment Variables

### Required for AI
```
NEXT_PUBLIC_AI_ENABLED=true
OPENAI_API_KEY=sk-...
```

### Optional Configuration
```
NEXT_PUBLIC_AI_PROVIDER=openai
NEXT_PUBLIC_AI_MODEL=gpt-4
NEXT_PUBLIC_AI_TEMPERATURE=0.7
NEXT_PUBLIC_AI_MAX_TOKENS=2000

NEXT_PUBLIC_AI_SEARCH_ENABLED=true
NEXT_PUBLIC_AI_RECOMMENDATIONS_ENABLED=true
NEXT_PUBLIC_AI_EXPLAIN_ENABLED=true
NEXT_PUBLIC_AI_COMPARE_ENABLED=true
NEXT_PUBLIC_AI_EXPORT_ENABLED=true

NEXT_PUBLIC_COPILOT_RUNTIME_URL=/api/copilot
NEXT_PUBLIC_AI_LOGGING=false
NEXT_PUBLIC_AI_LOG_LEVEL=info
```

## Browser Console Debugging

Open DevTools (F12) and check:

```javascript
// View configuration
window.debugState?.aiConfig

// Check if AI is enabled
window.debugState?.aiEnabled

// View current data
window.debugState?.allData

// View selected items
window.debugState?.selectedItems
```

## Troubleshooting

### Chat Widget Doesn't Appear
- ✓ Check `NEXT_PUBLIC_AI_ENABLED=true`
- ✓ Check browser console for errors
- ✓ Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### API Key Not Working
- ✓ Verify key format starts with `sk-`
- ✓ Check OpenAI account has credits
- ✓ Verify no extra spaces in `.env.local`
- ✓ Restart dev server after changes

### Widget Visible But No Responses
- ✓ Check API key is valid
- ✓ Verify network tab in DevTools
- ✓ Check `/api/copilot` endpoint responds

### Context Not Showing
- ✓ Ensure authenticated or sample data loaded
- ✓ Widget uses context from dashboard state
- ✓ Refresh if data not showing

## Next Steps (Week 2)

After confirming Phase 1 works:

1. **Semantic Search** - AI-powered relevance scoring
2. **Quick Actions** - Context-aware suggestions
3. **Best Practice Analysis** - Security & compliance scoring
4. **Recommendations Engine** - Proactive security suggestions

## Support & Feedback

Found an issue? Check:
- `.env.local` configuration
- Browser console (F12)
- Network requests in DevTools
- `/api/copilot` response status

## Success Criteria

Phase 1 is working if:
- ✅ Chat widget appears in bottom-right
- ✅ Widget shows welcome message
- ✅ Can open/close chat panel
- ✅ API key is configured
- ✅ Can submit messages without errors
- ✅ Backend receives requests at `/api/copilot`

# Azure AD Authentication Implementation Guide

This guide provides step-by-step instructions for implementing Azure AD authentication in the IntuneHero application.

## Prerequisites Checklist

- [x] Node.js 18+ installed
- [x] Azure subscription with Intune
- [x] @azure/msal-browser@^3.14.0 installed
- [x] Environment variables configured in Cloudflare Pages
- [ ] Azure AD App Registration created
- [ ] API permissions granted and admin consent given

## Step-by-Step Implementation

### Step 1: Verify Environment Variables

Ensure your Cloudflare Pages environment variables are set:

1. Go to **Cloudflare Dashboard** → **intunehero** project → **Settings** → **Environment variables**
2. Verify Production environment has:
   - `NEXT_PUBLIC_CLIENT_ID`: Your Azure AD Application ID
   - `NEXT_PUBLIC_REDIRECT_URI`: `https://intunehero.pages.dev/auth/callback`

3. For local development, create a `.env.local` file:
```bash
NEXT_PUBLIC_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
```

Check [.env.example](.env.example) for all available options.

### Step 2: Initialize MSAL in Your Application

**File: `app/page.tsx`**

Add MSAL initialization when the component mounts:

```typescript
import { initializeMSAL } from '@/lib/auth/msal';

export default function Page() {
  // ... existing state ...

  // Initialize MSAL on mount
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
    if (clientId && !isInitialized) {
      initializeMSAL(clientId)
        .then(() => setIsInitialized(true))
        .catch((error) => {
          console.error('Failed to initialize MSAL:', error);
          setAuthError('Failed to initialize authentication');
        });
    }
  }, []);

  // ... rest of component ...
}
```

### Step 3: Implement MSAL Login Function

**File: `lib/auth/msal.ts` - Replace `loginWithPopup()` function**

```typescript
import * as msal from '@azure/msal-browser';

// Store MSAL instance reference
let msalInstance: msal.PublicClientApplication | null = null;

export async function initializeMSAL(clientId: string): Promise<boolean> {
  if (!clientId || typeof clientId !== 'string') {
    throw new Error('Invalid clientId: must be a non-empty string');
  }

  try {
    const config = createMsalConfig();
    config.auth.clientId = clientId;

    msalInstance = new msal.PublicClientApplication(config);
    await msalInstance.initialize();

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('msalClientId', clientId);
      sessionStorage.setItem('msalInitialized', 'true');
    }
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('MSAL initialization failed:', errorMessage);
    throw new Error(`MSAL initialization failed: ${errorMessage}`);
  }
}

function getMsalInstance(): msal.PublicClientApplication {
  if (!msalInstance) {
    throw new Error('MSAL not initialized. Call initializeMSAL first.');
  }
  return msalInstance;
}

export async function loginWithPopup(): Promise<AuthAccount | null> {
  try {
    const instance = getMsalInstance();
    const loginResponse = await instance.loginPopup({
      scopes: requiredScopes,
    });
    return loginResponse.account;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    console.error('Login error:', errorMessage);
    throw new Error(`Authentication failed: ${errorMessage}`);
  }
}

export async function acquireToken(additionalScopes?: string[]): Promise<string> {
  try {
    const instance = getMsalInstance();
    const accounts = instance.getAllAccounts();

    if (accounts.length === 0) {
      throw new Error('No user account found. Please login first.');
    }

    const scopes = [...requiredScopes];
    if (additionalScopes && Array.isArray(additionalScopes)) {
      scopes.push(...additionalScopes);
    }

    // Try silent token acquisition first
    const silentRequest: msal.SilentRequest = {
      scopes,
      account: accounts[0],
    };

    try {
      const tokenResponse = await instance.acquireTokenSilent(silentRequest);
      return tokenResponse.accessToken;
    } catch (silentError) {
      // Fallback to interactive login
      console.log('Silent token acquisition failed, falling back to popup...');
      const popupRequest: msal.PopupRequest = {
        scopes,
      };
      const tokenResponse = await instance.acquireTokenPopup(popupRequest);
      return tokenResponse.accessToken;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Token acquisition failed';
    console.error('Token error:', errorMessage);
    throw new Error(`Failed to acquire token: ${errorMessage}`);
  }
}

export async function logoutUser(): Promise<void> {
  try {
    const instance = getMsalInstance();
    const accounts = instance.getAllAccounts();

    if (accounts.length > 0) {
      await instance.logoutPopup({
        account: accounts[0],
        mainWindowRedirectUri: msalConfig.auth.redirectUri,
      });
    }

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('msalClientId');
      sessionStorage.removeItem('msalInitialized');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Logout failed';
    console.error('Logout error:', errorMessage);
    console.warn(`Logout incomplete, but clearing session: ${errorMessage}`);
  }
}
```

### Step 4: Implement Graph API Calls

**File: `lib/api/graph.ts` - Replace `callGraphAPI()` function**

```typescript
async function callGraphAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const token = await acquireToken();

    if (!token) {
      throw new Error('No access token available. Please authenticate first.');
    }

    const response = await fetch(`${GRAPH_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // Response is not JSON, continue with default error
      }

      throw new Error(
        `Graph API error: ${response.status} ${response.statusText}. ` +
        `${errorData?.error?.message || 'Unknown error'}`
      );
    }

    if (response.status === 204) {
      return null as T; // No content response
    }

    return response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Graph API error:', errorMessage);
    throw new Error(`Failed to call Graph API (${endpoint}): ${errorMessage}`);
  }
}
```

### Step 5: Implement Data Loading Functions

**File: `lib/api/graph.ts` - Replace data loading functions**

```typescript
export async function loadConfigurationProfiles(): Promise<ConfigurationProfile[]> {
  try {
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceManagement/configurationPolicies'
    );

    if (!response?.value) return [];

    return response.value.map((profile: any) => ({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      platform: getPlatformFromOdataType(profile['@odata.type']),
      modifiedDateTime: profile.modifiedDateTime,
      settings: [], // Load settings separately if needed
      createdDateTime: profile.createdDateTime,
    }));
  } catch (error) {
    console.error('Failed to load configuration profiles:', error);
    throw error;
  }
}

export async function loadPowerShellScripts(): Promise<PowerShellScript[]> {
  try {
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceManagement/deviceManagementScripts'
    );

    if (!response?.value) return [];

    return response.value.map((script: any) => ({
      id: script.id,
      name: script.displayName,
      description: script.description,
      content: script.scriptContent || 'Script content not available',
      runAs32Bit: script.runAs32Bit,
      enforceSignatureCheck: script.enforceSignatureCheck,
      runAsAccount: script.runAsAccount,
    }));
  } catch (error) {
    console.error('Failed to load PowerShell scripts:', error);
    throw error;
  }
}

export async function loadCompliancePolicies(): Promise<CompliancePolicy[]> {
  try {
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceManagement/deviceCompliancePolicies'
    );

    if (!response?.value) return [];

    return response.value.map((policy: any) => ({
      id: policy.id,
      name: policy.displayName,
      description: policy.description,
      platform: getPlatformFromOdataType(policy['@odata.type']),
      createdDateTime: policy.createdDateTime,
      modifiedDateTime: policy.modifiedDateTime,
    }));
  } catch (error) {
    console.error('Failed to load compliance policies:', error);
    throw error;
  }
}

export async function loadApplications(): Promise<MobileApp[]> {
  try {
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceAppManagement/mobileApps'
    );

    if (!response?.value) return [];

    return response.value.map((app: any) => ({
      id: app.id,
      name: app.displayName,
      description: app.description,
      platform: getPlatformFromOdataType(app['@odata.type']),
      publisher: app.publisher,
      version: app.appVersion || 'N/A',
      createdDateTime: app.createdDateTime,
    }));
  } catch (error) {
    console.error('Failed to load applications:', error);
    throw error;
  }
}

export async function loadAllData(): Promise<AllData> {
  try {
    const [profiles, scripts, compliance, apps] = await Promise.all([
      loadConfigurationProfiles().catch((e) => {
        console.warn('Failed to load profiles:', e);
        return [];
      }),
      loadPowerShellScripts().catch((e) => {
        console.warn('Failed to load scripts:', e);
        return [];
      }),
      loadCompliancePolicies().catch((e) => {
        console.warn('Failed to load compliance policies:', e);
        return [];
      }),
      loadApplications().catch((e) => {
        console.warn('Failed to load applications:', e);
        return [];
      }),
    ]);

    return { profiles, scripts, compliance, apps };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to load Intune data:', errorMessage);
    throw new Error(`Failed to load Intune data: ${errorMessage}`);
  }
}
```

### Step 6: Update App Component to Load Data

**File: `app/page.tsx`**

```typescript
const handleLogin = useCallback(async () => {
  try {
    setIsLoadingData(true);
    const account = await loginWithPopup();

    if (account) {
      setCurrentUser(account.name || 'Azure AD User');
      setIsAuthenticated(true);

      // Load data after successful authentication
      const data = await loadAllData();
      setAllData(data);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    console.error('Login error:', errorMessage);
    setAuthError(errorMessage);
  } finally {
    setIsLoadingData(false);
  }
}, []);

const handleLogout = useCallback(async () => {
  try {
    await logoutUser();
    setIsAuthenticated(false);
    setCurrentUser('');
    setAllData({ profiles: [], scripts: [], compliance: [], apps: [] });
    setSelectedItems(new Set());
  } catch (error) {
    console.error('Logout error:', error);
  }
}, []);
```

## Troubleshooting

### "NEXT_PUBLIC_CLIENT_ID is not set"
- Verify environment variables in Cloudflare Pages Settings
- Ensure you're using the correct Application ID from Azure AD
- Check that variable names are exactly: `NEXT_PUBLIC_CLIENT_ID`

### "Redirect URI mismatch"
- Verify the Redirect URI in your Azure AD app registration matches exactly
- For Cloudflare: `https://intunehero.pages.dev/auth/callback`
- For local development: `http://localhost:3000`

### "AADSTS65001: User or admin has not consented"
- Go back to Azure AD App registration → API permissions
- Click "Grant admin consent for [Organization]"
- Wait 5-10 minutes for consent to propagate

### "Scopes not found or not consented"
- Verify all 5 required scopes are added to API permissions:
  - DeviceManagementConfiguration.ReadWrite.All
  - DeviceManagementManagedDevices.ReadWrite.All
  - DeviceManagementApps.ReadWrite.All
  - Directory.Read.All
  - offline_access
- Re-grant admin consent

### Silent Token Acquisition Fails
- This is expected on first login - the app falls back to popup
- Subsequent calls will succeed with silent acquisition
- Verify account has required Graph API scopes

## Testing Authentication Locally

1. Create `.env.local`:
```bash
NEXT_PUBLIC_CLIENT_ID=your-client-id
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
```

2. Run development server:
```bash
npm run dev
```

3. Open http://localhost:3000

4. Click "Sign In" and complete Azure AD login

5. Check browser console for any authentication errors

## Production Checklist

- [ ] Environment variables set in Cloudflare Pages
- [ ] Azure AD app registration completed
- [ ] API permissions granted
- [ ] Admin consent given
- [ ] MSAL functions implemented (not stubs)
- [ ] Graph API functions implemented (not stubs)
- [ ] Error handling added to data loading
- [ ] User can successfully login
- [ ] User can successfully logout
- [ ] Data loads after login
- [ ] Export functions work with real data
- [ ] Security: No credentials logged to console
- [ ] Security: Tokens never stored in localStorage (sessionStorage only)

## Next Steps

1. **Implement real MSAL**: Replace stub functions with actual MSAL implementation
2. **Implement Graph API calls**: Replace stub API functions with real endpoint calls
3. **Add error handling**: Add proper error messages and user feedback
4. **Test with real data**: Verify data loads correctly from your Intune instance
5. **Monitor logs**: Check browser console and application logs for any errors

## References

- [Microsoft Authentication Library (MSAL) for JavaScript](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/overview)
- [Intune REST API Reference](https://docs.microsoft.com/en-us/graph/intune-graph-apis)
- [MSAL.js Configuration Options](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md)

---

**Status**: Ready for implementation
**Last Updated**: November 2024

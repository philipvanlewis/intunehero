// MSAL Configuration and Authentication Utilities
// These are stubbed for now and should be wired up with actual MSAL implementation

import type { AuthAccount, TokenResponse } from '../types';

/**
 * Creates MSAL configuration object
 * Uses environment variables: NEXT_PUBLIC_CLIENT_ID, NEXT_PUBLIC_REDIRECT_URI
 */
export function createMsalConfig() {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || '';
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  if (!clientId) {
    console.warn('WARNING: NEXT_PUBLIC_CLIENT_ID environment variable is not set. Authentication will not work.');
  }
  if (!redirectUri && typeof window === 'undefined') {
    console.warn('WARNING: NEXT_PUBLIC_REDIRECT_URI environment variable is not set. Using window.location.origin as fallback.');
  }

  return {
    auth: {
      clientId,
      authority: 'https://login.microsoftonline.com/common',
      redirectUri,
    },
    cache: {
      cacheLocation: 'sessionStorage' as const,
      storeAuthStateInCookie: false,
    },
  };
}

const msalConfig = createMsalConfig();

const requiredScopes = [
  'DeviceManagementConfiguration.Read.All',
  'DeviceManagementApps.Read.All',
  'DeviceManagementServiceConfig.Read.All',
  'DeviceManagementManagedDevices.Read.All',
];

const automationScopes = [
  'Application.ReadWrite.All',
  'AppRoleAssignment.ReadWrite.All',
  'DelegatedPermissionGrant.ReadWrite.All',
];

/**
 * Initializes MSAL instance with provided clientId
 * @param clientId - Azure AD Application ID
 * @throws Error if clientId is not provided
 */
export async function initializeMSAL(clientId: string): Promise<boolean> {
  if (!clientId || typeof clientId !== 'string') {
    throw new Error('Invalid clientId: must be a non-empty string');
  }

  try {
    // TODO: Initialize actual MSAL instance with @azure/msal-browser
    // import * as msal from '@azure/msal-browser';
    // const msalInstance = new msal.PublicClientApplication({
    //   ...msalConfig,
    //   auth: { ...msalConfig.auth, clientId }
    // });
    // await msalInstance.initialize();
    // Store instance reference for later use

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('msalClientId', clientId);
      sessionStorage.setItem('msalInitialized', 'true');
    }
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during MSAL initialization';
    console.error('Failed to initialize MSAL:', errorMessage);
    throw new Error(`MSAL initialization failed: ${errorMessage}`);
  }
}

/**
 * Performs login with popup showing consent dialog
 * @returns User account information or null if login fails
 */
export async function loginWithPopup(): Promise<AuthAccount | null> {
  try {
    const clientId = msalConfig.auth.clientId;
    if (!clientId) {
      throw new Error('MSAL not initialized: clientId is missing. Check NEXT_PUBLIC_CLIENT_ID environment variable.');
    }

    // TODO: Implement actual MSAL login popup
    // const msalInstance = getMsalInstance(); // Get stored instance
    // const loginResponse = await msalInstance.loginPopup({
    //   scopes: requiredScopes,
    // });
    // return loginResponse.account;

    console.log('Login popup - STUB - In production, this would show Azure AD login dialog');
    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    console.error('Login error:', errorMessage);
    throw new Error(`Authentication failed: ${errorMessage}`);
  }
}

/**
 * Performs login for setup/automation flow with elevated scopes
 * @returns Token and account information for app registration automation
 */
export async function loginForAutomation(): Promise<{ token: string; account: AuthAccount } | null> {
  try {
    const clientId = msalConfig.auth.clientId;
    if (!clientId) {
      throw new Error('MSAL not initialized: clientId is missing. Check NEXT_PUBLIC_CLIENT_ID environment variable.');
    }

    // TODO: Implement login with automation scopes
    // const msalInstance = getMsalInstance();
    // const loginResponse = await msalInstance.loginPopup({
    //   scopes: automationScopes,
    // });
    // const tokenResponse = await msalInstance.acquireTokenSilent({
    //   scopes: automationScopes,
    //   account: loginResponse.account,
    // });
    // return {
    //   token: tokenResponse.accessToken,
    //   account: loginResponse.account,
    // };

    console.log('Automation login - STUB - In production, this would authenticate for app registration');
    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Automation login failed';
    console.error('Automation login error:', errorMessage);
    throw new Error(`Automation login failed: ${errorMessage}`);
  }
}

/**
 * Acquires access token for Microsoft Graph API
 * Combines required scopes with any additional scopes
 * @param additionalScopes - Additional scopes to request beyond required scopes
 * @returns Access token string
 * @throws Error if token acquisition fails
 */
export async function acquireToken(additionalScopes?: string[]): Promise<string> {
  try {
    const clientId = msalConfig.auth.clientId;
    if (!clientId) {
      throw new Error('MSAL not initialized: clientId is missing. Check NEXT_PUBLIC_CLIENT_ID environment variable.');
    }

    const scopes = [...requiredScopes];
    if (additionalScopes && Array.isArray(additionalScopes)) {
      scopes.push(...additionalScopes);
    }

    // TODO: Implement token acquisition
    // const msalInstance = getMsalInstance();
    // const accounts = msalInstance.getAllAccounts();
    // if (accounts.length === 0) {
    //   throw new Error('No user account found. Please login first.');
    // }
    // const tokenResponse = await msalInstance.acquireTokenSilent({
    //   scopes,
    //   account: accounts[0],
    // }).catch(async () => {
    //   // Fallback to interactive login if silent acquisition fails
    //   return msalInstance.acquireTokenPopup({ scopes });
    // });
    // return tokenResponse.accessToken;

    console.log('Acquire token - STUB', { scopes: scopes.length });
    return '';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Token acquisition failed';
    console.error('Token acquisition error:', errorMessage);
    throw new Error(`Failed to acquire token: ${errorMessage}`);
  }
}

/**
 * Logs out the current user and clears all stored authentication data
 */
export async function logoutUser(): Promise<void> {
  try {
    // TODO: Implement actual MSAL logout
    // const msalInstance = getMsalInstance();
    // const accounts = msalInstance.getAllAccounts();
    // if (accounts.length > 0) {
    //   await msalInstance.logoutPopup({
    //     account: accounts[0],
    //     mainWindowRedirectUri: msalConfig.auth.redirectUri,
    //   });
    // }

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('msalClientId');
      sessionStorage.removeItem('msalInitialized');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Logout failed';
    console.error('Logout error:', errorMessage);
    // Don't throw on logout errors, just log them
    console.warn(`Logout incomplete, but clearing local session data: ${errorMessage}`);
  }
}

export function getStoredClientId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('intuneReporterClientId');
  }
  return null;
}

export function saveClientId(clientId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('intuneReporterClientId', clientId);
  }
}

export const scopes = {
  required: requiredScopes,
  automation: automationScopes,
};

export default msalConfig;

// MSAL Configuration and Authentication Utilities
// Real implementation with @azure/msal-browser

import * as msal from '@azure/msal-browser';
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

// Store MSAL instance reference
let msalInstance: msal.PublicClientApplication | null = null;

/**
 * Gets or creates the MSAL instance
 * @throws Error if MSAL is not initialized
 */
function getMsalInstance(): msal.PublicClientApplication {
  if (!msalInstance) {
    throw new Error('MSAL not initialized. Call initializeMSAL first.');
  }
  return msalInstance;
}

const requiredScopes = [
  'DeviceManagementConfiguration.Read.All',
  'DeviceManagementApps.Read.All',
  'DeviceManagementServiceConfig.Read.All',
  'DeviceManagementManagedDevices.Read.All',
  'DeviceManagementScripts.Read.All',
  'DeviceManagementScripts.ReadWrite.All',
  'Directory.Read.All',
  'offline_access',
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
    // Create MSAL instance with provided clientId
    const config = createMsalConfig();
    msalInstance = new msal.PublicClientApplication({
      ...config,
      auth: { ...config.auth, clientId }
    });

    // Initialize MSAL
    await msalInstance.initialize();

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('msalClientId', clientId);
      sessionStorage.setItem('msalInitialized', 'true');
    }

    console.log('MSAL initialized successfully');
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
    const instance = getMsalInstance();
    const loginResponse = await instance.loginPopup({
      scopes: requiredScopes,
    });

    console.log('User logged in:', loginResponse.account?.username);
    return loginResponse.account || null;
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
    const instance = getMsalInstance();
    const loginResponse = await instance.loginPopup({
      scopes: automationScopes,
    });

    if (!loginResponse.account) {
      throw new Error('No account found after login');
    }

    const tokenResponse = await instance.acquireTokenSilent({
      scopes: automationScopes,
      account: loginResponse.account,
    });

    return {
      token: tokenResponse.accessToken,
      account: loginResponse.account,
    };
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
    const instance = getMsalInstance();
    const accounts = instance.getAllAccounts();

    if (accounts.length === 0) {
      throw new Error('No user account found. Please login first.');
    }

    const scopes = [...requiredScopes];
    if (additionalScopes && Array.isArray(additionalScopes)) {
      scopes.push(...additionalScopes);
    }

    try {
      // Try silent token acquisition first
      const silentRequest: msal.SilentRequest = {
        scopes,
        account: accounts[0],
      };

      const tokenResponse = await instance.acquireTokenSilent(silentRequest);
      return tokenResponse.accessToken;
    } catch (silentError) {
      // Fallback to interactive login if silent acquisition fails
      console.log('Silent token acquisition failed, falling back to popup...');
      const popupRequest: msal.PopupRequest = {
        scopes,
      };
      const tokenResponse = await instance.acquireTokenPopup(popupRequest);
      return tokenResponse.accessToken;
    }
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
    const instance = getMsalInstance();
    const accounts = instance.getAllAccounts();

    if (accounts.length > 0) {
      // Use the home page as redirect URI for post-logout, not the auth callback
      const homePageUri = typeof window !== 'undefined'
        ? `${window.location.origin}/`
        : msalConfig.auth.redirectUri;

      await instance.logoutPopup({
        account: accounts[0],
        mainWindowRedirectUri: homePageUri,
      });
    }

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('msalClientId');
      sessionStorage.removeItem('msalInitialized');
    }

    console.log('User logged out successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Logout failed';
    console.error('Logout error:', errorMessage);
    // Clear local session data even if MSAL logout fails
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('msalClientId');
      sessionStorage.removeItem('msalInitialized');
    }
    console.warn(`Logout incomplete, but cleared local session data: ${errorMessage}`);
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

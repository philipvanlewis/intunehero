// MSAL Configuration and Authentication Utilities
// These are stubbed for now and should be wired up with actual MSAL implementation

import type { AuthAccount, TokenResponse } from '../types';

const msalConfig = {
  auth: {
    clientId: '',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '',
  },
  cache: {
    cacheLocation: 'sessionStorage' as const,
    storeAuthStateInCookie: false,
  },
};

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

export async function initializeMSAL(clientId: string): Promise<boolean> {
  // TODO: Initialize MSAL with clientId
  // Store in sessionStorage/context for later use
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('msalClientId', clientId);
  }
  return true;
}

export async function loginWithPopup(): Promise<AuthAccount | null> {
  // TODO: Implement actual MSAL loginPopup with required scopes
  // Return the current account
  console.log('Login popup - STUB');
  return null;
}

export async function loginForAutomation(): Promise<{ token: string; account: AuthAccount } | null> {
  // TODO: Implement login with automation scopes for setup flow
  console.log('Automation login - STUB');
  return null;
}

export async function acquireToken(additionalScopes?: string[]): Promise<string> {
  // TODO: Implement token acquisition (silent or popup fallback)
  // Combine requiredScopes with additionalScopes
  console.log('Acquire token - STUB', { additionalScopes });
  return '';
}

export async function logoutUser(): Promise<void> {
  // TODO: Implement logout
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('msalClientId');
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

// Microsoft Graph API Utilities
// Real implementation with Microsoft Graph API

import type {
  ConfigurationProfile,
  PowerShellScript,
  CompliancePolicy,
  MobileApp,
  AllData,
} from '../types';
import { acquireToken } from '../auth/msal';
import { getPlatformFromOdataType } from '../utils/filters';

const GRAPH_API_BASE = process.env.NEXT_PUBLIC_GRAPH_API_BASE || 'https://graph.microsoft.com/v1.0';

/**
 * Makes an authenticated call to the Microsoft Graph API
 * @param endpoint - The API endpoint (e.g., '/deviceManagement/configurationPolicies')
 * @param options - Fetch options for the request
 * @returns Parsed JSON response from the API
 * @throws Error if the request fails or token acquisition fails
 */
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error calling Graph API';
    console.error('Graph API error:', errorMessage);
    throw new Error(`Failed to call Graph API (${endpoint}): ${errorMessage}`);
  }
}

/**
 * Loads device configuration profiles from Intune
 * Endpoint: GET /deviceManagement/configurationPolicies
 * Requires scope: DeviceManagementConfiguration.Read.All
 * @returns Array of configuration profiles
 */
export async function loadConfigurationProfiles(): Promise<ConfigurationProfile[]> {
  try {
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceManagement/configurationPolicies'
    );

    if (!response?.value) return [];

    return response.value.map((profile: any) => ({
      id: profile.id,
      name: profile.name || profile.displayName || 'Unnamed',
      displayName: profile.displayName || profile.name || 'Unnamed',
      description: profile.description,
      platforms: getPlatformFromOdataType(profile['@odata.type']),
      lastModifiedDateTime: profile.modifiedDateTime,
      settings: [], // Settings loaded separately if needed
      createdDateTime: profile.createdDateTime,
      type: 'profile' as const,
    }));
  } catch (error) {
    console.error('Failed to load configuration profiles:', error);
    throw error;
  }
}

/**
 * Loads PowerShell scripts from Intune
 * Endpoint: GET /deviceManagement/deviceManagementScripts
 * Requires scope: DeviceManagementConfiguration.Read.All
 * @returns Array of PowerShell scripts
 */
export async function loadPowerShellScripts(): Promise<PowerShellScript[]> {
  try {
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceManagement/deviceManagementScripts'
    );

    if (!response?.value) return [];

    return response.value.map((script: any) => ({
      id: script.id,
      displayName: script.displayName || 'Unnamed Script',
      description: script.description,
      createdDateTime: script.createdDateTime,
      lastModifiedDateTime: script.lastModifiedDateTime,
      scriptContent: script.scriptContent || 'Script content not available',
      executionContext: script.executionContext,
      runAsAccount: script.runAsAccount,
      type: 'script' as const,
    }));
  } catch (error) {
    console.error('Failed to load PowerShell scripts:', error);
    throw error;
  }
}

/**
 * Loads device compliance policies from Intune
 * Endpoint: GET /deviceManagement/deviceCompliancePolicies
 * Requires scope: DeviceManagementConfiguration.Read.All
 * @returns Array of compliance policies
 */
export async function loadCompliancePolicies(): Promise<CompliancePolicy[]> {
  try {
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceManagement/deviceCompliancePolicies'
    );

    if (!response?.value) return [];

    return response.value.map((policy: any) => ({
      id: policy.id,
      displayName: policy.displayName || 'Unnamed Policy',
      description: policy.description,
      lastModifiedDateTime: policy.lastModifiedDateTime || policy.modifiedDateTime,
      createdDateTime: policy.createdDateTime,
      '@odata.type': policy['@odata.type'],
      type: 'compliance' as const,
    }));
  } catch (error) {
    console.error('Failed to load compliance policies:', error);
    throw error;
  }
}

/**
 * Loads mobile applications from Intune
 * Endpoint: GET /deviceAppManagement/mobileApps
 * Requires scope: DeviceManagementApps.Read.All
 * @returns Array of mobile applications
 */
export async function loadApplications(): Promise<MobileApp[]> {
  try {
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceAppManagement/mobileApps'
    );

    if (!response?.value) return [];

    return response.value.map((app: any) => ({
      id: app.id,
      displayName: app.displayName || 'Unnamed App',
      description: app.description,
      publisher: app.publisher,
      publishedDateTime: app.publishedDateTime,
      createdDateTime: app.createdDateTime,
      '@odata.type': app['@odata.type'],
      type: 'app' as const,
    }));
  } catch (error) {
    console.error('Failed to load applications:', error);
    throw error;
  }
}

/**
 * Loads all Intune data in parallel
 * Combines profiles, scripts, compliance policies, and applications
 * @returns Object containing all loaded data
 */
export async function loadAllData(): Promise<AllData> {
  try {
    // Load all data in parallel for better performance
    const [profiles, scripts, compliance, apps] = await Promise.all([
      loadConfigurationProfiles().catch((error) => {
        console.warn('Failed to load profiles:', error);
        return [];
      }),
      loadPowerShellScripts().catch((error) => {
        console.warn('Failed to load scripts:', error);
        return [];
      }),
      loadCompliancePolicies().catch((error) => {
        console.warn('Failed to load compliance policies:', error);
        return [];
      }),
      loadApplications().catch((error) => {
        console.warn('Failed to load applications:', error);
        return [];
      }),
    ]);

    console.log('Data loaded successfully:', { profiles: profiles.length, scripts: scripts.length, compliance: compliance.length, apps: apps.length });
    return { profiles, scripts, compliance, apps };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error loading data';
    console.error('Failed to load Intune data:', errorMessage);
    throw new Error(`Failed to load Intune data: ${errorMessage}`);
  }
}

// Automation Setup Functions
export async function createAzureADApp(
  token: string,
  appName: string,
): Promise<{ appId: string; objectId: string }> {
  // TODO: Create Azure AD application
  console.log('Create AAD app - STUB', { appName });
  return { appId: '', objectId: '' };
}

export async function createServicePrincipal(token: string, appId: string): Promise<string> {
  // TODO: Create service principal for the app
  console.log('Create service principal - STUB', { appId });
  return '';
}

export async function grantAdminConsent(
  tenantId: string,
  appId: string,
): Promise<string> {
  // TODO: Return admin consent URL
  return `https://login.microsoftonline.com/${tenantId}/adminconsent?client_id=${appId}`;
}

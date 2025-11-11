// Microsoft Graph API Utilities
// These are stubbed for now and should be wired with actual API calls

import type {
  ConfigurationProfile,
  PowerShellScript,
  CompliancePolicy,
  MobileApp,
  AllData,
} from '../types';
import { acquireToken } from '../auth/msal';

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
    // TODO: Implement actual Graph API calls
    // const token = await acquireToken();
    // if (!token) {
    //   throw new Error('No access token available. Please authenticate first.');
    // }
    // const response = await fetch(`${GRAPH_API_BASE}${endpoint}`, {
    //   ...options,
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //     ...options.headers,
    //   },
    // });
    //
    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({}));
    //   throw new Error(
    //     `Graph API error: ${response.status} ${response.statusText}. ` +
    //     `${errorData?.error?.message || 'Unknown error'}`
    //   );
    // }
    //
    // if (response.status === 204) {
    //   return null as T; // No content response
    // }
    //
    // return response.json();

    console.log('Graph API call - STUB:', { endpoint, method: options.method || 'GET' });
    return {} as T;
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
  // TODO: Call /deviceManagement/configurationPolicies
  // and load settings for each profile
  // const profiles = await callGraphAPI<{ value: ConfigurationProfile[] }>(
  //   '/deviceManagement/configurationPolicies'
  // );
  // return profiles.value || [];
  console.log('Loading configuration profiles - STUB');
  return [];
}

/**
 * Loads PowerShell scripts from Intune
 * Endpoint: GET /deviceManagement/deviceManagementScripts
 * Requires scope: DeviceManagementConfiguration.Read.All
 * @returns Array of PowerShell scripts
 */
export async function loadPowerShellScripts(): Promise<PowerShellScript[]> {
  // TODO: Call /deviceManagement/deviceManagementScripts
  // const scripts = await callGraphAPI<{ value: PowerShellScript[] }>(
  //   '/deviceManagement/deviceManagementScripts'
  // );
  // return scripts.value || [];
  console.log('Loading PowerShell scripts - STUB');
  return [];
}

/**
 * Loads device compliance policies from Intune
 * Endpoint: GET /deviceManagement/deviceCompliancePolicies
 * Requires scope: DeviceManagementConfiguration.Read.All
 * @returns Array of compliance policies
 */
export async function loadCompliancePolicies(): Promise<CompliancePolicy[]> {
  // TODO: Call /deviceManagement/deviceCompliancePolicies
  // const policies = await callGraphAPI<{ value: CompliancePolicy[] }>(
  //   '/deviceManagement/deviceCompliancePolicies'
  // );
  // return policies.value || [];
  console.log('Loading compliance policies - STUB');
  return [];
}

/**
 * Loads mobile applications from Intune
 * Endpoint: GET /deviceAppManagement/mobileApps
 * Requires scope: DeviceManagementApps.Read.All
 * @returns Array of mobile applications
 */
export async function loadApplications(): Promise<MobileApp[]> {
  // TODO: Call /deviceAppManagement/mobileApps
  // const apps = await callGraphAPI<{ value: MobileApp[] }>(
  //   '/deviceAppManagement/mobileApps'
  // );
  // return apps.value || [];
  console.log('Loading applications - STUB');
  return [];
}

/**
 * Loads all Intune data in parallel
 * Combines profiles, scripts, compliance policies, and applications
 * @returns Object containing all loaded data
 */
export async function loadAllData(): Promise<AllData> {
  try {
    // TODO: Load all data in parallel for better performance
    // const [profiles, scripts, compliance, apps] = await Promise.all([
    //   loadConfigurationProfiles(),
    //   loadPowerShellScripts(),
    //   loadCompliancePolicies(),
    //   loadApplications(),
    // ]);
    // return { profiles, scripts, compliance, apps };

    console.log('Loading all data - STUB');
    return {
      profiles: [],
      scripts: [],
      compliance: [],
      apps: [],
    };
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

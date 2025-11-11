// Microsoft Graph API Utilities
// Real implementation with Microsoft Graph API
// See INTUNE_GRAPH_API_GUIDE.md for comprehensive endpoint documentation

import type {
  ConfigurationProfile,
  PowerShellScript,
  CompliancePolicy,
  MobileApp,
  AllData,
} from '../types';
import { acquireToken } from '../auth/msal';
import { getPlatformFromOdataType } from '../utils/filters';

// API Base URLs
const GRAPH_API_V1 = 'https://graph.microsoft.com/v1.0';
const GRAPH_API_BETA = 'https://graph.microsoft.com/beta';

/**
 * Makes an authenticated call to the Microsoft Graph API
 * @param endpoint - The API endpoint (e.g., '/deviceManagement/deviceConfigurations')
 * @param apiVersion - The API version to use ('v1.0' or 'beta'). Defaults to 'v1.0'
 * @param options - Fetch options for the request
 * @returns Parsed JSON response from the API
 * @throws Error if the request fails or token acquisition fails
 */
async function callGraphAPI<T>(
  endpoint: string,
  apiVersion: 'v1.0' | 'beta' = 'v1.0',
  options: RequestInit = {}
): Promise<T> {
  try {
    const baseUrl = apiVersion === 'beta' ? GRAPH_API_BETA : GRAPH_API_V1;
    const fullUrl = `${baseUrl}${endpoint}`;
    console.log(`[GRAPH API] Calling (${apiVersion}): ${fullUrl}`);

    const token = await acquireToken();

    if (!token) {
      throw new Error('No access token available. Please authenticate first.');
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log(`[GRAPH API] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // Response is not JSON, continue with default error
      }

      const errorMsg = `Graph API error: ${response.status} ${response.statusText}. ${errorData?.error?.message || 'Unknown error'}`;
      console.error(`[GRAPH API] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      console.log('[GRAPH API] No content response (204)');
      return null as T; // No content response
    }

    const data = await response.json();
    console.log(`[GRAPH API] Response received`);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error calling Graph API';
    console.error(`[GRAPH API] Error calling ${endpoint}:`, errorMessage);
    throw new Error(`Failed to call Graph API (${endpoint}): ${errorMessage}`);
  }
}

/**
 * Loads device configuration profiles from Intune (Traditional Device Configurations)
 * Endpoint: GET /deviceManagement/deviceConfigurations
 * API Version: v1.0 (stable)
 * Requires scope: DeviceManagementConfiguration.Read.All
 * @returns Array of configuration profiles
 */
export async function loadConfigurationProfiles(): Promise<ConfigurationProfile[]> {
  try {
    console.log('[GRAPH API] Loading device configuration profiles (traditional)...');
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceManagement/deviceConfigurations',
      'v1.0'
    );

    if (!response?.value) {
      console.warn('[GRAPH API] No configuration profiles returned');
      return [];
    }

    const profiles = response.value.map((profile: any) => ({
      id: profile.id,
      name: profile.displayName || 'Unnamed',
      displayName: profile.displayName || 'Unnamed',
      description: profile.description,
      platforms: getPlatformFromOdataType(profile['@odata.type']),
      lastModifiedDateTime: profile.lastModifiedDateTime,
      settings: [], // Settings loaded separately if needed
      createdDateTime: profile.createdDateTime,
      type: 'profile' as const,
    }));

    console.log(`[GRAPH API] Successfully loaded ${profiles.length} configuration profiles`);
    return profiles;
  } catch (error) {
    console.error('Failed to load configuration profiles:', error);
    throw error;
  }
}

/**
 * Loads configuration policies from Intune (Settings Catalog / Modern Management)
 * Endpoint: GET /deviceManagement/configurationPolicies
 * API Version: beta (Settings Catalog is beta-only)
 * Requires scope: DeviceManagementConfiguration.Read.All
 * @returns Array of configuration profiles
 */
export async function loadConfigurationPoliciesModern(): Promise<ConfigurationProfile[]> {
  try {
    console.log('[GRAPH API] Loading device configuration policies (Settings Catalog)...');
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceManagement/configurationPolicies',
      'beta'
    );

    if (!response?.value) {
      console.warn('[GRAPH API] No configuration policies returned');
      return [];
    }

    const policies = response.value.map((policy: any) => ({
      id: policy.id,
      name: policy.name || 'Unnamed',
      displayName: policy.name || 'Unnamed',
      description: policy.description,
      platforms: getPlatformFromOdataType(policy['@odata.type']),
      lastModifiedDateTime: policy.lastModifiedDateTime,
      settings: [], // Settings loaded separately if needed
      createdDateTime: policy.createdDateTime,
      type: 'profile' as const,
    }));

    console.log(`[GRAPH API] Successfully loaded ${policies.length} configuration policies (Settings Catalog)`);
    return policies;
  } catch (error) {
    console.error('Failed to load configuration policies (Settings Catalog):', error);
    throw error;
  }
}

/**
 * Loads PowerShell scripts from Intune
 * Endpoint: GET /deviceManagement/deviceManagementScripts
 * API Version: v1.0 (stable)
 * Requires scope: DeviceManagementConfiguration.Read.All
 * @returns Array of PowerShell scripts
 */
export async function loadPowerShellScripts(): Promise<PowerShellScript[]> {
  try {
    console.log('[GRAPH API] Loading PowerShell scripts...');
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceManagement/deviceManagementScripts',
      'v1.0'
    );

    if (!response?.value) {
      console.warn('[GRAPH API] No PowerShell scripts returned');
      return [];
    }

    const scripts = response.value.map((script: any) => ({
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

    console.log(`[GRAPH API] Successfully loaded ${scripts.length} PowerShell scripts`);
    return scripts;
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
    console.log('[GRAPH API] Loading compliance policies...');
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceManagement/deviceCompliancePolicies'
    );

    if (!response?.value) {
      console.warn('[GRAPH API] No compliance policies returned');
      return [];
    }

    const policies = response.value.map((policy: any) => ({
      id: policy.id,
      displayName: policy.displayName || 'Unnamed Policy',
      description: policy.description,
      lastModifiedDateTime: policy.lastModifiedDateTime || policy.modifiedDateTime,
      createdDateTime: policy.createdDateTime,
      '@odata.type': policy['@odata.type'],
      type: 'compliance' as const,
    }));

    console.log(`[GRAPH API] Successfully loaded ${policies.length} compliance policies`);
    return policies;
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
    console.log('[GRAPH API] Loading mobile applications...');
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceAppManagement/mobileApps'
    );

    if (!response?.value) {
      console.warn('[GRAPH API] No mobile applications returned');
      return [];
    }

    const apps = response.value.map((app: any) => ({
      id: app.id,
      displayName: app.displayName || 'Unnamed App',
      description: app.description,
      publisher: app.publisher,
      publishedDateTime: app.publishedDateTime,
      createdDateTime: app.createdDateTime,
      '@odata.type': app['@odata.type'],
      type: 'app' as const,
    }));

    console.log(`[GRAPH API] Successfully loaded ${apps.length} mobile applications`);
    return apps;
  } catch (error) {
    console.error('Failed to load applications:', error);
    throw error;
  }
}

/**
 * Loads all Intune data in parallel with fallback strategy
 * Configuration Profiles: Tries Settings Catalog (beta) first, falls back to Traditional (v1.0)
 * PowerShell Scripts: Uses v1.0 API
 * Compliance Policies: Uses v1.0 API
 * Applications: Uses v1.0 API
 * @returns Object containing all loaded data
 */
export async function loadAllData(): Promise<AllData> {
  try {
    // Helper function to load configurations with fallback strategy
    const loadConfigurations = async (): Promise<ConfigurationProfile[]> => {
      try {
        // Try Settings Catalog (beta) first - modern approach
        console.log('[GRAPH API] Attempting to load configurations from Settings Catalog (beta)...');
        return await loadConfigurationPoliciesModern();
      } catch (error) {
        console.warn('[GRAPH API] Settings Catalog failed, falling back to traditional device configurations (v1.0):', error);
        try {
          // Fallback to Traditional Device Configurations (v1.0)
          return await loadConfigurationProfiles();
        } catch (fallbackError) {
          console.warn('[GRAPH API] Both configuration sources failed:', fallbackError);
          return [];
        }
      }
    };

    // Load all data in parallel
    const [profiles, scripts, compliance, apps] = await Promise.all([
      loadConfigurations(),
      loadPowerShellScripts().catch((error) => {
        console.warn('Failed to load PowerShell scripts:', error);
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

    console.log('Data loaded successfully:', {
      profiles: profiles.length,
      scripts: scripts.length,
      compliance: compliance.length,
      apps: apps.length,
    });
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

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
 * @param options - Request options: { apiVersion?: 'v1.0' | 'beta', method?: 'GET' | 'POST' | etc, body?: any, headers?: any }
 * @returns Parsed JSON response from the API
 * @throws Error if the request fails or token acquisition fails
 */
async function callGraphAPI<T>(
  endpoint: string,
  options: {
    apiVersion?: 'v1.0' | 'beta';
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  try {
    const {
      apiVersion = 'v1.0',
      method = 'GET',
      body,
      headers: customHeaders = {},
    } = options;

    const baseUrl = apiVersion === 'beta' ? GRAPH_API_BETA : GRAPH_API_V1;
    const fullUrl = `${baseUrl}${endpoint}`;
    console.log(`[GRAPH API] ${method} (${apiVersion}): ${fullUrl}`);

    const token = await acquireToken();

    if (!token) {
      throw new Error('No access token available. Please authenticate first.');
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...customHeaders,
      },
    };

    if (body) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(fullUrl, fetchOptions);

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
    console.log(`[GRAPH API] Response received from ${endpoint}`);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error calling Graph API';
    console.error(`[GRAPH API] Error calling ${endpoint}:`, errorMessage);
    throw new Error(`Failed to call Graph API (${endpoint}): ${errorMessage}`);
  }
}

/**
 * Loads device configuration profiles from Intune (Traditional v1.0 - Legacy)
 * Endpoint: GET /deviceManagement/deviceConfigurations
 * API Version: v1.0 (stable)
 * Requires scope: DeviceManagementConfiguration.Read.All
 * @returns Array of traditional device configuration profiles
 */
export async function loadDeviceConfigurations(): Promise<ConfigurationProfile[]> {
  try {
    console.log('[GRAPH API] Loading traditional device configurations (v1.0)...');
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceManagement/deviceConfigurations',
      { apiVersion: 'v1.0' }
    );

    if (!response?.value) {
      console.warn('[GRAPH API] No device configurations returned');
      return [];
    }

    const profiles = response.value.map((profile: any) => ({
      id: profile.id,
      name: profile.displayName || 'Unnamed',
      displayName: profile.displayName || 'Unnamed',
      description: profile.description,
      platforms: getPlatformFromOdataType(profile['@odata.type']),
      lastModifiedDateTime: profile.lastModifiedDateTime,
      settings: [],
      createdDateTime: profile.createdDateTime,
      type: 'profile' as const,
      profileType: 'deviceConfiguration' as const,
    }));

    console.log(`[GRAPH API] Loaded ${profiles.length} traditional device configurations`);
    return profiles;
  } catch (error) {
    console.error('[GRAPH API] Failed to load device configurations:', error);
    throw error;
  }
}

/**
 * Loads configuration profiles from Intune (Settings Catalog - Modern Approach)
 * Endpoint: GET /deviceManagement/configurationPolicies
 * API Version: beta (Settings Catalog is beta-only)
 * Requires scope: DeviceManagementConfiguration.Read.All
 * @returns Array of configuration policy profiles
 */
export async function loadConfigurationPolicies(): Promise<ConfigurationProfile[]> {
  try {
    console.log('[GRAPH API] Loading configuration policies (Settings Catalog - beta)...');
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceManagement/configurationPolicies',
      { apiVersion: 'beta' }
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
      // Settings Catalog doesn't have @odata.type at root level, use a safe default
      platforms: policy['@odata.type'] ? getPlatformFromOdataType(policy['@odata.type']) : 'Unknown',
      lastModifiedDateTime: policy.lastModifiedDateTime,
      settings: [],
      createdDateTime: policy.createdDateTime,
      type: 'profile' as const,
      profileType: 'configurationPolicy' as const,
    }));

    console.log(`[GRAPH API] Loaded ${policies.length} configuration policies (Settings Catalog)`);
    return policies;
  } catch (error) {
    console.error('[GRAPH API] Failed to load configuration policies:', error);
    throw error;
  }
}

/**
 * Loads all configuration profiles from both v1.0 and beta endpoints
 * Tries Settings Catalog (beta) first, falls back to traditional configs (v1.0)
 * @returns Combined array of configuration profiles from both sources
 */
export async function loadAllConfigurationProfiles(): Promise<ConfigurationProfile[]> {
  try {
    console.log('[GRAPH API] Loading all configuration profiles with fallback strategy...');
    let allProfiles: ConfigurationProfile[] = [];

    // Try Settings Catalog (beta) first - modern approach
    try {
      console.log('[GRAPH API] Attempting Settings Catalog (beta)...');
      const policies = await loadConfigurationPolicies();
      allProfiles = [...policies];
      console.log(`[GRAPH API] Settings Catalog returned ${policies.length} policies`);
    } catch (betaError) {
      console.warn('[GRAPH API] Settings Catalog (beta) failed, will try traditional configs:', betaError);
    }

    // Always load traditional configs (v1.0) to ensure complete data
    try {
      console.log('[GRAPH API] Loading traditional device configurations (v1.0)...');
      const configs = await loadDeviceConfigurations();
      allProfiles = [...allProfiles, ...configs];
      console.log(`[GRAPH API] Traditional configs returned ${configs.length} profiles`);
    } catch (v1Error) {
      console.warn('[GRAPH API] Traditional device configurations (v1.0) failed:', v1Error);
      if (allProfiles.length === 0) {
        throw new Error('Failed to load both Settings Catalog and traditional configurations');
      }
    }

    console.log(`[GRAPH API] Total configuration profiles loaded: ${allProfiles.length}`);
    return allProfiles;
  } catch (error) {
    console.error('[GRAPH API] Failed to load all configuration profiles:', error);
    throw error;
  }
}

/**
 * Loads PowerShell scripts from Intune
 * Tries multiple endpoints: Platform Scripts and Proactive Remediations
 * Platform Scripts: /deviceManagement/deviceManagementScripts (v1.0 and beta)
 * Proactive Remediations: /deviceManagement/deviceHealthScripts (beta)
 * Requires scope: DeviceManagementConfiguration.Read.All
 * @returns Array of PowerShell scripts
 */
export async function loadPowerShellScripts(): Promise<PowerShellScript[]> {
  try {
    console.log('[GRAPH API] Loading PowerShell scripts (Platform Scripts & Proactive Remediations)...');
    let response: { value: any[] } | null = null;
    let scriptSourceEndpoint = '';

    // Try Platform Scripts v1.0 first
    try {
      console.log('[GRAPH API] Attempting /deviceManagement/deviceManagementScripts (v1.0)...');
      response = await callGraphAPI<{ value: any[] }>(
        '/deviceManagement/deviceManagementScripts',
        { apiVersion: 'v1.0' }
      );
      console.log('[GRAPH API] v1.0 endpoint succeeded');
      scriptSourceEndpoint = 'deviceManagementScripts (v1.0)';
    } catch (v1Error: any) {
      console.warn('[GRAPH API] v1.0 endpoint failed:', {
        message: v1Error?.message,
        status: v1Error?.status,
      });

      // Try Platform Scripts on beta endpoint as fallback
      try {
        console.log('[GRAPH API] Attempting /deviceManagement/deviceManagementScripts (beta)...');
        response = await callGraphAPI<{ value: any[] }>(
          '/deviceManagement/deviceManagementScripts',
          { apiVersion: 'beta' }
        );
        console.log('[GRAPH API] beta endpoint succeeded');
        scriptSourceEndpoint = 'deviceManagementScripts (beta)';
      } catch (betaError: any) {
        console.warn('[GRAPH API] beta endpoint failed:', {
          message: betaError?.message,
          status: betaError?.status,
        });

        // Try alternative endpoint /deviceManagement/scripts (legacy Platform Scripts)
        try {
          console.log('[GRAPH API] Attempting /deviceManagement/scripts (v1.0)...');
          response = await callGraphAPI<{ value: any[] }>(
            '/deviceManagement/scripts',
            { apiVersion: 'v1.0' }
          );
          console.log('[GRAPH API] /deviceManagement/scripts endpoint succeeded');
          scriptSourceEndpoint = 'scripts (v1.0)';
        } catch (legacyError: any) {
          console.warn('[GRAPH API] /deviceManagement/scripts failed:', {
            message: legacyError?.message,
            status: legacyError?.status,
          });

          // Try Proactive Remediations endpoint (beta only)
          try {
            console.log('[GRAPH API] Attempting /deviceManagement/deviceHealthScripts (beta) - Proactive Remediations...');
            response = await callGraphAPI<{ value: any[] }>(
              '/deviceManagement/deviceHealthScripts',
              { apiVersion: 'beta' }
            );
            console.log('[GRAPH API] Proactive Remediations endpoint succeeded');
            scriptSourceEndpoint = 'deviceHealthScripts (beta) - Proactive Remediations';
          } catch (remediationError: any) {
            console.warn('[GRAPH API] Proactive Remediations endpoint failed:', {
              message: remediationError?.message,
              status: remediationError?.status,
            });

            console.warn('[GRAPH API] All PowerShell/Remediation script endpoints failed:', {
              v1Error: v1Error?.message,
              betaError: betaError?.message,
              legacyError: legacyError?.message,
              remediationError: remediationError?.message,
            });
            console.log('[GRAPH API] PowerShell scripts not available in this tenant');
            return [];
          }
        }
      }
    }

    if (!response?.value) {
      console.warn('[GRAPH API] PowerShell scripts response has no value array');
      return [];
    }

    const scripts = response.value.map((script: any) => {
      // Decode base64 scriptContent if present
      let decodedContent = script.scriptContent || 'Script content not available';
      if (script.scriptContent && typeof script.scriptContent === 'string') {
        try {
          // Try to decode as base64
          decodedContent = atob(script.scriptContent);
        } catch {
          // If decode fails, use original content
          decodedContent = script.scriptContent;
        }
      }

      return {
        id: script.id,
        displayName: script.displayName || 'Unnamed Script',
        description: script.description,
        createdDateTime: script.createdDateTime,
        lastModifiedDateTime: script.lastModifiedDateTime,
        scriptContent: decodedContent,
        executionContext: script.executionContext,
        runAsAccount: script.runAsAccount,
        type: 'script' as const,
      };
    });

    console.log(`[GRAPH API] Successfully loaded ${scripts.length} PowerShell scripts from endpoint: ${scriptSourceEndpoint}`);
    return scripts;
  } catch (error) {
    console.error('[GRAPH API] Unexpected error loading PowerShell scripts:', error);
    // Return empty array instead of throwing to allow other data to load
    return [];
  }
}

/**
 * Loads device compliance policies from Intune
 * Endpoint: GET /deviceManagement/deviceCompliancePolicies
 * API Version: v1.0 (stable)
 * Requires scope: DeviceManagementConfiguration.Read.All
 * @returns Array of compliance policies
 */
export async function loadCompliancePolicies(): Promise<CompliancePolicy[]> {
  try {
    console.log('[GRAPH API] Loading compliance policies...');
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceManagement/deviceCompliancePolicies',
      { apiVersion: 'v1.0' }
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

    console.log(`[GRAPH API] Loaded ${policies.length} compliance policies`);
    return policies;
  } catch (error) {
    console.error('[GRAPH API] Failed to load compliance policies:', error);
    throw error;
  }
}

/**
 * Loads mobile applications from Intune
 * Endpoint: GET /deviceAppManagement/mobileApps
 * API Version: v1.0 (stable)
 * Requires scope: DeviceManagementApps.Read.All
 * @returns Array of mobile applications
 */
export async function loadApplications(): Promise<MobileApp[]> {
  try {
    console.log('[GRAPH API] Loading mobile applications...');
    const response = await callGraphAPI<{ value: any[] }>(
      '/deviceAppManagement/mobileApps',
      { apiVersion: 'v1.0' }
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

    console.log(`[GRAPH API] Loaded ${apps.length} mobile applications`);
    return apps;
  } catch (error) {
    console.error('[GRAPH API] Failed to load applications:', error);
    throw error;
  }
}

/**
 * Loads all Intune data in parallel with fallback strategy
 * Configuration Profiles: Uses loadAllConfigurationProfiles() which combines Settings Catalog (beta) and Traditional (v1.0)
 * PowerShell Scripts: Uses v1.0 API
 * Compliance Policies: Uses v1.0 API
 * Applications: Uses v1.0 API
 * @returns Object containing all loaded data
 */
export async function loadAllData(): Promise<AllData> {
  try {
    console.log('[GRAPH API] Starting parallel data load from all endpoints...');

    // Load all data in parallel
    const [profiles, scripts, compliance, apps] = await Promise.all([
      loadAllConfigurationProfiles().catch((error) => {
        console.warn('[GRAPH API] Failed to load configuration profiles:', error);
        return [];
      }),
      loadPowerShellScripts().catch((error) => {
        console.warn('[GRAPH API] Failed to load PowerShell scripts:', error);
        return [];
      }),
      loadCompliancePolicies().catch((error) => {
        console.warn('[GRAPH API] Failed to load compliance policies:', error);
        return [];
      }),
      loadApplications().catch((error) => {
        console.warn('[GRAPH API] Failed to load applications:', error);
        return [];
      }),
    ]);

    console.log('[GRAPH API] Data load complete:', {
      profiles: profiles.length,
      scripts: scripts.length,
      compliance: compliance.length,
      apps: apps.length,
    });

    return { profiles, scripts, compliance, apps };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error loading data';
    console.error('[GRAPH API] Failed to load Intune data:', errorMessage);
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

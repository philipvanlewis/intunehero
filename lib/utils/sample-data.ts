/**
 * Sample Data for Testing AI Features
 * Realistic Intune configurations for testing search, explain, and recommendations
 */

import type { ConfigurationProfile, PowerShellScript, CompliancePolicy, MobileApp, AllData } from '@/lib/types';

// Sample Device Configuration Profiles
export const sampleProfiles: ConfigurationProfile[] = [
  {
    id: 'profile-001',
    name: 'Windows 11 Security Baseline',
    displayName: 'Windows 11 Security Baseline',
    description: 'Applies Microsoft security baseline recommendations for Windows 11 devices',
    platforms: 'Windows 10,Windows 11',
    technologies: 'Windows',
    lastModifiedDateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdDateTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'profile',
    profileType: 'configurationPolicy',
  },
  {
    id: 'profile-002',
    name: 'iOS Device Restrictions',
    displayName: 'iOS Device Restrictions',
    description: 'Restricts certain device features on iOS/iPadOS devices including camera, AirDrop, and app installation from untrusted sources',
    platforms: 'iOS,iPadOS',
    technologies: 'Apple',
    lastModifiedDateTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdDateTime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'profile',
    profileType: 'deviceConfiguration',
  },
  {
    id: 'profile-003',
    name: 'BitLocker Encryption Policy',
    displayName: 'BitLocker Encryption Policy',
    description: 'Enforces BitLocker disk encryption on all Windows devices to protect data at rest',
    platforms: 'Windows 10,Windows 11',
    technologies: 'Windows,Security',
    lastModifiedDateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdDateTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'profile',
    profileType: 'configurationPolicy',
  },
  {
    id: 'profile-004',
    name: 'Android Enterprise Work Profile',
    displayName: 'Android Enterprise Work Profile',
    description: 'Configures work profile settings for Android Enterprise managed devices, including app restrictions and data separation',
    platforms: 'Android',
    technologies: 'Android,Security',
    lastModifiedDateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdDateTime: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'profile',
    profileType: 'configurationPolicy',
  },
  {
    id: 'profile-005',
    name: 'Password Policy - Corporate Standard',
    displayName: 'Password Policy - Corporate Standard',
    description: 'Sets password complexity requirements: minimum 12 characters, mixed case, numbers, and special characters. Password history of 24 passwords.',
    platforms: 'Windows 10,Windows 11,macOS',
    technologies: 'Windows,Security,macOS',
    lastModifiedDateTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    createdDateTime: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'profile',
    profileType: 'configurationPolicy',
  },
];

// Sample PowerShell Scripts
export const sampleScripts: PowerShellScript[] = [
  {
    id: 'script-001',
    displayName: 'Windows Defender Update Check',
    description: 'Checks Windows Defender definitions are up to date and updates them if necessary',
    createdDateTime: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    lastModifiedDateTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'script',
    executionContext: 'System',
    runAsAccount: 'System',
  },
  {
    id: 'script-002',
    displayName: 'Registry Hardening - Disable USB',
    description: 'Modifies Windows registry to disable USB device installation except for specific whitelisted devices',
    createdDateTime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    lastModifiedDateTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'script',
    executionContext: 'System',
    runAsAccount: 'System',
  },
  {
    id: 'script-003',
    displayName: 'Edge Browser Privacy Configuration',
    description: 'Configures Microsoft Edge browser privacy settings including tracking prevention, cookie policies, and privacy controls',
    createdDateTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastModifiedDateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'script',
    executionContext: 'User',
    runAsAccount: 'User',
  },
];

// Sample Compliance Policies
export const sampleCompliance: CompliancePolicy[] = [
  {
    id: 'compliance-001',
    displayName: 'Windows 10/11 Compliance Policy',
    description: 'Ensures Windows devices meet compliance requirements: encryption enabled, antivirus running, and minimum OS version',
    lastModifiedDateTime: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    createdDateTime: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    '@odata.type': '#microsoft.graph.deviceCompliancePolicy',
    type: 'compliance',
  },
  {
    id: 'compliance-002',
    displayName: 'iOS Compliance Policy',
    description: 'Requires iOS devices to have passcode enabled, minimum iOS version 15.0, and no jailbreak detection',
    lastModifiedDateTime: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    createdDateTime: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    '@odata.type': '#microsoft.graph.iosCompliancePolicy',
    type: 'compliance',
  },
  {
    id: 'compliance-003',
    displayName: 'Android Compliance Policy',
    description: 'Requires Android devices to have encryption, minimum Android version 10, and security patch level within 60 days',
    lastModifiedDateTime: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    createdDateTime: new Date(Date.now() - 210 * 24 * 60 * 60 * 1000).toISOString(),
    '@odata.type': '#microsoft.graph.androidCompliancePolicy',
    type: 'compliance',
  },
];

// Sample Mobile Apps
export const sampleApps: MobileApp[] = [
  {
    id: 'app-001',
    displayName: 'Microsoft Teams',
    description: 'Enterprise messaging and collaboration app. Required for all users.',
    publisher: 'Microsoft Corporation',
    publishedDateTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdDateTime: new Date(Date.now() - 380 * 24 * 60 * 60 * 1000).toISOString(),
    '@odata.type': '#microsoft.graph.iosStoreApp',
    type: 'app',
  },
  {
    id: 'app-002',
    displayName: 'Microsoft Outlook',
    description: 'Email and calendar management application for enterprise users',
    publisher: 'Microsoft Corporation',
    publishedDateTime: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString(),
    createdDateTime: new Date(Date.now() - 370 * 24 * 60 * 60 * 1000).toISOString(),
    '@odata.type': '#microsoft.graph.iosStoreApp',
    type: 'app',
  },
  {
    id: 'app-003',
    displayName: 'Microsoft OneDrive',
    description: 'Cloud storage and file synchronization for OneDrive for Business',
    publisher: 'Microsoft Corporation',
    publishedDateTime: new Date(Date.now() - 320 * 24 * 60 * 60 * 1000).toISOString(),
    createdDateTime: new Date(Date.now() - 340 * 24 * 60 * 60 * 1000).toISOString(),
    '@odata.type': '#microsoft.graph.androidStoreApp',
    type: 'app',
  },
  {
    id: 'app-004',
    displayName: 'Slack',
    description: 'Team collaboration and messaging platform',
    publisher: 'Slack Technologies',
    publishedDateTime: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000).toISOString(),
    createdDateTime: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    '@odata.type': '#microsoft.graph.iosStoreApp',
    type: 'app',
  },
];

/**
 * Generate complete sample data set
 */
export function generateSampleData(): AllData {
  return {
    profiles: sampleProfiles,
    scripts: sampleScripts,
    compliance: sampleCompliance,
    apps: sampleApps,
  };
}

/**
 * Get a single sample item by ID
 */
export function getSampleItemById(id: string) {
  const all = generateSampleData();

  for (const profile of all.profiles) {
    if (profile.id === id) return profile;
  }
  for (const script of all.scripts) {
    if (script.id === id) return script;
  }
  for (const policy of all.compliance) {
    if (policy.id === id) return policy;
  }
  for (const app of all.apps) {
    if (app.id === id) return app;
  }

  return null;
}

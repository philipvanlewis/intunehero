// Azure AD & Auth Types
export interface AuthAccount {
  username: string;
  homeAccountId: string;
  tenantId: string;
  localAccountId: string;
  name?: string;
  idToken?: string;
}

export interface TokenResponse {
  accessToken: string;
  expiresOn: Date;
}

// Configuration & Policy Types
export interface ConfigurationProfile {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  platforms: string;
  technologies?: string;
  lastModifiedDateTime: string;
  createdDateTime: string;
  settings?: ConfigurationSetting[];
  type: 'profile';
  profileType?: 'deviceConfiguration' | 'configurationPolicy'; // Distinguishes v1.0 vs beta sources
}

export interface ConfigurationSetting {
  settingDefinitionId: string;
  valueJson?: Record<string, any>;
  value?: any;
}

export interface PowerShellScript {
  id: string;
  displayName: string;
  description?: string;
  createdDateTime: string;
  lastModifiedDateTime?: string;
  scriptContent?: string; // Base64 encoded
  executionContext?: string;
  runAsAccount?: string;
  type: 'script';
}

export interface CompliancePolicy {
  id: string;
  displayName: string;
  description?: string;
  lastModifiedDateTime: string;
  createdDateTime: string;
  '@odata.type': string;
  type: 'compliance';
}

export interface MobileApp {
  id: string;
  displayName: string;
  description?: string;
  publisher?: string;
  publishedDateTime?: string;
  createdDateTime: string;
  '@odata.type': string;
  type: 'app';
}

export type ResourceItem = ConfigurationProfile | PowerShellScript | CompliancePolicy | MobileApp;

export interface AllData {
  profiles: ConfigurationProfile[];
  scripts: PowerShellScript[];
  compliance: CompliancePolicy[];
  apps: MobileApp[];
}

export interface ExportData {
  profiles: ConfigurationProfile[];
  scripts: PowerShellScript[];
  compliance: CompliancePolicy[];
  apps: MobileApp[];
  exportedAt: string;
  exportedBy?: string;
}

// UI State Types
export interface SetupState {
  step: number;
  isLoading: boolean;
  error?: string;
  progress: number;
  clientId?: string;
  isSuccess?: boolean;
}

export interface DashboardState {
  isLoading: boolean;
  error?: string;
  selectedItems: Set<string>;
  currentTab: 'profiles' | 'scripts' | 'compliance' | 'apps';
  searchTerm: string;
  platformFilter: string;
}

export interface ModalState {
  isOpen: boolean;
  itemId?: string;
  itemType?: 'profile' | 'script' | 'compliance' | 'app';
  item?: ResourceItem;
}

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import AdminWarning from '@/components/setup/AdminWarning';
import AutomatedSetup from '@/components/setup/AutomatedSetup';
import ManualSetupAccordion from '@/components/setup/ManualSetupAccordion';
import ClientIdInput from '@/components/setup/ClientIdInput';
import Tabs from '@/components/dashboard/Tabs';
import SearchFilterBar from '@/components/dashboard/SearchFilterBar';
import SelectionToolbar from '@/components/dashboard/SelectionToolbar';
import ResourceCard from '@/components/dashboard/ResourceCard';
import DetailModal from '@/components/modals/DetailModal';
import Card from '@/components/ui/Card';
import {
  saveClientId,
  getStoredClientId,
} from '@/lib/auth/msal';
import { downloadJSON, downloadHTML, downloadZIP, generateHTMLReport } from '@/lib/utils/exports';
import { filterItems } from '@/lib/utils/filters';
import type { AllData, ResourceItem, ExportData } from '@/lib/types';

export default function Page() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [clientId, setClientId] = useState<string>(getStoredClientId() || '');

  // Setup State
  const [setupProgress, setSetupProgress] = useState(0);
  const [setupStep, setSetupStep] = useState(0);
  const [showSetupProgress, setShowSetupProgress] = useState(false);
  const [setupError, setSetupError] = useState<string>('');
  const [generatedClientId, setGeneratedClientId] = useState<string>('');
  const [setupSuccess, setSetupSuccess] = useState(false);

  // Dashboard State
  const [allData, setAllData] = useState<AllData>({
    profiles: [],
    scripts: [],
    compliance: [],
    apps: [],
  });
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'profiles' | 'scripts' | 'compliance' | 'apps'>(
    'profiles'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

  // Modal State
  const [modalItem, setModalItem] = useState<ResourceItem | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handlers
  const handleClientIdChange = useCallback((value: string) => {
    setClientId(value);
    if (value.trim()) {
      saveClientId(value.trim());
    }
  }, []);

  const handleLogin = useCallback(() => {
    // TODO: Wire up actual MSAL login with Azure AD credentials
    // For now, show message that authentication is configured
    setCurrentUser('Azure AD User');
    setIsAuthenticated(true);
    // Demo data removed - will use real Graph API when wired up
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setAllData({ profiles: [], scripts: [], compliance: [], apps: [] });
    setSelectedItems(new Set());
  }, []);

  const handleAutomateSetup = useCallback(async () => {
    setShowSetupProgress(true);
    setSetupError('');
    setSetupProgress(0);
    setSetupStep(0);

    try {
      // Step 1: Authenticate
      setSetupStep(1);
      setSetupProgress(25);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: Create App
      setSetupStep(2);
      setSetupProgress(50);
      const mockClientId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
      setGeneratedClientId(mockClientId);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 3: Add Permissions
      setSetupStep(3);
      setSetupProgress(75);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 4: Grant Consent
      setSetupStep(4);
      setSetupProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSetupSuccess(true);
    } catch (error) {
      setSetupError(error instanceof Error ? error.message : 'Setup failed');
      setShowSetupProgress(false);
    }
  }, []);

  const handleUseGeneratedClientId = useCallback(() => {
    setClientId(generatedClientId);
    saveClientId(generatedClientId);
    setSetupSuccess(false);
    setShowSetupProgress(false);
    setSetupProgress(0);
    // Auto-login
    handleLogin();
  }, [generatedClientId, handleLogin]);

  // Demo data removed - will use real Graph API when wired up
  // const loadDemoData = useCallback(() => {
  //   setIsLoadingData(true);
  //   // Simulate loading delay
  //   setTimeout(() => {
  //     // TODO: Replace with actual loadAllData() from @/lib/api/graph
  //     setAllData({
        profiles: [
          {
            id: '1',
            name: 'Windows 11 Security Baseline',
            displayName: 'Windows 11 Security Baseline',
            description: 'Enterprise security configuration for Windows 11 devices',
            platforms: 'windows10',
            technologies: 'Microsoft Intune',
            lastModifiedDateTime: new Date().toISOString(),
            createdDateTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            settings: [],
            type: 'profile',
          },
          {
            id: '2',
            name: 'iOS Device Configuration',
            displayName: 'iOS Device Configuration',
            description: 'Basic iOS device management settings',
            platforms: 'iOS',
            technologies: 'Apple MDM',
            lastModifiedDateTime: new Date().toISOString(),
            createdDateTime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            settings: [],
            type: 'profile',
          },
        ],
        scripts: [
          {
            id: 's1',
            displayName: 'Update Windows Defender Definitions',
            description: 'Automatically updates Windows Defender signatures',
            createdDateTime: new Date().toISOString(),
            executionContext: 'System',
            type: 'script',
          },
        ],
        compliance: [
          {
            id: 'c1',
            displayName: 'Windows 10 Compliance Policy',
            description: 'Ensures Windows 10 devices meet compliance requirements',
            lastModifiedDateTime: new Date().toISOString(),
            createdDateTime: new Date().toISOString(),
            '@odata.type': 'microsoft.graph.windowsCompliancePolicy',
            type: 'compliance',
          },
        ],
        apps: [
          {
            id: 'a1',
            displayName: 'Microsoft Office 365',
            description: 'Productivity suite for enterprise',
            publisher: 'Microsoft',
            publishedDateTime: new Date().toISOString(),
            createdDateTime: new Date().toISOString(),
            '@odata.type': 'microsoft.graph.webApp',
            type: 'app',
          },
        ],
      });
      setIsLoadingData(false);
    }, 1500);
  }, []);
  // */

  const handleSelectItem = useCallback(
    (id: string, type: string, checked: boolean) => {
      const key = `${type}-${id}`;
      const newSelected = new Set(selectedItems);
      if (checked) {
        newSelected.add(key);
      } else {
        newSelected.delete(key);
      }
      setSelectedItems(newSelected);
    },
    [selectedItems]
  );

  const handleSelectAll = useCallback(() => {
    const collectionName =
      activeTab === 'profiles'
        ? 'profiles'
        : activeTab === 'scripts'
        ? 'scripts'
        : activeTab === 'compliance'
        ? 'compliance'
        : 'apps';
    const items = (allData[collectionName as keyof AllData] as ResourceItem[]) || [];
    const filtered = filterItems(items, searchTerm, platformFilter);
    const newSelected = new Set<string>();
    filtered.forEach((item) => {
      newSelected.add(`${item.type}-${item.id}`);
    });
    setSelectedItems(newSelected);
  }, [activeTab, searchTerm, platformFilter, allData]);

  const handleViewDetails = useCallback((id: string, type: string) => {
    const collectionName =
      type === 'profile' ? 'profiles' : type === 'script' ? 'scripts' : type + 's';
    const item = allData[collectionName as keyof AllData]?.find(
      (i: any) => i.id === id
    ) as ResourceItem | undefined;
    if (item) {
      setModalItem(item);
      setIsModalOpen(true);
    }
  }, [allData]);

  const handleDownloadJSON = useCallback(() => {
    const data = getSelectedData();
    downloadJSON(data as ExportData, 'intune-configuration.json');
  }, [selectedItems, allData, currentUser]);

  const handleDownloadHTML = useCallback(() => {
    const data = getSelectedData();
    const html = generateHTMLReport(data as ExportData);
    downloadHTML(html, 'intune-report.html');
  }, [selectedItems, allData, currentUser]);

  const handleDownloadZIP = useCallback(() => {
    const data = getSelectedData();
    downloadZIP(data as ExportData, data.scripts);
  }, [selectedItems, allData, currentUser]);

  // Helper Functions
  const getFilteredData = () => {
    const items = allData[activeTab === 'profiles' ? 'profiles' : activeTab === 'scripts' ? 'scripts' : activeTab === 'compliance' ? 'compliance' : 'apps'] as ResourceItem[];
    return filterItems(items || [], searchTerm, platformFilter);
  };

  const getSelectedData = (): ExportData => {
    const data: ExportData = {
      profiles: [],
      scripts: [],
      compliance: [],
      apps: [],
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser,
    };

    selectedItems.forEach((key) => {
      const [type, id] = key.split('-');
      const collectionName = type === 'profile' ? 'profiles' : type + 's';
      const item = allData[collectionName as keyof AllData]?.find(
        (i: any) => i.id === id
      );
      if (item) {
        data[collectionName as keyof ExportData].push(item as any);
      }
    });

    return data;
  };

  const isItemSelected = (id: string, type: string) => {
    return selectedItems.has(`${type}-${id}`);
  };

  const filteredData = useMemo(() => getFilteredData(), [
    activeTab,
    searchTerm,
    platformFilter,
    allData,
  ]);

  // Render
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <Header
          isAuthenticated={false}
          onLogin={handleLogin}
        />

        <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Sidebar />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Admin Warning */}
              <AdminWarning />

              {/* Automated Setup */}
              <AutomatedSetup
                onStartSetup={handleAutomateSetup}
                isLoading={showSetupProgress && setupProgress < 100}
                error={setupError}
                progress={setupProgress}
                currentStep={setupStep}
                showProgress={showSetupProgress}
              />

              {/* Success State */}
              {setupSuccess && (
                <ClientIdInput
                  value={generatedClientId}
                  onChange={() => {}}
                  generatedClientId={generatedClientId}
                  onUseGenerated={handleUseGeneratedClientId}
                  isSuccess={true}
                />
              )}

              {/* Manual Setup */}
              <div id="manual-setup">
                <ManualSetupAccordion />
              </div>

              {/* Client ID Input */}
              {!setupSuccess && (
                <ClientIdInput
                  value={clientId}
                  onChange={handleClientIdChange}
                />
              )}

              {/* Login Button */}
              {clientId && !setupSuccess && (
                <Card padding="lg" className="text-center">
                  <button
                    onClick={handleLogin}
                    className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors"
                  >
                    Continue with Client ID
                  </button>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header
        isAuthenticated={true}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>

          {/* Dashboard Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Selection Toolbar */}
            <SelectionToolbar
              selectedCount={selectedItems.size}
              onSelectAll={handleSelectAll}
              onClearSelection={() => setSelectedItems(new Set())}
              onDownloadJSON={handleDownloadJSON}
              onDownloadHTML={handleDownloadHTML}
              onDownloadZIP={handleDownloadZIP}
              isLoading={isLoadingData}
            />

            {/* Search & Filter */}
            <SearchFilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              platformFilter={platformFilter}
              onPlatformFilterChange={setPlatformFilter}
            />

            {/* Tabs */}
            <Tabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={{
                profiles: allData.profiles.length,
                scripts: allData.scripts.length,
                compliance: allData.compliance.length,
                apps: allData.apps.length,
              }}
            />

            {/* Resource List */}
            <div className="bg-white rounded-b-xl shadow-card p-6 space-y-4">
              {isLoadingData ? (
                <div className="flex justify-center items-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600">Loading data...</p>
                  </div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-gray-600 font-medium">No items found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                  </div>
                </div>
              ) : (
                filteredData.map((item) => (
                  <ResourceCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                    isSelected={isItemSelected(item.id, item.type)}
                    onCheckboxChange={handleSelectItem}
                    onViewDetails={handleViewDetails}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <DetailModal
        isOpen={isModalOpen}
        item={modalItem}
        isSelected={modalItem ? isItemSelected(modalItem.id, modalItem.type) : false}
        onClose={() => setIsModalOpen(false)}
        onToggleSelection={() => {
          if (modalItem) {
            const key = `${modalItem.type}-${modalItem.id}`;
            const newSelected = new Set(selectedItems);
            if (newSelected.has(key)) {
              newSelected.delete(key);
            } else {
              newSelected.add(key);
            }
            setSelectedItems(newSelected);
          }
        }}
        onDownload={() => {
          if (modalItem) {
            downloadJSON(modalItem, `${modalItem.displayName}.json`);
          }
        }}
      />
    </div>
  );
}

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import WelcomeBanner from '@/components/setup/WelcomeBanner';
import Tabs from '@/components/dashboard/Tabs';
import SearchFilterBar from '@/components/dashboard/SearchFilterBar';
import SelectionToolbar from '@/components/dashboard/SelectionToolbar';
import ResourceCard from '@/components/dashboard/ResourceCard';
import DetailModal from '@/components/modals/DetailModal';
import Card from '@/components/ui/Card';
import {
  initializeMSAL,
  loginWithPopup,
  logoutUser,
} from '@/lib/auth/msal';
import { loadAllData } from '@/lib/api/graph';
import { downloadJSON, downloadHTML, downloadZIP, generateHTMLReport } from '@/lib/utils/exports';
import { filterItems } from '@/lib/utils/filters';
import type { AllData, ResourceItem, ExportData } from '@/lib/types';

export default function Page() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);


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

  // Initialize MSAL on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const clientIdToUse = process.env.NEXT_PUBLIC_CLIENT_ID;
        if (clientIdToUse) {
          await initializeMSAL(clientIdToUse);
          setIsInitialized(true);
        } else {
          setAuthError('No Client ID configured. Please set NEXT_PUBLIC_CLIENT_ID environment variable.');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize authentication';
        setAuthError(errorMessage);
        console.error('Auth initialization error:', errorMessage);
      }
    };

    initAuth();
  }, []);

  const handleLogin = useCallback(async () => {
    try {
      setAuthError('');
      setIsLoadingData(true);

      // Perform login
      const account = await loginWithPopup();

      if (account) {
        setCurrentUser(account.name || account.username || 'Azure AD User');
        setIsAuthenticated(true);

        // Load data after successful authentication
        try {
          const data = await loadAllData();
          console.log('[DATA] Loaded data from Graph API:', {
            profiles: data.profiles.length,
            scripts: data.scripts.length,
            compliance: data.compliance.length,
            apps: data.apps.length,
          });
          console.log('[DATA] Sample profile:', data.profiles[0]);
          console.log('[DATA] Sample script:', data.scripts[0]);
          console.log('[DATA] Sample compliance:', data.compliance[0]);
          console.log('[DATA] Sample app:', data.apps[0]);
          setAllData(data);
          console.log('Data loaded successfully');
        } catch (dataError) {
          const errorMessage = dataError instanceof Error ? dataError.message : 'Failed to load data';
          setAuthError(`Logged in but failed to load data: ${errorMessage}`);
          console.error('Data loading error:', errorMessage);
          // Keep user authenticated even if data loading fails
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthError(errorMessage);
      console.error('Login error:', errorMessage);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      setAuthError('');
      await logoutUser();
      setIsAuthenticated(false);
      setCurrentUser('');
      setAllData({ profiles: [], scripts: [], compliance: [], apps: [] });
      setSelectedItems(new Set());
      console.log('User logged out successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setAuthError(errorMessage);
      console.error('Logout error:', errorMessage);
      // Clear local state even if logout fails
      setIsAuthenticated(false);
      setCurrentUser('');
      setAllData({ profiles: [], scripts: [], compliance: [], apps: [] });
      setSelectedItems(new Set());
    }
  }, []);

  // Refresh data from Graph API
  const handleRefreshData = useCallback(async () => {
    try {
      setAuthError('');
      setIsLoadingData(true);
      console.log('[DATA] Refreshing Intune data from Microsoft Graph...');

      const data = await loadAllData();
      console.log('[DATA] Refreshed data from Graph API:', {
        profiles: data.profiles.length,
        scripts: data.scripts.length,
        compliance: data.compliance.length,
        apps: data.apps.length,
      });
      setAllData(data);

      // Log individual endpoint status
      console.log('[DATA] Data refresh complete:', {
        profiles: data.profiles.length,
        scripts: data.scripts.length,
        compliance: data.compliance.length,
        apps: data.apps.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data';
      setAuthError(`Data refresh failed: ${errorMessage}`);
      console.error('[DATA] Data refresh error:', errorMessage);
    } finally {
      setIsLoadingData(false);
    }
  }, []);


  // TODO: Wire up real Graph API data loading
  // const loadDemoData = async () => {
  //   console.log('Demo mode disabled - waiting for authentication implementation');
  // };

  const handleSelectItem = useCallback(
    (id: string, type: string, checked: boolean) => {
      const key = `${type}-${id}`;
      const newSelected = new Set(selectedItems);
      if (checked) {
        newSelected.add(key);
        console.log(`[SELECT] Added ${type} item ${id}, total selected: ${newSelected.size}`);
      } else {
        newSelected.delete(key);
        console.log(`[SELECT] Removed ${type} item ${id}, total selected: ${newSelected.size}`);
      }
      console.log('[SELECT] Current selectedItems:', Array.from(newSelected));
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
    // Map type to collection name: profile→profiles, script→scripts, compliance→compliance, app→apps
    let collectionName: keyof AllData;
    if (type === 'profile') {
      collectionName = 'profiles';
    } else if (type === 'script') {
      collectionName = 'scripts';
    } else if (type === 'compliance') {
      collectionName = 'compliance';
    } else if (type === 'app') {
      collectionName = 'apps';
    } else {
      console.warn(`[VIEW_DETAILS] Unknown type: ${type}`);
      return;
    }

    const item = allData[collectionName]?.find(
      (i: any) => i.id === id
    ) as ResourceItem | undefined;
    if (item) {
      setModalItem(item);
      setIsModalOpen(true);
    }
  }, [allData]);

  // Helper Functions
  const getFilteredData = () => {
    const items = allData[activeTab === 'profiles' ? 'profiles' : activeTab === 'scripts' ? 'scripts' : activeTab === 'compliance' ? 'compliance' : 'apps'] as ResourceItem[];
    return filterItems(items || [], searchTerm, platformFilter);
  };

  const getSelectedData = useCallback((): ExportData => {
    const data: ExportData = {
      profiles: [],
      scripts: [],
      compliance: [],
      apps: [],
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser,
    };

    console.log('[EXPORT] Starting export with selectedItems:', selectedItems.size);
    console.log('[EXPORT] Current allData state:', {
      profilesCount: allData.profiles.length,
      scriptsCount: allData.scripts.length,
      complianceCount: allData.compliance.length,
      appsCount: allData.apps.length,
    });

    selectedItems.forEach((key) => {
      // Split only on the first dash since IDs contain dashes (GUIDs)
      const dashIndex = key.indexOf('-');
      const type = key.substring(0, dashIndex);
      const id = key.substring(dashIndex + 1);
      console.log(`[EXPORT] Processing selection: type=${type}, id=${id}`);

      // Map type to collection name: profile→profiles, script→scripts, compliance→compliance, app→apps
      let collectionName: keyof AllData;
      if (type === 'profile') {
        collectionName = 'profiles';
      } else if (type === 'script') {
        collectionName = 'scripts';
      } else if (type === 'compliance') {
        collectionName = 'compliance';
      } else if (type === 'app') {
        collectionName = 'apps';
      } else {
        console.warn(`[EXPORT] Unknown type: ${type}`);
        return;
      }

      const item = allData[collectionName]?.find((i: any) => i.id === id);

      if (item) {
        const dataKey = collectionName as keyof ExportData;
        (data[dataKey] as any[]).push(item as any);
        console.log(`[EXPORT] Added ${type} to export:`, (item as any).displayName || (item as any).id);
      } else {
        console.warn(`[EXPORT] Item not found - type: ${type}, id: ${id}, collectionName: ${collectionName}`);
      }
    });

    console.log('[EXPORT] Final export data summary:', {
      profiles: data.profiles.length,
      scripts: data.scripts.length,
      compliance: data.compliance.length,
      apps: data.apps.length,
      totalSelected: selectedItems.size,
    });

    return data;
  }, [selectedItems, allData, currentUser]);

  const handleDownloadJSON = useCallback(() => {
    try {
      console.log('[DOWNLOAD_JSON] Starting JSON download...');
      const data = getSelectedData();
      console.log('[DOWNLOAD_JSON] Export data:', {
        profiles: data.profiles.length,
        scripts: data.scripts.length,
        compliance: data.compliance.length,
        apps: data.apps.length,
      });
      downloadJSON(data as ExportData, 'intune-configuration.json');
      console.log('[DOWNLOAD_JSON] JSON download complete');
    } catch (error) {
      console.error('[DOWNLOAD_JSON] Error:', error);
      alert('Failed to download JSON: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, [getSelectedData]);

  const handleDownloadHTML = useCallback(() => {
    try {
      console.log('[DOWNLOAD_HTML] Starting HTML download...');
      console.log('[DOWNLOAD_HTML] Current state at click time:', {
        selectedItemsSize: selectedItems.size,
        selectedItemsArray: Array.from(selectedItems),
        allDataCount: {
          profiles: allData.profiles.length,
          scripts: allData.scripts.length,
          compliance: allData.compliance.length,
          apps: allData.apps.length,
        },
      });
      const data = getSelectedData();
      console.log('[DOWNLOAD_HTML] Export data received:', {
        profiles: data.profiles.length,
        scripts: data.scripts.length,
        compliance: data.compliance.length,
        apps: data.apps.length,
      });
      const html = generateHTMLReport(data as ExportData);
      console.log('[DOWNLOAD_HTML] HTML report generated, length:', html.length);
      downloadHTML(html, 'intune-report.html');
      console.log('[DOWNLOAD_HTML] HTML download complete');
    } catch (error) {
      console.error('[DOWNLOAD_HTML] Error:', error);
      alert('Failed to download HTML report: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, [getSelectedData, selectedItems, allData]);

  const handleDownloadZIP = useCallback(async () => {
    try {
      console.log('[DOWNLOAD_ZIP] Starting ZIP download...');
      const data = getSelectedData();
      console.log('[DOWNLOAD_ZIP] Export data:', {
        profiles: data.profiles.length,
        scripts: data.scripts.length,
        compliance: data.compliance.length,
        apps: data.apps.length,
      });
      await downloadZIP(data as ExportData, data.scripts);
      console.log('[DOWNLOAD_ZIP] ZIP download complete');
    } catch (error) {
      console.error('[DOWNLOAD_ZIP] Error:', error);
      alert('Failed to download ZIP: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, [getSelectedData]);

  const isItemSelected = (id: string, type: string) => {
    return selectedItems.has(`${type}-${id}`);
  };

  // Expose state to window for debugging
  useEffect(() => {
    (window as any).debugState = {
      isAuthenticated,
      selectedItemsSize: selectedItems.size,
      selectedItemsArray: Array.from(selectedItems),
      allDataCount: {
        profiles: allData.profiles.length,
        scripts: allData.scripts.length,
        compliance: allData.compliance.length,
        apps: allData.apps.length,
      },
      currentUser,
    };
  }, [selectedItems, allData, isAuthenticated, currentUser]);

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
              {/* Auth Error Display */}
              {authError && (
                <Card padding="lg" className="border-l-4 border-red-500 bg-red-50">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-red-800 font-semibold">Authentication Error</p>
                      <p className="text-red-700 text-sm mt-1">{authError}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Loading Indicator */}
              {isLoadingData && (
                <Card padding="lg" className="bg-blue-50 border-l-4 border-blue-500">
                  <div className="flex gap-3">
                    <div className="animate-spin">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-blue-800 font-semibold">Loading Data</p>
                      <p className="text-blue-700 text-sm">Fetching your Intune configuration from Microsoft Graph...</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Welcome Banner */}
              <WelcomeBanner />

              {/* Login Button */}
              <Card padding="lg" className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <button
                  onClick={handleLogin}
                  className="px-8 py-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors text-lg"
                >
                  Sign In with Microsoft 365
                </button>
                <p className="text-gray-600 text-sm mt-4">You will be asked to grant permissions to access your Intune configuration</p>
              </Card>
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
              onRefresh={handleRefreshData}
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

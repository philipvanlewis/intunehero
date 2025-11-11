'use client';

import React from 'react';
import Card from '../ui/Card';

export const SetupGuide: React.FC = () => {
  return (
    <Card padding="lg" variant="default" className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Quick Setup</h3>
            <p className="text-gray-600 text-sm mt-1">Get started in 2 simple steps</p>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Create Azure AD App Registration</h4>
              <p className="text-gray-700 text-sm mt-1">
                Go to{' '}
                <a
                  href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Azure Portal → App registrations
                </a>
                {' '}and click <span className="font-mono bg-gray-200 px-2 py-1 rounded text-sm">New registration</span>
              </p>
              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p><strong>Name:</strong> IntuneHero</p>
                <p><strong>Supported account types:</strong> Accounts in any organizational directory (Multitenant)</p>
                <p><strong>Redirect URI:</strong> Single-page application (SPA) → <span className="font-mono bg-gray-100 px-2 py-0.5">https://intunehero.pages.dev</span></p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">Add Permissions & Copy Client ID</h4>
              <p className="text-gray-700 text-sm mt-1">
                In your app registration:
              </p>
              <div className="mt-2 space-y-2 text-sm text-gray-700">
                <p>
                  • Copy the <span className="font-mono bg-gray-100 px-2 py-0.5">Application (client) ID</span> and paste it below
                </p>
                <p>
                  • Go to <span className="font-mono bg-gray-100 px-2 py-0.5">API permissions</span> → <span className="font-mono bg-gray-100 px-2 py-0.5">Add a permission</span>
                </p>
                <p>
                  • Select <span className="font-mono bg-gray-100 px-2 py-0.5">Microsoft Graph</span> → <span className="font-mono bg-gray-100 px-2 py-0.5">Delegated permissions</span>
                </p>
                <p className="font-semibold">Add these permissions:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>DeviceManagementConfiguration.Read.All</li>
                  <li>DeviceManagementApps.Read.All</li>
                  <li>DeviceManagementManagedDevices.Read.All</li>
                  <li>DeviceManagementServiceConfig.Read.All</li>
                </ul>
                <p>
                  • Click <span className="font-mono bg-gray-100 px-2 py-0.5">Grant admin consent for [Your Organization]</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-100">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Next:</span> Paste your Client ID in the field below and click <span className="font-mono bg-gray-100 px-2 py-0.5">Sign In</span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SetupGuide;

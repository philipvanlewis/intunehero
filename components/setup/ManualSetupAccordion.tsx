'use client';

import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export const ManualSetupAccordion: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      number: 1,
      title: 'Create App Registration',
      description: 'Go to Azure Portal > Azure AD > App registrations > New registration',
    },
    {
      number: 2,
      title: 'Configure Application',
      description: 'Name: "Intune Reporter Tool" | Single tenant | Redirect URI: http://localhost',
    },
    {
      number: 3,
      title: 'Copy Client ID',
      description:
        'From the Overview page, copy the Application (client) ID and use it above',
    },
    {
      number: 4,
      title: 'Add API Permissions',
      description:
        'Go to API permissions > Add a permission > Microsoft Graph (Delegated) > Add: DeviceManagementConfiguration.Read.All, DeviceManagementApps.Read.All, DeviceManagementServiceConfig.Read.All, DeviceManagementManagedDevices.Read.All',
    },
    {
      number: 5,
      title: 'Grant Admin Consent',
      description: 'Click "Grant admin consent for [organization]" under API permissions',
    },
  ];

  return (
    <Card padding="lg" variant="default">
      <div className="space-y-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between hover:text-brand-primary transition-colors"
        >
          <h4 className="font-semibold text-gray-900">Manual Setup Instructions</h4>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="space-y-4 pt-4 border-t border-gray-200 animate-slideDown">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary text-white font-semibold text-sm">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-1">{step.title}</h5>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900 mb-3">
                <strong>Need help?</strong> Visit these resources:
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      'https://portal.azure.com',
                      '_blank',
                    )
                  }
                >
                  Azure Portal
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      'https://docs.microsoft.com/graph',
                      '_blank',
                    )
                  }
                >
                  Graph API Docs
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ManualSetupAccordion;

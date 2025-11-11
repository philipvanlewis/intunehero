'use client';

import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressTracker from './ProgressTracker';

interface AutomatedSetupProps {
  onStartSetup: () => void;
  isLoading?: boolean;
  error?: string;
  progress?: number;
  currentStep?: number;
  showProgress?: boolean;
}

const setupSteps = [
  'Authenticate',
  'Create App',
  'Add Permissions',
  'Grant Consent',
];

export const AutomatedSetup: React.FC<AutomatedSetupProps> = ({
  onStartSetup,
  isLoading = false,
  error,
  progress = 0,
  currentStep = 0,
  showProgress = false,
}) => {
  return (
    <Card variant="default" padding="lg" className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-brand-primary">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-brand-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <h3 className="font-semibold text-lg text-gray-900">One-Click Automated Setup</h3>
          </div>
          <p className="text-sm text-gray-700">
            This will automatically create the Azure AD app, configure permissions, and grant admin
            consent — all in your browser.
          </p>
        </div>

        {/* Progress Tracker */}
        <ProgressTracker
          currentStep={currentStep}
          totalSteps={setupSteps.length}
          progress={progress}
          steps={setupSteps}
          isVisible={showProgress}
        />

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button
            size="md"
            variant="primary"
            onClick={onStartSetup}
            isLoading={isLoading}
            disabled={isLoading}
            className="flex-1 min-w-[200px]"
          >
            {isLoading ? 'Setting up...' : 'Automate Setup Now'}
          </Button>
          <Button
            size="md"
            variant="secondary"
            className="flex-1 min-w-[180px]"
            onClick={() => {
              // Scroll to manual setup section
              const manualSetupElement = document.getElementById('manual-setup');
              manualSetupElement?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Manual Setup Guide
          </Button>
        </div>

        <p className="text-xs text-gray-600 border-t border-gray-200 pt-4">
          Your credentials are never stored. Authentication happens securely through Microsoft's
          login system.
        </p>
      </div>
    </Card>
  );
};

export default AutomatedSetup;

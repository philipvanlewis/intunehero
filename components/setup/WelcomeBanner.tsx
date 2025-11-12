'use client';

import React from 'react';
import Card from '../ui/Card';

interface WelcomeBannerProps {
  clientId?: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ clientId }) => {
  return (
    <div className="space-y-6">
      {/* Main Welcome Card */}
      <Card padding="lg" variant="default" className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Intune Configuration Reporter</h1>
              <p className="text-gray-600 mt-1">Your all-in-one tool for exporting and analyzing Intune device management configurations</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding="md" variant="default" className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900">Device Configurations</h3>
              <p className="text-sm text-green-700 mt-0.5">View all traditional and modern Settings Catalog profiles</p>
            </div>
          </div>
        </Card>

        <Card padding="md" variant="default" className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4m-4-4l-4 4" />
            </svg>
            <div>
              <h3 className="font-semibold text-purple-900">PowerShell Scripts</h3>
              <p className="text-sm text-purple-700 mt-0.5">Access platform scripts and proactive remediations</p>
            </div>
          </div>
        </Card>

        <Card padding="md" variant="default" className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
            </svg>
            <div>
              <h3 className="font-semibold text-orange-900">Compliance Policies</h3>
              <p className="text-sm text-orange-700 mt-0.5">Review device compliance requirements and rules</p>
            </div>
          </div>
        </Card>

        <Card padding="md" variant="default" className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900">Mobile Applications</h3>
              <p className="text-sm text-blue-700 mt-0.5">Manage iOS, Android, and Windows app deployments</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Export Options */}
      <Card padding="lg" variant="default" className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200">
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Your Configurations
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
              Download as JSON for automation and backup
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
              Generate HTML reports for documentation
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
              Export as ZIP for portable archival
            </li>
          </ul>
        </div>
      </Card>

      {/* Login Instructions */}
      {!clientId && (
        <Card padding="lg" variant="default" className="bg-amber-50 border-l-4 border-amber-400">
          <div className="space-y-3">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Getting Started
            </h3>
            <ol className="space-y-2 text-sm text-amber-900 list-decimal list-inside">
              <li>Enter your Azure AD Application (Client) ID below</li>
              <li>Sign in with your organizational account</li>
              <li>Grant consent to access your Intune data</li>
              <li>Review and export your configurations</li>
            </ol>
          </div>
        </Card>
      )}
    </div>
  );
};

export default WelcomeBanner;

'use client';

import React from 'react';
import Card from '../ui/Card';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  return (
    <aside className={`space-y-6 ${className}`}>
      {/* App Info Card */}
      <Card padding="lg" variant="default">
        <div className="space-y-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-brand-primary text-white mx-auto">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="text-center font-semibold text-gray-900">Intune Reporter</h3>
          <p className="text-center text-sm text-gray-600">
            Streamline your device management configuration exports
          </p>
        </div>
      </Card>

      {/* Quick Links */}
      <Card padding="lg" variant="default">
        <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
        <nav className="space-y-2">
          <a
            href="https://portal.azure.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-brand-primary hover:text-brand-dark font-medium transition"
          >
            → Azure Portal
          </a>
          <a
            href="https://intune.microsoft.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-brand-primary hover:text-brand-dark font-medium transition"
          >
            → Intune Dashboard
          </a>
          <a
            href="https://docs.microsoft.com/graph"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-brand-primary hover:text-brand-dark font-medium transition"
          >
            → Graph API Docs
          </a>
        </nav>
      </Card>

      {/* Status Info */}
      <Card padding="lg" variant="default">
        <h4 className="font-semibold text-gray-900 mb-4">Status</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">API Connection</span>
            <span className="text-status-warning font-medium">Pending Auth</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Data Loaded</span>
            <span className="text-gray-500 font-medium">–</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Sync</span>
            <span className="text-gray-500 font-medium">–</span>
          </div>
        </div>
      </Card>
    </aside>
  );
};

export default Sidebar;

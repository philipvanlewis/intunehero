'use client';

import React from 'react';

interface TabsProps {
  activeTab: 'profiles' | 'scripts' | 'compliance' | 'apps';
  onTabChange: (tab: 'profiles' | 'scripts' | 'compliance' | 'apps') => void;
  counts?: {
    profiles?: number;
    scripts?: number;
    compliance?: number;
    apps?: number;
  };
}

const tabConfig = [
  { id: 'profiles' as const, label: 'Configuration Profiles', icon: '⚙️' },
  { id: 'scripts' as const, label: 'PowerShell Scripts', icon: '< >' },
  { id: 'compliance' as const, label: 'Compliance Policies', icon: '✓' },
  { id: 'apps' as const, label: 'Applications', icon: '📱' },
];

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, counts = {} }) => {
  return (
    <div className="bg-white rounded-t-xl border border-b-0 border-gray-200 shadow-card">
      <nav className="flex border-b border-gray-200 overflow-x-auto">
        {tabConfig.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-3 font-semibold transition-all duration-200
                whitespace-nowrap flex items-center gap-2
                border-b-2
                ${
                  isActive
                    ? 'text-brand-primary border-brand-primary'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={`
                  text-xs font-bold px-2 py-1 rounded-full
                  ${isActive ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-700'}
                `}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;

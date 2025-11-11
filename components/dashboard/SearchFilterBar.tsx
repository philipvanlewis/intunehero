'use client';

import React from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  platformFilter: string;
  onPlatformFilterChange: (filter: string) => void;
}

const platformOptions = [
  { value: '', label: 'All Platforms' },
  { value: 'android', label: 'Android' },
  { value: 'iOS', label: 'iOS/iPadOS' },
  { value: 'windows10', label: 'Windows' },
  { value: 'macOS', label: 'macOS' },
];

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  platformFilter,
  onPlatformFilterChange,
}) => {
  return (
    <Card padding="lg" variant="default" className="mb-6">
      <div className="flex flex-col gap-4 md:flex-row md:gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search configurations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            variant="compact"
          />
        </div>
        <select
          value={platformFilter}
          onChange={(e) => onPlatformFilterChange(e.target.value)}
          className={`
            px-4 py-2 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
            focus:bg-white transition-colors
            bg-gray-50 text-gray-900 text-sm
            font-medium cursor-pointer
            min-w-[180px]
          `}
        >
          {platformOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
};

export default SearchFilterBar;

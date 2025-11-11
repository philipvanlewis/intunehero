'use client';

import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface SelectionToolbarProps {
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDownloadJSON: () => void;
  onDownloadHTML: () => void;
  onDownloadZIP: () => void;
  isLoading?: boolean;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedCount,
  onSelectAll,
  onClearSelection,
  onDownloadJSON,
  onDownloadHTML,
  onDownloadZIP,
  isLoading = false,
}) => {
  const hasSelection = selectedCount > 0;

  return (
    <Card padding="lg" variant="default" className="mb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left side: Selection info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-brand-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
            </svg>
            <span className="font-semibold text-gray-900">
              Selected: <span className="text-brand-primary">{selectedCount}</span>
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onSelectAll}
              className="text-xs"
            >
              Select All
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={onClearSelection}
              className="text-xs"
              disabled={!hasSelection}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Right side: Download buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="md"
            variant="primary"
            onClick={onDownloadJSON}
            disabled={!hasSelection || isLoading}
            isLoading={isLoading}
          >
            Download JSON
          </Button>
          <Button
            size="md"
            variant={hasSelection ? 'primary' : 'secondary'}
            onClick={onDownloadHTML}
            disabled={!hasSelection || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            HTML Report
          </Button>
          <Button
            size="md"
            variant={hasSelection ? 'primary' : 'secondary'}
            onClick={onDownloadZIP}
            disabled={!hasSelection || isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Download ZIP
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SelectionToolbar;

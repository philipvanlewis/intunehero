'use client';

import React from 'react';
import Card from '../ui/Card';

export const AdminWarning: React.FC = () => {
  return (
    <Card variant="outlined" padding="lg" className="border-2 border-status-warning bg-amber-50">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-status-warning"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4v2m0 4v2M7.08 6.06A9 9 0 1020.94 17.94M7.08 6.06l5.87 5.87m0 0l5.87 5.87"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900 mb-1">
            Admin Permission Required
          </h3>
          <p className="text-sm text-amber-800">
            You must have <strong>Application Administrator</strong> or{' '}
            <strong>Global Administrator</strong> role to automate setup.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default AdminWarning;

'use client';

import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate, getPlatformFromOdataType } from '@/lib/utils/filters';
import type { ResourceItem } from '@/lib/types';

interface ResourceCardProps {
  item: ResourceItem;
  isSelected: boolean;
  onCheckboxChange: (id: string, type: string, checked: boolean) => void;
  onViewDetails: (id: string, type: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  item,
  isSelected,
  onCheckboxChange,
  onViewDetails,
}) => {
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'profile':
        return 'info' as const;
      case 'script':
        return 'success' as const;
      case 'compliance':
        return 'warning' as const;
      case 'app':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  const getTypeLabel = (item: ResourceItem): string => {
    switch (item.type) {
      case 'profile':
        return 'Configuration Profile';
      case 'script':
        return 'PowerShell Script';
      case 'compliance':
        return 'Compliance Policy';
      case 'app':
        return 'Application';
      default:
        return 'Unknown';
    }
  };

  const getMetadata = (item: ResourceItem) => {
    const items: Array<{ label: string; value: string }> = [];

    if (item.type === 'profile' && 'platforms' in item) {
      items.push({ label: 'Platform', value: item.platforms });
    }

    if ('lastModifiedDateTime' in item && item.lastModifiedDateTime) {
      items.push({ label: 'Modified', value: formatDate(item.lastModifiedDateTime) });
    } else if ('createdDateTime' in item && item.createdDateTime) {
      items.push({ label: 'Created', value: formatDate(item.createdDateTime) });
    }

    if (item.type === 'app' && 'publisher' in item) {
      items.push({ label: 'Publisher', value: item.publisher || 'Unknown' });
    }

    if (item.type === 'profile' && 'settings' in item) {
      items.push({ label: 'Settings', value: `${(item as any).settings?.length || 0}` });
    }

    return items;
  };

  return (
    <Card padding="lg" className="hover:shadow-card-hover transition-shadow duration-200 animate-fadeIn">
      <div className="flex gap-4">
        {/* Checkbox */}
        <div className="flex items-start pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) =>
              onCheckboxChange(item.id, item.type, e.target.checked)
            }
            className="w-4 h-4 rounded border border-gray-300 text-brand-primary focus:ring-2 focus:ring-brand-primary cursor-pointer"
            aria-label={`Select ${item.displayName}`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">
                {item.displayName || 'Unnamed'}
              </h3>
              <Badge variant={getBadgeVariant(item.type)} size="sm">
                {getTypeLabel(item)}
              </Badge>
            </div>
          </div>

          {item.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            {getMetadata(item).map((meta, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {meta.label}: {meta.value}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0 flex items-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(item.id, item.type)}
            className="text-xs"
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ResourceCard;

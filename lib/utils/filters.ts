// Filter and Search Utilities

import type { ResourceItem } from '../types';

export function filterItems(
  items: ResourceItem[],
  searchTerm: string,
  platformFilter: string,
): ResourceItem[] {
  return items.filter((item) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      item.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Platform filter
    const matchesPlatform =
      !platformFilter ||
      ('platforms' in item && item.platforms?.toLowerCase().includes(platformFilter.toLowerCase())) ||
      ('@odata.type' in item &&
        item['@odata.type']?.toLowerCase().includes(platformFilter.toLowerCase()));

    return matchesSearch && matchesPlatform;
  });
}

export function getPlatformFromOdataType(odataType: string): string {
  const parts = odataType.split('.');
  return parts[parts.length - 1];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

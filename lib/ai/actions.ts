// AI Actions for IntuneHero
// These functions define what the AI assistant can do

import type { ResourceItem, AllData } from '../types';
import type {
  SearchConfigurationsParams,
  ExplainConfigurationParams,
  RecommendSettingsParams,
  CompareConfigurationsParams,
  ExportAssistantParams,
  AIActionResult,
  SearchResult,
  ConfigurationExplanation,
  ConfigurationComparison,
  BestPracticeAnalysis,
} from './types';
import { filterItems } from '../utils/filters';

/**
 * Search configurations action
 * Finds configurations based on natural language query
 */
export async function searchConfigurationsAction(
  params: SearchConfigurationsParams,
  allData: AllData
): Promise<AIActionResult<SearchResult[]>> {
  try {
    const { query, type = 'all', platform, limit = 10 } = params;

    // Determine which data to search
    let itemsToSearch: ResourceItem[] = [];

    if (type === 'all') {
      itemsToSearch = [
        ...allData.profiles,
        ...allData.scripts,
        ...allData.compliance,
        ...allData.apps,
      ];
    } else {
      const typeMap = {
        profiles: allData.profiles,
        scripts: allData.scripts,
        compliance: allData.compliance,
        apps: allData.apps,
      };
      itemsToSearch = typeMap[type] || [];
    }

    // Apply platform filter if specified
    if (platform) {
      itemsToSearch = itemsToSearch.filter(item => {
        if (item.type === 'profile') {
          return item.platforms.toLowerCase().includes(platform.toLowerCase());
        }
        return true;
      });
    }

    // Search using existing filter function
    const filtered = filterItems(itemsToSearch, query, platform || '');

    // Calculate relevance scores and create search results
    const results: SearchResult[] = filtered.slice(0, limit).map(item => {
      const relevanceScore = calculateRelevanceScore(item, query);
      const matchedFields = getMatchedFields(item, query);

      return {
        item,
        relevanceScore,
        matchedFields,
      };
    });

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      success: true,
      data: results,
      message: `Found ${results.length} matching configuration${results.length === 1 ? '' : 's'}.`,
      suggestions: generateSearchSuggestions(query, results),
    };
  } catch (error) {
    console.error('[AI] Search configurations error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search configurations',
    };
  }
}

/**
 * Explain configuration action
 * Provides detailed explanation of a configuration
 */
export async function explainConfigurationAction(
  params: ExplainConfigurationParams,
  allData: AllData
): Promise<AIActionResult<ConfigurationExplanation>> {
  try {
    const { id, type } = params;

    // Find the item
    const item = findItemById(id, type, allData);

    if (!item) {
      return {
        success: false,
        error: `Configuration with ID ${id} not found.`,
      };
    }

    // Generate explanation (in a real implementation, this would use AI)
    const explanation = generateExplanation(item);

    return {
      success: true,
      data: explanation,
      message: `Explanation for ${item.displayName}`,
    };
  } catch (error) {
    console.error('[AI] Explain configuration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to explain configuration',
    };
  }
}

/**
 * Recommend settings action
 * Provides best practice recommendations
 */
export async function recommendSettingsAction(
  params: RecommendSettingsParams
): Promise<AIActionResult<BestPracticeAnalysis>> {
  try {
    const { scenario, platform, securityLevel = 'enhanced' } = params;

    // Generate recommendations (in a real implementation, this would use AI)
    const analysis = generateRecommendations(scenario, platform, securityLevel);

    return {
      success: true,
      data: analysis,
      message: `Generated recommendations for ${scenario} on ${platform || 'all platforms'}`,
    };
  } catch (error) {
    console.error('[AI] Recommend settings error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate recommendations',
    };
  }
}

/**
 * Compare configurations action
 * Compares multiple configurations
 */
export async function compareConfigurationsAction(
  params: CompareConfigurationsParams,
  allData: AllData
): Promise<AIActionResult<ConfigurationComparison>> {
  try {
    const { ids } = params;

    if (ids.length < 2) {
      return {
        success: false,
        error: 'Please provide at least 2 configurations to compare.',
      };
    }

    // Find all items
    const items = ids.map(id => findItemByIdAny(id, allData)).filter(Boolean) as ResourceItem[];

    if (items.length < 2) {
      return {
        success: false,
        error: 'Could not find all configurations. Please check the IDs.',
      };
    }

    // Generate comparison
    const comparison = generateComparison(items);

    return {
      success: true,
      data: comparison,
      message: `Compared ${items.length} configurations`,
    };
  } catch (error) {
    console.error('[AI] Compare configurations error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to compare configurations',
    };
  }
}

/**
 * Export assistant action
 * Helps users export configurations
 */
export async function exportAssistantAction(
  params: ExportAssistantParams,
  allData: AllData
): Promise<AIActionResult<{ exportInfo: string; recommendations: string[] }>> {
  try {
    const { ids, format, includeScripts = true } = params;

    // Find items to export
    const items = ids.map(id => findItemByIdAny(id, allData)).filter(Boolean) as ResourceItem[];

    if (items.length === 0) {
      return {
        success: false,
        error: 'No valid items selected for export.',
      };
    }

    // Generate export guidance
    const exportInfo = generateExportGuidance(items, format, includeScripts);
    const recommendations = generateExportRecommendations(items, format);

    return {
      success: true,
      data: { exportInfo, recommendations },
      message: `Ready to export ${items.length} configuration${items.length === 1 ? '' : 's'} as ${format.toUpperCase()}`,
    };
  } catch (error) {
    console.error('[AI] Export assistant error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assist with export',
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate relevance score for search results
 */
function calculateRelevanceScore(item: ResourceItem, query: string): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  // Name match (highest weight)
  if (item.displayName.toLowerCase().includes(queryLower)) {
    score += 100;
    // Exact match bonus
    if (item.displayName.toLowerCase() === queryLower) {
      score += 50;
    }
  }

  // Description match
  if (item.description?.toLowerCase().includes(queryLower)) {
    score += 50;
  }

  // Platform match (for profiles)
  if (item.type === 'profile' && item.platforms.toLowerCase().includes(queryLower)) {
    score += 30;
  }

  // Recency bonus (newer items get slight boost)
  const modifiedDate = 'lastModifiedDateTime' in item ? item.lastModifiedDateTime : item.createdDateTime;
  const daysSinceModified = Math.floor(
    (Date.now() - new Date(modifiedDate).getTime()) /
    (1000 * 60 * 60 * 24)
  );
  score += Math.max(0, 20 - daysSinceModified);

  return score;
}

/**
 * Get fields that matched the query
 */
function getMatchedFields(item: ResourceItem, query: string): string[] {
  const queryLower = query.toLowerCase();
  const matched: string[] = [];

  if (item.displayName.toLowerCase().includes(queryLower)) {
    matched.push('name');
  }
  if (item.description?.toLowerCase().includes(queryLower)) {
    matched.push('description');
  }
  if (item.type === 'profile' && item.platforms.toLowerCase().includes(queryLower)) {
    matched.push('platform');
  }

  return matched;
}

/**
 * Generate search suggestions based on results
 */
function generateSearchSuggestions(query: string, results: SearchResult[]): string[] {
  const suggestions: string[] = [];

  // If no results, suggest broadening search
  if (results.length === 0) {
    suggestions.push('Try using different keywords');
    suggestions.push('Remove platform filters');
    suggestions.push('Search across all types');
  }

  // If many results, suggest filtering
  if (results.length > 20) {
    suggestions.push('Add a platform filter to narrow results');
    suggestions.push('Search within a specific type (profiles, scripts, etc.)');
  }

  // Suggest related searches based on common patterns
  const hasWindows = results.some(r =>
    r.item.type === 'profile' && r.item.platforms.toLowerCase().includes('windows')
  );
  if (hasWindows) {
    suggestions.push('View only Windows configurations');
  }

  return suggestions.slice(0, 3);
}

/**
 * Find item by ID and type
 */
function findItemById(
  id: string,
  type: 'profile' | 'script' | 'compliance' | 'app',
  allData: AllData
): ResourceItem | undefined {
  const typeMap = {
    profile: allData.profiles,
    script: allData.scripts,
    compliance: allData.compliance,
    app: allData.apps,
  };

  return typeMap[type].find(item => item.id === id);
}

/**
 * Find item by ID (search all types)
 */
function findItemByIdAny(id: string, allData: AllData): ResourceItem | undefined {
  const allItems = [
    ...allData.profiles,
    ...allData.scripts,
    ...allData.compliance,
    ...allData.apps,
  ];

  return allItems.find(item => item.id === id);
}

/**
 * Generate explanation for a configuration
 * (Simplified version - in production, this would call the AI)
 */
function generateExplanation(item: ResourceItem): ConfigurationExplanation {
  if (item.type === 'profile') {
    return {
      summary: `This is a ${item.platforms} configuration profile that manages device settings.`,
      purpose: 'Configuration profiles are used to standardize device settings across your organization.',
      impact: `When applied, this profile will configure ${item.platforms} devices according to the specified settings.`,
      affectedDevices: `${item.platforms} devices in the assigned groups`,
      relatedPolicies: [],
      technicalDetails: {
        profileType: item.profileType,
        settingsCount: item.settings?.length || 0,
      },
    };
  }

  if (item.type === 'script') {
    return {
      summary: `This PowerShell script automates device configuration tasks.`,
      purpose: 'PowerShell scripts enable advanced automation and custom configurations.',
      impact: `The script will run on assigned devices with ${item.executionContext || 'default'} permissions.`,
      affectedDevices: 'Windows devices in the assigned groups',
      relatedPolicies: [],
      technicalDetails: {
        executionContext: item.executionContext,
        runAsAccount: item.runAsAccount,
      },
    };
  }

  // Default explanation
  return {
    summary: `This is a ${item.type} configuration.`,
    purpose: 'Manages device compliance and settings.',
    impact: 'Applies to assigned devices based on configuration.',
    affectedDevices: 'Devices in assigned groups',
    relatedPolicies: [],
  };
}

/**
 * Generate recommendations
 * (Simplified version - in production, this would call the AI)
 */
function generateRecommendations(
  scenario: string,
  platform?: string,
  securityLevel?: string
): BestPracticeAnalysis {
  return {
    score: 75,
    recommendations: [
      {
        severity: 'high',
        title: 'Enable BitLocker Encryption',
        description: 'Protect data at rest with full disk encryption',
        action: 'Create a BitLocker configuration profile for Windows devices',
        learnMoreUrl: 'https://learn.microsoft.com/intune/configuration/bitlocker-settings',
      },
      {
        severity: 'medium',
        title: 'Enforce Password Complexity',
        description: 'Require strong passwords to prevent unauthorized access',
        action: 'Configure password policy with minimum 12 characters and complexity requirements',
      },
      {
        severity: 'low',
        title: 'Enable Windows Defender',
        description: 'Real-time protection against malware and threats',
        action: 'Deploy Microsoft Defender configuration profile',
      },
    ],
    compliantWith: ['CIS Benchmark', 'NIST 800-53'],
    summary: `Based on the scenario "${scenario}", here are best practice recommendations for ${platform || 'all platforms'} with ${securityLevel} security level.`,
  };
}

/**
 * Generate comparison between configurations
 * (Simplified version - in production, this would call the AI)
 */
function generateComparison(items: ResourceItem[]): ConfigurationComparison {
  const differences: Array<{ field: string; values: Record<string, any> }> = [];
  const similarities: string[] = [];

  // Compare names
  differences.push({
    field: 'Name',
    values: Object.fromEntries(
      items.map((item, i) => [`Config ${i + 1}`, item.displayName])
    ),
  });

  // Compare types
  const types = new Set(items.map(item => item.type));
  if (types.size === 1) {
    similarities.push(`All are ${items[0].type} configurations`);
  }

  // Compare platforms (if applicable)
  const profiles = items.filter(item => item.type === 'profile');
  if (profiles.length > 0) {
    differences.push({
      field: 'Platform',
      values: Object.fromEntries(
        profiles.map((item, i) => [`Config ${i + 1}`, (item as any).platforms])
      ),
    });
  }

  return {
    configurations: items,
    differences,
    similarities,
    summary: `Compared ${items.length} configurations. Found ${differences.length} differences and ${similarities.length} similarities.`,
  };
}

/**
 * Generate export guidance
 */
function generateExportGuidance(
  items: ResourceItem[],
  format: string,
  includeScripts: boolean
): string {
  const scriptCount = items.filter(item => item.type === 'script').length;

  return `
**Export Summary:**
- Items to export: ${items.length}
- Format: ${format.toUpperCase()}
- Include scripts: ${includeScripts ? 'Yes' : 'No'}
${scriptCount > 0 ? `- PowerShell scripts: ${scriptCount}` : ''}

**What will be included:**
- Configuration metadata (name, description, dates)
- Settings and policies
${includeScripts && scriptCount > 0 ? '- Full PowerShell script content' : ''}

**Next steps:**
1. Click the Export button to download
2. Review the exported data
3. ${format === 'json' ? 'Use for backup or import to another tenant' : format === 'html' ? 'Share as documentation' : 'Extract and review individual files'}
  `.trim();
}

/**
 * Generate export recommendations
 */
function generateExportRecommendations(items: ResourceItem[], format: string): string[] {
  const recommendations: string[] = [];

  if (format === 'json') {
    recommendations.push('JSON is best for backups and migrations');
    recommendations.push('You can re-import this data to another tenant');
  } else if (format === 'html') {
    recommendations.push('HTML reports are great for documentation');
    recommendations.push('Share with stakeholders for review');
  } else if (format === 'zip') {
    recommendations.push('ZIP archives include all files and scripts');
    recommendations.push('Good for comprehensive backups');
  }

  const hasScripts = items.some(item => item.type === 'script');
  if (hasScripts) {
    recommendations.push('Review scripts before sharing - they may contain sensitive data');
  }

  return recommendations;
}

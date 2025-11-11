'use client';

import React from 'react';
import Button from '../ui/Button';
import { formatDateTime } from '@/lib/utils/filters';
import type { ResourceItem, ConfigurationProfile, PowerShellScript } from '@/lib/types';

interface DetailModalProps {
  isOpen: boolean;
  item?: ResourceItem;
  isSelected: boolean;
  onClose: () => void;
  onToggleSelection: () => void;
  onDownload: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  item,
  isSelected,
  onClose,
  onToggleSelection,
  onDownload,
}) => {
  if (!isOpen || !item) return null;

  const renderContent = () => {
    switch (item.type) {
      case 'profile': {
        const profile = item as ConfigurationProfile;
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Description:</span>
                  <p className="text-gray-900 font-medium">{profile.description || 'None'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Platform:</span>
                  <p className="text-gray-900 font-medium">{profile.platforms}</p>
                </div>
                <div>
                  <span className="text-gray-600">Technologies:</span>
                  <p className="text-gray-900 font-medium">{profile.technologies || 'None'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Last Modified:</span>
                  <p className="text-gray-900 font-medium">
                    {formatDateTime(profile.lastModifiedDateTime)}
                  </p>
                </div>
              </div>
            </div>

            {profile.settings && profile.settings.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Settings ({profile.settings.length})
                </h4>
                <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-2 px-2 font-semibold text-gray-900">
                          Setting ID
                        </th>
                        <th className="text-left py-2 px-2 font-semibold text-gray-900">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.settings.map((setting, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-white">
                          <td className="py-2 px-2 text-gray-700 font-mono text-xs">
                            {setting.settingDefinitionId || 'N/A'}
                          </td>
                          <td className="py-2 px-2 text-gray-600">
                            <pre className="text-xs overflow-x-auto bg-white p-2 rounded max-w-sm">
                              {JSON.stringify(setting.valueJson || setting, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'script': {
        const script = item as PowerShellScript;
        let scriptContent = 'No content available';
        if (script.scriptContent) {
          try {
            scriptContent = atob(script.scriptContent);
          } catch (e) {
            scriptContent = 'Error decoding script content';
          }
        }

        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Script Details</h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Description:</span>
                  <p className="text-gray-900 font-medium">{script.description || 'None'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Execution Context:</span>
                  <p className="text-gray-900 font-medium">{script.executionContext || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Run As:</span>
                  <p className="text-gray-900 font-medium">{script.runAsAccount || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Script Content</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs max-h-96 overflow-y-auto font-mono">
                {scriptContent}
              </pre>
            </div>
          </div>
        );
      }

      default:
        return (
          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs max-h-96 overflow-y-auto">
            {JSON.stringify(item, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideDown"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-xl font-bold text-gray-900 truncate">
            {item.displayName || 'Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">{renderContent()}</div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <Button
            size="md"
            variant={isSelected ? 'danger' : 'primary'}
            onClick={onToggleSelection}
          >
            {isSelected ? 'Remove from Selection' : 'Add to Selection'}
          </Button>
          <Button size="md" variant="success" onClick={onDownload}>
            Download
          </Button>
          <Button size="md" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;

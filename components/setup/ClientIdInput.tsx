'use client';

import React from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface ClientIdInputProps {
  value: string;
  onChange: (value: string) => void;
  generatedClientId?: string;
  onUseGenerated?: () => void;
  isSuccess?: boolean;
}

export const ClientIdInput: React.FC<ClientIdInputProps> = ({
  value,
  onChange,
  generatedClientId,
  onUseGenerated,
  isSuccess = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (generatedClientId) {
      navigator.clipboard.writeText(generatedClientId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isSuccess && generatedClientId) {
    return (
      <Card variant="default" padding="lg" className="border-2 border-status-success bg-green-50">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-status-success flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-green-900">Setup Complete!</h4>
              <p className="text-sm text-green-800">Azure AD app created successfully.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-green-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application (client) ID:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={generatedClientId}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono text-gray-700"
              />
              <Button
                size="md"
                variant="primary"
                onClick={handleCopy}
                className="whitespace-nowrap"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {onUseGenerated && (
            <Button
              size="md"
              variant="primary"
              onClick={onUseGenerated}
              className="w-full"
            >
              Use This Client ID & Continue
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" variant="default" className="bg-gray-50">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Enter Client ID</h4>
          <p className="text-sm text-gray-600 mb-4">
            Paste your Application (client) ID from Azure AD app registration
          </p>
        </div>
        <Input
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="text"
        />
        <p className="text-xs text-gray-500">
          This will be saved locally in your browser for future sessions.
        </p>
      </div>
    </Card>
  );
};

export default ClientIdInput;

'use client';

import React from 'react';

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
  steps: string[];
  isVisible: boolean;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentStep,
  totalSteps,
  progress,
  steps,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="space-y-4 mb-6">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Setup Progress</span>
          <span className="text-sm font-semibold text-brand-primary">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <div
              key={step}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 transition-all duration-200"
            >
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  flex-shrink-0 transition-all duration-200
                  ${isCompleted ? 'bg-status-success text-white' : ''}
                  ${isActive ? 'bg-brand-primary text-white ring-2 ring-offset-2 ring-brand-primary' : ''}
                  ${isPending ? 'bg-gray-300 text-gray-600' : ''}
                `}
              >
                {isCompleted ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span className="text-xs font-medium text-gray-700">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;

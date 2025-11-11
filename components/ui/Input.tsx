import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'compact';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  variant = 'default',
  className = '',
  ...props
}) => {
  const isCompact = variant === 'compact';

  return (
    <div className={isCompact ? '' : 'mb-4'}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-gray-400 pointer-events-none">{icon}</span>
        )}
        <input
          className={`
            w-full rounded-lg border border-gray-300 bg-gray-50
            px-4 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
            focus:bg-white transition-colors
            disabled:bg-gray-100 disabled:text-gray-500
            placeholder:text-gray-400
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-status-error focus:ring-status-error' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-status-error mt-1">{error}</p>}
    </div>
  );
};

export default Input;

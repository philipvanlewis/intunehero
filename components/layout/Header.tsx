'use client';

import React from 'react';
import Button from '../ui/Button';

interface HeaderProps {
  isAuthenticated: boolean;
  currentUser?: string;
  onLogin?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  currentUser,
  onLogin,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-card sticky top-0 z-40">
      <div className="px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Intune Configuration Reporter
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Connect, inspect, and export your Intune environment
          </p>
        </div>

        <div className="text-right">
          {isAuthenticated ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Signed in as</p>
              <p className="font-semibold text-gray-900">{currentUser}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={onLogout}
                className="mt-2 text-xs"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button size="md" variant="primary" onClick={onLogin}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

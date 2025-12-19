'use client';

import { HandMetal, ArrowLeft, CheckCircle } from 'lucide-react';
import PrimaryButton from '../ui/PrimaryButton';

/**
 * Modal shown to new users to confirm they want to create an account
 * Prevents accidental account creation from clicking the wrong email
 */
const NewUserConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  email,
  darkMode,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop modal-backdrop-enter"
      onClick={onCancel}
    >
      <div
        className={`rounded-lg shadow-xl max-w-md w-full p-6 modal-content modal-popup-enter ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <HandMetal className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Welcome to Shako
          </h2>
        </div>

        {/* Content */}
        <div className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <p className="mb-4">
            You're signing in with a new email:
          </p>

          <div className={`p-3 rounded-lg mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              {email}
            </p>
          </div>

          <p>
            Please confirm account creation.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors
              ${darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <PrimaryButton
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {isLoading ? 'Creating...' : 'Confirm'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default NewUserConfirmModal;

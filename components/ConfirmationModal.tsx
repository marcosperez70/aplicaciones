
import React from 'react';
import { UiTexts } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  uiTexts: UiTexts;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  uiTexts,
  confirmText,
  cancelText,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full text-center">
        <p className="text-lg font-semibold mb-6">{message}</p>
        <div className="flex justify-around">
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition"
          >
            {confirmText || uiTexts.yesRestartButton}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition"
          >
            {cancelText || uiTexts.cancelButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;


import React from 'react';
import ReactMarkdown from 'react-markdown';
import { UiTexts } from '../types';

interface OutputModalProps {
  isOpen: boolean;
  title: string;
  content: string;
  onClose: () => void;
  onCopy?: () => void;
  copyButtonText?: string;
  closeButtonText?: string;
  uiTexts: UiTexts;
  conceptContext?: string; // For elaboration/analogy context
}

const OutputModal: React.FC<OutputModalProps> = ({
  isOpen,
  title,
  content,
  onClose,
  onCopy,
  copyButtonText,
  closeButtonText,
  uiTexts,
  conceptContext,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full flex flex-col max-h-[80vh]">
        <h3 className="text-xl sm:text-2xl font-semibold text-blue-700 mb-2">{title}</h3>
        {conceptContext && (
            <p className="text-sm text-gray-600 mb-4">{uiTexts.elaborationModalConceptLabel} "{conceptContext}"</p>
        )}
        <div className="prose prose-sm sm:prose-base max-w-none overflow-y-auto mb-6 p-3 bg-gray-50 rounded-md border flex-grow">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
          {onCopy && copyButtonText && (
            <button onClick={onCopy} className="flex-1 bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-sky-600 transition">
              {copyButtonText}
            </button>
          )}
        </div>
        <button onClick={onClose} className="mt-4 w-full bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition">
          {closeButtonText || uiTexts.closeButton}
        </button>
      </div>
    </div>
  );
};

export default OutputModal;

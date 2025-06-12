import React from 'react';
import { UiTexts } from '../types';
import { BASE_UI_TEXTS } from '../constants';

interface FullscreenButtonProps {
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  uiTexts: UiTexts;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({ isFocusMode, onToggleFocusMode, uiTexts }) => {
  return (
    <div className={`w-full max-w-3xl flex ${isFocusMode ? 'justify-end mb-0.5 mt-1 sm:mt-2' : 'justify-end mb-2'}`}>
      <button
        onClick={onToggleFocusMode}
        title={isFocusMode ? (uiTexts.exitFocusModeButtonLabel || BASE_UI_TEXTS.exitFocusModeButtonLabel) : (uiTexts.focusModeButtonLabel || BASE_UI_TEXTS.focusModeButtonLabel)}
        className="p-1.5 sm:p-2 bg-green-600 hover:bg-green-500 text-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-1 focus:ring-offset-green-800"
        aria-label={isFocusMode ? (uiTexts.exitFocusModeButtonLabel || BASE_UI_TEXTS.exitFocusModeButtonLabel) : (uiTexts.focusModeButtonLabel || BASE_UI_TEXTS.focusModeButtonLabel)}
      >
        {isFocusMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9M20.25 20.25h-4.5m4.5 0v-4.5m0-4.5L15 15" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default FullscreenButton;
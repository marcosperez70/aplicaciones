
import React from 'react';

interface InitialLoadingScreenProps {
  language: string;
}

const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({ language }) => {
  const langForMessage = language || "your target language";
  const mainMessage = `Translating interface to ${langForMessage}...`;
  const subMessages = {
      en: "Please wait a moment...",
      zh: "请稍候...",
      hi: "कृपया थोड़ी देर प्रतीक्षा करें...",
      es: "Por favor, espera un momento..."
  };

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-95 flex flex-col justify-center items-center z-[200] p-4 text-center">
      <p className="text-2xl font-semibold text-blue-700 animate-pulse">
        {mainMessage}
      </p>
      <div className="mt-3 space-y-1">
        <p className="text-xs text-gray-500">{subMessages.en}</p>
        <p className="text-xs text-gray-500">{subMessages.zh}</p>
        <p className="text-xs text-gray-500">{subMessages.hi}</p>
        <p className="text-xs text-gray-500">{subMessages.es}</p>
      </div>
    </div>
  );
};

export default InitialLoadingScreen;

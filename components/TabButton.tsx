import React from 'react';
import { ActiveTab } from '../types';

interface TabButtonProps {
  tabId: ActiveTab;
  label: string;
  activeTab: ActiveTab;
  onClick: (tabId: ActiveTab) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ tabId, label, activeTab, onClick }) => {
  return (
    <button
      onClick={() => onClick(tabId)}
      className={`py-2 sm:py-3 px-3 sm:px-5 text-sm sm:text-base font-medium rounded-t-lg transition-colors duration-200 ease-in-out focus:outline-none whitespace-nowrap
                  ${activeTab === tabId 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-green-700 text-gray-200 hover:bg-green-600' // Updated for dark theme
                  }`}
    >
      {label}
    </button>
  );
};

export default TabButton;
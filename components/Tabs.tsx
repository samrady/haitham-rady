import React from 'react';
import type { AppTab } from '../App';

interface TabsProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const getTabClass = (tabName: AppTab) => {
    return activeTab === tabName
      ? 'text-purple-400 border-purple-400'
      : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-600';
  };

  return (
    <div className="border-b border-gray-800">
      <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
        <button
          onClick={() => setActiveTab('visualizer')}
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-lg transition-colors ${getTabClass('visualizer')}`}
        >
          حوّل قصتك لمشاهد
        </button>
        <button
          onClick={() => setActiveTab('generator')}
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-lg transition-colors ${getTabClass('generator')}`}
        >
          حوّل فكرتك لقصة
        </button>
      </nav>
    </div>
  );
};

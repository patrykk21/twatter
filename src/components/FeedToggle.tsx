'use client';

interface FeedToggleProps {
  activeView: 'latest' | 'for-you';
  onViewChange: (view: 'latest' | 'for-you') => void;
}

export default function FeedToggle({ activeView, onViewChange }: FeedToggleProps) {
  return (
    <div className="border-b border-gray-800 p-4">
      <div className="flex space-x-1">
        <button
          onClick={() => onViewChange('latest')}
          className={`flex-1 py-3 px-4 text-center font-medium rounded-t-lg transition-colors ${
            activeView === 'latest'
              ? 'text-white border-b-2 border-blue-500 bg-gray-900'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
          }`}
        >
          Latest
        </button>
        <button
          onClick={() => onViewChange('for-you')}
          className={`flex-1 py-3 px-4 text-center font-medium rounded-t-lg transition-colors ${
            activeView === 'for-you'
              ? 'text-white border-b-2 border-blue-500 bg-gray-900'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
          }`}
        >
          For You
        </button>
      </div>
    </div>
  );
}
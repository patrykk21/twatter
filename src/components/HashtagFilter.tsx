'use client';

interface HashtagFilterProps {
  selectedHashtag: string | null;
  onHashtagChange: (hashtag: string | null) => void;
  availableHashtags: string[];
}

export default function HashtagFilter({ selectedHashtag, onHashtagChange, availableHashtags }: HashtagFilterProps) {
  return (
    <div className="border-b border-gray-200 p-4">
      <h3 className="font-medium text-gray-900 mb-3">Filter by hashtag</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onHashtagChange(null)}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedHashtag === null
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        {availableHashtags.map((hashtag) => (
          <button
            key={hashtag}
            onClick={() => onHashtagChange(hashtag)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedHashtag === hashtag
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            #{hashtag}
          </button>
        ))}
      </div>
    </div>
  );
}
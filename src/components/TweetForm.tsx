'use client';

import { useState } from 'react';

interface TweetFormProps {
  onSubmit: (content: string) => void;
}

export default function TweetForm({ onSubmit }: TweetFormProps) {
  const [content, setContent] = useState('');
  const [author] = useState('current_user');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <div className="border-b border-gray-800 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {author.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full p-3 text-lg border-none resize-none focus:outline-none bg-black text-white placeholder-gray-400"
              rows={3}
            />
            <div className="flex justify-between items-center mt-3">
              <div className="text-sm text-gray-400">
                {content.length}/280
              </div>
              <button
                type="submit"
                disabled={!content.trim() || content.length > 280}
                className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Tweet
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
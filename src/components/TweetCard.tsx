'use client';

import { Tweet } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { useState } from 'react';

interface TweetCardProps {
  tweet: Tweet;
  onLike: (tweetId: string) => void;
  onReply: (tweetId: string, content: string) => void;
  onDelete: (tweetId: string) => void;
  onHashtagClick: (hashtag: string) => void;
}

export default function TweetCard({ tweet, onLike, onReply, onDelete, onHashtagClick }: TweetCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  
  // Check if this is an optimistic update
  const isOptimistic = tweet.id.startsWith('temp-');

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(tweet.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const formatContent = (content: string) => {
    return content.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span
            key={index}
            className="text-blue-500 hover:text-blue-600 cursor-pointer"
            onClick={() => onHashtagClick(word.substring(1))}
          >
            {word}{' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  return (
    <div className={`border-b border-gray-800 p-4 hover:bg-gray-900 ${isOptimistic ? 'opacity-60' : ''}`}>
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-200">
            {tweet.author.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-white">@{tweet.author}</span>
            <span className="text-gray-400 text-sm">
              {formatRelativeTime(new Date(tweet.createdAt))}
            </span>
            {isOptimistic && (
              <span className="text-xs text-gray-500 italic">sending...</span>
            )}
          </div>
          <p className="mt-1 text-white">{formatContent(tweet.content)}</p>
          
          <div className="flex items-center space-x-6 mt-3">
            <button
              onClick={() => onLike(tweet.id)}
              className="flex items-center space-x-1 text-gray-400 hover:text-red-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{tweet.likes}</span>
            </button>
            
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 text-gray-400 hover:text-blue-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{tweet.replies.length}</span>
            </button>
            
            <button
              onClick={() => onDelete(tweet.id)}
              className="flex items-center space-x-1 text-gray-400 hover:text-red-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                rows={2}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="px-3 py-1 text-sm text-gray-400 hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                >
                  Reply
                </button>
              </div>
            </form>
          )}
          
          {tweet.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {tweet.replies.map((reply) => (
                <div key={reply.id} className="border-l-2 border-gray-700 pl-4">
                  <TweetCard
                    tweet={reply}
                    onLike={onLike}
                    onReply={onReply}
                    onDelete={onDelete}
                    onHashtagClick={onHashtagClick}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tweet } from '@/lib/types';
import TweetCard from '@/components/TweetCard';
import TweetForm from '@/components/TweetForm';
import HashtagFilter from '@/components/HashtagFilter';
import FeedToggle from '@/components/FeedToggle';
import { trackLike, removeLike, generateRecommendations } from '@/lib/recommendations';

export default function Home() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedView, setFeedView] = useState<'latest' | 'for-you'>('latest');
  const [recommendedTweets, setRecommendedTweets] = useState<Tweet[]>([]);
  const [likingTweets, setLikingTweets] = useState<Set<string>>(new Set());

  const fetchTweets = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedHashtag 
        ? `/api/tweets?hashtag=${encodeURIComponent(selectedHashtag)}`
        : '/api/tweets';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setTweets(data.tweets);
        // Update recommendations when tweets change
        setRecommendedTweets(generateRecommendations(data.tweets));
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedHashtag]);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  const handleCreateTweet = async (content: string) => {
    // Create optimistic tweet
    const optimisticTweet: Tweet = {
      id: `temp-${Date.now()}`,
      content,
      author: 'current_user',
      createdAt: new Date(),
      likes: 0,
      replies: [],
      hashtags: content.match(/#\w+/g)?.map(tag => tag.substring(1).toLowerCase()) || []
    };

    // Optimistic update - add to beginning of tweets array
    setTweets([optimisticTweet, ...tweets]);

    try {
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author: 'current_user' })
      });
      const data = await response.json();
      if (data.success) {
        // Replace temp tweet with real one
        setTweets(currentTweets => 
          currentTweets.map(tweet => 
            tweet.id === optimisticTweet.id ? data.tweet : tweet
          )
        );
      } else {
        // Rollback on failure
        setTweets(currentTweets => 
          currentTweets.filter(tweet => tweet.id !== optimisticTweet.id)
        );
        console.error('Failed to create tweet');
      }
    } catch (error) {
      // Rollback on error
      setTweets(currentTweets => 
        currentTweets.filter(tweet => tweet.id !== optimisticTweet.id)
      );
      console.error('Error creating tweet:', error);
    }
  };

  const updateTweetInState = (tweetId: string, updateFn: (tweet: Tweet) => Tweet): Tweet[] => {
    const updateTweetRecursive = (tweets: Tweet[]): Tweet[] => {
      return tweets.map(tweet => {
        if (tweet.id === tweetId) {
          return updateFn(tweet);
        }
        return {
          ...tweet,
          replies: updateTweetRecursive(tweet.replies)
        };
      });
    };
    return updateTweetRecursive(tweets);
  };

  const handleLike = async (tweetId: string) => {
    // Prevent double-clicking
    if (likingTweets.has(tweetId)) {
      return;
    }
    
    // Mark as liking
    setLikingTweets(prev => new Set(prev).add(tweetId));
    
    // Find the tweet to track interaction
    const findTweetById = (tweets: Tweet[], id: string): Tweet | null => {
      for (const tweet of tweets) {
        if (tweet.id === id) return tweet;
        const found = findTweetById(tweet.replies, id);
        if (found) return found;
      }
      return null;
    };
    
    const likedTweet = findTweetById(tweets, tweetId);
    if (likedTweet) {
      trackLike(likedTweet);
    }

    // Optimistic update
    const optimisticTweets = updateTweetInState(tweetId, (tweet) => ({
      ...tweet,
      likes: tweet.likes + 1
    }));
    setTweets(optimisticTweets);
    
    // Update recommendations based on new like
    setRecommendedTweets(generateRecommendations(optimisticTweets));

    try {
      const response = await fetch(`/api/tweets/${tweetId}/like`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        // Success - optimistic update was correct, just remove from liking set
        setLikingTweets(prev => {
          const newSet = new Set(prev);
          newSet.delete(tweetId);
          return newSet;
        });
      } else {
        // Rollback on failure
        const rollbackTweets = updateTweetInState(tweetId, (tweet) => ({
          ...tweet,
          likes: tweet.likes - 1
        }));
        setTweets(rollbackTweets);
        
        // Also rollback the like tracking
        if (likedTweet) {
          removeLike(likedTweet);
        }
        setRecommendedTweets(generateRecommendations(rollbackTweets));
        
        // Remove from liking set
        setLikingTweets(prev => {
          const newSet = new Set(prev);
          newSet.delete(tweetId);
          return newSet;
        });
      }
    } catch (error) {
      // Rollback on error
      const rollbackTweets = updateTweetInState(tweetId, (tweet) => ({
        ...tweet,
        likes: tweet.likes - 1
      }));
      setTweets(rollbackTweets);
      
      // Also rollback the like tracking
      if (likedTweet) {
        removeLike(likedTweet);
      }
      setRecommendedTweets(generateRecommendations(rollbackTweets));
      
      // Remove from liking set
      setLikingTweets(prev => {
        const newSet = new Set(prev);
        newSet.delete(tweetId);
        return newSet;
      });
      console.error('Error liking tweet:', error);
    }
  };

  const handleReply = async (tweetId: string, content: string) => {
    // Create optimistic reply
    const optimisticReply: Tweet = {
      id: `temp-${Date.now()}`,
      content,
      author: 'current_user',
      createdAt: new Date(),
      likes: 0,
      replies: [],
      parentId: tweetId,
      hashtags: content.match(/#\w+/g)?.map(tag => tag.substring(1).toLowerCase()) || []
    };

    // Optimistic update
    const optimisticTweets = updateTweetInState(tweetId, (tweet) => ({
      ...tweet,
      replies: [...tweet.replies, optimisticReply]
    }));
    setTweets(optimisticTweets);

    try {
      const response = await fetch(`/api/tweets/${tweetId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author: 'current_user' })
      });
      const data = await response.json();
      if (data.success) {
        // Replace temp reply with real one
        setTweets(currentTweets => {
          const replaceOptimisticReply = (tweets: Tweet[]): Tweet[] => {
            return tweets.map(tweet => {
              if (tweet.id === tweetId) {
                return {
                  ...tweet,
                  replies: tweet.replies.map(reply => 
                    reply.id === optimisticReply.id ? data.tweet : reply
                  )
                };
              }
              return {
                ...tweet,
                replies: replaceOptimisticReply(tweet.replies)
              };
            });
          };
          return replaceOptimisticReply(currentTweets);
        });
      } else {
        // Rollback on failure
        const rollbackTweets = updateTweetInState(tweetId, (tweet) => ({
          ...tweet,
          replies: tweet.replies.filter(reply => reply.id !== optimisticReply.id)
        }));
        setTweets(rollbackTweets);
        console.error('Failed to create reply');
      }
    } catch (error) {
      // Rollback on error
      const rollbackTweets = updateTweetInState(tweetId, (tweet) => ({
        ...tweet,
        replies: tweet.replies.filter(reply => reply.id !== optimisticReply.id)
      }));
      setTweets(rollbackTweets);
      console.error('Error replying to tweet:', error);
    }
  };

  const removeTweetFromState = (tweetId: string): { updatedTweets: Tweet[], removedTweet: Tweet | null } => {
    let removedTweet: Tweet | null = null;
    
    // First check if it's a main tweet
    const mainTweetIndex = tweets.findIndex(t => t.id === tweetId);
    if (mainTweetIndex !== -1) {
      removedTweet = tweets[mainTweetIndex];
      return {
        updatedTweets: tweets.filter(t => t.id !== tweetId),
        removedTweet
      };
    }
    
    // Otherwise, remove from replies
    const removeTweetRecursive = (tweets: Tweet[]): Tweet[] => {
      return tweets.map(tweet => ({
        ...tweet,
        replies: tweet.replies.filter(reply => {
          if (reply.id === tweetId) {
            removedTweet = reply;
            return false;
          }
          return true;
        }).map(reply => ({
          ...reply,
          replies: removeTweetRecursive(reply.replies)
        }))
      }));
    };
    
    return {
      updatedTweets: removeTweetRecursive(tweets),
      removedTweet
    };
  };

  const handleDelete = async (tweetId: string) => {
    // Optimistic delete
    const { updatedTweets, removedTweet } = removeTweetFromState(tweetId);
    setTweets(updatedTweets);

    try {
      const response = await fetch(`/api/tweets/${tweetId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!data.success) {
        // Rollback on failure
        if (removedTweet) {
          if (removedTweet.parentId) {
            // Re-add to replies
            const rollbackTweets = updateTweetInState(removedTweet.parentId, (tweet) => ({
              ...tweet,
              replies: [...tweet.replies, removedTweet]
            }));
            setTweets(rollbackTweets);
          } else {
            // Re-add to main tweets
            setTweets([...tweets, removedTweet]);
          }
        }
        console.error('Failed to delete tweet');
      }
    } catch (error) {
      // Rollback on error
      if (removedTweet) {
        if (removedTweet.parentId) {
          // Re-add to replies
          const rollbackTweets = updateTweetInState(removedTweet.parentId, (tweet) => ({
            ...tweet,
            replies: [...tweet.replies, removedTweet]
          }));
          setTweets(rollbackTweets);
        } else {
          // Re-add to main tweets
          setTweets([...tweets, removedTweet]);
        }
      }
      console.error('Error deleting tweet:', error);
    }
  };

  const handleHashtagClick = (hashtag: string) => {
    setSelectedHashtag(hashtag);
  };

  const getAvailableHashtags = () => {
    const hashtags = new Set<string>();
    tweets.forEach(tweet => {
      tweet.hashtags.forEach(hashtag => hashtags.add(hashtag));
      tweet.replies.forEach(reply => {
        reply.hashtags.forEach(hashtag => hashtags.add(hashtag));
      });
    });
    return Array.from(hashtags);
  };

  const getDisplayTweets = () => {
    if (feedView === 'for-you') {
      return recommendedTweets;
    }
    
    // Latest view with hashtag filtering
    if (selectedHashtag) {
      return tweets.filter(tweet => 
        tweet.hashtags.includes(selectedHashtag.toLowerCase())
      );
    }
    
    return tweets;
  };

  return (
    <div className="max-w-2xl mx-auto bg-black min-h-screen">
      <div className="sticky top-0 bg-black border-b border-gray-800 p-4">
        <h1 className="text-xl font-bold text-white">Twitter Clone</h1>
      </div>
      
      <TweetForm onSubmit={handleCreateTweet} />
      
      <FeedToggle 
        activeView={feedView}
        onViewChange={(view) => {
          setFeedView(view);
          // Clear hashtag filter when switching to "For You"
          if (view === 'for-you') {
            setSelectedHashtag(null);
          }
        }}
      />
      
      {feedView === 'latest' && (
        <HashtagFilter
          selectedHashtag={selectedHashtag}
          onHashtagChange={setSelectedHashtag}
          availableHashtags={getAvailableHashtags()}
        />
      )}
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="text-gray-400">Loading tweets...</div>
        </div>
      ) : (
        <div>
          {getDisplayTweets().length === 0 ? (
            <div className="flex justify-center p-8">
              <div className="text-gray-400">
                {feedView === 'for-you' 
                  ? 'Like some tweets to get personalized recommendations!' 
                  : 'No tweets found.'}
              </div>
            </div>
          ) : (
            getDisplayTweets().map(tweet => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                onLike={handleLike}
                onReply={handleReply}
                onDelete={handleDelete}
                onHashtagClick={handleHashtagClick}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

import { Tweet } from './types';

// Simple user interaction tracking
interface UserInteractions {
  likedTweets: string[];
  likedHashtags: Record<string, number>;
  likedAuthors: Record<string, number>;
}

// Mock current user interactions (in a real app, this would come from a database)
let userInteractions: UserInteractions = {
  likedTweets: [],
  likedHashtags: {},
  likedAuthors: {}
};

export function trackLike(tweet: Tweet) {
  console.log('Tracking like for tweet:', tweet.id, tweet.content.substring(0, 30));
  
  // Add to liked tweets
  if (!userInteractions.likedTweets.includes(tweet.id)) {
    userInteractions.likedTweets.push(tweet.id);
    console.log('Added tweet to liked list. Total liked:', userInteractions.likedTweets.length);
  }
  
  // Track hashtag preferences
  tweet.hashtags.forEach(hashtag => {
    userInteractions.likedHashtags[hashtag] = (userInteractions.likedHashtags[hashtag] || 0) + 1;
    console.log(`Hashtag preference for #${hashtag}:`, userInteractions.likedHashtags[hashtag]);
  });
  
  // Track author preferences
  userInteractions.likedAuthors[tweet.author] = (userInteractions.likedAuthors[tweet.author] || 0) + 1;
  console.log(`Author preference for @${tweet.author}:`, userInteractions.likedAuthors[tweet.author]);
}

export function removeLike(tweet: Tweet) {
  // Remove from liked tweets
  userInteractions.likedTweets = userInteractions.likedTweets.filter(id => id !== tweet.id);
  
  // Decrease hashtag preferences
  tweet.hashtags.forEach(hashtag => {
    if (userInteractions.likedHashtags[hashtag]) {
      userInteractions.likedHashtags[hashtag] -= 1;
      if (userInteractions.likedHashtags[hashtag] <= 0) {
        delete userInteractions.likedHashtags[hashtag];
      }
    }
  });
  
  // Decrease author preferences  
  if (userInteractions.likedAuthors[tweet.author]) {
    userInteractions.likedAuthors[tweet.author] -= 1;
    if (userInteractions.likedAuthors[tweet.author] <= 0) {
      delete userInteractions.likedAuthors[tweet.author];
    }
  }
}

export function generateRecommendations(allTweets: Tweet[]): Tweet[] {
  console.log('Generating recommendations for', allTweets.length, 'tweets');
  console.log('User interactions:', userInteractions);
  
  // If user hasn't liked anything, return popular tweets
  if (userInteractions.likedTweets.length === 0) {
    console.log('No user likes found, returning popular tweets');
    return allTweets
      .filter(tweet => tweet.likes > 0)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 10);
  }
  
  // Calculate recommendation scores for each tweet
  const tweetScores: Array<{ tweet: Tweet; score: number }> = [];
  
  const flattenTweets = (tweets: Tweet[]): Tweet[] => {
    const flat: Tweet[] = [];
    tweets.forEach(tweet => {
      flat.push(tweet);
      if (tweet.replies.length > 0) {
        flat.push(...flattenTweets(tweet.replies));
      }
    });
    return flat;
  };
  
  const allFlatTweets = flattenTweets(allTweets);
  
  allFlatTweets.forEach(tweet => {
    // Note: We include liked tweets in recommendations as users might want to engage further
    // (reply, share, etc.) - this matches typical social media behavior
    
    let score = 0;
    let scoreBreakdown = { hashtags: 0, author: 0, popularity: 0, recency: 0 };
    
    // Hashtag similarity score (weighted heavily)
    tweet.hashtags.forEach(hashtag => {
      const preference = userInteractions.likedHashtags[hashtag] || 0;
      const hashtagScore = preference * 3;
      score += hashtagScore;
      scoreBreakdown.hashtags += hashtagScore;
    });
    
    // Author preference score
    const authorPreference = userInteractions.likedAuthors[tweet.author] || 0;
    const authorScore = authorPreference * 2;
    score += authorScore;
    scoreBreakdown.author = authorScore;
    
    // Popularity boost (tweets with high engagement)
    const popularityScore = Math.log(tweet.likes + 1) * 0.5 + Math.log(tweet.replies.length + 1) * 0.3;
    score += popularityScore;
    scoreBreakdown.popularity = popularityScore;
    
    // Recency boost (newer tweets get slight preference)
    const ageInHours = (Date.now() - new Date(tweet.createdAt).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 1 - (ageInHours / 168)); // Decay over a week
    score += recencyScore * 0.5;
    scoreBreakdown.recency = recencyScore * 0.5;
    
    console.log(`Tweet ${tweet.id} (${tweet.content.substring(0, 30)}...) score:`, score, scoreBreakdown);
    
    if (score > 0) {
      tweetScores.push({ tweet, score });
    }
  });
  
  // Sort by score and return top recommendations
  const recommendations = tweetScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(item => item.tweet);
    
  console.log('Final recommendations:', recommendations.length, 'tweets');
  return recommendations;
}

export function getUserInteractions(): UserInteractions {
  return { ...userInteractions };
}

// For debugging/testing
export function resetUserInteractions() {
  userInteractions = {
    likedTweets: [],
    likedHashtags: {},
    likedAuthors: {}
  };
}
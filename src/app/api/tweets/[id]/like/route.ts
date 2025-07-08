import { NextRequest, NextResponse } from 'next/server';
import { tweets } from '@/lib/data';
import { Tweet, TweetResponse } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tweetId } = await params;
    
    // Find the target tweet/reply in both main tweets and nested replies
    let tweet = tweets.find(t => t.id === tweetId);
    
    // If not found in main tweets, search in replies
    if (!tweet) {
      for (const mainTweet of tweets) {
        const findInReplies = (replies: Tweet[]): Tweet | null => {
          for (const reply of replies) {
            if (reply.id === tweetId) return reply;
            const found = findInReplies(reply.replies);
            if (found) return found;
          }
          return null;
        };
        const foundTweet = findInReplies(mainTweet.replies);
        if (foundTweet) {
          tweet = foundTweet;
          break;
        }
      }
    }
    
    if (!tweet) {
      const response: TweetResponse = {
        success: false,
        error: 'Tweet not found'
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    tweet.likes += 1;
    
    const response: TweetResponse = {
      success: true,
      tweet
    };
    
    return NextResponse.json(response);
  } catch {
    const response: TweetResponse = {
      success: false,
      error: 'Failed to like tweet'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
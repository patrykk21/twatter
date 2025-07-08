import { NextRequest, NextResponse } from 'next/server';
import { tweets } from '@/lib/data';
import { Tweet, TweetResponse } from '@/lib/types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tweetId } = await params;
    
    // Try to find and delete from main tweets first
    const tweetIndex = tweets.findIndex(t => t.id === tweetId);
    let deletedTweet;
    
    if (tweetIndex !== -1) {
      deletedTweet = tweets.splice(tweetIndex, 1)[0];
    } else {
      // Search in nested replies
      let found = false;
      for (const tweet of tweets) {
        const deleteFromReplies = (replies: Tweet[]): boolean => {
          for (let i = 0; i < replies.length; i++) {
            if (replies[i].id === tweetId) {
              deletedTweet = replies.splice(i, 1)[0];
              return true;
            }
            if (deleteFromReplies(replies[i].replies)) {
              return true;
            }
          }
          return false;
        };
        
        if (deleteFromReplies(tweet.replies)) {
          found = true;
          break;
        }
      }
      
      if (!found) {
        const response: TweetResponse = {
          success: false,
          error: 'Tweet not found'
        };
        return NextResponse.json(response, { status: 404 });
      }
    }
    
    const response: TweetResponse = {
      success: true,
      tweet: deletedTweet
    };
    
    return NextResponse.json(response);
  } catch {
    const response: TweetResponse = {
      success: false,
      error: 'Failed to delete tweet'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
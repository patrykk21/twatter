import { NextRequest, NextResponse } from 'next/server';
import { tweets, generateId, extractHashtags } from '@/lib/data';
import { CreateTweetRequest, TweetResponse } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tweetId } = await params;
    const body: CreateTweetRequest = await request.json();
    
    if (!body.content || !body.author) {
      const response: TweetResponse = {
        success: false,
        error: 'Content and author are required'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // Find the target tweet/reply in both main tweets and nested replies
    let parentTweet = tweets.find(t => t.id === tweetId);
    
    // If not found in main tweets, search in replies
    if (!parentTweet) {
      for (const tweet of tweets) {
        const findInReplies = (replies: Tweet[]): Tweet | null => {
          for (const reply of replies) {
            if (reply.id === tweetId) return reply;
            const found = findInReplies(reply.replies);
            if (found) return found;
          }
          return null;
        };
        parentTweet = findInReplies(tweet.replies);
        if (parentTweet) break;
      }
    }
    
    if (!parentTweet) {
      const response: TweetResponse = {
        success: false,
        error: 'Tweet not found'
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    const reply = {
      id: generateId(),
      content: body.content,
      author: body.author,
      createdAt: new Date(),
      likes: 0,
      replies: [],
      parentId: tweetId,
      hashtags: extractHashtags(body.content)
    };
    
    parentTweet.replies.push(reply);
    
    const response: TweetResponse = {
      success: true,
      tweet: reply
    };
    
    return NextResponse.json(response);
  } catch {
    const response: TweetResponse = {
      success: false,
      error: 'Failed to create reply'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

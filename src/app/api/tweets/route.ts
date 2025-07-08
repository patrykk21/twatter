import { NextRequest, NextResponse } from 'next/server';
import { tweets, generateId, extractHashtags } from '@/lib/data';
import { CreateTweetRequest, TweetResponse, TweetsResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hashtag = searchParams.get('hashtag');
    
    let filteredTweets = tweets;
    
    if (hashtag) {
      filteredTweets = tweets.filter(tweet => 
        tweet.hashtags.includes(hashtag.toLowerCase())
      );
    }
    
    const response: TweetsResponse = {
      success: true,
      tweets: filteredTweets.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    };
    
    return NextResponse.json(response);
  } catch {
    const response: TweetsResponse = {
      success: false,
      tweets: [],
      error: 'Failed to fetch tweets'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTweetRequest = await request.json();
    
    if (!body.content || !body.author) {
      const response: TweetResponse = {
        success: false,
        error: 'Content and author are required'
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const newTweet = {
      id: generateId(),
      content: body.content,
      author: body.author,
      createdAt: new Date(),
      likes: 0,
      replies: [],
      parentId: body.parentId,
      hashtags: extractHashtags(body.content)
    };
    
    if (body.parentId) {
      const parentTweet = tweets.find(t => t.id === body.parentId);
      if (parentTweet) {
        parentTweet.replies.push(newTweet);
      }
    } else {
      tweets.push(newTweet);
    }
    
    const response: TweetResponse = {
      success: true,
      tweet: newTweet
    };
    
    return NextResponse.json(response);
  } catch {
    const response: TweetResponse = {
      success: false,
      error: 'Failed to create tweet'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
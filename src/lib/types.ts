export interface Tweet {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  likes: number;
  replies: Tweet[];
  parentId?: string;
  hashtags: string[];
}

export interface CreateTweetRequest {
  content: string;
  author: string;
  parentId?: string;
}

export interface TweetResponse {
  success: boolean;
  tweet?: Tweet;
  error?: string;
}

export interface TweetsResponse {
  success: boolean;
  tweets: Tweet[];
  error?: string;
}
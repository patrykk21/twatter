import { Tweet } from './types';

export const tweets: Tweet[] = [
  {
    id: '1',
    content: 'Hello world! This is my first tweet #hello #world',
    author: 'john_doe',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    likes: 5,
    replies: [],
    hashtags: ['hello', 'world']
  },
  {
    id: '2',
    content: 'Building something amazing with Next.js! #nextjs #react #coding',
    author: 'jane_smith',
    createdAt: new Date('2024-01-01T11:00:00Z'),
    likes: 12,
    replies: [],
    hashtags: ['nextjs', 'react', 'coding']
  },
  {
    id: '3',
    content: 'Great weather today! Perfect for a walk #weather #nature',
    author: 'mike_wilson',
    createdAt: new Date('2024-01-01T12:00:00Z'),
    likes: 3,
    replies: [],
    hashtags: ['weather', 'nature']
  }
];

export function extractHashtags(content: string): string[] {
  const hashtags = content.match(/#\w+/g) || [];
  return hashtags.map(tag => tag.substring(1).toLowerCase());
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
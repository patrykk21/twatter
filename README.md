# Twitter Clone

A feature-rich Twitter-like web application built with Next.js 15, React, and Tailwind CSS featuring real-time interactions, optimistic UI updates, and a sleek dark mode interface.

## 🚀 Features

- **Tweet Management**: Create, view, like, reply to, and delete tweets
- **Nested Conversations**: Unlimited reply threading with visual hierarchy
- **Hashtag System**: Clickable hashtags with filtering functionality
- **Optimistic UI**: Instant feedback for all user actions with error rollback
- **Dark Mode**: Modern Twitter-like dark theme throughout
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Updates**: Live tweet feed with relative timestamps
- **"For You" Recommendations**: AI-powered tweet recommendations based on user interactions
- **Mock Backend**: In-memory REST API for development and testing

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes (Mock REST API)
- **Data Storage**: In-memory JavaScript arrays
- **Development**: ESLint, TypeScript compiler
- **Build Tool**: Turbopack (Next.js 15)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/tweets/           # REST API endpoints
│   │   ├── route.ts          # GET /api/tweets, POST /api/tweets
│   │   └── [id]/             # Dynamic tweet routes
│   │       ├── route.ts      # DELETE /api/tweets/:id
│   │       ├── like/route.ts # POST /api/tweets/:id/like
│   │       └── reply/route.ts# POST /api/tweets/:id/reply
│   ├── globals.css           # Global styles and dark theme
│   └── page.tsx              # Main application page
├── components/
│   ├── TweetCard.tsx         # Individual tweet display component
│   ├── TweetForm.tsx         # Tweet creation form
│   ├── HashtagFilter.tsx     # Hashtag filtering interface
│   └── FeedToggle.tsx        # Latest/For You view toggle
└── lib/
    ├── types.ts              # TypeScript type definitions
    ├── data.ts               # Mock data and utility functions
    ├── utils.ts              # Helper functions (time formatting)
    └── recommendations.ts    # Recommendation engine and user tracking
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd twitter-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

## 📖 API Documentation

### Endpoints

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/api/tweets` | Retrieve all tweets | `?hashtag=<tag>` (optional) |
| `POST` | `/api/tweets` | Create a new tweet | `{ content, author }` |
| `POST` | `/api/tweets/:id/like` | Like a tweet | Tweet ID in URL |
| `POST` | `/api/tweets/:id/reply` | Reply to a tweet | `{ content, author }` |
| `DELETE` | `/api/tweets/:id` | Delete a tweet | Tweet ID in URL |

### Response Format

```typescript
// Success Response
{
  success: true,
  tweet?: Tweet,
  tweets?: Tweet[]
}

// Error Response
{
  success: false,
  error: string
}
```

### Data Models

```typescript
interface Tweet {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  likes: number;
  replies: Tweet[];
  parentId?: string;
  hashtags: string[];
}
```

## 🎨 UI/UX Features

### Optimistic Updates

All user interactions provide immediate visual feedback:

- **Likes**: Counter increments instantly, rolls back on failure
- **Replies**: Appear immediately with "sending..." indicator
- **Deletes**: Tweets disappear instantly, restored on failure
- **New Tweets**: Added to feed immediately, replaced with server response

### Dark Mode Design

- **Background**: Pure black (#000000) for OLED-friendly design
- **Text Hierarchy**: White primary, gray-400 secondary, gray-500 tertiary
- **Interactive Elements**: Blue accent colors with hover states
- **Visual Feedback**: Reduced opacity for pending actions

### Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Flexible Layout**: Adapts to different screen sizes
- **Touch-friendly**: Large click targets for mobile interaction

## 🤖 Recommendation System

### Algorithm Overview

The "For You" feed uses a multi-factor recommendation algorithm that analyzes user behavior to surface relevant content:

#### **Scoring Factors**:

1. **Hashtag Similarity (Weight: 3x)**
   - Tracks hashtags from previously liked tweets
   - Recommends tweets with matching hashtags
   - Higher preference scores for frequently liked hashtags

2. **Author Preference (Weight: 2x)**
   - Tracks authors whose tweets users have liked
   - Recommends tweets from preferred authors
   - Builds user taste profiles over time

3. **Engagement Boost (Weight: 0.5x)**
   - Promotes tweets with high like counts
   - Considers reply engagement
   - Uses logarithmic scaling to prevent outliers

4. **Recency Factor (Weight: 0.5x)**
   - Newer tweets get slight preference
   - Decays over one week period
   - Balances fresh content with relevance

#### **Fallback Strategy**:
- New users with no likes see popular tweets (sorted by engagement)
- Prevents cold start problem
- Encourages initial interaction

#### **Technical Implementation**:
- Real-time score calculation on each like action
- In-memory user preference tracking
- Optimistic UI updates for immediate feedback
- Automatic recommendation refresh on new interactions

### Usage Patterns

1. **Latest Feed**: All tweets sorted by recency with hashtag filtering
2. **For You Feed**: Personalized recommendations based on interaction history
3. **Seamless Switching**: Toggle between views with state preservation

## 🔧 Technical Decisions

### State Management

**Approach**: React useState with optimistic updates
- **Reasoning**: Simple application scope, no need for complex state management
- **Benefits**: Immediate UI feedback, automatic error handling

### Data Storage

**Approach**: In-memory JavaScript arrays
- **Reasoning**: Development/demo purpose, no persistence requirements
- **Trade-offs**: Data resets on server restart, not production-ready
- **Future**: Easy migration to database (PostgreSQL, MongoDB)

### Styling Strategy

**Approach**: Tailwind CSS with dark mode theme
- **Benefits**: Rapid development, consistent design system, small bundle size
- **Implementation**: Utility-first classes with component-level styling

### API Design

**Approach**: RESTful endpoints with Next.js API routes
- **Benefits**: Type-safe server code, easy deployment, familiar patterns
- **Structure**: Resource-based URLs with HTTP method semantics

## 🚧 Development Process

**Total Development Time: 70 minutes**

### Phase 1: Foundation (Initial Setup) - 10 minutes
- Next.js 15 project initialization
- TypeScript configuration
- Basic project structure

### Phase 2: Backend Development - 15 minutes
- REST API endpoint creation
- Data models and types
- In-memory data storage
- CRUD operations implementation

### Phase 3: Core UI Components - 20 minutes
- TweetCard component with nested replies
- TweetForm for creating tweets
- HashtagFilter for content filtering
- Basic styling with Tailwind CSS

### Phase 4: Advanced Features - 15 minutes
- Optimistic UI updates implementation
- Error handling and rollback mechanisms
- Hashtag extraction and filtering
- Relative time formatting

### Phase 5: Polish & Optimization - 10 minutes
- Dark mode theme implementation
- TypeScript error resolution
- ESLint configuration and fixes
- Performance optimizations

## 🐛 Challenges & Solutions

### Challenge 1: Nested Reply System
**Problem**: Complex state management for unlimited reply threading
**Solution**: Recursive component structure with helper functions for state updates

### Challenge 2: Optimistic UI Updates
**Problem**: Maintaining data consistency during async operations
**Solution**: Temporary IDs, rollback mechanisms, and proper error handling

### Challenge 3: TypeScript Compatibility
**Problem**: Next.js 15 async params breaking TypeScript compilation
**Solution**: Updated route handlers to properly await dynamic params

### Challenge 4: Server Action Warnings
**Problem**: Next.js warning about client component props
**Solution**: Proper client component structure for interactive UI elements

## 🔮 Future Enhancements

### Short-term Improvements
- [ ] User authentication and profiles
- [ ] Image/media upload support
- [ ] Tweet search functionality
- [ ] Real-time updates with WebSockets

### Long-term Features
- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] Advanced hashtag analytics
- [ ] User mentions and notifications
- [ ] Tweet scheduling
- [ ] Content moderation tools

### Performance Optimizations
- [ ] Infinite scroll for large datasets
- [ ] Image optimization and lazy loading
- [ ] Service Worker for offline support
- [ ] CDN integration for static assets

## 📝 AI-Assisted Development

This project was developed with assistance from Claude AI. For detailed AI usage documentation, see [AI_USAGE.md](AI_USAGE.md).

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

This is a demonstration project. For production use, consider:

1. **Database Integration**: Replace in-memory storage
2. **Authentication**: Implement user management
3. **Testing**: Add unit and integration tests
4. **Deployment**: Configure for production environment
5. **Monitoring**: Add error tracking and analytics

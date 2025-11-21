# Parlays for Days

**AI-Powered Sports Betting Analysis App**

---

## Overview

Parlays for Days is a mobile-first web application that provides comprehensive, AI-powered analysis for sports betting. Built with Next.js and powered by Claude AI, it helps users make informed betting decisions by analyzing team form, injuries, statistics, and historical data.

---

## Features

### Core Functionality
- 📊 **AI Match Analysis**: Deep dive into any match with AI-generated insights
- 🎯 **Smart Parlay Builder**: Build multi-match parlays with AI confidence ratings
- 📈 **Real-Time Odds**: Live odds from major sportsbooks
- 🏥 **Injury Reports**: Up-to-date player injury and suspension tracking
- 📋 **Betslip Management**: Save and organize your analysis for future reference
- 🤖 **AI Pick of the Day**: Daily curated recommendation

### Design Philosophy
- Mobile-first, responsive design
- Dark theme with professional aesthetic
- Fast, intuitive user experience
- No clutter, just actionable insights

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: React functional components with hooks

### Backend & Data
- **Database**: Supabase (PostgreSQL)
- **APIs**:
  - API-Football (live odds, match data, stats, injuries, form)
  - Claude API (AI analysis via Anthropic)

### Deployment
- **Hosting**: Vercel
- **Analytics**: (TBD)
- **Error Tracking**: (TBD)

---

## Project Structure
```
parlays-for-days/
├── designs/               # Design files and screenshots
│   ├── 01-home-default.png
│   ├── 02-home-tooltip.png
│   └── ...
│   └── component-library.png
├── docs/                  # Documentation
│   ├── design-system.md
│   ├── component-notes.md
│   └── README.md
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/              # Utilities and helpers
│   ├── styles/           # Global styles
│   └── types/            # TypeScript types
├── public/               # Static assets
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- API keys for:
  - API-Football (free tier: https://www.api-football.com/)
  - Claude API (Anthropic)
  - Supabase project

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/parlays-for-days.git

# Navigate to project
cd parlays-for-days

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file:
```env
# APIs
# Get your free API key from https://www.api-football.com/
API_FOOTBALL_KEY=your_api_football_key
ANTHROPIC_API_KEY=your_claude_api_key

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Design System

See [design-system.md](./design-system.md) for comprehensive design guidelines including:
- Color palette
- Typography
- Spacing system
- Component specifications
- Mobile interaction patterns

See [component-notes.md](./component-notes.md) for component behaviors and interactions.

---

## Development Workflow

### Running Locally
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Component Development
1. Check `component-library.png` for design reference
2. Build component following design-system.md specs
3. Test on mobile viewport (375px width)
4. Verify interactions match component-notes.md

---

## Key Components

### Navigation
- `BottomNav`: Fixed navigation bar (Home, Betslips, Profile)

### Cards
- `MatchCard`: Individual match with selection and analysis
- `ParlayCard`: AI-generated parlay recommendations

### Buttons
- `PrimaryButton`: Main actions with gradient
- `SecondaryButton`: Alternative actions
- `GhostButton`: Tertiary actions
- `FloatingButton`: Appears on multi-select

### Screens
- `HomePage`: Match list with filters
- `SingleMatchAnalysis`: Deep dive on one match
- `ParlayAnalysis`: Multi-match parlay breakdown
- `BetslipsLibrary`: Saved analyses

---

## API Integration

### API-Football
```typescript
// Fetch upcoming fixtures with odds
GET https://v3.football.api-sports.io/fixtures?league={leagueId}&from={date}&to={date}
GET https://v3.football.api-sports.io/odds?fixture={fixtureId}

// Get match statistics
GET https://v3.football.api-sports.io/fixtures/statistics
```

**Note**: API-Football free tier provides 100 requests per day. The app uses API-Football for both odds and match data.

### Claude API (Anthropic)
```typescript
// Generate AI analysis
POST https://api.anthropic.com/v1/messages
```

See `/lib/api/` for wrapper functions.

---

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables
Add all `.env.local` variables to Vercel project settings.

---

## Roadmap

### Phase 1: MVP (Current)
- [x] Design complete
- [ ] Home screen with match list
- [ ] Single match analysis
- [ ] Parlay analysis
- [ ] Betslips library
- [ ] Profile/settings
- [ ] API integration

### Phase 2: Enhancement
- [ ] User authentication
- [ ] Bet outcome tracking
- [ ] Win/loss analytics
- [ ] Push notifications
- [ ] Social sharing

### Phase 3: Expansion
- [ ] More sports (NFL, NBA)
- [ ] Live match tracking
- [ ] Advanced statistics
- [ ] Mobile apps (iOS, Android)

---

*Last updated: November 3, 2024*
# Parlays for Days - Component Behaviors & Notes

Last updated: November 3, 2024

---

## Overview

This document describes how components behave, interact, and handle user actions. Use this alongside design-system.md when building.

---

## Navigation

### Bottom Navigation Bar

**Behavior:**
- Always visible at bottom of screen (fixed position)
- Persists across all screens
- Active tab highlighted with blue color + indicator
- Tap switches between screens instantly (no loading)

**States:**
- **Home**: Match list view
- **Betslips**: Saved/active parlays library
- **Profile**: Settings and preferences

**Interaction:**
- Tap any tab to navigate
- Active tab shows blue icon + text
- Inactive tabs show gray
- No animation between tabs (instant switch)

**Implementation Notes:**
- Fixed bottom position (80px height + safe area)
- Z-index above content but below modals
- Should not scroll with content

---

## Cards

### Match Card

**Default State:**
- Gray border (1px, #334155)
- Checkbox unchecked
- All elements visible

**Selection Flow:**
1. User taps anywhere on card (entire card is tappable)
2. Checkbox animates to checked
3. Border changes to blue (2px, #0EA5E9)
4. Card scales to 98% momentarily (100ms)
5. Floating button appears when 2+ cards selected

**Analyze Button (P4Ds Logo):**
- Top-right corner of card
- 32px touchable area (44px minimum touch target)
- Tap navigates to Single Match Analysis screen
- Does NOT select the card
- Independent action from card selection

**Edge Cases:**
- User can select card AND analyze separately
- Analyze works even if card not selected
- Max selection: No limit (but recommend 5-7 for UX)

**Data Requirements:**
- Team names, logos
- Match time, league
- Current odds (home/away/draw)
- League icon

---

### Parlay Card (Recommendations)

**Types:**
1. **SAFEST PARLAY** (Green badge, high confidence 70%+)
2. **VALUE UPSET PARLAY** (Amber badge, medium confidence 40-60%)
3. **BTTS SPECIAL** (Blue badge, specialized bet type)
4. **CONSERVATIVE WIN** (Green badge, lowest odds, highest confidence)

**Structure:**
- Badge with type (top-left)
- Odds (top-right, large)
- Confidence percentage (below odds)
- List of bet legs with individual odds
- Combined odds (emphasized)
- "Why this works" reasoning (2-3 sentences)
- "Add to Betslip" button (full-width at bottom)

**Interactions:**
- Entire card is NOT tappable (only button is)
- "Add to Betslip" button adds parlay to saved betslips
- Can add multiple parlays to compare
- No visual change after adding (button doesn't disable)

**Button Behavior:**
- Tap "Add to Betslip"
- Show toast notification: "Added to Betslip ✓"
- Betslip tab badge updates with count
- User stays on current screen
- Can continue browsing

---

## Buttons

### Primary Buttons

**Visual Feedback:**
- **Tap down**: Scale to 98%, gradient darkens
- **Release**: Scale back to 100%, execute action
- **Duration**: 100ms transition

**Loading State:**
- Button text replaced with spinner
- Button still has gradient background
- Button disabled (not tappable)
- Spinner color: white

**Disabled State:**
- 40% opacity
- Not tappable
- No visual feedback on press
- Cursor: not-allowed (web only)

**Text Behavior:**
- Text should be concise: 1-3 words
- No text wrapping (single line)
- Truncate with ellipsis if too long

---

### Secondary Buttons

**Same behavior as primary but:**
- Solid background instead of gradient
- Slightly less emphasis visually

---

### Ghost Buttons

**Visual Feedback:**
- **Tap down**: Background appears (#1e293b), scale 98%
- **Release**: Background fades out, execute action

**Use Cases:**
- "Cancel" in modals
- "Close" in overlays
- "Skip" in onboarding

---

### Floating Button (Analyze Parlay)

**Appearance:**
- Appears when 2+ match cards selected
- Slides up from bottom (300ms animation)
- Positioned above bottom nav, with 16px gap
- Persists while scrolling

**Content:**
- Left side: "X matches selected" (dynamic count)
- Right side: "Analyze Parlay →" button (gradient)

**Interactions:**
- Tap button (not entire bar) to analyze
- Navigates to Parlay Analysis screen
- Passes selected match IDs to next screen
- Selection state persists if user goes back

**Dismissal:**
- Deselect all cards: Button slides down and disappears
- User navigates away: Button disappears
- User completes parlay analysis: Selection clears

---

## Interactive Elements

### Checkboxes (Match Selection)

**States:**
- Unchecked: Empty square, gray border
- Checked: Blue background, white checkmark
- Disabled: Gray, 40% opacity

**Behavior:**
- Tap checkbox to toggle
- Tap anywhere on card also toggles checkbox
- Animate check/uncheck (200ms)

---

### Toggle Switches

**Usage:**
- Odds format (American/Decimal)
- Notifications (On/Off)

**Behavior:**
- Tap to toggle instantly
- No confirmation needed
- Save preference to local storage
- Haptic feedback on toggle (mobile)

---

### Form Indicator (W/L/D Circles)

**Display:**
- Shows last 5 results (most recent on right)
- Green (W), Red (L), Gray (D)
- 24px circles, 4px spacing
- Left-to-right = oldest to newest

**Interaction:**
- Not tappable
- Static display only
- Tooltip on hover (web only): "Win vs Arsenal"

---

## Screens

### Home Screen

**Initial Load:**
1. Show loading state (spinner)
2. Fetch today's matches
3. Animate matches in (fade up, staggered 50ms)
4. Show tooltip on first load (pointing to P4Ds logo)

**Scroll Behavior:**
- Vertical scroll only
- Header (logo) sticks to top
- Filters stick below header
- Match cards scroll
- Bottom nav always visible

**Pull to Refresh:**
- Pull down from top
- Show loading indicator
- Refresh match data
- Odds updated in real-time

---

### Single Match Analysis

**Entry:**
- Tap P4Ds logo on match card
- Loading screen: "Analyzing matches..."
- Duration: 5-15 seconds (API call)
- Then show full analysis

**Content:**
- All sections expanded by default
- Scroll to see all information
- No back button needed (use system back)

**Sections:**
- League Position
- Recent Form
- Injuries & Suspensions
- Head-to-Head
- Key Stats
- Top Scorers
- Referee Info
- Fouls & Cards
- Advanced Stats

**Exit:**
- System back button returns to home
- Match card remains in same state (selected/unselected)

---

### Parlay Analysis

**Entry:**
- From floating "Analyze Parlay" button
- Loading screen: "Analyzing matches..."
- Duration: 10-30 seconds (multiple matches)
- Then show full parlay analysis

**Match Breakdown:**
- Collapsible sections (tap to expand/collapse)
- First match expanded by default
- Chevron indicates expand/collapse state
- Smooth animation (300ms)

**Recommendations:**
- All 4 parlay cards visible
- Scroll vertically to see all
- Can add multiple to betslips
- Each addition shows toast notification

**Upset Alerts:**
- Yellow/Red badges
- Highlight high-risk, high-reward bets
- Optional to consider

**Top Individual Bets:**
- For users who don't want parlays
- Single bet recommendations
- Tap to add to betslip (future feature)

---

### Betslips Library

**Tabs:**
- **Active**: Upcoming matches, bets not yet placed
- **Saved**: Past analyses, historical parlays

**Filter Behavior:**
- Tap tab to switch instantly
- Content updates with fade transition (200ms)
- Empty state if no betslips in that category

**Betslip Cards:**
- Show parlay name, teams, odds, confidence
- Tap card to view full details (future)
- Swipe to delete (future)
- Actions: View, Share, Delete

**Empty State:**
- Shows when no betslips in selected tab
- Icon, text, button to analyze matches
- Button navigates to home screen

---

### Profile/Settings

**Sections:**
- Settings (odds format, notifications)
- Help & Support (FAQ, contact, about)
- Footer (version number)

**Settings Changes:**
- Toggle switches save immediately
- No "Save" button needed
- Changes reflected app-wide instantly

**Navigation:**
- Tap row with chevron to go to detail screen
- Back button returns to profile

---

## Loading States

**When to Show:**
- Initial app load
- Analyzing matches (single or parlay)
- Fetching odds data
- Saving betslip

**What to Show:**
- Centered spinner (32px, blue)
- Text below: "Analyzing matches..."
- Dark background
- Bottom nav still visible

**Duration:**
- Target: <5 seconds for single match
- Target: <15 seconds for parlay
- Show timeout error after 30 seconds

---

## Error States

**When to Show:**
- Network failure
- API timeout
- No matches available
- Invalid data

**Structure:**
- Warning icon (⚠️, red, 48px)
- Clear error message
- Actionable guidance
- "Retry" button (primary)
- "Close" button (ghost) optional

**Error Messages:**
- "Unable to load matches" + "Check your connection"
- "Something went wrong" + "We're looking into it"
- "No matches available" + "Check back soon"

**User Actions:**
- Retry: Attempt action again
- Close: Return to previous screen
- Contact Support: Open support (future)

---

## Empty States

**Variations:**

**No Betslips:**
- Icon: 📋 (48px, gray)
- Text: "No saved parlays"
- Subtext: "Analyze matches to save your first parlay"
- Button: "Analyze Matches" → Home screen

**No Search Results:**
- Icon: 🔍 (48px, gray)
- Text: "No matches found"
- Subtext: "Try different filters"
- Button: "Clear Filters"

**No Matches Today:**
- Icon: 📅 (48px, gray)
- Text: "No matches today"
- Subtext: "Check back tomorrow"
- Button: "View Upcoming"

---

## Tooltips & Onboarding

### First Load Tooltip

**Trigger:**
- First time user opens app
- Stored in localStorage: "tooltipSeen"

**Behavior:**
1. App loads normally
2. After 500ms delay, tooltip appears
3. Points to P4Ds logo on first match card
4. Text: "Tap for AI analysis"
5. Auto-dismisses after 3 seconds
6. OR user taps anywhere to dismiss
7. Never shows again

**Visual:**
- White background
- Black text (14px)
- Blue arrow pointing to logo
- Subtle shadow
- Rounded corners (8px)

---

### Onboarding (Optional Future)

**Screens:**
1. Welcome: App name, tagline, continue
2. How it works: Tap logo for analysis
3. Get started: Navigate to home

**Behavior:**
- Skippable at any point
- Only shows once
- Stored in localStorage: "onboardingComplete"

---

## Data Updates

### Real-Time Odds

**Update Frequency:**
- Poll API every 30 seconds when app is open
- Only update changed odds
- Show subtle flash animation on change

**Visual Indicator:**
- Odds briefly flash blue when updated
- No intrusive notifications

---

### Live Match Updates

**During Match:**
- Show "LIVE" badge on card
- Update score in real-time
- Red pulsing indicator

**Post-Match:**
- Show final score
- Mark betslip as "Completed" (if outcome tracking added)

---

## Animations

### Card Selection
```
Duration: 200ms
Easing: ease-out
Effect: Border color change + scale 98%
```

### Screen Transitions
```
Duration: 300ms
Easing: ease-in-out
Effect: Fade or slide
```

### Tooltip Appearance
```
Duration: 300ms
Easing: ease-out
Effect: Fade in + slide up slightly
```

### Button Press
```
Duration: 100ms
Easing: ease
Effect: Scale 98%
```

### Toast Notifications
```
Duration: 250ms in, 2000ms visible, 250ms out
Easing: ease-in-out
Effect: Slide up from bottom
```

---

## Persistence & Storage

### Local Storage
- Tooltip seen: Boolean
- Onboarding complete: Boolean
- Odds format preference: "american" | "decimal"
- Notifications enabled: Boolean
- Selected matches: Array of match IDs (cleared on parlay analysis)

### Database (Supabase)
- Saved betslips
- User preferences (if authenticated)
- Analysis history

---

## API Integration Notes

### The Odds API
- Endpoint: Get today's matches by sport/league
- Rate limit: 500 requests/month (free tier)
- Poll frequency: Every 30 seconds when app open
- Cache: 30 seconds

### API-Football
- Endpoint: Match details, stats, injuries
- Used for: Form data, H2H, injuries, standings
- Rate limit: Based on plan
- Cache: Match data (1 hour), injuries (15 min)

### Claude API (AI Analysis)
- Trigger: User taps analyze
- Input: Match data + context
- Output: JSON with analysis
- Average duration: 5-10 seconds
- Cost: ~$0.01-0.03 per analysis

---

## Error Handling

### Network Errors
- Show error state with retry
- Log to error tracking (future: Sentry)
- Provide fallback: cached data if available

### API Rate Limits
- Show user-friendly message: "Too many requests, try again soon"
- Implement exponential backoff

### Invalid Data
- Validate all API responses
- Show error if data malformed
- Log to error tracking

---

## Performance Considerations

### Image Loading
- Lazy load team logos
- Use CDN for logos (API-Football CDN)
- Fallback: Show team initials if logo fails

### Data Fetching
- Fetch today's matches on app open
- Cache for 30 seconds
- Pagination if >20 matches

### Analysis Generation
- Show loading state during API call
- Don't block UI
- Allow user to navigate away (cancel in background)

---

## Accessibility (Future Considerations)

### Screen Readers
- All buttons have labels
- Images have alt text
- Cards have accessible names

### Text Scaling
- Support iOS dynamic type
- Test at 200% scale

### Color Blindness
- Don't rely solely on color (use icons + text)
- W/L/D: Green/Red/Gray + letters

---

## Future Features (Not in MVP)

- User authentication
- Bet outcome tracking
- Win/loss statistics
- Bet history analytics
- Social sharing with friends
- Push notifications for lineup news
- Live match tracking
- More sports (NFL, NBA, etc.)
- Dark/light theme toggle
- Multiple language support

---

*This is a living document. Update as components are built and behaviors are refined.*
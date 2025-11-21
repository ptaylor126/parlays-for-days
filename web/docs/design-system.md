# Parlays for Days - Design System

Last updated: November 3, 2024

---

## Overview

Parlays for Days is a mobile-first sports betting analysis app with a dark, professional aesthetic emphasizing AI-powered insights. This design system ensures consistency across all screens and components.

---

## Colors

### Primary Palette
- **Primary Blue**: `#0EA5E9` - Main brand color, CTAs
- **Deep Blue**: `#3b82f6` - Gradient endpoint, depth
- **Background**: `#0f172a` - App background (dark navy)
- **Card Background**: `#1e293b` - Card surfaces (dark slate)
- **Card Selected**: `#1e3a5f` - Selected state (lighter slate with blue tint)

### Text Colors
- **Primary Text**: `#ffffff` - Headings, main content
- **Secondary Text**: `#94a3b8` - Subtext, labels, descriptions
- **Tertiary Text**: `#64748b` - Subtle text, disabled states

### Semantic Colors
- **Success (Win)**: `#22c55e` - Green for wins, positive actions
- **Warning (Alert)**: `#f59e0b` - Amber for warnings, upsets
- **Error (Loss)**: `#ef4444` - Red for losses, destructive actions
- **Info**: `#0EA5E9` - Blue for informational elements

### Gradients
- **Primary Button Gradient**: 
  - Angle: 135deg (diagonal)
  - Start: `#0EA5E9`
  - End: `#3b82f6`
- **Pressed State**: Darker gradient
  - Start: `#0284c7`
  - End: `#2563eb`

### Border Colors
- **Default**: `#334155` - Subtle borders
- **Selected**: `#0EA5E9` - Active/selected state
- **Focus**: `#0EA5E9` - Input focus

---

## Typography

### Font Family
- **Primary**: SF Pro Display (iOS native)
- **Fallback**: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui

### Font Sizes & Weights

#### Headings
- **H1 (Screen Titles)**: 24px, Bold (700), White
- **H2 (Section Headers)**: 18px, Bold (700), White  
- **H3 (Card Titles)**: 16px, Bold (700), White

#### Body Text
- **Body Large**: 16px, Regular (400), White
- **Body Medium**: 16px, Medium (500), White
- **Body Small**: 14px, Regular (400), Gray (#94a3b8)

#### UI Elements
- **Button Text**: 16px (large), 14px (medium), Bold (700)
- **Badge Text**: 12px, Medium (500)
- **Caption**: 12px, Regular (400), Gray (#64748b)
- **Tiny**: 10px, Regular (400), Gray (#64748b)

### Line Height
- **Headings**: 1.2 (tight)
- **Body**: 1.5 (comfortable reading)
- **UI Elements**: 1.0 (compact)

---

## Spacing System

### Base Unit: 4px

#### Standard Spacing
- **4px** (xs): Tight spacing, badges
- **8px** (sm): Element spacing within components
- **12px** (md): Between related elements
- **16px** (lg): Component padding, screen margins
- **24px** (xl): Section spacing
- **32px** (2xl): Major section breaks
- **48px** (3xl): Large gutters

#### Specific Uses
- **Screen Padding**: 16px horizontal
- **Card Padding**: 16px all sides
- **Card Margin**: 12px between cards
- **Button Padding**: 16px horizontal, 12px vertical
- **Section Spacing**: 24px between major sections

---

## Border Radius

### Standard Radii
- **Small**: 6px - Badges, tiny elements
- **Medium**: 8px - Buttons (secondary)
- **Large**: 12px - Cards, primary buttons
- **Pill**: 20px - Compact buttons, pills
- **Circle**: 50% - Icons, avatars

---

## Shadows

### Elevation Levels
- **None**: Most cards (flat design)
- **Subtle**: `0 2px 8px rgba(0, 0, 0, 0.1)` - Floating elements
- **Medium**: `0 4px 12px rgba(14, 165, 233, 0.3)` - Primary buttons
- **Strong**: `0 8px 24px rgba(0, 0, 0, 0.2)` - Modals, overlays

---

## Components

### Bottom Navigation

**Specifications:**
- Height: 80px
- Background: `#0f172a` (matches app background)
- Border top: 1px solid `#334155`
- 3 tabs: Home, Betslips, Profile
- Icon size: 24px
- Text: 12px, Medium

**States:**
- **Active**: Blue icon (`#0EA5E9`) + Blue text + Blue indicator
- **Inactive**: Gray icon (`#64748b`) + Gray text

---

### Match Card

**Specifications:**
- Background: `#1e293b`
- Border radius: 12px
- Padding: 16px
- Height: Auto (min 120px)

**Elements:**
- Checkbox: 20px, top-left
- League icon: 24px, left of time
- Time badge: Center-top
- Team logos: 32px
- Analyze button (P4Ds logo): 32px, top-right
- Odds: 16px, right-aligned

**States:**
- **Default**: `#334155` border (1px)
- **Selected**: `#0EA5E9` border (2px), checkbox checked
- **Pressed**: Scale 98%, transition 100ms

---

### Parlay Card

**Specifications:**
- Background: `#1e293b`
- Border radius: 12px
- Padding: 16px
- Margin: 12px between cards

**Variants:**
- 🟢 **SAFEST PARLAY**: Green badge (`#22c55e`)
- 🟡 **VALUE UPSET PARLAY**: Amber badge (`#f59e0b`)
- 🔵 **BTTS SPECIAL**: Blue badge (`#0EA5E9`)
- 🟢 **CONSERVATIVE WIN**: Green badge (`#22c55e`)

**Elements:**
- Badge: Top-left, 12px text
- Odds: Top-right, large (24px)
- Confidence: Below odds, 14px
- Bet legs: 16px, with odds right-aligned
- "Why this works": 14px, gray text
- Button: Full-width at bottom

---

### Buttons

#### Primary Buttons (Gradient)
**Background:**
- Gradient: 135deg, `#0EA5E9` → `#3b82f6`
- Text: White, Bold
- Shadow: `0 4px 12px rgba(14, 165, 233, 0.3)`

**Sizes:**
- **Large**: 48px height, 100% width, 12px radius
- **Medium**: 44px height, 280px width, 12px radius  
- **Compact**: 40px height, auto width, 20px radius (pill)

**States:**
- **Pressed**: Darker gradient + scale 98%
- **Disabled**: 40% opacity, not clickable

**Use Cases:**
- Large: "Analyze matches", "Get Started"
- Medium: "Analyze Parlay"
- Compact: Floating button with icon

---

#### Secondary Buttons (Solid)
**Background:**
- Solid: `#334155`
- Text: White, Medium (500)
- No shadow

**Sizes:**
- Same as primary (48px, 44px, 40px)

**States:**
- **Pressed**: `#475569` + scale 98%
- **Disabled**: 40% opacity

**Use Cases:**
- "Add to Betslip", "Save", alternative actions

---

#### Ghost Buttons (Transparent)
**Background:**
- Transparent
- Text: Gray (`#94a3b8`), Medium
- Border: Optional 1px `#475569`

**States:**
- **Pressed**: Background `#1e293b`, scale 98%

**Use Cases:**
- "Cancel", "Close", "Skip"

---

#### Destructive Buttons (Red)
**Background:**
- Solid: `#ef4444`
- Text: White, Bold
- No shadow

**States:**
- **Pressed**: `#dc2626` + scale 98%

**Use Cases:**
- "Delete Betslip", "Remove", dangerous actions

---

### Form Indicator (W/L/D Circles)

**Specifications:**
- Size: 24px diameter circles
- Spacing: 4px between circles
- Shows last 5 results

**Colors:**
- **Win**: `#22c55e` (green)
- **Loss**: `#ef4444` (red)
- **Draw**: `#64748b` (gray)

---

### Badges

#### Confidence Badge
- Background: `#0EA5E9` (40% opacity)
- Text: White, 12px, Medium
- Padding: 6px 12px
- Radius: 6px
- Icon: 🤖 (optional)

#### Odds Badge
- Background: Transparent
- Text: `#0EA5E9` (positive) or `#ef4444` (negative)
- Font: 16px, Medium
- Format: American (+200, -150)

---

### Floating Button

**Specifications:**
- Position: Fixed bottom, 16px from bottom nav
- Width: Calc(100% - 32px)
- Height: 56px
- Background: `#1e293b`
- Border: 1px solid `#0EA5E9`
- Shadow: `0 8px 24px rgba(0, 0, 0, 0.3)`

**Content:**
- Left: "X matches selected" (14px, gray)
- Right: "Analyze Parlay →" button (gradient, compact)

---

## Mobile-Specific Considerations

### Touch Targets
- Minimum: 44px × 44px
- Preferred: 48px × 48px
- Spacing between targets: 8px minimum

### States (No Hover!)
- **Default**: Normal appearance
- **Pressed**: Scale 98%, darker color, 100ms transition
- **Disabled**: 40% opacity, not tappable
- **Loading**: Spinner replaces content

### Safe Areas
- Respect top safe area (notch/island)
- Bottom nav: 80px + safe area inset
- Screen padding: 16px sides

### Gestures
- Tap: Primary interaction
- Long press: Optional secondary actions
- Swipe: For dismissing cards/modals (future)

---

## Animations & Transitions

### Button Interactions
```css
button:active {
  transform: scale(0.98);
  transition: transform 100ms ease;
}
```

### Card Selection
```css
.card-selected {
  border-color: #0EA5E9;
  transition: border-color 200ms ease;
}
```

### Tooltip Appearance
```css
.tooltip {
  opacity: 0;
  animation: fadeIn 300ms ease forwards;
}
```

### Screen Transitions
- Duration: 200-300ms
- Easing: ease-in-out
- Type: Slide or fade

---

## Accessibility

### Contrast Ratios
- White on dark navy: 15.5:1 (AAA)
- Gray text on dark navy: 7:1 (AA)
- Blue on dark navy: 8.5:1 (AAA)

### Text Sizing
- Minimum body text: 14px
- Minimum button text: 14px
- Important info: 16px+

### Touch Targets
- All interactive elements: 44px minimum
- Clear tap states with scale feedback

---

## Grid & Layout

### Mobile Grid
- Columns: 1 (single column layout)
- Margins: 16px left/right
- Gutters: 12px between cards

### Vertical Rhythm
- Base: 8px
- Major sections: 24px spacing
- Card stacks: 12px spacing

---

## Icons

### Sizes
- Small: 16px (inline with text)
- Medium: 24px (nav, headers)
- Large: 32px (features, logos)

### Style
- Line icons preferred
- 2px stroke weight
- Rounded corners
- Color matches context

### Sources
- System icons (SF Symbols on iOS)
- Custom P4Ds logo
- League logos (32px)
- Team logos (32px-48px)

---

## Loading States

### Spinner
- Size: 32px
- Color: `#0EA5E9`
- Animation: Smooth rotation
- Text below: "Analyzing matches..." (14px, gray)

### Skeleton Screens
- Background: `#1e293b`
- Shimmer: `#334155` → `#475569`
- Animation: 1.5s ease-in-out infinite

---

## Empty States

### Structure
- Icon: 48px, gray
- Heading: 18px, bold, white
- Subtext: 14px, regular, gray
- Button: Primary/large
- Centered vertically and horizontally

### Icons
- 📋 Empty clipboard: No betslips
- ⚠️ Warning: Error states
- 🔍 Magnifying glass: No results

---

## Error States

### Structure
- Icon: ⚠️ (red, 48px)
- Heading: "Unable to load matches"
- Subtext: "Check your connection..."
- Primary button: "Retry"
- Ghost button: "Close"

### Tone
- Calm, not alarming
- Clear, actionable guidance
- No technical jargon

---

## Data Formats

### Odds Display
- American format default: +200, -150
- Toggle to Decimal: 2.50, 1.67
- Always prefixed with + or -

### Time Display
- Match time: "TODAY 15:00", "Tomorrow 18:30"
- Saved time: "Oct 30, 3:42 PM"
- Relative: "2 hours ago"

### Confidence Levels
- Display as percentage: 72%
- Color coded: >70% green, 50-70% blue, <50% amber

---

## Platform-Specific Notes

### iOS
- Use SF Pro font (native)
- Respect safe areas (notch, home indicator)
- Native share sheet for sharing
- Haptic feedback on button press

### Android
- Use Roboto font (fallback)
- Material ripple effect on press
- Android share sheet
- Material motion principles

### Web (Future)
- Responsive: 320px minimum
- Desktop: Max width 480px, centered
- Mouse: Add hover states
- Keyboard: Focus indicators

---

## File Organization

### Design Files
```
/designs
  ├── 01-home-default.png
  ├── 02-home-tooltip.png
  ├── 03-home-selected.png
  ├── 04-single-match-analysis.png
  ├── 05-parlay-analysis.png
  ├── 06-betslips-active.png
  ├── 07-betslips-saved.png
  ├── 08-betslips-empty.png
  ├── 09-loading.png
  ├── 10-error.png
  ├── 11-profile.png
  └── 12-component-library.png
```

---

## Version History

- **v1.0** (Nov 3, 2024): Initial design system
- Based on comprehensive design work in Figma
- Mobile-first approach
- Dark theme with blue accents
- AI-powered betting analysis focus

---

## References

- Component library: `component-library.png`
- Figma file: [Link to your Figma]
- Brand colors derived from: Electric blue (#0EA5E9)
- Inspiration: FanDuel, DraftKings, but distinctively AI-focused

---

*This design system is a living document. Update as the product evolves.*
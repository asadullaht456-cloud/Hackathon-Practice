---
name: Lahore Urban Mobility
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#41493d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#717a6b'
  outline-variant: '#c0c9b9'
  surface-tint: '#266c20'
  primary: '#20671b'
  on-primary: '#ffffff'
  primary-container: '#3b8132'
  on-primary-container: '#eaffdf'
  inverse-primary: '#8ed97e'
  secondary: '#005faf'
  on-secondary: '#ffffff'
  secondary-container: '#54a0fe'
  on-secondary-container: '#003567'
  tertiary: '#8f4600'
  on-tertiary: '#ffffff'
  tertiary-container: '#b45900'
  on-tertiary-container: '#fff7f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a9f697'
  primary-fixed-dim: '#8ed97e'
  on-primary-fixed: '#002201'
  on-primary-fixed-variant: '#055307'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a5c8ff'
  on-secondary-fixed: '#001c3a'
  on-secondary-fixed-variant: '#004786'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311300'
  on-tertiary-fixed-variant: '#723600'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '800'
    lineHeight: 12px
    letterSpacing: 0.06em
  transit-countdown:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 32px
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system powers a high-velocity civic transit utility engineered for commuters navigating Lahore's multimodal public transport ecosystem. Designed to function effortlessly in intense outdoor sun at high noon at an elevated Metrobus station, packed feeder buses, and low-light night departures, the UI prioritizes rapid-scan legibility, zero-latency interactions, and immediate spatial clarity.

The aesthetic philosophy draws inspiration from leading global urban mobility tools (Citymapper, Transit app) while anchoring deeply in Lahore’s municipal transportation iconography: the authoritative green of the national transport authority, the iconic red BRT corridors, the fiery energetic Orange Line Metro Train, and the municipal blue Speedo feeder fleet. 

Visual characteristics balance contemporary digital utility with physical transit wayfinding:
- **Instant Glanceability:** Heavy visual contrast, bold informational wayfinding tokens, and zero decorative fluff ensure information can be digested mid-stride in under two seconds.
- **Physical Lineage:** Visual badges, stop noodles, and line indicators replicate physical station signage, reducing cognitive translation between mobile screen and physical station kiosks.
- **Micro-Elevation & Clean Edge Framing:** Surface elevations avoid murky blur washes, relying instead on clean slate containers, crisp hairline dividers, and high-visibility physical-touch tactile surfaces.

## Colors

The color system is explicitly partitioned into structural system tokens and authoritative transit line identifiers. Line colors must never be repurposed for generic status or decoration—they serve purely as visual anchors for infrastructure routes.

### Primary & System Tokens
- **Transit Green (`#3b8132`):** Primary action color, system confirmations, valid card validations, on-time indicators, and main navigation targets.
- **Background Slate (`#f8fafc`):** Clean, glare-reducing light background that separates cards effortlessly without causing eye strain.
- **Surface Pure (`#ffffff`):** Card foregrounds, transit sheets, and bottom navigation modules.
- **Dark Slate Ground (`#0f172a`):** Base canvas for dark mode and midnight commute themes.
- **Neutral Slate Text (`#0f172a` primary, `#475569` secondary, `#94a3b8` muted):** Strictly tuned against WCAG AAA standards for ambient sunlight readability.

### Transit Line Badges & Wayfinding Channels
- **Metrobus BRT Red (`#E53935`):** Reserved exclusively for the Green Line / Ferozepur-Gajju Mata BRT spine.
- **Orange Line Train (`#F57C00`):** Reserved for OLMT (Ali Town to Dera Gujran) rail tracking and transfer points.
- **Speedo Feeder Bus (`#1976D2`):** Applied to municipal feeder network routes, bus stop pill tags, and connecting route branches.
- **Student Zero-Fare Purple (`#8E24AA`):** Dedicated pass status badge, subsidy verification banners, and educational concession identifiers.

### Outdoor Sunlight Mode Rules
When the ambient light sensor triggers high-contrast mode, surface tints flatten to absolute `#ffffff`, text forces to pitch `#000000`, and all card containers drop ambient elevation in favor of a crisp 2px solid `#000000` stroke with route badges rendering at 100% saturation.

## Typography

Plus Jakarta Sans brings geometric structural balance paired with humanist warmth, providing wide apertures that prevent letterform collapse at micro-sizes or under sunlight refraction.

### Hierarchical Roles
- **Transit Countdown (`transit-countdown`):** Used specifically for ETA displays (e.g., "2 min", "14:20"). Employs tabular numeric figures to ensure ticking times do not trigger horizontal reflows.
- **Station / Node Headlines (`headline-md`, `headline-lg`):** Strong, tight tracking for terminal stations (e.g., "Anarkali", "Shahdara", "MAO College").
- **Wayfinding & Route Badges (`label-sm`, `label-md`):** Strict uppercase formatting with open letter-spacing (+0.04em to +0.06em) for route pills (e.g., "FR-01", "METRO-1", "OLMT").
- **Body & Secondary Station Indicators (`body-md`, `body-sm`):** Optimized for platform instructions, transfer walk times, and crowd density warnings.

## Layout & Spacing

Designed fundamentally around single-handed thumb-zone accessibility on mobile devices. The structure employs a fluid column layout anchored by safe bottom sheets, continuous map viewports, and stacked transit cards.

### Spacing Principles
- **Base Rhythm:** Built on a tight 4px / 8px incremental scale.
- **Horizontal Screen Padding (`margin`):** Fixed 16px (`1rem`) on standard viewports, expanding to 20px on larger mobile flagships.
- **Component Breathing Space (`space-md`, `space-lg`):** Transit list rows maintain a minimum 56px touch target height with 12px internal vertical padding to ensure rapid selection on bumpy commutes.
- **Bottom Sheet Clearance:** Live tracking panels pin to the viewport bottom with 16px floating margins or dynamic safe-area-inset docking, preventing overlap with native operating system navigation gestures.

## Elevation & Depth

Rather than heavy, blurred shadows that disappear or smudge in bright outdoor lighting, the design system utilizes micro-elevations combining faint surface-container separation with precise, low-opacity directional rim borders.

- **Level 0 (Flat Canvas):** Used for base interactive maps and system utility surfaces (`#f8fafc`).
- **Level 1 (Docked Transit Cards):** `#ffffff` background with a subtle border stroke `1px solid rgba(15, 23, 42, 0.08)` and micro-drop `box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Active Route / Floating Direction Pill):** Raised action element. `box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modal Bottom Sheets / Urgent Route Alerts):** `box-shadow: 0 12px 28px -4px rgba(15, 23, 42, 0.16)`.
- **Sunlight Override:** All shadows drop completely to `none`. Surfaces rely on `2px solid #0f172a` boundary strokes to maintain structural isolation under direct sunlight.

## Shapes

The geometric signature uses friendly, modern, accessible curves calibrated to a 16px base radius (`rounded-2xl` / standard roundedness scale 2).

- **Transit Route Cards & Sheet Drawers:** 16px corner radii provide a smooth, tactile card feel that matches contemporary mobile device chassis curves.
- **Route Number Badges (Line Pills):** Full pill (`9999px`) rounded geometry for bus, metro, and feeder numbers, creating an unmistakable distinction between route tags and rectangular station cards.
- **Action Buttons & Input Search Bars:** 12px to 14px subtle inner rounding, keeping them distinct from full-round route pills.

## Components

### Route Badges & Transit Pills
High-contrast colored tokens featuring solid fills for primary identifiers:
- **BRT Red Pill:** `#E53935` background, white text. Bold, condensed numeral tracking.
- **Orange Line Pill:** `#F57C00` background, white text. Train car glyph prefix.
- **Speedo Feeder Pill:** `#1976D2` background, white text. Feeder bus route indicator (e.g., "FR-12").
- **Zero-Fare Student Badge:** Royal Purple (`#8E24AA`) with high-contrast badge text "STUDENT PASS".

### Live Transit List Rows
Composed of four distinct horizontal zones:
1. **Left Zone:** Route badge pill stacked with transport vehicle icon.
2. **Center Zone:** Primary destination station name in `headline-sm`, subtitle with platform info and intermediate stop count in `body-sm`.
3. **Right Zone:** Live departure ETA in `transit-countdown`, color-coded (`#3b8132` for approaching / on-time, `#E53935` for delay).
4. **Live Signal Indicator:** A pulsating 8px dot adjacent to the ETA denoting real-time GPS telemetry from the bus/train unit.

### Buttons & Quick Actions
- **Primary ("Chalo" / Start Journey):** Pakistan Transit Green (`#3b8132`) background, crisp white text, 14px bold, 48px height, 12px rounded corners. Active state reduces brightness by 10% with a haptic click.
- **Secondary (Transfer Options):** White surface container, `1.5px solid #cbd5e1` outline, dark slate typography.
- **Emergency / Delay Flag:** Outlined red badge with alert triangle for service disruptions along the corridor.

### Input Fields (Station & Journey Search)
- 52px height, white background, framed with `1.5px solid #e2e8f0`. Focus state shifts outline to `#3b8132` with a 3px outer glow ring of `rgba(59, 129, 50, 0.15)`.
- Clear, physical departure (`A`) and arrival (`B`) iconography with connected dotted transit line noodles between inputs.

### Transit Route Noodles
Vertical connection lines (3px width) in transit maps and stop itineraries:
- Completed stops render in muted `#94a3b8`.
- Current location renders as an active pulsing white node inside a line-colored border ring.
- Upcoming stops take on the full saturation of that specific transit line color (Orange, Red, or Speedo Blue).
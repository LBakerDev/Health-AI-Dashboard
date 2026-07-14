# Visual System

The MVP1 UI uses a restrained Apple-inspired glass language: translucent controls and navigation, readable metric surfaces, tactile motion, and clear trend signaling.

## Principles

- Use glass for controls, navigation, insight cards, and important tiles.
- Keep dense metric areas readable with stronger surfaces.
- Avoid stacking glass panels inside glass panels unless the inner layer is a small control.
- Pair blur with contrast. If text sits on glass, use a stronger surface or muted background.
- Motion should feel tactile: small translate/scale changes, never large page theatrics.
- Respect `prefers-reduced-motion`.
- Use signal color semantically: green good, coral bad, neutral gray, cyan/cardio, amber attention.

## Core Files

```text
src/styles/tokens.css       color, radius, shadow, glass, motion tokens
src/styles/base.css         reset, font, focus, accessibility defaults
src/styles/components.css   shared primitive class styles
src/shared/theme/           light/dark/system theme provider
src/shared/ui/              reusable React UI primitives
```

## Shared Primitives

Use these before creating one-off UI:

```ts
import { Button, GlassSurface, SegmentedControl, TrendBadge } from '@shared/ui';
```

- `GlassSurface`: cards, panels, insight containers, module tiles.
- `Button`: tactile actions, icon buttons, import/navigation commands.
- `SegmentedControl`: week/range filters and dashboard mode controls.
- `TrendBadge`: good/bad/neutral trend chips tied to `TrendSignal`.

## Theme

`ThemeProvider` lives in `AppProviders` and writes the resolved theme to:

```html
<html data-theme="light"></html>
```

Modes:

- `system`
- `light`
- `dark`

The dashboard should default to system preference and expose a manual toggle once the real shell is built.

## Mobile Web Rules

- Tap targets should be at least 44px tall.
- Use safe-area env vars for top/bottom padding.
- Keep fixed or sticky glass light on blur for smoother phone scrolling.
- Design notification landing states as direct routes into the relevant insight or week summary.

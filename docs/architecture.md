# Frontend Architecture

The app uses a lightweight feature-sliced structure. The goal is to keep MVP1 fast while making the codebase easy to extend into parser integration, richer health modules, PWA behavior, and AI narration.

## Source Layout

```text
src/
  app/                 App composition, providers, routing, app-level setup
  pages/               Route/page compositions built from features and entities
  features/            User workflows such as weekly summary, import, cardio detail
  entities/            Reusable domain concepts such as health metrics
  data/                Mock data, parser-facing adapters, static fixtures
  shared/              Generic UI, hooks, utilities, config, and cross-cutting types
  styles/              Global CSS and design tokens
```

## Import Direction

Keep dependencies flowing downward:

```text
app -> pages -> features -> entities -> shared
data -> entities/shared
```

Rules:

- `app` may compose anything.
- `pages` assemble features, entities, and shared UI.
- `features` own workflow-specific state, UI, and actions.
- `entities` own reusable health-domain types and display logic.
- `shared` must stay product-agnostic.
- Avoid importing one feature from another feature. Lift shared domain code into `entities` or generic code into `shared`.

## Folder Conventions

Feature and entity folders can use these subfolders as needed:

```text
model/      Types, selectors, stores, domain calculations
ui/         React components owned by the slice
lib/        Slice-specific helpers
api/        Data access or adapter calls, when needed
```

Each slice exposes its public API from `index.ts`. Import from the slice root instead of reaching into internals:

```ts
import { WeeklySummaryCard } from '@features/weekly-summary';
```

## Path Aliases

Use aliases for cross-layer imports:

```text
@app/*
@pages/*
@features/*
@entities/*
@data/*
@shared/*
@styles/*
```

Relative imports are fine within the same slice.

## MVP1 Boundaries

MVP1 should ship:

- Weekly Summary home view
- Cardio Fitness detail view
- sample-data-first experience
- local import and loading states
- typed data contract for parser output

Keep these out of MVP1 implementation unless explicitly pulled forward:

- real AI calls
- push notifications
- Health Auto Export bridge
- Fat-Loss detail
- Recovery detail

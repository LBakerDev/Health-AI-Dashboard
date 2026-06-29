# Health AI Dashboard

Local-first Apple Health dashboard for checking whether conditioning is improving and fat-loss progress is on track.

## MVP 1

- React + TypeScript static web app
- Sample-data-first Weekly Summary
- Cardio Fitness detail view
- Local import/loading states for Apple Health export flow
- Typed data contract for parser output and AI insight narration

## Architecture

The frontend uses a lightweight feature-sliced structure:

- `src/app` for app composition and providers
- `src/pages` for route/page assembly
- `src/features` for user workflows
- `src/entities` for reusable health-domain concepts
- `src/data` for mock data and parser-facing adapters
- `src/shared` for generic UI, hooks, utilities, config, and cross-cutting types
- `src/styles` for global CSS and design tokens

See [docs/architecture.md](docs/architecture.md) for import rules and conventions.

## Scripts

- `npm run dev` starts the local app on `127.0.0.1:4173`
- `npm run build` type-checks and builds production assets
- `npm run lint` runs ESLint
- `npm run test` runs Vitest

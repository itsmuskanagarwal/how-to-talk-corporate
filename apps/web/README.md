# @professional-message-writer/web

The Next.js 14 App Router web client for Professional Message Writer.

## Develop

```bash
pnpm --filter @professional-message-writer/web dev
```

Open http://localhost:3000.

## Phase ownership

- **P2** — Web App UI (this package). Tone presets, rewrite UI, usage counter, 429 state, accessibility audit.
- The agent pipeline lives in [`packages/agents`](../../packages/agents).
- The browser extension shares the same agents via the workspace dependency `@professional-message-writer/agents`.

## Environment

Copy `.env.example` to `.env.local` and fill in keys before running `dev`.

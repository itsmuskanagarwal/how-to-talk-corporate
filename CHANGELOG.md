# Changelog

## 0.1.0 — 2026-05-09

### P0 — Research & Architecture

- Monorepo scaffold: pnpm workspaces, strict TypeScript, ESLint + Prettier
- Next.js 14 App Router (apps/web) and Plasmo extension shell (apps/extension)
- Shared `@professional-message-writer/agents` package with full type contract and stubs for all modules
- GitHub Actions: lint → typecheck → test → build + Vercel deploy workflow
- docs/ARCHITECTURE.md with system design, pipeline contract, and phase gates

### P1 — Core Agent Pipeline

- toneOrchestrator wiring 4 real LLM sub-agents against Claude Haiku 4.5
- IntentClassifier (5 intents, 16-token call, prompt-cached)
- RewriteAgent (per-preset tone mapping + per-platform rules + intent calibration)
- GrammarAgent (temperature 0, tone-preserving fixes)
- InputSanitizer hook (PII regex strip with placeholder round-trip)
- LengthGuardrail hook (async compression pass via Haiku when output exceeds cap)
- Heuristic tone scoring (no 5th LLM call needed for ToneScore)
- 13 Vitest tests with mocked Anthropic API

### P2 — Web App UI

- Full rewrite interface at `/`: TonePresetSelector, MessageInput, OutputCard
- PlatformSelector (7 platforms), UsageCounter (reads X-RateLimit-Remaining)
- LimitReachedBanner (429 state with time-until-reset)
- Zustand store managing message/preset/result/remaining/error state
- API route (POST /api/rewrite) with Upstash rate limiter
- Mobile-first at 360px, Tailwind-only styling, custom theme (ink/paper/accent)
- Playwright E2E tests (7 test cases with route mocking)

### P3 — Browser Extension

- Popup (320px) with full rewrite UI: presets, textarea, submit, result, copy
- Content script injecting floating "TW" button near text fields (Slack, Gmail, Jira, Teams, LinkedIn)
- Inline CSUI rewrite overlay: floating panel with shadow DOM isolation
- Background service worker with chrome.storage.local for usage persistence
- Chrome MV3 + Firefox MV2 builds via Plasmo

### P4 — Compliance, Docs & Launch

- Privacy Policy at /legal/privacy (GDPR, India DPDP Act 2023, CCPA)
- Terms of Service at /legal/terms
- Cookie/storage notice
- Refreshed README with env key table and extension build docs
- Extension store listing copy
- Main branch protection enforced via GitHub API

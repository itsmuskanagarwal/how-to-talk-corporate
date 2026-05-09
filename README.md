# ToneWise

> AI-powered workplace communication assistant — zero login, free tier, production grade.

Rewrite Slack, email, and Jira messages with the right tone in seconds. No login required. 10 free rewrites a day.

---

## Status

**Phase P4 — Compliance, Docs & Launch.** All core features are implemented and deployed. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the system design and [`CHANGELOG.md`](CHANGELOG.md) for the release history.

## Quick start

```bash
# Prerequisites: Node 20.10+ (see .nvmrc) and pnpm 9+
pnpm install
cp apps/web/.env.example apps/web/.env.local  # fill in your API keys
pnpm dev                                       # runs web + extension
```

Open **http://localhost:3000** to see the web app.

### Environment keys

| Variable                   | Required | Source                                             | Purpose                               |
| -------------------------- | -------- | -------------------------------------------------- | ------------------------------------- |
| `ANTHROPIC_API_KEY`        | Yes      | [Anthropic Console](https://console.anthropic.com) | Claude Haiku API for message rewrites |
| `UPSTASH_REDIS_REST_URL`   | Yes      | [Upstash Console](https://console.upstash.com)     | Rate-limiting storage                 |
| `UPSTASH_REDIS_REST_TOKEN` | Yes      | Upstash Console                                    | Rate-limiting auth                    |
| `SENTRY_DSN`               | No       | [Sentry](https://sentry.io)                        | Error tracking                        |
| `NEXT_PUBLIC_POSTHOG_KEY`  | No       | [PostHog](https://posthog.com)                     | Product analytics                     |

Without `ANTHROPIC_API_KEY`, the rewrite API returns 500. Without `UPSTASH_*` keys, rate limiting is disabled (all requests pass through).

## Repository layout

```
tonewise/
├── apps/
│   ├── web/              # Next.js 14 App Router (web client + Edge API)
│   └── extension/        # Plasmo browser extension (Chrome MV3 + Firefox MV2)
├── packages/
│   └── agents/           # Shared agent pipeline — consumed by both apps
├── docs/
│   └── ARCHITECTURE.md   # System design, pipeline contract, phase gates
└── .github/workflows/    # CI + Vercel deploy
```

## Development

### Web app

```bash
pnpm --filter @tonewise/web dev       # http://localhost:3000
pnpm --filter @tonewise/web test      # vitest unit tests
pnpm --filter @tonewise/web test:e2e  # Playwright E2E tests (requires npx playwright install)
```

### Browser extension

```bash
pnpm --filter @tonewise/extension dev       # watch mode → load build/chrome-mv3-dev in Chrome
pnpm --filter @tonewise/extension build      # Chrome MV3 production build
pnpm --filter @tonewise/extension build:firefox  # Firefox MV2
pnpm --filter @tonewise/extension package    # generate .zip for store submission
```

### Agent pipeline (shared)

```bash
pnpm --filter @tonewise/agents build   # compile to dist/
pnpm --filter @tonewise/agents test    # 13 Vitest tests with mocked Anthropic API
```

### Root-level commands

| Command          | What it does                         |
| ---------------- | ------------------------------------ |
| `pnpm typecheck` | `tsc --noEmit` per workspace         |
| `pnpm test`      | Run all tests across workspaces      |
| `pnpm lint`      | ESLint across the monorepo           |
| `pnpm format`    | Prettier across all source files     |
| `pnpm build`     | Production build for every workspace |

## How Claude Code builds this project

This project is built with [Claude Code](https://claude.ai/code) acting as every specialist role — Engineering Lead, Backend Architect, Frontend Architect, Compliance Officer, Technical Writer. Each phase follows a specific role prompt from the master product & engineering document, and roles are reflected in [`.github/CODEOWNERS`](.github/CODEOWNERS).

## License

MIT — see [LICENSE](LICENSE) when filed.

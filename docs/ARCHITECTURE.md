# How to Talk Corporate — Architecture

> Companion to the Master Product & Engineering Document (v1.0). This doc captures
> the engineering-level decisions that flow from that spec, plus anything decided
> after.

## 1. System overview

```
 ┌─────────────────────────────┐      ┌─────────────────────────────┐
 │  Browser Extension (Plasmo) │      │  Web App (Next.js 14)       │
 │  apps/extension             │      │  apps/web                   │
 └──────────────┬──────────────┘      └──────────────┬──────────────┘
                │                                    │
                └────────────────┬───────────────────┘
                                 │ HTTPS (POST /api/rewrite)
                                 ▼
                ┌──────────────────────────────────┐
                │  Edge API route (Next.js)        │
                │  apps/web/app/api/rewrite/       │
                │  ┌────────────────────────────┐  │
                │  │ IPRateLimiter (Upstash)    │  │
                │  │ UsageLogger (async)        │  │
                │  └─────────────┬──────────────┘  │
                │                ▼                 │
                │  ┌────────────────────────────┐  │
                │  │ ToneOrchestrator           │  │
                │  │   (packages/agents)        │  │
                │  └─────────────┬──────────────┘  │
                └────────────────┼─────────────────┘
                                 ▼
              ┌──────────────────────────────────────┐
              │  Anthropic Claude Haiku API          │
              └──────────────────────────────────────┘
```

The web client and extension share a single Edge API route. All LLM logic lives
in `packages/agents` so both surfaces stay byte-for-byte consistent.

## 2. Repository layout

```
tonewise/
├── apps/
│   ├── web/            # Next.js 14 App Router · public client + Edge API
│   └── extension/      # Plasmo MV3 · Chrome + Firefox
├── packages/
│   └── agents/         # Shared agent pipeline (orchestrator, sub-agents, hooks, skills)
├── docs/
│   ├── ARCHITECTURE.md # this file
│   └── (future)        # ADRs, runbooks, prompt-eval reports
├── .github/
│   ├── workflows/      # CI + Vercel deploy
│   ├── CODEOWNERS
│   └── PULL_REQUEST_TEMPLATE.md
├── .husky/
├── tsconfig.base.json  # strict TS, shared by every workspace
├── pnpm-workspace.yaml
└── package.json        # root workspace + tooling
```

## 3. Tech stack (frozen for V1)

| Layer           | Choice                       | Why                                                 |
| --------------- | ---------------------------- | --------------------------------------------------- |
| Frontend        | Next.js 14 App Router        | SSR + Edge runtime, easy extension transpilation    |
| Styling         | Tailwind CSS                 | Token-friendly, no runtime CSS-in-JS                |
| Extension       | Plasmo                       | React-based, MV3 + MV2 in one source                |
| LLM             | Anthropic Claude Haiku       | Cost + latency profile fits free-tier rewrites      |
| Rate limit      | Upstash Redis sliding window | 10 req / 24h per IP+UA hash, free tier sufficient   |
| Analytics       | PostHog (cloud free tier)    | Privacy-first, no login flow needed                 |
| Error tracking  | Sentry                       | Existing free tier; only collects stack frames      |
| CI/CD           | GitHub Actions → Vercel      | Zero infra; Vercel's edge handles `/api/rewrite`    |
| Package manager | pnpm 9 + workspaces          | Disk-efficient, deterministic, first-class monorepo |
| Language        | TypeScript 5.5 (strict)      | One std for both surfaces                           |

## 4. Pipeline contract (`@how-to-talk-corporate/agents`)

```ts
// apps/web/app/api/rewrite/route.ts (P1, sketch only)
export async function POST(req: Request) {
  const { ip, fingerprint } = identify(req);
  const limit = await ipRateLimiter(ip, fingerprint);
  if (!limit.success) return rateLimited(limit);

  const body = (await req.json()) as RewriteRequest;
  const result = await toneOrchestrator(body); // <-- packages/agents
  return Response.json(result, {
    headers: { 'X-RateLimit-Remaining': String(limit.remaining) },
  });
}
```

The orchestrator's **input** is `RewriteRequest` and **output** is
`RewriteResult` — both defined in
[`packages/agents/src/types/index.ts`](../packages/agents/src/types/index.ts).
Frontends MUST NOT depend on intermediate types; the orchestrator is the only
public boundary.

### Pipeline order

```
RewriteRequest
  → InputSanitizer       (strip PII; remember placeholders)
  → LanguageDetector     (decide whether to translate)
  → IntentClassifier     (asking | escalating | explaining | venting | neutral)
  → [if Mode B] ClarificationAgent → user answers → RewriteAgent
  → [else]                            RewriteAgent
  → GrammarAgent
  → LengthGuardrail      (≤ 1.5× input for chat presets; compress if over)
  → ToneVerifier         (drift score; reject + retry if drift > threshold)
  → restorePlaceholders
  → RewriteResult
```

## 5. Rate limiting & identity

- **Window**: 10 rewrites / rolling 24h, per `(IP || UA hash || Accept-Language)` SHA-256.
- **Storage**: Upstash Redis. Keys auto-expire at 24h. No raw IPs stored.
- **Bypass surface**: VPN hopping costs effort; we accept a thin abuse band per the
  spec ( <2% V1 target ).
- **Headers exposed**: `X-RateLimit-Remaining`, `X-RateLimit-Reset` so the client
  can render the usage counter without a second round-trip.

## 6. Coding standards

- **TypeScript strict + `noUncheckedIndexedAccess`**, set in `tsconfig.base.json`
  and inherited by every workspace.
- **No `any`** — `@typescript-eslint/no-explicit-any` is `warn` in shared rules
  but should be treated as an error in PR review.
- **Imports**: type-only imports must use `import type`
  (`@typescript-eslint/consistent-type-imports`).
- **Server-only code** lives in `app/api/**` or `packages/agents` — never in
  `'use client'` modules.
- **No console.log in production code.** ESLint blocks anything beyond
  `console.warn` / `console.error`.

## 7. CI/CD

GitHub Actions workflow in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

```
install → [lint, typecheck, test] → build → upload artifacts
```

Web deploys to Vercel via [`deploy-web.yml`](../.github/workflows/deploy-web.yml)
on every push to `main` that touches `apps/web/**` or `packages/agents/**`.
Extension is shipped manually to Chrome Web Store + Firefox Add-ons during P3.

## 8. Phase gates (mirrors spec section 9)

| Phase | Gate criteria                                                                |
| ----- | ---------------------------------------------------------------------------- |
| P0    | Repo scaffold green on CI · ARCHITECTURE.md merged · LLM benchmarks recorded |
| P1    | Pipeline returns valid `RewriteResult` for all 5 presets · Rate limit live   |
| P2    | Web app passes Lighthouse ≥ 95 · Mobile responsive at 360px · A11y AA        |
| P3    | Extension loads on Slack, Gmail, Jira · 3-second p95 round-trip end-to-end   |
| P4    | Privacy Policy + ToS published · Extensions submitted · Beta launch          |

## 9. Open architecture questions

- **Streaming**: do we stream tokens to the UI, or wait for ToneVerifier to gate
  the output? (Lean: stream optimistically, allow a "this drifted, regenerate"
  affordance instead of blocking.)
- **Mode B persistence**: clarification answers are session-only by design — but
  should we let users opt in to short-term browser storage? Defer to PM in P2.
- **Self-hosted LLM fallback**: Groq Llama 3 was named in the spec as backup.
  Keep behind a feature flag; do not implement until P1 budget review.

These should land as ADRs in `docs/adr/` once decided.

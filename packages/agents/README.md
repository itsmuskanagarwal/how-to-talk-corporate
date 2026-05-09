# @how-to-talk-corporate/agents

Shared agent pipeline for How to Talk Corporate. Consumed by both `@how-to-talk-corporate/web` and
`@how-to-talk-corporate/extension` via workspace dependency.

## Phase ownership

- **P0 (this scaffold)** — interfaces and stubs only. Every export throws
  `not implemented`. The shape is what's frozen here.
- **P1 (Backend Architect)** — implement orchestrator, sub-agents, and hooks
  against the Anthropic Claude Haiku API.
- **P0/P1 (Domain Researcher)** — author content for `tone-mapping`,
  `cultural-calibration`, and `few-shot-examples`.

## Pipeline

```
RewriteRequest
  → InputSanitizer (strip PII)
  → LanguageDetector
  → IntentClassifier
  → RewriteAgent (with toneMapping + platformAwareness + fewShotExamples)
  → GrammarAgent
  → LengthGuardrail (≤ 1.5× input for chat presets)
  → ToneVerifier (drift check)
  → restorePlaceholders
  → RewriteResult
```

See [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md) for the full diagram.

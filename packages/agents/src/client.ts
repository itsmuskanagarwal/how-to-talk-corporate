import Anthropic from '@anthropic-ai/sdk';

/**
 * Default Haiku alias. Per `shared/models.md` (claude-api skill, 2026-04-29):
 * Haiku 4.5 is the cheapest/fastest first-party model — the right choice for
 * short tone-rewrite tasks where we trade some intelligence for cost.
 *
 * NOTE: Haiku does NOT support the `effort` parameter (returns 400). It does
 * accept `temperature`, unlike Opus 4.7. Adaptive thinking is supported but
 * unnecessary here — rewrites don't benefit from extended reasoning.
 */
export const DEFAULT_MODEL = 'claude-haiku-4-5';

/**
 * Per-call timeout. Tone rewrites should land in <5s p95; 30s is a safety
 * net for cold-start and flakey upstream conditions. The SDK auto-retries
 * 429 / 5xx twice with exponential backoff — those retries fit within the
 * timeout budget.
 */
export const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Minimal surface the agents/hooks rely on. Lets tests inject a stub without
 * pulling in the full Anthropic class shape.
 */
export interface AnthropicClient {
  messages: {
    create: Anthropic['messages']['create'];
  };
}

let _client: AnthropicClient | undefined;

export function getClient(): AnthropicClient {
  if (_client) return _client;
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Add it to apps/web/.env.local (see .env.example).',
    );
  }
  _client = new Anthropic({ apiKey, timeout: DEFAULT_TIMEOUT_MS });
  return _client;
}

/**
 * Test seam: inject a stub or reset to default behaviour with `undefined`.
 * Production callers should never use this.
 */
export function setClient(client: AnthropicClient | undefined): void {
  _client = client;
}

/**
 * Pull the first text block out of a messages.create response. Throws if the
 * response has no text block — caller can catch and degrade.
 */
export function extractText(message: Anthropic.Message): string {
  const block = message.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') {
    throw new Error('Anthropic response contained no text block');
  }
  return block.text;
}

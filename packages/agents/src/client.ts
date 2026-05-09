import { complete as routerComplete } from './lib/llmRouter';

export interface CompleteOptions {
  system: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  max_tokens?: number;
  temperature?: number;
}

type CompleteFn = (opts: CompleteOptions) => Promise<string>;

let _complete: CompleteFn | undefined;

export const DEFAULT_MODEL = 'gemini-2.0-flash' as const;

/**
 * Send a completion request through the provider routing layer.
 * Tries Google Gemini first, falls back to Groq on rate limits.
 * Exposed as a function (not a client object) for simplicity.
 */
export function complete(opts: CompleteOptions): Promise<string> {
  if (_complete) return _complete(opts);
  return routerComplete({
    system: opts.system,
    messages: opts.messages,
    max_tokens: opts.max_tokens ?? 1024,
    temperature: opts.temperature ?? 0.4,
  });
}

/**
 * Test seam: inject a stub or reset to default with `undefined`.
 */
export function setComplete(fn: CompleteFn | undefined): void {
  _complete = fn;
}

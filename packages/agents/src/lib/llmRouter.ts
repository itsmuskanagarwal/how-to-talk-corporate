import OpenAI from 'openai';

export interface CompleteOpts {
  system: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  max_tokens?: number;
  temperature?: number;
}

function env(key: string): string | undefined {
  // Works in both Next.js edge runtime and Node.js
  return (
    process.env[key] ??
    (globalThis[key as keyof typeof globalThis] as unknown as string | undefined)
  );
}

function makeClient(baseURL: string, apiKey: string): OpenAI {
  return new OpenAI({
    baseURL,
    apiKey,
    dangerouslyAllowBrowser: true,
    maxRetries: 1,
    timeout: 30_000,
  });
}

function isRetryable(err: unknown): boolean {
  if (err instanceof OpenAI.RateLimitError) return true;
  if (err instanceof OpenAI.APIError) {
    // Google returns 429 for quota, 403 for billing; Groq returns 429
    return [429, 403].includes(err.status);
  }
  return false;
}

let _googleClient: OpenAI | undefined;
let _groqClient: OpenAI | undefined;

function getGoogleClient(): OpenAI {
  if (!_googleClient) {
    const key = env('GOOGLE_AI_API_KEY');
    if (!key) throw new Error('GOOGLE_AI_API_KEY is not set. Get one free at aistudio.google.com.');
    _googleClient = makeClient('https://generativelanguage.googleapis.com/v1beta/openai/', key);
  }
  return _googleClient;
}

function getGroqClient(): OpenAI {
  if (!_groqClient) {
    const key = env('GROQ_API_KEY');
    if (!key) throw new Error('GROQ_API_KEY is not set. Get one free at console.groq.com.');
    _groqClient = makeClient('https://api.groq.com/openai/v1', key);
  }
  return _groqClient;
}

export async function complete(opts: CompleteOpts): Promise<string> {
  const forcedProvider = env('LLM_PROVIDER') as 'google' | 'groq' | undefined;
  const providers: Array<{ name: string; client: () => OpenAI; model: string }> = [];

  if (forcedProvider === 'google') {
    providers.push({ name: 'google', client: getGoogleClient, model: 'gemini-2.0-flash' });
  } else if (forcedProvider === 'groq') {
    providers.push({ name: 'groq', client: getGroqClient, model: 'llama-3.3-70b-versatile' });
  } else {
    providers.push(
      { name: 'google', client: getGoogleClient, model: 'gemini-2.0-flash' },
      { name: 'groq', client: getGroqClient, model: 'llama-3.3-70b-versatile' },
    );
  }

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: opts.system },
    ...opts.messages,
  ];

  for (const provider of providers) {
    try {
      const response = await provider.client().chat.completions.create({
        model: provider.model,
        messages,
        max_tokens: opts.max_tokens ?? 1024,
        temperature: opts.temperature ?? 0.4,
      });
      const text = response.choices?.[0]?.message?.content;
      if (text) return text;
      throw new Error(`Empty response from ${provider.name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[llmRouter] ${provider.name} failed: ${msg}`);
      if (!isRetryable(err)) {
        // Non-retryable error — don't bother trying next provider
        throw err;
      }
      // Retryable — fall through to the next provider
    }
  }

  throw new Error('All providers unavailable, try again shortly');
}

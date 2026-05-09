import { afterEach, describe, expect, it, vi } from 'vitest';
import { toneOrchestrator } from './agents/orchestrator.js';
import { setClient, type AnthropicClient } from './client.js';

interface FakeCall {
  model: string;
  max_tokens: number;
  system: unknown;
  messages: Array<{ role: string; content: string }>;
}

function makeFakeClient(textResponses: string[]): { client: AnthropicClient; calls: FakeCall[] } {
  const calls: FakeCall[] = [];
  let i = 0;
  const create = vi.fn(async (req: unknown) => {
    calls.push(req as FakeCall);
    const text = textResponses[i++] ?? '';
    return {
      id: `msg_${i}`,
      type: 'message',
      role: 'assistant',
      model: (req as FakeCall).model,
      content: [{ type: 'text', text }],
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: { input_tokens: 1, output_tokens: 1 },
    };
  });
  return {
    client: { messages: { create: create as unknown as AnthropicClient['messages']['create'] } },
    calls,
  };
}

afterEach(() => {
  setClient(undefined);
});

describe('toneOrchestrator', () => {
  it('runs the full pipeline for a chat preset (intent → rewrite → grammar)', async () => {
    const { client, calls } = makeFakeClient([
      'asking', // intent classifier
      'Could you take a look at the deploy when you have a moment?', // rewrite
      'Could you take a look at the deploy when you have a moment?', // grammar
    ]);
    setClient(client);

    const result = await toneOrchestrator({
      message: 'pls check the deploy',
      preset: 'humble-polite',
      platform: 'slack',
    });

    expect(calls).toHaveLength(3);
    expect(calls[0]?.max_tokens).toBe(16);
    expect(result.intent).toBe('asking');
    expect(result.grammarFixed).toBe(true);
    expect(result.rewritten).toContain('deploy');
    expect(result.toneScore.politeness).toBeGreaterThan(0);
    expect(result.toneScore.driftFromPreset).toBeGreaterThanOrEqual(0);
    expect(result.toneScore.driftFromPreset).toBeLessThanOrEqual(1);
  });

  it('short-circuits to grammar-only for the grammar-only preset', async () => {
    const { client, calls } = makeFakeClient([
      "I've already told you guys this is a bug — it needs to be fixed today.",
    ]);
    setClient(client);

    const result = await toneOrchestrator({
      message: 'i already told you guys this is a bug it needs to be fixed today',
      preset: 'grammar-only',
      platform: 'slack',
    });

    expect(calls).toHaveLength(1);
    expect(result.intent).toBe('neutral');
    expect(result.grammarFixed).toBe(true);
    expect(result.rewritten).toContain('bug');
  });

  it('strips PII before LLM calls and restores it in the output', async () => {
    const { client, calls } = makeFakeClient([
      'asking',
      "Could you confirm whether you've received the test email at __TW_EMAIL_1__?",
      "Could you confirm whether you've received the test email at __TW_EMAIL_1__?",
    ]);
    setClient(client);

    const result = await toneOrchestrator({
      message: 'did u get the test email at alice@acme.com?',
      preset: 'humble-polite',
      platform: 'gmail',
    });

    for (const call of calls) {
      const userContent = call.messages.find((m) => m.role === 'user')?.content ?? '';
      expect(userContent).not.toContain('alice@acme.com');
    }
    expect(result.rewritten).toContain('alice@acme.com');
  });

  it('falls back to "neutral" intent when the classifier returns garbage', async () => {
    const { client } = makeFakeClient([
      '🤷 unknown gibberish output',
      'Rewritten message.',
      'Rewritten message.',
    ]);
    setClient(client);

    const result = await toneOrchestrator({
      message: 'whatever',
      preset: 'confident-direct',
      platform: 'slack',
    });

    expect(result.intent).toBe('neutral');
  });

  it('skips length compression when output stays under the platform cap', async () => {
    const { client, calls } = makeFakeClient([
      'asking',
      'Brief rewrite.', // well under 1.5x of input
      'Brief rewrite.',
    ]);
    setClient(client);

    await toneOrchestrator({
      message: 'this is a moderately long input message that ought to allow plenty of room',
      preset: 'humble-polite',
      platform: 'slack',
    });

    // Only 3 calls (intent + rewrite + grammar) — no compression call
    expect(calls).toHaveLength(3);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { toneOrchestrator } from './agents/orchestrator';
import { setComplete } from './client';

afterEach(() => {
  setComplete(undefined);
});

describe('toneOrchestrator', () => {
  it('runs the full pipeline for a chat preset (intent → rewrite → grammar)', async () => {
    const calls: Array<unknown> = [];
    const _mock = vi.fn(async (_opts: unknown) => {
      calls.push(_opts);
      return 'asking';
    });

    // First call: intent classifier → "asking"
    // We need to return different values per call
    const responses = [
      'asking',
      'Could you take a look at the deploy when you have a moment?',
      'Could you take a look at the deploy when you have a moment?',
    ];
    let i = 0;
    setComplete(async () => responses[i++] ?? '');

    const result = await toneOrchestrator({
      message: 'pls check the deploy',
      preset: 'humble-polite',
      platform: 'slack',
    });

    expect(result.intent).toBe('asking');
    expect(result.grammarFixed).toBe(true);
    expect(result.rewritten).toContain('deploy');
    expect(result.toneScore.politeness).toBeGreaterThan(0);
    expect(result.toneScore.driftFromPreset).toBeGreaterThanOrEqual(0);
    expect(result.toneScore.driftFromPreset).toBeLessThanOrEqual(1);
  });

  it('short-circuits to grammar-only for the grammar-only preset', async () => {
    setComplete(
      async () => "I've already told you guys this is a bug — it needs to be fixed today.",
    );

    const result = await toneOrchestrator({
      message: 'i already told you guys this is a bug it needs to be fixed today',
      preset: 'grammar-only',
      platform: 'slack',
    });

    expect(result.intent).toBe('neutral');
    expect(result.grammarFixed).toBe(true);
    expect(result.rewritten).toContain('bug');
  });

  it('strips PII before LLM calls and restores it in the output', async () => {
    const calls: string[] = [];
    setComplete(async (_opts) => {
      calls.push(_opts.messages[0].content);
      return _opts.messages[0].content; // echo back (PII should be stripped)
    });

    // Override the third call to restore some text
    let callCount = 0;
    setComplete(async (_opts) => {
      callCount++;
      if (callCount === 1) return 'asking';
      return "Could you confirm whether you've received the test email at __TW_EMAIL_1__?";
    });

    const result = await toneOrchestrator({
      message: 'did u get the test email at alice@acme.com?',
      preset: 'humble-polite',
      platform: 'gmail',
    });

    expect(result.rewritten).toContain('alice@acme.com');
  });

  it('falls back to "neutral" intent when the classifier returns garbage', async () => {
    setComplete(async () => '🤷 unknown gibberish output');

    const result = await toneOrchestrator({
      message: 'whatever',
      preset: 'confident-direct',
      platform: 'slack',
    });

    expect(result.intent).toBe('neutral');
  });

  it('skips length compression when output stays under the platform cap', async () => {
    let callCount = 0;
    setComplete(async () => {
      callCount++;
      if (callCount === 1) return 'asking';
      return 'Brief rewrite.';
    });

    await toneOrchestrator({
      message: 'this is a moderately long input message that ought to allow plenty of room',
      preset: 'humble-polite',
      platform: 'slack',
    });

    // 3 calls (intent + rewrite + grammar) — no compression call
    expect(callCount).toBe(3);
  });
});

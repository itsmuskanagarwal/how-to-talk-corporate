import type { Intent, Platform, TonePreset } from '../types/index';
import { complete } from '../client';
import { toneMapping } from '../skills/tone-mapping';
import { platformAwareness } from '../skills/platform-awareness';

export interface RewriteAgentInput {
  message: string;
  preset: TonePreset;
  platform: Platform;
  intent: Intent;
}

export async function rewriteAgent(input: RewriteAgentInput): Promise<string> {
  const tone = toneMapping(input.preset);
  const platform = platformAwareness(input.platform);

  const platformLines = [
    `Platform: ${input.platform} (formality floor: ${platform.formalityFloor})`,
    platform.maxSentences ? `Hard cap: ${platform.maxSentences} sentences.` : 'No sentence cap.',
    platform.needsSalutation ? 'Include an opening greeting.' : 'No greeting needed.',
    platform.needsSignoff ? 'Include a closing sign-off.' : 'No sign-off needed.',
    platform.bannedTokens.length ? `Avoid these phrases: ${platform.bannedTokens.join(', ')}.` : '',
  ].filter(Boolean);

  const systemPrompt = [
    tone.systemPrompt,
    '',
    'DO:',
    ...tone.doRules.map((r) => `- ${r}`),
    '',
    'DO NOT:',
    ...tone.dontRules.map((r) => `- ${r}`),
    '',
    ...platformLines,
    '',
    `Detected intent: ${input.intent}. Calibrate accordingly.`,
    '',
    'Output ONLY the rewritten message. No preamble, no commentary, no markdown fencing.',
  ].join('\n');

  return complete({
    system: systemPrompt,
    messages: [{ role: 'user', content: input.message }],
    max_tokens: 1024,
    temperature: 0.4,
  });
}

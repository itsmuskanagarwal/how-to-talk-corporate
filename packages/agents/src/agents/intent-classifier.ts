import type { Intent } from '../types/index';
import { complete } from '../client';

const VALID: ReadonlySet<Intent> = new Set([
  'asking',
  'escalating',
  'explaining',
  'venting',
  'neutral',
]);

const SYSTEM_PROMPT =
  'You classify the intent of workplace messages. Respond with EXACTLY one of these ' +
  'words and nothing else: asking, escalating, explaining, venting, neutral.\n\n' +
  'Definitions:\n' +
  '- asking: requesting information, help, or a decision\n' +
  '- escalating: pushing back, expressing frustration, or raising urgency\n' +
  '- explaining: providing context, status, or rationale\n' +
  '- venting: expressing emotion without a specific ask\n' +
  '- neutral: announcement, FYI, acknowledgement, or social pleasantry';

export async function intentClassifier(message: string): Promise<Intent> {
  const text = await complete({
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: message }],
    max_tokens: 16,
    temperature: 0,
  });

  const raw = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '');
  return VALID.has(raw as Intent) ? (raw as Intent) : 'neutral';
}

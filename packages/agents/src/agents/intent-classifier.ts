import type { Intent } from '../types/index';
import { getClient, DEFAULT_MODEL, extractText } from '../client';

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
  const client = getClient();
  const response = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 16,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: message }],
  });

  const raw = extractText(response)
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '');
  return VALID.has(raw as Intent) ? (raw as Intent) : 'neutral';
}

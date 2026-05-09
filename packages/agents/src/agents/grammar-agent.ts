import { getClient, DEFAULT_MODEL, extractText } from '../client';

const SYSTEM_PROMPT =
  'You are a grammar and spelling proofreader. Fix only typos, misspellings, ' +
  'subject-verb agreement, tense errors, and punctuation. Preserve tone, voice, ' +
  'sentence structure, word choice, and phrasing exactly. If the text is already ' +
  'correct, return it unchanged.\n\n' +
  'Output ONLY the corrected text. No preamble, no commentary, no markdown fencing.';

export async function grammarAgent(text: string): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1024,
    temperature: 0,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: text }],
  });

  return extractText(response).trim();
}

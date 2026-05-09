import { complete } from '../client';

const SYSTEM_PROMPT =
  'You are a grammar and spelling proofreader. Fix only typos, misspellings, ' +
  'subject-verb agreement, tense errors, and punctuation. Preserve tone, voice, ' +
  'sentence structure, word choice, and phrasing exactly. If the text is already ' +
  'correct, return it unchanged.\n\n' +
  'Output ONLY the corrected text. No preamble, no commentary, no markdown fencing.';

export async function grammarAgent(text: string): Promise<string> {
  return complete({
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: text }],
    max_tokens: 1024,
    temperature: 0,
  });
}

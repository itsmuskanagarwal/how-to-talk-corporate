import { getClient, DEFAULT_MODEL, extractText } from '../client.js';

export interface LengthGuardrailOptions {
  inputLength: number;
  maxRatio: number;
}

/**
 * Enforce an output-length cap relative to the original input. Per spec §6
 * the chat presets cap at 1.5×; email-style presets pass `maxRatio: Infinity`
 * to bypass this.
 *
 * If the output exceeds the cap, ask Haiku to compress it while preserving
 * tone and intent. The compression call is the *only* time this hook hits
 * the LLM — short outputs return immediately.
 */
export async function lengthGuardrail(
  output: string,
  opts: LengthGuardrailOptions,
): Promise<string> {
  if (!Number.isFinite(opts.maxRatio)) return output;
  const cap = Math.max(120, Math.floor(opts.inputLength * opts.maxRatio));
  if (output.length <= cap) return output;

  const client = getClient();
  const message = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 512,
    system: [
      {
        type: 'text',
        text:
          'You compress chat-message rewrites. Preserve the tone, intent, and meaning ' +
          'exactly — only remove redundancy. Output ONLY the compressed message, no preamble.',
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Compress this to roughly ${cap} characters while preserving tone and intent:\n\n${output}`,
      },
    ],
  });

  return extractText(message).trim();
}

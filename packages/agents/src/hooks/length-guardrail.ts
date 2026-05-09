import { complete } from '../client';

export interface LengthGuardrailOptions {
  inputLength: number;
  maxRatio: number;
}

/**
 * Enforce an output-length cap relative to the original input. Per spec §6
 * the chat presets cap at 1.5×; email-style presets pass `maxRatio: Infinity`
 * to bypass this.
 *
 * If the output exceeds the cap, ask the LLM to compress it while preserving
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

  return complete({
    system:
      'You compress chat-message rewrites. Preserve the tone, intent, and meaning ' +
      'exactly — only remove redundancy. Output ONLY the compressed message, no preamble.',
    messages: [
      {
        role: 'user',
        content: `Compress this to roughly ${cap} characters while preserving tone and intent:\n\n${output}`,
      },
    ],
    max_tokens: 512,
    temperature: 0,
  });
}

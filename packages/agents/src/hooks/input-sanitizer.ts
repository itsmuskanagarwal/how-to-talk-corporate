export interface SanitizeResult {
  sanitized: string;
  placeholders: Record<string, string>;
}

/**
 * Strip PII before the message reaches the LLM, replacing each match with a
 * stable placeholder token. `restorePlaceholders` substitutes the originals
 * back into the rewritten output. Names are intentionally NOT detected here
 * — false positives ("Will" the verb vs "Will" the person) cause more harm
 * than benefit; the spec accepts the tradeoff (master doc §11).
 *
 * Detection order matters: URLs and emails first (they contain @ and dots
 * that would otherwise match other patterns), then phones, then handles.
 */
const PATTERNS: ReadonlyArray<{ kind: string; regex: RegExp }> = [
  { kind: 'URL', regex: /https?:\/\/[^\s<>"]+/g },
  { kind: 'EMAIL', regex: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { kind: 'PHONE', regex: /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g },
  { kind: 'SLACK_HANDLE', regex: /@[A-Za-z][\w.-]{1,30}/g },
];

export function inputSanitizer(text: string): SanitizeResult {
  const placeholders: Record<string, string> = {};
  const counters: Record<string, number> = {};
  let sanitized = text;

  for (const { kind, regex } of PATTERNS) {
    sanitized = sanitized.replace(regex, (match) => {
      counters[kind] = (counters[kind] ?? 0) + 1;
      const token = `__TW_${kind}_${counters[kind]}__`;
      placeholders[token] = match;
      return token;
    });
  }

  return { sanitized, placeholders };
}

export function restorePlaceholders(
  text: string,
  placeholders: Record<string, string>,
): string {
  let result = text;
  for (const [token, original] of Object.entries(placeholders)) {
    result = result.split(token).join(original);
  }
  return result;
}

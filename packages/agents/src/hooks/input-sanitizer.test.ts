import { describe, expect, it } from 'vitest';
import { inputSanitizer, restorePlaceholders } from './input-sanitizer.js';

describe('inputSanitizer', () => {
  it('strips emails and round-trips them via restorePlaceholders', () => {
    const original = 'ping alice@example.com when ready';
    const { sanitized, placeholders } = inputSanitizer(original);
    expect(sanitized).not.toContain('alice@example.com');
    expect(sanitized).toMatch(/__TW_EMAIL_1__/);
    expect(restorePlaceholders(sanitized, placeholders)).toBe(original);
  });

  it('strips URLs and phone numbers in a single pass', () => {
    const original = 'call +1 (415) 555-9876 or check https://status.example.com';
    const { sanitized, placeholders } = inputSanitizer(original);
    expect(sanitized).not.toContain('415');
    expect(sanitized).not.toContain('https://');
    expect(restorePlaceholders(sanitized, placeholders)).toBe(original);
  });

  it('strips Slack-style handles', () => {
    const original = 'hey @alice can you look at this';
    const { sanitized, placeholders } = inputSanitizer(original);
    expect(sanitized).not.toContain('@alice');
    expect(restorePlaceholders(sanitized, placeholders)).toBe(original);
  });

  it('returns input unchanged when no PII is present', () => {
    const original = 'looks good to me';
    const { sanitized, placeholders } = inputSanitizer(original);
    expect(sanitized).toBe(original);
    expect(Object.keys(placeholders)).toHaveLength(0);
  });

  it('numbers multiple matches of the same kind', () => {
    const original = 'cc alice@a.com and bob@b.com';
    const { placeholders } = inputSanitizer(original);
    expect(Object.keys(placeholders).sort()).toEqual(['__TW_EMAIL_1__', '__TW_EMAIL_2__']);
  });
});

import type { ToneScore, TonePreset } from './types/index';
import { toneMapping } from './skills/tone-mapping';

/**
 * Heuristic tone scoring. Stand-in for the full LLM-based ToneVerifier
 * (which lands in a later phase per spec §6). Cheap, deterministic, and
 * keeps the public RewriteResult contract intact without a 5th LLM call.
 *
 * All three scores are 0..1.
 */
const POLITE_TOKENS = [
  'please',
  'thank you',
  'thanks',
  'appreciate',
  'would you',
  'could you',
  'kindly',
  'i hope',
  'sorry',
];

const ASSERTIVE_TOKENS = [
  'will',
  'must',
  'need to',
  'have to',
  'expect',
  'require',
  'immediately',
  'now',
  'asap',
  'today',
];

const HEDGE_TOKENS = ['maybe', 'perhaps', 'might', 'possibly', 'i think', 'i guess', 'sort of'];

export function scoreTone(text: string, preset: TonePreset): ToneScore {
  const lower = text.toLowerCase();
  const sentenceCount = Math.max(1, (text.match(/[.!?]+/g) ?? []).length);

  const polite = countOccurrences(lower, POLITE_TOKENS) / sentenceCount;
  const assertive = countOccurrences(lower, ASSERTIVE_TOKENS) / sentenceCount;
  const hedge = countOccurrences(lower, HEDGE_TOKENS) / sentenceCount;

  const politeness = clamp01(polite);
  const assertiveness = clamp01(assertive - hedge * 0.5 + 0.3);

  const target = toneMapping(preset).assertivenessTarget;
  const driftFromPreset = clamp01(Math.abs(target - assertiveness));

  return { politeness, assertiveness, driftFromPreset };
}

function countOccurrences(haystack: string, needles: readonly string[]): number {
  let total = 0;
  for (const needle of needles) {
    let idx = haystack.indexOf(needle);
    while (idx !== -1) {
      total += 1;
      idx = haystack.indexOf(needle, idx + needle.length);
    }
  }
  return total;
}

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

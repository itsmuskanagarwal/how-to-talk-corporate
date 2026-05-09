import type { TonePreset } from '../types/index.js';

export interface TonePromptSpec {
  systemPrompt: string;
  examples: Array<{ input: string; output: string }>;
  doRules: string[];
  dontRules: string[];
  /** 0..1 — how forceful/insistent the output should land. */
  assertivenessTarget: number;
}

/**
 * Maps each preset to the system-prompt fragment + rules used by the
 * RewriteAgent. Per the master doc, the Domain Researcher (P0/P1) authors
 * the 50-example fewshot library that ships in `examples`. This file
 * provides the structural prompt skeleton; `examples` is intentionally
 * empty for V1 and gets populated in their pass.
 */
const SPECS: Readonly<Record<TonePreset, TonePromptSpec>> = {
  'humble-polite': {
    systemPrompt:
      'Rewrite the message in a humble, warmly professional tone. The author wants ' +
      'to come across as approachable and considerate without sounding subservient or ' +
      'over-apologetic. Keep the original intent and meaning intact.',
    examples: [],
    doRules: [
      'Use polite framing ("would you be able to", "when you have a moment")',
      'Acknowledge the reader\'s time or effort once, briefly',
      'Keep sentences direct and uncluttered',
    ],
    dontRules: [
      'Do not over-apologize ("so sorry to bother you")',
      'Do not add new requests or commitments',
      'Do not use cute or filler phrases ("just checking in!", "no worries!")',
    ],
    assertivenessTarget: 0.3,
  },
  'confident-direct': {
    systemPrompt:
      'Rewrite the message in a confident, direct tone. The author wants to take a ' +
      'firm position or push back without sounding aggressive. Maintain the original ' +
      'intent — sharpen it, do not soften it.',
    examples: [],
    doRules: [
      'Lead with the position or ask',
      'Use definite language ("we will", "this needs", "I expect")',
      'Be specific about what is required and by when',
    ],
    dontRules: [
      'Do not hedge ("maybe", "I think", "perhaps")',
      'Do not threaten, blame, or use aggressive language',
      'Do not add filler that dilutes the ask',
    ],
    assertivenessTarget: 0.85,
  },
  clarifying: {
    systemPrompt:
      'Rewrite the message to be maximally clear and structured. The original was ' +
      'confusing or got misunderstood — restate it so the reader cannot mis-parse it.',
    examples: [],
    doRules: [
      'Lead with one sentence stating the point',
      'Use short paragraphs or numbered points if the content has multiple parts',
      'Spell out implied context the reader may have missed',
    ],
    dontRules: [
      'Do not introduce new claims or asks',
      'Do not be condescending ("as I said before")',
      'Do not pad with filler ("hope this helps clarify")',
    ],
    assertivenessTarget: 0.55,
  },
  'empathetic-nudge': {
    systemPrompt:
      'Rewrite the message as a follow-up nudge with warm urgency. The author is ' +
      'chasing a blocked item from someone they want to keep a good relationship with. ' +
      'Convey that this matters without sounding annoyed.',
    examples: [],
    doRules: [
      'Acknowledge the reader is busy, briefly',
      'Restate what is needed and the impact of the delay',
      'Suggest a concrete next step or low-effort response option',
    ],
    dontRules: [
      'Do not be passive-aggressive ("just bumping this for the third time")',
      'Do not threaten escalation',
      'Do not over-apologize for following up',
    ],
    assertivenessTarget: 0.5,
  },
  'grammar-only': {
    systemPrompt:
      'Fix grammar, spelling, and punctuation errors only. Preserve the original ' +
      'tone, voice, register, sentence structure, and word choice exactly. Do not ' +
      'reword, restructure, or "improve" anything else.',
    examples: [],
    doRules: [
      'Correct typos and misspellings',
      'Fix subject-verb agreement and tense errors',
      'Fix punctuation (apostrophes, missing periods, commas)',
    ],
    dontRules: [
      'Do not change tone',
      'Do not restructure sentences',
      'Do not substitute synonyms or simplify phrasing',
    ],
    assertivenessTarget: 0.5,
  },
};

export function toneMapping(preset: TonePreset): TonePromptSpec {
  return SPECS[preset];
}

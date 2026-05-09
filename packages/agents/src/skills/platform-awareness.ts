import type { Platform } from '../types/index.js';

export interface PlatformRules {
  /** null = no cap (e.g. email). */
  maxSentences: number | null;
  needsSalutation: boolean;
  needsSignoff: boolean;
  formalityFloor: 'casual' | 'semi-formal' | 'formal';
  bannedTokens: string[];
  /**
   * Multiplier on input length applied by the LengthGuardrail hook. Chat
   * platforms cap at 1.5× per spec §6. Email-style platforms have no cap
   * (Infinity bypasses the guardrail entirely).
   */
  lengthRatio: number;
}

const RULES: Readonly<Record<Platform, PlatformRules>> = {
  slack: {
    maxSentences: 3,
    needsSalutation: false,
    needsSignoff: false,
    formalityFloor: 'casual',
    bannedTokens: ['Dear', 'Sincerely', 'Best regards', 'To whom it may concern'],
    lengthRatio: 1.5,
  },
  teams: {
    maxSentences: 3,
    needsSalutation: false,
    needsSignoff: false,
    formalityFloor: 'casual',
    bannedTokens: ['Dear', 'Sincerely', 'Best regards'],
    lengthRatio: 1.5,
  },
  gmail: {
    maxSentences: null,
    needsSalutation: true,
    needsSignoff: true,
    formalityFloor: 'semi-formal',
    bannedTokens: [],
    lengthRatio: Number.POSITIVE_INFINITY,
  },
  outlook: {
    maxSentences: null,
    needsSalutation: true,
    needsSignoff: true,
    formalityFloor: 'semi-formal',
    bannedTokens: [],
    lengthRatio: Number.POSITIVE_INFINITY,
  },
  jira: {
    maxSentences: 5,
    needsSalutation: false,
    needsSignoff: false,
    formalityFloor: 'semi-formal',
    bannedTokens: ['Hi team', 'Thanks!', 'Cheers'],
    lengthRatio: 1.8,
  },
  linear: {
    maxSentences: 5,
    needsSalutation: false,
    needsSignoff: false,
    formalityFloor: 'semi-formal',
    bannedTokens: ['Hi team', 'Thanks!', 'Cheers'],
    lengthRatio: 1.8,
  },
  linkedin: {
    maxSentences: 4,
    needsSalutation: true,
    needsSignoff: false,
    formalityFloor: 'semi-formal',
    bannedTokens: ['Hey', 'lol'],
    lengthRatio: 1.8,
  },
};

export function platformAwareness(platform: Platform): PlatformRules {
  return RULES[platform];
}

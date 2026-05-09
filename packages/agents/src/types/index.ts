export type TonePreset =
  | 'humble-polite'
  | 'confident-direct'
  | 'clarifying'
  | 'empathetic-nudge'
  | 'grammar-only';

export type Platform = 'slack' | 'teams' | 'gmail' | 'outlook' | 'jira' | 'linear' | 'linkedin';

export type Intent = 'asking' | 'escalating' | 'explaining' | 'venting' | 'neutral';

export type Mode = 'quick' | 'clarify';

export interface RewriteRequest {
  message: string;
  preset: TonePreset;
  platform: Platform;
  mode?: Mode;
  clarifications?: ClarificationAnswer[];
}

export interface ClarificationAnswer {
  question: string;
  answer: string;
}

export interface RewriteResult {
  rewritten: string;
  grammarFixed: true;
  intent: Intent;
  toneScore: ToneScore;
}

export interface ToneScore {
  politeness: number;
  assertiveness: number;
  driftFromPreset: number;
}

export interface ClarificationRequest {
  questions: string[];
}

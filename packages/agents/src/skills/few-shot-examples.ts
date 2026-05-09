import type { Platform, TonePreset } from '../types/index';

export interface FewShotExample {
  input: string;
  output: string;
}

export function fewShotExamples(_preset: TonePreset, _platform: Platform): FewShotExample[] {
  // Returns 2–3 in-context examples matching the preset+platform combination.
  throw new Error('fewShotExamples: not implemented (P0/P1)');
}

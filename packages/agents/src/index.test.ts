import { describe, expect, it } from 'vitest';
import {
  toneOrchestrator,
  intentClassifier,
  rewriteAgent,
  grammarAgent,
  clarificationAgent,
  inputSanitizer,
  restorePlaceholders,
  lengthGuardrail,
  toneVerifier,
  languageDetector,
  toneMapping,
  platformAwareness,
  culturalCalibration,
  fewShotExamples,
  getClient,
  setClient,
  DEFAULT_MODEL,
} from './index.js';

describe('@tonewise/agents — public surface', () => {
  it('exports every symbol the orchestrator pipeline depends on', () => {
    const surface = [
      toneOrchestrator,
      intentClassifier,
      rewriteAgent,
      grammarAgent,
      clarificationAgent,
      inputSanitizer,
      restorePlaceholders,
      lengthGuardrail,
      toneVerifier,
      languageDetector,
      toneMapping,
      platformAwareness,
      culturalCalibration,
      fewShotExamples,
      getClient,
      setClient,
    ];
    for (const fn of surface) {
      expect(typeof fn).toBe('function');
    }
  });

  it('defaults to Haiku 4.5 (cheapest first-party Claude)', () => {
    expect(DEFAULT_MODEL).toBe('claude-haiku-4-5');
  });

  it('out-of-scope sub-agents still throw "not implemented"', async () => {
    expect(() => culturalCalibration('US')).toThrow(/not implemented/i);
    expect(() => fewShotExamples('humble-polite', 'slack')).toThrow(/not implemented/i);
    await expect(clarificationAgent('hi')).rejects.toThrow(/not implemented/i);
    await expect(toneVerifier('hi', 'humble-polite')).rejects.toThrow(/not implemented/i);
    await expect(languageDetector('hi')).rejects.toThrow(/not implemented/i);
  });
});

import type { Intent, RewriteRequest, RewriteResult } from '../types/index.js';
import { inputSanitizer, restorePlaceholders } from '../hooks/input-sanitizer.js';
import { lengthGuardrail } from '../hooks/length-guardrail.js';
import { intentClassifier } from './intent-classifier.js';
import { rewriteAgent } from './rewrite-agent.js';
import { grammarAgent } from './grammar-agent.js';
import { platformAwareness } from '../skills/platform-awareness.js';
import { scoreTone } from '../score-tone.js';

/**
 * Pipeline order (per docs/ARCHITECTURE.md §4):
 *   sanitize → classify intent → rewrite → grammar → length guardrail → restore
 *
 * `grammar-only` preset short-circuits the intent + rewrite stages because
 * the grammar pass IS the rewrite. Other presets run the full pipeline.
 *
 * LanguageDetector and ToneVerifier are not in §10 Backend Architect scope —
 * they remain stubs and ship in a later phase. `toneScore` is computed
 * heuristically here (see `score-tone.ts`) so the public RewriteResult
 * contract stays satisfied without a 5th LLM call per request.
 */
export async function toneOrchestrator(req: RewriteRequest): Promise<RewriteResult> {
  const { sanitized, placeholders } = inputSanitizer(req.message);

  let intent: Intent;
  let rewritten: string;

  if (req.preset === 'grammar-only') {
    intent = 'neutral';
    rewritten = await grammarAgent(sanitized);
  } else {
    intent = await intentClassifier(sanitized);
    const drafted = await rewriteAgent({
      message: sanitized,
      preset: req.preset,
      platform: req.platform,
      intent,
    });
    rewritten = await grammarAgent(drafted);
  }

  const platform = platformAwareness(req.platform);
  const guarded = await lengthGuardrail(rewritten, {
    inputLength: req.message.length,
    maxRatio: platform.lengthRatio,
  });

  const restored = restorePlaceholders(guarded, placeholders);
  const toneScore = scoreTone(restored, req.preset);

  return {
    rewritten: restored,
    grammarFixed: true,
    intent,
    toneScore,
  };
}

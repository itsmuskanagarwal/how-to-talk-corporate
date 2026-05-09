'use client';

import type { TonePreset } from '@tonewise/agents';
import { useRewriteStore } from '../store/rewrite';

const PRESETS: Array<{ key: TonePreset; label: string }> = [
  { key: 'humble-polite', label: 'Humble & Polite' },
  { key: 'confident-direct', label: 'Confident & Direct' },
  { key: 'clarifying', label: 'Clarifying' },
  { key: 'empathetic-nudge', label: 'Empathetic Nudge' },
  { key: 'grammar-only', label: 'Grammar Fix Only' },
];

export function TonePresetSelector() {
  const current = useRewriteStore((s) => s.preset);
  const setPreset = useRewriteStore((s) => s.setPreset);

  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-3">
        Tone
      </legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tone preset">
        {PRESETS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={current === key}
            onClick={() => setPreset(key)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              current === key
                ? 'border-accent bg-accent text-white'
                : 'border-paper-3 bg-white text-ink-2 hover:border-ink-3'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

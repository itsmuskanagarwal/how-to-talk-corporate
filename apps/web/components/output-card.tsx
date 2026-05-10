'use client';

import { useState } from 'react';
import { useRewriteStore } from '../store/rewrite';
import type { TonePreset } from '@professional-message-writer/agents';

const PRESET_LABELS: Record<TonePreset, string> = {
  'humble-polite': 'Humble & Polite',
  'confident-direct': 'Confident & Direct',
  clarifying: 'Clarifying',
  'empathetic-nudge': 'Empathetic Nudge',
  'grammar-only': 'Grammar Fix Only',
};

export function OutputCard() {
  const result = useRewriteStore((s) => s.result);
  const preset = useRewriteStore((s) => s.preset);
  const clearResult = useRewriteStore((s) => s.clearResult);
  const [copied, setCopied] = useState(false);

  if (!result) return null;
  const output = result.rewritten;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable; silently fail
    }
  }

  return (
    <section className="rounded-xl border border-paper-3 bg-paper-2 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Result
          </span>
          <span className="rounded bg-paper-3 px-2 py-0.5 text-[10px] font-medium text-ink-3">
            {PRESET_LABELS[preset]}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md border border-paper-3 bg-white px-3 py-1 text-xs font-medium text-ink-2 transition-colors hover:bg-paper-2"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={clearResult}
            className="rounded-md border border-paper-3 bg-white px-3 py-1 text-xs font-medium text-ink-3 transition-colors hover:bg-paper-2"
          >
            Clear
          </button>
        </div>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{output}</p>
    </section>
  );
}

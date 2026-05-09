'use client';

import { useRewriteStore } from '../store/rewrite';

export function UsageCounter() {
  const remaining = useRewriteStore((s) => s.remaining);
  const used = 10 - remaining;
  const pct = (used / 10) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-3">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="whitespace-nowrap font-mono text-[11px] text-ink-3">
        {remaining} / 10 remaining
      </span>
    </div>
  );
}

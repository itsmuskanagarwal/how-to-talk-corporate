'use client';

import { useRewriteStore } from '../store/rewrite';

export function LimitReachedBanner() {
  const error = useRewriteStore((s) => s.error);
  const limitResetAt = useRewriteStore((s) => s.limitResetAt);

  if (!error) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          &#9200;
        </span>
        <h3 className="text-sm font-semibold text-amber-900">Daily limit reached</h3>
      </div>
      <p className="mb-4 text-sm text-amber-800">
        {limitResetAt
          ? `Your 10 free rewrites reset at ${limitResetAt.toLocaleTimeString()}.`
          : 'You have used all 10 free rewrites for today.'}
      </p>
      {/* Upgrade CTA placeholder — active in V2 when the pricing model ships */}
      <p className="text-xs text-amber-600/70">
        Unlimited daily rewrites and team context memory coming soon.
      </p>
    </div>
  );
}

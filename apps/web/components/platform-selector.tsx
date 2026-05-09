'use client';

import { useRewriteStore } from '../store/rewrite';

const PLATFORMS = [
  { key: 'slack' as const, label: 'Slack' },
  { key: 'teams' as const, label: 'Teams' },
  { key: 'gmail' as const, label: 'Gmail' },
  { key: 'outlook' as const, label: 'Outlook' },
  { key: 'jira' as const, label: 'Jira' },
  { key: 'linear' as const, label: 'Linear' },
  { key: 'linkedin' as const, label: 'LinkedIn DM' },
];

export function PlatformSelector() {
  const current = useRewriteStore((s) => s.platform);
  const setPlatform = useRewriteStore((s) => s.setPlatform);

  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-3">
        Platform
      </legend>
      <select
        value={current}
        onChange={(e) => setPlatform(e.target.value as typeof current)}
        className="w-full rounded-lg border border-paper-3 bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
      >
        {PLATFORMS.map(({ key, label }) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </fieldset>
  );
}

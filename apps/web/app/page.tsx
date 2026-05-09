'use client';

import dynamic from 'next/dynamic';
import { Header } from '@/components/header';
import { useRewriteStore } from '@/store/rewrite';

// Dynamic imports so server render doesn't break the client-only store usage
const TonePresetSelector = dynamic(
  () =>
    import('@/components/tone-preset-selector').then((m) => ({ default: m.TonePresetSelector })),
  { ssr: false },
);
const PlatformSelector = dynamic(
  () => import('@/components/platform-selector').then((m) => ({ default: m.PlatformSelector })),
  { ssr: false },
);
const MessageInput = dynamic(
  () => import('@/components/message-input').then((m) => ({ default: m.MessageInput })),
  { ssr: false },
);
const OutputCard = dynamic(
  () => import('@/components/output-card').then((m) => ({ default: m.OutputCard })),
  { ssr: false },
);
const UsageCounter = dynamic(
  () => import('@/components/usage-counter').then((m) => ({ default: m.UsageCounter })),
  { ssr: false },
);
const LimitReachedBanner = dynamic(
  () =>
    import('@/components/limit-reached-banner').then((m) => ({ default: m.LimitReachedBanner })),
  { ssr: false },
);

export default function Page() {
  const error = useRewriteStore((s) => s.error);
  const remaining = useRewriteStore((s) => s.remaining);

  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <Header />

      <div className="mt-8 space-y-6">
        <TonePresetSelector />
        <PlatformSelector />
        <MessageInput />
        <LimitReachedBanner />

        {!error && remaining > 0 && (
          <div className="pt-4">
            <UsageCounter />
          </div>
        )}

        <OutputCard />
      </div>

      <footer className="mt-16 border-t border-paper-3 pt-6 text-center text-xs text-ink-3">
        <p>10 free rewrites daily &middot; No login required</p>
        <p className="mt-1">
          Your message content is never stored.{' '}
          <a href="/legal/privacy" className="underline hover:text-ink-2">
            Privacy Policy
          </a>{' '}
          &middot;{' '}
          <a href="/legal/terms" className="underline hover:text-ink-2">
            Terms of Service
          </a>
        </p>
      </footer>
    </main>
  );
}

import { Header } from '@/components/header';
import { TonePresetSelector } from '@/components/tone-preset-selector';
import { PlatformSelector } from '@/components/platform-selector';
import { MessageInput } from '@/components/message-input';
import { OutputCard } from '@/components/output-card';
import { UsageCounter } from '@/components/usage-counter';
import { LimitReachedBanner } from '@/components/limit-reached-banner';
import { ClientPage } from '@/components/client-page';

export default function Page() {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <Header />

      <ClientPage>
        <div className="mt-8 space-y-6">
          <TonePresetSelector />
          <PlatformSelector />
          <MessageInput />
          <LimitReachedBanner />
          <UsageCounter />
          <OutputCard />
        </div>
      </ClientPage>

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

'use client';

import { useRewriteStore } from '../store/rewrite';

export function MessageInput() {
  const message = useRewriteStore((s) => s.message);
  const setMessage = useRewriteStore((s) => s.setMessage);
  const isRewriting = useRewriteStore((s) => s.isRewriting);
  const rewrite = useRewriteStore((s) => s.rewrite);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || isRewriting) return;
    rewrite();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="message-input" className="sr-only">
        Paste your message
      </label>
      <textarea
        id="message-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Paste your draft message here..."
        rows={4}
        className="w-full resize-none rounded-lg border border-paper-3 bg-white p-4 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        disabled={isRewriting}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-3">{message.length} characters</span>
        <button
          type="submit"
          disabled={!message.trim() || isRewriting}
          className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRewriting ? 'Rewriting...' : 'Rewrite'}
        </button>
      </div>
    </form>
  );
}

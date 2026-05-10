'use client';

import { create } from 'zustand';
import type {
  TonePreset,
  Platform,
  RewriteResult,
  Mode,
} from '@professional-message-writer/agents';

export interface RewriteState {
  message: string;
  preset: TonePreset;
  platform: Platform;
  mode: Mode;
  result: RewriteResult | null;
  isRewriting: boolean;
  error: string | null;
  remaining: number;
  limitResetAt: Date | null;
}

export interface RewriteActions {
  setMessage: (msg: string) => void;
  setPreset: (p: TonePreset) => void;
  setPlatform: (p: Platform) => void;
  setMode: (m: Mode) => void;
  rewrite: () => Promise<void>;
  clearResult: () => void;
  clearError: () => void;
}

export type RewriteStore = RewriteState & RewriteActions;

async function apiRewrite(
  message: string,
  preset: TonePreset,
  platform: Platform,
  mode: Mode,
): Promise<{ result: RewriteResult; remaining: number; resetAt: Date | null }> {
  const res = await fetch('/api/rewrite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, preset, platform, mode }),
  });

  const remaining = Number(res.headers.get('X-RateLimit-Remaining') ?? '-1');
  const resetAtStr = res.headers.get('X-RateLimit-Reset');
  const resetAt = resetAtStr ? new Date(resetAtStr) : null;

  if (res.status === 429) {
    throw new LimitReachedError(
      'Daily limit reached. Resets at ' + (resetAt?.toLocaleTimeString() ?? 'soon'),
      remaining,
      resetAt,
    );
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Rewrite failed. Please try again.');
  }

  const result: RewriteResult = await res.json();
  return { result, remaining, resetAt };
}

export class LimitReachedError extends Error {
  remaining: number;
  resetAt: Date | null;

  constructor(msg: string, remaining: number, resetAt: Date | null) {
    super(msg);
    this.name = 'LimitReachedError';
    this.remaining = remaining;
    this.resetAt = resetAt;
  }
}

const initialState: RewriteState = {
  message: '',
  preset: 'humble-polite',
  platform: 'slack',
  mode: 'quick',
  result: null,
  isRewriting: false,
  error: null,
  remaining: 10,
  limitResetAt: null,
};

export const useRewriteStore = create<RewriteStore>()((set, get) => ({
  ...initialState,

  setMessage: (message) => set({ message, error: null }),
  setPreset: (preset) => set({ preset }),
  setPlatform: (platform) => set({ platform }),
  setMode: (mode) => set({ mode }),
  clearResult: () => set({ result: null, error: null }),
  clearError: () => set({ error: null }),

  rewrite: async () => {
    const { message, preset, platform, mode } = get();
    if (!message.trim()) return;

    set({ isRewriting: true, error: null, result: null });

    try {
      const { result, remaining, resetAt } = await apiRewrite(
        message.trim(),
        preset,
        platform,
        mode,
      );
      set({ result, remaining, limitResetAt: resetAt, isRewriting: false });
    } catch (err) {
      if (err instanceof LimitReachedError) {
        set({
          remaining: err.remaining,
          limitResetAt: err.resetAt,
          error: err.message,
          isRewriting: false,
        });
      } else {
        set({
          error: err instanceof Error ? err.message : 'An unexpected error occurred.',
          isRewriting: false,
        });
      }
    }
  },
}));

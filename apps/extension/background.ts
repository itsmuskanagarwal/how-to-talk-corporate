/**
 * Background service worker (MV3). Manages the usage counter via
 * chrome.storage.local so the popup persists remaining counts across
 * browser restarts and avoids relying on a remote endpoint for this.
 *
 * Storage key: `tw_remaining` (number, 0-10)
 * Storage key: `tw_reset_at` (ISO string — when the 24h window resets)
 */

const STORE_REMAINING = 'tw_remaining';
const STORE_RESET_AT = 'tw_reset_at';

export async function getRemaining(): Promise<{ remaining: number; resetAt: string | null }> {
  const data = await chrome.storage.local.get([STORE_REMAINING, STORE_RESET_AT]);
  const stored = data[STORE_REMAINING];
  // If there's no stored value, default to 10
  const remaining = typeof stored === 'number' ? stored : 10;
  const resetAt = data[STORE_RESET_AT] ?? null;
  return { remaining, resetAt };
}

export async function setRemaining(remaining: number): Promise<void> {
  await chrome.storage.local.set({
    [STORE_REMAINING]: Math.max(0, Math.min(10, remaining)),
  });
}

export async function setResetAt(iso: string): Promise<void> {
  await chrome.storage.local.set({ [STORE_RESET_AT]: iso });
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'tw:get-remaining') {
    getRemaining().then(sendResponse);
    return true; // keep channel open for async response
  }
  if (msg.type === 'tw:set-remaining') {
    setRemaining(msg.remaining).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'tw:set-reset-at') {
    setResetAt(msg.iso).then(() => sendResponse({ ok: true }));
    return true;
  }
});

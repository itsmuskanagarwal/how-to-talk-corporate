import type { PlasmoCSConfig, PlasmoCSUIAnchor } from 'plasmo';
import { useState, useEffect, useCallback } from 'react';
import type { TonePreset } from '@tonewise/agents';

export const config: PlasmoCSConfig = {
  matches: [
    'https://*.slack.com/*',
    'https://mail.google.com/*',
    'https://*.atlassian.net/*',
    'https://teams.microsoft.com/*',
    'https://*.linkedin.com/*',
  ],
  run_at: 'document_idle',
};

export const getRootContainer = () => {
  const id = 'tonewise-overlay-root';
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.style.cssText = 'position:fixed;z-index:2147483647;bottom:16px;right:16px;';
    document.body.appendChild(el);
  }
  return el;
};

export const getShadowHostId = () => 'tonewise-overlay-shadow';

const PRESETS: Array<{ key: TonePreset; label: string }> = [
  { key: 'humble-polite', label: 'Humble & Polite' },
  { key: 'confident-direct', label: 'Confident & Direct' },
  { key: 'clarifying', label: 'Clarifying' },
  { key: 'empathetic-nudge', label: 'Empathetic Nudge' },
  { key: 'grammar-only', label: 'Grammar Fix Only' },
];

export default function RewriteOverlay({ anchor: _anchor }: { anchor: PlasmoCSUIAnchor }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [preset, setPreset] = useState<TonePreset>('humble-polite');
  const [result, setResult] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.text) setMessage(detail.text);
      setOpen(true);
      setResult(null);
      setError(null);
    };
    window.addEventListener('tonewise:open-overlay', handler);
    return () => window.removeEventListener('tonewise:open-overlay', handler);
  }, []);

  const handleRewrite = useCallback(async () => {
    if (!message.trim()) return;
    setIsRewriting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('https://tonewise.vercel.app/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), preset, platform: 'slack', mode: 'quick' }),
      });
      if (res.status === 429) {
        setError('Daily limit reached.');
        setIsRewriting(false);
        return;
      }
      if (!res.ok) throw new Error('Rewrite failed.');
      const body = await res.json();
      setResult(body.rewritten);
    } catch {
      setError('Rewrite failed.');
    }
    setIsRewriting(false);
  }, [message, preset]);

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (!open) return null;

  return (
    <div
      style={{
        width: 300,
        background: '#faf9f7',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        border: '1px solid #e4e0d8',
        padding: 12,
        fontFamily: '"DM Sans", system-ui, sans-serif',
        fontSize: 12,
        color: '#3a3832',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span style={{ fontFamily: '"Fraunces", serif', fontSize: 15, fontWeight: 900 }}>
          Tone<span style={{ color: '#c84b1e' }}>Wise</span>
        </span>
        <button
          onClick={() => setOpen(false)}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: 16,
            color: '#7a7670',
          }}
        >
          &times;
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 8 }}>
        {PRESETS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPreset(key)}
            style={{
              fontSize: 10,
              borderRadius: 10,
              border: '1px solid #e4e0d8',
              padding: '2px 8px',
              background: preset === key ? '#c84b1e' : '#fff',
              color: preset === key ? '#fff' : '#3a3832',
              fontWeight: preset === key ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Paste your draft..."
        rows={2}
        style={{
          width: '100%',
          resize: 'none',
          borderRadius: 6,
          border: '1px solid #e4e0d8',
          padding: 6,
          fontSize: 11,
          boxSizing: 'border-box',
          marginBottom: 6,
        }}
        disabled={isRewriting}
      />

      <button
        onClick={handleRewrite}
        disabled={!message.trim() || isRewriting}
        style={{
          width: '100%',
          padding: '5px 0',
          borderRadius: 6,
          border: 'none',
          background: message.trim() && !isRewriting ? '#c84b1e' : '#e4e0d8',
          color: message.trim() && !isRewriting ? '#fff' : '#7a7670',
          fontWeight: 600,
          fontSize: 11,
          cursor: message.trim() && !isRewriting ? 'pointer' : 'default',
          marginBottom: 6,
        }}
      >
        {isRewriting ? 'Rewriting...' : 'Rewrite'}
      </button>

      {error && (
        <div
          style={{
            background: '#fffbeb',
            borderRadius: 6,
            padding: 6,
            fontSize: 10,
            marginBottom: 6,
            color: '#92400e',
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div style={{ background: '#f0ede8', borderRadius: 6, padding: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span
              style={{ fontSize: 9, fontWeight: 600, color: '#c84b1e', textTransform: 'uppercase' }}
            >
              Result
            </span>
            <button
              onClick={handleCopy}
              style={{
                fontSize: 9,
                border: '1px solid #e4e0d8',
                borderRadius: 3,
                padding: '1px 6px',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 11, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
            {result}
          </p>
        </div>
      )}
    </div>
  );
}

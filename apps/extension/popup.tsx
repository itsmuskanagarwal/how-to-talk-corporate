import { useState } from 'react';
import type { TonePreset, Platform } from '@professional-message-writer/agents';
import { API_BASE } from './api-base';

const PRESETS: Array<{ key: TonePreset; label: string }> = [
  { key: 'humble-polite', label: 'Humble & Polite' },
  { key: 'confident-direct', label: 'Confident & Direct' },
  { key: 'clarifying', label: 'Clarifying' },
  { key: 'empathetic-nudge', label: 'Empathetic Nudge' },
  { key: 'grammar-only', label: 'Grammar Fix Only' },
];

export default function Popup() {
  const [message, setMessage] = useState('');
  const [preset, setPreset] = useState<TonePreset>('humble-polite');
  const [result, setResult] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [remaining, setRemaining] = useState(10);

  async function handleRewrite() {
    if (!message.trim()) return;
    setIsRewriting(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          preset,
          platform: 'slack' as Platform,
          mode: 'quick',
        }),
      });
      setRemaining(Number(res.headers.get('X-RateLimit-Remaining') ?? remaining));
      if (res.status === 429) {
        setError('Daily limit reached. Resets soon.');
        setIsRewriting(false);
        return;
      }
      if (!res.ok) throw new Error('Rewrite failed.');
      const body = await res.json();
      setResult(body.rewritten);
    } catch {
      setError('Rewrite failed. Please try again.');
    }
    setIsRewriting(false);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div
      style={{
        width: 320,
        padding: 12,
        fontFamily: '"DM Sans", system-ui, sans-serif',
        fontSize: 13,
        color: '#3a3832',
      }}
    >
      <h1
        style={{
          fontFamily: '"Fraunces", serif',
          fontSize: 16,
          fontWeight: 900,
          margin: '0 0 10px',
        }}
      >
        How to Talk Corporate
      </h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        {PRESETS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPreset(key)}
            style={{
              fontSize: 11,
              borderRadius: 12,
              border: '1px solid #e4e0d8',
              padding: '3px 10px',
              cursor: 'pointer',
              background: preset === key ? '#c84b1e' : '#fff',
              color: preset === key ? '#fff' : '#3a3832',
              fontWeight: preset === key ? 600 : 400,
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
        rows={3}
        style={{
          width: '100%',
          resize: 'none',
          borderRadius: 6,
          border: '1px solid #e4e0d8',
          padding: 8,
          fontSize: 12,
          boxSizing: 'border-box',
          marginBottom: 8,
        }}
        disabled={isRewriting}
      />

      <button
        onClick={handleRewrite}
        disabled={!message.trim() || isRewriting}
        style={{
          width: '100%',
          padding: '6px 0',
          borderRadius: 6,
          border: 'none',
          background: message.trim() && !isRewriting ? '#c84b1e' : '#e4e0d8',
          color: message.trim() && !isRewriting ? '#fff' : '#7a7670',
          fontWeight: 600,
          fontSize: 12,
          cursor: message.trim() && !isRewriting ? 'pointer' : 'default',
          marginBottom: 8,
        }}
      >
        {isRewriting ? 'Rewriting...' : 'Rewrite'}
      </button>

      {error && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 6,
            padding: 8,
            fontSize: 11,
            marginBottom: 8,
            color: '#92400e',
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div style={{ background: '#f0ede8', borderRadius: 6, padding: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#c84b1e',
                textTransform: 'uppercase',
              }}
            >
              Result
            </span>
            <button
              onClick={handleCopy}
              style={{
                fontSize: 10,
                border: '1px solid #e4e0d8',
                borderRadius: 4,
                padding: '2px 8px',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
            {result}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          style={{ flex: 1, height: 4, borderRadius: 2, background: '#e4e0d8', overflow: 'hidden' }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 2,
              background: '#c84b1e',
              width: `${((10 - remaining) / 10) * 100}%`,
            }}
          />
        </div>
        <span style={{ fontSize: 10, color: '#7a7670' }}>{remaining} / 10</span>
      </div>
    </div>
  );
}

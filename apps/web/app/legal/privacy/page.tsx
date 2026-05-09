import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — How to Talk Corporate',
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-sm max-w-none">
      <h1 className="font-serif text-3xl font-black">Privacy Policy</h1>
      <p className="text-ink-3">Last updated: May 9, 2026</p>

      <h2>1. What we collect</h2>
      <p>
        How to Talk Corporate is designed to work without an account. We collect only the data
        necessary to enforce the free tier and prevent abuse:
      </p>
      <ul>
        <li>
          <strong>Hashed IP + fingerprint</strong> — a composite one-way hash derived from your IP
          address, User-Agent header, and Accept-Language header. This is used exclusively for rate
          limiting (10 rewrites per 24-hour rolling window). The raw inputs are never stored, and
          the hash cannot be reversed to identify you.
        </li>
        <li>
          <strong>Usage count</strong> — the number of rewrites your hashed identity has used in the
          current window. Stored in Redis with a 24-hour TTL, then automatically purged.
        </li>
        <li>
          <strong>Aggregate analytics</strong> — anonymised counts of which tone presets are used
          across all users. No personal data is included. Retained for 90 days.
        </li>
      </ul>

      <h2>2. What we NEVER collect</h2>
      <ul>
        <li>Your name, email address, or any account identifier</li>
        <li>Your message content (input or rewritten output)</li>
        <li>Cookies or tracking identifiers</li>
        <li>Your raw IP address in long-term storage</li>
      </ul>

      <h2>3. How message content is handled</h2>
      <p>
        When you submit a message for rewriting, it is sent to our rewrite API, processed by the
        ToneOrchestrator agent pipeline (powered by Anthropic Claude Haiku), and the rewritten
        result is returned to you. The message content is <strong>never stored or logged</strong> by
        How to Talk Corporate. It is processed in memory only and discarded immediately after the
        response is returned.
      </p>
      <p>
        The Anthropic API receives your message for the purpose of performing the rewrite. Anthropic
        does not use your content to train their models. See{' '}
        <a href="https://www.anthropic.com/privacy" className="underline">
          Anthropic&apos;s Privacy Policy
        </a>{' '}
        for their data handling commitments.
      </p>

      <h2>4. Cookies and local storage</h2>
      <p>
        How to Talk Corporate does <strong>not</strong> use cookies or any form of client-side
        tracking. The browser extension may use{' '}
        <code className="rounded bg-paper-3 px-1 py-0.5 text-sm">chrome.storage.local</code> to
        persist your remaining daily usage count so the counter survives a browser restart. This
        data never leaves your device. The web app stores nothing on the client.
      </p>

      <h2>5. Data retention</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left font-semibold">Data type</th>
            <th className="text-left font-semibold">Retention</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Hashed IP + fingerprint</td>
            <td>24 hours (rolling window)</td>
          </tr>
          <tr>
            <td>Usage count</td>
            <td>24 hours (Redis key TTL)</td>
          </tr>
          <tr>
            <td>Aggregate analytics</td>
            <td>90 days</td>
          </tr>
          <tr>
            <td>Message content</td>
            <td>Never stored</td>
          </tr>
        </tbody>
      </table>

      <h2>6. Your rights</h2>
      <p>
        Under the GDPR (EU), India DPDP Act 2023, and CCPA (California), you have the right to
        access, correct, or delete personal data. Because How to Talk Corporate stores only hashed,
        non-reversible identifiers, we cannot identify or locate data belonging to a specific
        individual. However, all stored data is automatically purged within 24 hours.
      </p>

      <h2>7. Third-party services</h2>
      <p>
        How to Talk Corporate uses the following third-party services. Each processes only the data
        described above and is contractually prohibited from using it for any purpose other than
        providing the service:
      </p>
      <ul>
        <li>
          <strong>Anthropic (Claude API)</strong> — LLM inference for message rewrites. See the
          Anthropic privacy policy linked above.
        </li>
        <li>
          <strong>Upstash (Redis)</strong> — serverless rate-limiting storage. No message content is
          stored.
        </li>
        <li>
          <strong>Vercel</strong> — hosting for the web application. Vercel may process IP addresses
          and request metadata for operational purposes.
        </li>
      </ul>

      <h2>8. Contact</h2>
      <p>
        If you have questions about this policy, open an issue at{' '}
        <a href="https://github.com/itsmuskanagarwal/tonewise" className="underline">
          github.com/itsmuskanagarwal/tonewise
        </a>
        .
      </p>
    </article>
  );
}

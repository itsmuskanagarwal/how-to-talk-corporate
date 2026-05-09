import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'How to Talk Corporate — Workplace communication, calibrated.',
  description:
    'Rewrite Slack, email, and Jira messages with the right tone in seconds. No login. 10 free rewrites a day.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink font-sans antialiased">{children}</body>
    </html>
  );
}

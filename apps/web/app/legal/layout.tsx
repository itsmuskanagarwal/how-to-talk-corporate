import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Legal — ToneWise',
};

export default function LegalLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-2xl px-6 py-16">{children}</div>;
}

'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * Renders children only on the client after hydration. Prevents React
 * hydration-mismatch errors when the initial SSR placeholder differs
 * from the client-side content (e.g. Zustand default values differ from
 * what the server would render if it had access to the store).
 */
export function ClientPage({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="mt-8 space-y-6" />;
  return <>{children}</>;
}

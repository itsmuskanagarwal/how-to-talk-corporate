'use client';

export function Header() {
  return (
    <header className="border-b border-paper-3 px-6 py-5">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <h1 className="font-serif text-2xl font-black tracking-tight">
          Tone<span className="text-accent">Wise</span>
        </h1>
        <p className="hidden text-sm text-ink-3 sm:block">Workplace communication, calibrated.</p>
      </div>
    </header>
  );
}

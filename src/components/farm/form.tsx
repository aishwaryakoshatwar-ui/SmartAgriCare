import type { ReactNode } from "react";

export const inputClass =
  "min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button className="min-h-12 w-full rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition-opacity hover:opacity-90">
      {children}
    </button>
  );
}

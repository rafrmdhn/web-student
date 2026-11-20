import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, hint, icon, accent = false }) => {
  return (
    <div
      className={`rounded-xl border p-5 ${
        accent ? 'border-accent/30 bg-accent-soft/60' : 'border-line bg-paper'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            {value}
          </p>
        </div>
        {icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              accent ? 'bg-accent text-white' : 'bg-subtle text-ink-muted'
            }`}
          >
            {icon}
          </div>
        )}
      </div>
      {hint && <p className="mt-2 text-xs leading-relaxed text-ink-muted">{hint}</p>}
    </div>
  );
};

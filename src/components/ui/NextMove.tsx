import type { ElementType, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export type NextMoveTone = 'next' | 'waiting';

/**
 * Calm, decompressed next-step card: icon, clear single-glance message
 * (with optional concise context), and one primary action button.
 */
export default function NextMove({
  tone = 'next',
  icon: Icon,
  label,
  title,
  why,
  action,
  onAction,
}: {
  tone?: NextMoveTone;
  icon: ElementType;
  label?: string;
  title: ReactNode;
  why?: ReactNode;
  action: string;
  onAction: () => void;
  askPrompt?: string;
}) {
  const next = tone === 'next';
  return (
    <div
      className={cn(
        'studio-nudge flex flex-col gap-3.5 rounded-2xl border transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-5',
        next
          ? 'border-stone-200/80 bg-white text-stone-900 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
          : 'border-amber-200/70 bg-amber-50/50 text-stone-900',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            next ? 'bg-stone-100 text-stone-700' : 'border border-amber-200/60 bg-white text-amber-700',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {!next && label ? (
              <span className="text-xs font-medium text-amber-700">
                {label}
                <span aria-hidden="true" className="ml-1.5 text-amber-400">·</span>
              </span>
            ) : null}
            <p className="text-sm font-semibold leading-relaxed text-stone-900">{title}</p>
            {why ? (
              <p className="text-xs leading-relaxed text-stone-500">
                <span aria-hidden="true" className="mr-1.5 text-stone-300">·</span>
                {why}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex w-full shrink-0 items-center sm:w-auto">
        <button
          type="button"
          onClick={onAction}
          className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-stone-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-stone-800 sm:w-auto sm:text-sm"
        >
          <span>{action}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-80" />
        </button>
      </div>
    </div>
  );
}


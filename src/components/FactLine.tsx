import React, { ReactNode } from 'react';

interface FactLineProps {
  items: readonly (ReactNode | string | number | null | undefined | false)[];
  label?: string;
  className?: string;
}

/**
 * Facts about a card's subject - stage, place, sector, level, commitment -
 * as one muted line, dot-separated.
 * Follows CoFounderBay cursor/next-improvements-1514 (a040a5a0) design rules:
 * Pills are reserved for states or controls; facts are kept as clean dot-separated lines.
 */
export function FactLine({ items, label, className = '' }: FactLineProps) {
  const shown = items.filter((item) => item !== null && item !== undefined && item !== false && item !== '');
  if (!shown.length) return null;

  return (
    <ul 
      aria-label={label} 
      className={`facts-dotted flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground ${className}`}
    >
      {shown.map((item, i) => (
        <li key={i} className="inline-flex items-center">
          {item}
        </li>
      ))}
    </ul>
  );
}

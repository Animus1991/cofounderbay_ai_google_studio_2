import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, BarChart2 } from 'lucide-react';
import { AnalyticsMetric } from '../types';

interface AnalyticsTilesProps {
  metrics: AnalyticsMetric[];
  lang: 'en' | 'el';
}

export const AnalyticsTiles: React.FC<AnalyticsTilesProps> = ({ metrics, lang }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {lang === 'en' ? 'Venture & Profile Momentum' : 'Δυναμική Προφίλ & Venture'}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {lang === 'en' ? 'Live analytics stream' : 'Ζωντανή ροή στατιστικών'}
        </span>
      </div>

      {/* Shared Uniform Shape Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {metrics.map((metric) => {
          return (
            <div
              key={metric.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/30 transition-colors"
            >
              {/* Row 1: The Change Pill & Trend Arrow */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ${
                    metric.isPositive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {metric.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {metric.change}
                </span>

                <span className="text-[11px] text-muted-foreground">
                  {lang === 'en' ? metric.periodEn : metric.periodEl}
                </span>
              </div>

              {/* Row 2: The Large Tabular Figure */}
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  {metric.value}
                </div>
              </div>

              {/* Row 3: Two-Line Uniform Label Box (Never stretches or alters row height) */}
              <div className="mt-2 min-h-[2.5rem]">
                <p className="text-xs font-medium text-muted-foreground leading-snug line-clamp-2">
                  {lang === 'en' ? metric.nameEn : metric.nameEl}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

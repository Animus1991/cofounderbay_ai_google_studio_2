import React from 'react';
import { 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Code2, 
  TrendingUp, 
  Palette, 
  Stethoscope, 
  Layers
} from 'lucide-react';
import { RoleCategory } from '../types';

interface HeroBannerProps {
  selectedRoleFilter?: RoleCategory | 'All';
  setSelectedRoleFilter?: (role: RoleCategory | 'All') => void;
  onOpenMatchmaker?: () => void;
  onQuickFilterRole?: (role: RoleCategory | 'All') => void;
  totalFounders?: number;
  lang?: 'en' | 'el';
}

const ROLE_FILTERS: Array<{ id: RoleCategory | 'All'; labelEn: string; labelEl: string; icon: React.ElementType; color: string }> = [
  { id: 'All', labelEn: 'All Roles', labelEl: 'Όλοι οι Ρόλοι', icon: Layers, color: 'text-indigo-400' },
  { id: 'Technical Co-Founder', labelEn: 'Tech & AI Leads', labelEl: 'Tech & AI Leads', icon: Code2, color: 'text-cyan-400' },
  { id: 'Business & Growth', labelEn: 'GTM & Revenue', labelEl: 'GTM & Ανάπτυξη', icon: TrendingUp, color: 'text-emerald-400' },
  { id: 'Product & Design', labelEn: 'Product & Design', labelEl: 'Product & Design', icon: Palette, color: 'text-purple-400' },
  { id: 'Domain & Operations', labelEn: 'Domain & Ops', labelEl: 'Domain & Ops', icon: Stethoscope, color: 'text-amber-400' },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  selectedRoleFilter = 'All',
  setSelectedRoleFilter,
  onOpenMatchmaker,
  onQuickFilterRole,
  totalFounders = 8,
  lang = 'el',
}) => {
  const handleSelectRole = (r: RoleCategory | 'All') => {
    if (setSelectedRoleFilter) setSelectedRoleFilter(r);
    if (onQuickFilterRole) onQuickFilterRole(r);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-64 w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Main headline & copy formatted on the product type ladder */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-accessible mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>
              {lang === 'en' 
                ? 'Smart Compatibility & Complementary Skill Scoring Active' 
                : 'Ενεργή Αξιολόγηση Συμβατότητας & Συμπληρωματικών Δεξιοτήτων'}
            </span>
          </div>

          <h1 className="page-title text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {lang === 'en' ? 'Build your founding team ' : 'Δημιουργήστε την ιδρυτική σας ομάδα '}
            <span className="text-primary-accessible">
              {lang === 'en' ? 'with precision.' : 'με απόλυτη ακρίβεια.'}
            </span>
          </h1>

          <p className="page-lead mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
            {lang === 'en'
              ? 'Connect with vetted Technical Co-Founders, GTM Operators, and Product Visionaries. Filter by runway, equity split, verified traction, and complementary superpowers.'
              : 'Συνδεθείτε με επαληθευμένους Technical Co-Founders, GTM Operators και Product Leaders. Φιλτράρισμα βάσει runway, διανομής equity, traction και δεξιοτήτων.'}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {onOpenMatchmaker && (
              <button
                type="button"
                onClick={onOpenMatchmaker}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-95 transition-opacity"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>{lang === 'en' ? 'Launch AI Matchmaker Wizard' : 'Εκκίνηση AI Matchmaker'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground py-1">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>{lang === 'en' ? '100% Verified Profiles' : '100% Επαληθευμένα Προφίλ'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>{lang === 'en' ? 'Zero Spam' : 'Μηδενικό Spam'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid using exact 13.582px / 14.002px tokens */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 lg:w-[380px]">
          <div className="rounded-xl border border-border bg-background p-3 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>{lang === 'en' ? 'Active Builders' : 'Ενεργοί Ιδρυτές'}</span>
              <Users className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="mt-1 text-sm sm:text-base font-bold text-foreground">
              {totalFounders * 420}+
            </div>
            <p className="mt-0.5 text-[11px] text-emerald-400 font-medium">
              {lang === 'en' ? '+18 new today' : '+18 νέοι σήμερα'}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background p-3 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>{lang === 'en' ? 'Avg Match' : 'Μ.Ο. Συμβατότητας'}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="mt-1 text-sm sm:text-base font-bold text-foreground">
              92.4%
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {lang === 'en' ? 'Skills sync' : 'Συγχρονισμός δεξιοτήτων'}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl border border-border bg-background p-3 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>{lang === 'en' ? 'Ventures' : 'Ventures'}</span>
              <TrendingUp className="h-3.5 w-3.5 text-primary-accessible" />
            </div>
            <div className="mt-1 text-sm sm:text-base font-bold text-foreground">
              380+
            </div>
            <p className="mt-0.5 text-[11px] text-primary-accessible font-medium">
              $45M+ raised
            </p>
          </div>
        </div>
      </div>

      {/* Role Filter Category Row */}
      <div className="mt-4 pt-3 border-t border-border/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {lang === 'en' ? 'Filter By Expertise Category' : 'Φιλτράρισμα βάσει εξειδίκευσης'}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {lang === 'en' ? 'Showing active candidates' : 'Ενεργοί υποψήφιοι'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ROLE_FILTERS.map((filter) => {
            const Icon = filter.icon;
            const isSelected = selectedRoleFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => handleSelectRole(filter.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-primary-foreground' : filter.color}`} />
                <span>{lang === 'en' ? filter.labelEn : filter.labelEl}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

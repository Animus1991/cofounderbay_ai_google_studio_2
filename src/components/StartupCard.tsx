import React from 'react';
import { 
  CheckCircle, 
  TrendingUp, 
  ArrowUpRight, 
  Briefcase,
  FileText
} from 'lucide-react';
import { StartupVenture } from '../types';
import { CardHead, CardFoot } from './CardAnatomy';
import { FactLine } from './FactLine';

interface StartupCardProps {
  startup: StartupVenture;
  lang?: 'en' | 'el';
  onApply?: (startup: StartupVenture) => void;
  onApplyRole?: (startup: StartupVenture, role: string) => void;
  onViewPitch?: (startup: StartupVenture) => void;
}

export const StartupCard: React.FC<StartupCardProps> = ({ 
  startup, 
  lang = 'en',
  onApply,
  onApplyRole,
  onViewPitch
}) => {
  const handlePitchClick = () => {
    if (onApply) {
      onApply(startup);
    } else if (onApplyRole && startup.openRoles.length > 0) {
      onApplyRole(startup, startup.openRoles[0]);
    }
  };

  return (
    <div className="card-interactive group flex flex-col justify-between p-5 shadow-sm">
      <div className="space-y-3.5">
        {/* Card Anatomy Head: Venture mark, Name, Industry, Stage aside */}
        <CardHead
          mark={
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 text-sm font-extrabold font-mono text-primary shadow-inner shrink-0">
              {startup.logo}
            </div>
          }
          title={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onViewPitch && onViewPitch(startup)}
                className="font-semibold text-foreground group-hover:text-primary-accessible transition-colors text-left"
              >
                {startup.name}
              </button>
              {startup.verified && (
                <span title={lang === 'en' ? 'Verified Venture' : 'Επαληθευμένο Venture'}>
                  <CheckCircle className="h-4 w-4 text-primary-accessible stroke-[2.5]" />
                </span>
              )}
            </div>
          }
          subtitle={
            <span className="text-primary-accessible font-medium">
              {startup.tagline}
            </span>
          }
          meta={
            <FactLine
              items={[
                startup.industry,
                startup.location,
                startup.stage,
              ]}
            />
          }
          aside={
            <div className="text-right">
              <div className="text-xs font-extrabold font-mono tabular-nums text-primary">
                {startup.equityOffer}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {lang === 'en' ? 'equity offer' : 'προσφορά equity'}
              </div>
            </div>
          }
          asideStays={false}
        />

        {/* Description */}
        <p className="card-body line-clamp-2 leading-relaxed text-foreground/85">
          {startup.description}
        </p>

        {/* Traction & Funding FactLine */}
        <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2">
          <FactLine
            items={[
              <span key="traction" className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                <span>{startup.tractionMetric}</span>
              </span>,
              <span key="funding" className="font-mono tabular-nums text-foreground">
                {startup.fundingRaised}
              </span>,
            ]}
          />
        </div>

        {/* Open Founding Seats (Interactive Filter/Action Buttons) */}
        <div>
          <div className="text-[11px] font-semibold text-muted-foreground mb-1.5">
            {lang === 'en' ? 'Open Co-Founder Seats (Click to Pitch):' : 'Ανοιχτές Θέσεις Συνιδρυτών:'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {startup.openRoles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => onApplyRole && onApplyRole(startup, role)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary-accessible hover:bg-primary/20 transition-colors whitespace-nowrap shrink-0"
              >
                <Briefcase className="h-3 w-3 text-primary" />
                <span>{role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card Foot: Founder Info at left, Action buttons at right */}
      <CardFoot
        className="mt-4"
        meta={
          <div className="flex items-center gap-2">
            <img
              src={startup.founderAvatar}
              alt={startup.founderName}
              referrerPolicy="no-referrer"
              className="h-7 w-7 rounded-lg object-cover ring-1 ring-border"
              loading="lazy"
            />
            <div className="text-left min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">
                {startup.founderName}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono tabular-nums">
                {startup.teamSize} · {startup.applicationsCount || 4} {lang === 'en' ? 'pitches' : 'αιτήσεις'}
              </div>
            </div>
          </div>
        }
      >
        {onViewPitch && (
          <button
            type="button"
            onClick={() => onViewPitch(startup)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground hover:bg-accent transition-colors whitespace-nowrap shrink-0"
          >
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{lang === 'en' ? 'Deal Room' : 'Deal Room'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={handlePitchClick}
          className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap shrink-0"
        >
          <span>{lang === 'en' ? 'Pitch as Co-Founder' : 'Υποβολή Πρότασης'}</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </CardFoot>
    </div>
  );
};

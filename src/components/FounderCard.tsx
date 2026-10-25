import React from 'react';
import { 
  CheckCircle, 
  Bookmark, 
  MessageSquare, 
  ChevronRight,
  PieChart,
  BarChart2
} from 'lucide-react';
import { FounderProfile } from '../types';
import { CardHead, CardFoot } from './CardAnatomy';
import { FactLine } from './FactLine';

interface FounderCardProps {
  founder: FounderProfile;
  isSaved: boolean;
  lang?: 'en' | 'el';
  onToggleSave: (id: string) => void;
  onInitiateChat: (founder: FounderProfile) => void;
  onOpenDetails: (founder: FounderProfile) => void;
  onOpenMatchBreakdown?: (founder: FounderProfile) => void;
}

export const FounderCard: React.FC<FounderCardProps> = ({
  founder,
  isSaved,
  lang = 'en',
  onToggleSave,
  onInitiateChat,
  onOpenDetails,
  onOpenMatchBreakdown,
}) => {
  return (
    <div className="card-interactive group relative flex flex-col justify-between p-5 shadow-sm">
      <div className="space-y-3.5">
        {/* Card Anatomy Head: Single left axis, Avatar mark, Title, Subtitle, Interactive Match Score aside */}
        <CardHead
          mark={
            <div className="relative shrink-0">
              <img
                src={founder.avatar}
                alt={founder.name}
                referrerPolicy="no-referrer"
                className="h-11 w-11 rounded-xl object-cover ring-1 ring-border group-hover:ring-primary/40 transition-all"
                loading="lazy"
              />
              {founder.verified && (
                <div 
                  className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card shadow-sm"
                  title={lang === 'en' ? 'Verified Founder Profile' : 'Επαληθευμένο Προφίλ'}
                >
                  <CheckCircle className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>
          }
          title={
            <button
              type="button"
              onClick={() => onOpenDetails(founder)}
              className="person-name inline-flex items-center gap-1.5 text-left transition-colors group-hover:text-primary-accessible"
            >
              {founder.name}
            </button>
          }
          subtitle={
            <span className="text-primary-accessible font-medium">
              {founder.role}
            </span>
          }
          meta={
            <FactLine
              items={[
                founder.location,
                founder.commitment,
                founder.isRemote ? (lang === 'en' ? 'Remote' : 'Εξ αποστάσεως') : null,
              ]}
            />
          }
          aside={
            <button
              type="button"
              onClick={() =>
                onOpenMatchBreakdown ? onOpenMatchBreakdown(founder) : onOpenDetails(founder)
              }
              title={
                lang === 'en'
                  ? 'Click to view 6-axis compatibility breakdown'
                  : 'Πατήστε για ανάλυση συμβατότητας 6 αξόνων'
              }
              className="flex flex-col items-end group/score cursor-pointer"
            >
              <div className="inline-flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/25 px-2.5 py-0.5 text-xs font-bold font-mono tabular-nums text-primary-accessible group-hover/score:bg-primary group-hover/score:text-primary-foreground transition-colors">
                <BarChart2 className="h-3 w-3" />
                <span>{founder.matchScore}%</span>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium mt-0.5 underline decoration-dotted underline-offset-2">
                {lang === 'en' ? '6-axis score' : 'ανάλυση σκορ'}
              </span>
            </button>
          }
          asideStays={false}
        />

        {/* Bio / Thesis snippet */}
        <p className="card-body line-clamp-2 leading-relaxed text-foreground/85">
          {founder.bio}
        </p>

        {/* Clean FactLine for Stage & Equity Offer */}
        <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2">
          <FactLine
            items={[
              <span key="equity" className="inline-flex items-center gap-1 font-medium text-foreground">
                <PieChart className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">{lang === 'en' ? 'Equity:' : 'Equity:'}</span>
                <span className="font-mono tabular-nums">{founder.equityExpectation}</span>
              </span>,
              <span key="stage" className="text-muted-foreground">
                {founder.stage}
              </span>,
            ]}
          />
        </div>

        {/* Skills Unboxed FactLine */}
        <FactLine items={founder.skills.slice(0, 5)} />
      </div>

      {/* CardFoot Hairline: Bookmark at left axis, Profile details & Connect button at right */}
      <CardFoot
        className="mt-4"
        meta={
          <button
            type="button"
            onClick={() => onToggleSave(founder.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              isSaved
                ? 'border-primary/50 bg-primary/10 text-primary-accessible'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
            aria-label={isSaved ? 'Remove Bookmark' : 'Bookmark profile'}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-primary' : ''}`} />
            <span>{isSaved ? (lang === 'en' ? 'Saved' : 'Αποθηκεύτηκε') : (lang === 'en' ? 'Save' : 'Αποθήκευση')}</span>
          </button>
        }
      >
        <button
          type="button"
          onClick={() => onOpenDetails(founder)}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-accent transition-colors whitespace-nowrap shrink-0"
        >
          <span>{lang === 'en' ? 'Profile' : 'Προφίλ'}</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        <button
          type="button"
          onClick={() => onInitiateChat(founder)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap shrink-0"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{lang === 'en' ? 'Connect' : 'Σύνδεση'}</span>
        </button>
      </CardFoot>
    </div>
  );
};

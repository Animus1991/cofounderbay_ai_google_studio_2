import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Code, 
  TrendingUp, 
  Palette, 
  Briefcase,
  MessageSquare,
  Check,
  BarChart2,
  SlidersHorizontal
} from 'lucide-react';
import { FounderProfile, RoleCategory, StartupStage, CommitmentType } from '../types';
import { computeFounderMatch } from '../utils/matchingEngine';

interface MatchmakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  founders: FounderProfile[];
  myProfile: FounderProfile;
  onSelectCandidate: (founder: FounderProfile) => void;
  onInitiateChat: (founder: FounderProfile) => void;
  onOpenBreakdown?: (founder: FounderProfile) => void;
  lang?: 'en' | 'el';
}

export const MatchmakerModal: React.FC<MatchmakerModalProps> = ({
  isOpen,
  onClose,
  founders,
  myProfile,
  onSelectCandidate,
  onInitiateChat,
  onOpenBreakdown,
  lang = 'en',
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [myRole, setMyRole] = useState<RoleCategory>(myProfile.role);
  const [ventureStage, setVentureStage] = useState<StartupStage>(myProfile.stage);
  const [neededSuperpower, setNeededSuperpower] = useState<RoleCategory>('Business & Growth');
  const [commitmentNeeded, setCommitmentNeeded] = useState<CommitmentType>('Full-Time');
  const [matchedResults, setMatchedResults] = useState<
    Array<{ founder: FounderProfile; score: number; rationale: string[] }>
  >([]);

  if (!isOpen) return null;

  const handleRunMatch = () => {
    const simulatedViewer: FounderProfile = {
      ...myProfile,
      role: myRole,
      stage: ventureStage,
      commitment: commitmentNeeded,
      lookingFor: [neededSuperpower, ...myProfile.lookingFor],
    };

    const results = founders
      .map((f) => {
        const { score, highlights } = computeFounderMatch(simulatedViewer, f);
        const roleBonus = f.role === neededSuperpower ? 4 : 0;
        const finalScore = Math.min(99, score + roleBonus);
        return {
          founder: { ...f, matchScore: finalScore },
          score: finalScore,
          rationale: highlights,
        };
      })
      .sort((a, b) => b.score - a.score);

    setMatchedResults(results.slice(0, 4));
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setMatchedResults([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-background/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 text-primary">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {lang === 'en'
                  ? '6-Axis Co-Founder Matchmaker Studio'
                  : 'Στούντιο Υπολογισμού Συμβατότητας 6 Αξόνων'}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {lang === 'en'
                  ? 'Deterministic Jaccard skill & role complementarity engine'
                  : 'Αλγόριθμος συμπληρωματικότητας ρόλων, δεξιοτήτων & σταδίου'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wizard Steps Progress */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-2">
            <span className={step >= 1 ? 'text-primary' : ''}>1. Your Discipline</span>
            <span className={step >= 2 ? 'text-primary' : ''}>2. Venture Stage</span>
            <span className={step >= 3 ? 'text-primary' : ''}>3. Partner Role</span>
            <span className={step >= 4 ? 'text-primary' : ''}>4. Ranked Matches</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground">
                {lang === 'en' ? 'What is your primary founding role?' : 'Ποιος είναι ο δικός σας ρόλος;'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {lang === 'en'
                  ? 'We weight role complementarity at 25/100 points to pair inverse strengths.'
                  : 'Ο αλγόριθμος βαθμολογεί με 25/100 τη συμπληρωματικότητα ρόλων.'}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'Technical Co-Founder' as RoleCategory, label: 'Technical Co-Founder', desc: 'Architecture, AI models, backend systems, MVP velocity', icon: Code },
                  { id: 'Business & Growth' as RoleCategory, label: 'Business & Growth', desc: 'Enterprise sales, fundraising, GTM strategy', icon: TrendingUp },
                  { id: 'Product & Design' as RoleCategory, label: 'Product & Design', desc: 'UI/UX, design systems, user research, retention', icon: Palette },
                  { id: 'Domain & Operations' as RoleCategory, label: 'Domain & Operations', desc: 'Clinical, fintech, logistics, regulatory moats', icon: Briefcase },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = myRole === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMyRole(item.id)}
                      className={`flex flex-col text-left rounded-xl border p-4 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                          : 'border-border bg-background/60 hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <span className="font-bold text-sm text-foreground mt-2">{item.label}</span>
                      <span className="text-[11px] text-muted-foreground mt-1 leading-snug">{item.desc}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <span>{lang === 'en' ? 'Next: Venture Stage' : 'Επόμενο: Στάδιο'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground">
                {lang === 'en' ? 'Current Venture Maturity' : 'Τρέχον Στάδιο Ωριμότητας'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {lang === 'en'
                  ? 'Stage alignment contributes 20/100 points to total compatibility.'
                  : 'Η ευθυγράμμιση σταδίου συνεισφέρει 20/100 πόντους στο τελικό σκορ.'}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {(['Idea / Concept', 'Prototype / MVP', 'Pre-Seed (Traction)', 'Seed Funded'] as StartupStage[]).map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => setVentureStage(stg)}
                    className={`rounded-xl border p-3.5 text-xs font-semibold text-left transition-all ${
                      ventureStage === stg
                        ? 'border-primary bg-primary/15 text-foreground ring-1 ring-primary'
                        : 'border-border bg-background/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {stg}
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  {lang === 'en' ? 'Back' : 'Πίσω'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <span>{lang === 'en' ? 'Next: Target Partner' : 'Επόμενο: Ρόλος Συνιδρυτή'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground">
                {lang === 'en' ? 'Who is your ideal Co-Founder?' : 'Τι ρόλο συνιδρυτή αναζητάτε;'}
              </h3>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    {lang === 'en' ? 'Needed Co-Founder Discipline' : 'Ζητούμενη Εξειδίκευση'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { role: 'Technical Co-Founder' as RoleCategory, label: 'Technical Lead / CTO' },
                      { role: 'Business & Growth' as RoleCategory, label: 'GTM / CEO / Commercial Lead' },
                      { role: 'Product & Design' as RoleCategory, label: 'Head of Product / Design' },
                      { role: 'Domain & Operations' as RoleCategory, label: 'Operations & Regulatory Partner' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setNeededSuperpower(item.role)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          neededSuperpower === item.role
                            ? 'border-primary bg-primary/15 text-foreground ring-1 ring-primary'
                            : 'border-border bg-background/60 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <div className="font-bold text-xs">{item.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    {lang === 'en' ? 'Required Commitment Level' : 'Επίπεδο Δέσμευσης'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Full-Time', 'Part-Time (Transition to FT)', 'Evenings & Weekends'] as CommitmentType[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCommitmentNeeded(c)}
                        className={`rounded-lg border p-2 text-xs font-medium text-center transition-all ${
                          commitmentNeeded === c
                            ? 'border-primary bg-primary/15 text-foreground ring-1 ring-primary'
                            : 'border-border bg-background/60 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  {lang === 'en' ? 'Back' : 'Πίσω'}
                </button>
                <button
                  type="button"
                  onClick={handleRunMatch}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
                >
                  <BarChart2 className="h-4 w-4" />
                  <span>
                    {lang === 'en' ? 'Compute 6-Axis Matches' : 'Υπολογισμός Συμβατότητας'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {lang === 'en' ? 'Top Compatible Candidates' : 'Κορυφαίοι Συμβατοί Υποψήφιοι'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {lang === 'en'
                      ? 'Ranked by deterministic 6-axis role, skill, stage, and commitment scoring.'
                      : 'Ταξινόμηση βάσει του αλγορίθμου 6 αξόνων.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {lang === 'en' ? 'Adjust Parameters' : 'Αλλαγή Κριτηρίων'}
                </button>
              </div>

              <div className="space-y-2.5 pt-1 max-h-[340px] overflow-y-auto">
                {matchedResults.map((result) => (
                  <div
                    key={result.founder.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-background/60 p-3.5 transition-all hover:border-primary/50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={result.founder.avatar}
                        alt={result.founder.name}
                        referrerPolicy="no-referrer"
                        className="h-11 w-11 rounded-xl object-cover ring-1 ring-border"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSelectCandidate(result.founder);
                            }}
                            className="font-bold text-sm text-foreground hover:text-primary"
                          >
                            {result.founder.name}
                          </button>
                          <span className="text-xs text-primary font-medium">
                            · {result.founder.role}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground max-w-sm line-clamp-1 mt-0.5">
                          {result.founder.headline}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {result.rationale.slice(0, 2).map((r, i) => (
                            <span key={i} className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenBreakdown) {
                            onClose();
                            onOpenBreakdown(result.founder);
                          }
                        }}
                        className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-extrabold font-mono tabular-nums text-primary hover:bg-primary/20"
                      >
                        {result.score}%
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onInitiateChat(result.founder);
                        }}
                        className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{lang === 'en' ? 'Connect' : 'Σύνδεση'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

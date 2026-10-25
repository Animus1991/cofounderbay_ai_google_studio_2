import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Layers, BarChart2, Briefcase, PlusCircle } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { useLanguage, useT } from '../lib/language';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../App';
import { MatchBreakdownModal } from './MatchBreakdownModal';
import { StartupDealRoomModal } from './StartupDealRoomModal';
import { NeedCardWall } from './NeedCardWall';
import { ProfileModal } from './ProfileModal';
import {
  FounderProfile,
  StartupVenture,
  NeedCardItem,
  RoleCategory,
  StartupStage,
  CommitmentType,
} from '../types';
import {
  INITIAL_MY_PROFILE,
  FOUNDER_PROFILES,
  STARTUP_VENTURES,
  NEED_CARD_ITEMS,
  createAvatarSvg,
} from '../data/studioCatalog';
import { enrichFoundersWithMatches } from '../utils/matchingEngine';
import { avatarOf, directoryPeople, type Person } from '../lib/peopleSource';
import {
  ensureChatConversation,
  keys,
  logActivity,
  readNeeds,
  readProfileLocal,
  readRound,
  readSaved,
  readValue,
  removeSaved,
  saveProfile,
  upsertNeed,
  writeProfileLocal,
  type NeedCard,
} from '../lib/localLists';
import { useStored } from '../lib/useStored';

function mapRoleCategory(rawRole?: string, headline?: string): RoleCategory {
  const text = `${rawRole || ''} ${headline || ''}`.toLowerCase();
  if (/mentor|advisor/.test(text)) return 'Mentor & Advisor';
  if (/investor|angel|vc/.test(text)) return 'Angel / Investor';
  if (/design|product|ux|ui/.test(text)) return 'Product & Design';
  if (/growth|sales|gtm|marketing|business|commercial/.test(text)) return 'Business & Growth';
  if (/tech|cto|engineer|developer|ai|ml|full-stack|hardware/.test(text)) return 'Technical Co-Founder';
  return 'Domain & Operations';
}

function mapStartupStage(rawStage?: string): StartupStage {
  const s = (rawStage || '').toLowerCase();
  if (s.includes('idea')) return 'Idea / Concept';
  if (s.includes('proto') || s.includes('mvp')) return 'Prototype / MVP';
  if (s.includes('series') || s.includes('growth')) return 'Series A+';
  if (s.includes('seed') && !s.includes('pre')) return 'Seed Funded';
  return 'Pre-Seed (Traction)';
}

function mapCommitment(rawCommitment?: string): CommitmentType {
  const c = (rawCommitment || '').toLowerCase();
  if (c.includes('advis')) return 'Advisory';
  if (c.includes('part')) return 'Part-Time (Transition to FT)';
  if (c.includes('side') || c.includes('weekend')) return 'Evenings & Weekends';
  return 'Full-Time';
}

function personToFounderProfile(person: Person): FounderProfile {
  return {
    id: person.id,
    name: person.fullName,
    avatar: avatarOf(person) || createAvatarSvg(person.fullName.slice(0, 2).toUpperCase(), '#1E293B', '#334155', '#6366F1'),
    headline: person.headline || person.role,
    role: mapRoleCategory(person.role, person.headline),
    location: person.location || `${person.city}, ${person.country}`,
    isRemote: true,
    stage: mapStartupStage(person.stage),
    commitment: mapCommitment(person.commitment),
    equityExpectation: person.checkSize || '25% - 50% (Negotiable)',
    experienceYears: 7,
    bio: person.bio || person.headline,
    skills: person.skills.length > 0 ? person.skills : ['Startup Execution', 'Product Strategy'],
    lookingFor: person.lookingFor.length > 0 ? person.lookingFor : ['Co-Founder', 'Strategic Partner'],
    pastExperience: person.company ? `${person.role} @ ${person.company}` : `${person.role} · ${person.industry || 'Tech'}`,
    education: person.achievements?.[0] || `${person.industry || 'Technology'} Track Record`,
    verified: person.verified !== false,
    matchScore: 88,
    matchHighlights: [
      `Complementary ${person.role}`,
      person.industry ? `${person.industry} Domain` : 'Aligned Stage',
      person.location || 'Remote Ready',
    ],
    socials: {
      linkedin: person.linkedinUrl || 'https://linkedin.com',
      github: person.githubUrl || undefined,
    },
  };
}

function localNeedToWallItem(card: NeedCard, ventureName: string): NeedCardItem {
  const missingLower = (card.missing || '').toLowerCase();
  const category: NeedCardItem['category'] =
    /cto|engineer|tech|dev|rust|ai|ml|react|node/.test(missingLower)
      ? 'Engineering'
      : /growth|sales|gtm|marketing|commercial/.test(missingLower)
        ? 'Growth & GTM'
        : /design|product|ux/.test(missingLower)
          ? 'Product'
          : /mentor|advisor/.test(missingLower)
            ? 'Advisory'
            : 'Operations';
  return {
    id: card.id,
    title: card.missing || 'Co-Founder / Key Partner',
    description: `${card.exists ? `What exists: ${card.exists}. ` : ''}${card.outcome ? `Target outcome: ${card.outcome}.` : ''}`.trim() || card.missing,
    ventureName: ventureName || 'My Startup Venture',
    category,
    location: 'Athens / Remote',
    isRemote: true,
    stage: 'Pre-Seed (Traction)',
    commitment: 'Full-Time',
    equityOffered: card.offer || '15% - 35% Co-Founder Equity',
    skills: (card.missing || '')
      .split(/[,/·•]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5),
    applicantCount: 1,
    createdAt: card.createdAt ? card.createdAt.slice(0, 10) : 'Just now',
    status: card.status === 'closed' ? 'filled' : 'active',
  };
}

export const GlobalStudioModals: React.FC = () => {
  const { mode: lang } = useLanguage();
  const t = useT();
  const navigate = useNavigate();
  const { profile: authProfile } = useAuth();
  const { success: toastSuccess } = useToast();

  const matchBreakdownModalOpen = useUIStore((s) => s.matchBreakdownModalOpen);
  const setMatchBreakdownModalOpen = useUIStore((s) => s.setMatchBreakdownModalOpen);
  const selectedFounderId = useUIStore((s) => s.selectedFounderId);

  const dealRoomModalOpen = useUIStore((s) => s.dealRoomModalOpen);
  const setDealRoomModalOpen = useUIStore((s) => s.setDealRoomModalOpen);
  const selectedStartupId = useUIStore((s) => s.selectedStartupId);

  const needWallModalOpen = useUIStore((s) => s.needWallModalOpen);
  const setNeedWallModalOpen = useUIStore((s) => s.setNeedWallModalOpen);

  // Live reactive subscriptions to local studio state
  const localNeeds = useStored(readNeeds, [keys.needs]);
  const localProfilePatch = useStored(readProfileLocal, [keys.profileLocal]);
  const localRound = useStored(readRound, [keys.round]);
  const localStartup = useStored(() => readValue<Record<string, unknown>>('cfb.startup', {}), ['cfb.startup']);
  const localCanvas = useStored(() => readValue<Record<string, string>>(keys.canvas, {}), [keys.canvas]);
  const savedProfiles = useStored(readSaved, [keys.saved]);

  const [myProfileBase, setMyProfileBase] = useState<FounderProfile>(INITIAL_MY_PROFILE);
  const [backendFounders, setBackendFounders] = useState<FounderProfile[]>(FOUNDER_PROFILES);
  const [backendStartups, setBackendStartups] = useState<StartupVenture[]>(STARTUP_VENTURES);
  const [backendNeedCards, setBackendNeedCards] = useState<NeedCardItem[]>(NEED_CARD_ITEMS);

  const [activeFounderId, setActiveFounderId] = useState<string>('fp-1');
  const [activeStartupId, setActiveStartupId] = useState<string>('sv-1');
  const [dealRoomMode, setDealRoomMode] = useState<'view' | 'apply' | 'create'>('view');
  const [fullProfileFounder, setFullProfileFounder] = useState<FounderProfile | null>(null);

  const fetchBackendState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const data = await res.json();
      if (data.myProfile) setMyProfileBase(data.myProfile);
      if (Array.isArray(data.founders) && data.founders.length > 0) setBackendFounders(data.founders);
      if (Array.isArray(data.startups) && data.startups.length > 0) setBackendStartups(data.startups);
      if (Array.isArray(data.needCards) && data.needCards.length > 0) setBackendNeedCards(data.needCards);
    } catch {
      // Fallback to local state if offline
    }
  }, []);

  useEffect(() => {
    void fetchBackendState();
  }, [fetchBackendState]);

  // Synchronize viewer profile across Auth, localProfilePatch, and Studio Profile
  const myProfile = useMemo<FounderProfile>(() => {
    const mergedName = localProfilePatch.fullName || authProfile?.fullName || myProfileBase.name;
    const mergedHeadline = localProfilePatch.headline || authProfile?.headline || myProfileBase.headline;
    const mergedBio = localProfilePatch.bio || authProfile?.bio || myProfileBase.bio;
    const mergedLocation = localProfilePatch.location || authProfile?.location || myProfileBase.location;
    const mergedSkills =
      (Array.isArray(localProfilePatch.skills) && localProfilePatch.skills.length > 0
        ? localProfilePatch.skills
        : Array.isArray(authProfile?.skills) && authProfile.skills.length > 0
          ? authProfile.skills
          : myProfileBase.skills);
    const mergedLookingFor =
      (Array.isArray(localProfilePatch.lookingFor) && localProfilePatch.lookingFor.length > 0
        ? localProfilePatch.lookingFor
        : Array.isArray(authProfile?.lookingFor) && authProfile.lookingFor.length > 0
          ? authProfile.lookingFor
          : myProfileBase.lookingFor);
    return {
      ...myProfileBase,
      name: mergedName,
      headline: mergedHeadline,
      bio: mergedBio,
      location: mergedLocation,
      stage: mapStartupStage(localProfilePatch.stage || authProfile?.stage || myProfileBase.stage),
      commitment: mapCommitment(localProfilePatch.commitment || authProfile?.commitment || myProfileBase.commitment),
      skills: mergedSkills,
      lookingFor: mergedLookingFor,
    };
  }, [myProfileBase, authProfile, localProfilePatch]);

  // Unified Founders pool: combines Studio Catalog founders (fp-1..fp-4) + ALL directory/CAST founders
  const founders = useMemo<FounderProfile[]>(() => {
    const byId = new Map<string, FounderProfile>();
    for (const f of backendFounders) {
      byId.set(f.id, f);
    }
    for (const person of directoryPeople()) {
      if (!byId.has(person.id)) {
        byId.set(person.id, personToFounderProfile(person));
      }
    }
    return enrichFoundersWithMatches(myProfile, Array.from(byId.values()));
  }, [backendFounders, myProfile]);

  // Unified Startups pool: includes the user's live Venture synced with FounderTools, Workspace Canvas & Fundraising Round
  const startups = useMemo<StartupVenture[]>(() => {
    const ventureName =
      typeof localStartup.name === 'string' && localStartup.name.trim()
        ? localStartup.name.trim()
        : 'EcoFlow Systems';
    const oneLiner =
      typeof localStartup.oneLiner === 'string' && localStartup.oneLiner.trim()
        ? localStartup.oneLiner.trim()
        : 'AI-driven urban water & resource optimization platform';
    const description =
      typeof localStartup.description === 'string' && localStartup.description.trim()
        ? localStartup.description.trim()
        : oneLiner;
    const readiness = typeof localStartup.readinessScore === 'number' ? localStartup.readinessScore : 68;
    const openNeedRoles = localNeeds
      .filter((n) => n.status === 'open')
      .map((n) => n.missing)
      .filter(Boolean);

    const myVenture: StartupVenture = {
      id: 'sv-my-venture',
      name: ventureName,
      logo: createAvatarSvg(ventureName.slice(0, 2).toUpperCase(), '#0F172A', '#1E293B', '#10B981'),
      tagline: oneLiner,
      description,
      industry: authProfile?.industry || 'CleanTech & AI',
      stage: mapStartupStage(localRound.name || authProfile?.stage),
      location: myProfile.location || 'Athens, Greece',
      openRoles: openNeedRoles.length > 0 ? openNeedRoles : ['Commercial Co-Founder (GTM)', 'Lead AI Architect'],
      equityOffer: '15% - 35% Co-Founder Equity',
      fundingRaised: `$${(localRound.committedAmount || 450000).toLocaleString()} / $${(localRound.targetAmount || 1500000).toLocaleString()} (${localRound.instrument || 'SAFE'})`,
      teamSize: '3 Founders',
      founderName: myProfile.name,
      founderAvatar: myProfile.avatar,
      tractionMetric: `Readiness ${readiness}/100 · Burn $${(localRound.monthlyBurn || 22000).toLocaleString()}/mo`,
      verified: true,
      pitchDeck: {
        problem: localCanvas.problem || 'Fragmented early-stage operations and slow co-founder / investor alignment.',
        solution: localCanvas.solution || oneLiner,
        marketSize: '$14B addressable European & global venture ecosystem.',
        businessModel: localCanvas.uvp || 'B2B SaaS subscription + enterprise licensing.',
        tractionDetails: `$${(localRound.committedAmount || 450000).toLocaleString()} committed in ${localRound.name} round · ${readiness}/100 Readiness Index.`,
        useOfFunds: ` Raising $${(localRound.targetAmount || 1500000).toLocaleString()} (${localRound.instrument}) at $${(localRound.valuationCap || 12000000).toLocaleString()} cap.`,
      },
      applicationsCount: openNeedRoles.length + 2,
    };

    const rest = backendStartups.filter((s) => s.id !== 'sv-my-venture');
    return [myVenture, ...rest];
  }, [localStartup, localRound, localCanvas, localNeeds, authProfile, myProfile, backendStartups]);

  // Unified Need Cards: combines localLists Need Cards (from AI Chat / Network page) + Studio Need Cards
  const needCards = useMemo<NeedCardItem[]>(() => {
    const ventureName =
      typeof localStartup.name === 'string' && localStartup.name.trim()
        ? localStartup.name.trim()
        : 'EcoFlow Systems';
    const convertedLocal = localNeeds.map((c) => localNeedToWallItem(c, ventureName));
    const localIds = new Set(convertedLocal.map((c) => c.id));
    return [...convertedLocal, ...backendNeedCards.filter((c) => !localIds.has(c.id))];
  }, [localNeeds, localStartup, backendNeedCards]);

  const savedFounderIds = useMemo(() => {
    return Array.from(new Set(['fp-1', 'fp-2', ...savedProfiles.map((p) => p.id)]));
  }, [savedProfiles]);

  useEffect(() => {
    if (selectedFounderId) {
      setActiveFounderId(selectedFounderId);
    }
  }, [selectedFounderId]);

  useEffect(() => {
    if (selectedStartupId === 'create') {
      setDealRoomMode('create');
    } else if (selectedStartupId) {
      setActiveStartupId(selectedStartupId);
      setDealRoomMode('view');
    }
  }, [selectedStartupId]);

  const activeFounder =
    founders.find((f) => f.id === activeFounderId) ||
    founders.find((f) => f.name.toLowerCase().includes(activeFounderId.toLowerCase())) ||
    founders[0] ||
    null;
  const activeStartup =
    startups.find((s) => s.id === activeStartupId) || startups[0] || null;

  const handleSaveMyProfile = async (updated: FounderProfile) => {
    setMyProfileBase(updated);
    writeProfileLocal({
      fullName: updated.name,
      headline: updated.headline,
      bio: updated.bio,
      location: updated.location,
      skills: updated.skills,
      lookingFor: updated.lookingFor,
    });
    logActivity({
      kind: 'profile',
      title: `Updated profile (${updated.name})`,
      titleEl: `Ενημερώθηκε το προφίλ (${updated.name})`,
      href: '/profile',
    });
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.myProfile) setMyProfileBase(json.myProfile);
        if (json.founders) setBackendFounders(json.founders);
      }
    } catch {
      // local update preserved
    }
    toastSuccess(
      t('Profile & 6-Axis Scores Updated', 'Το προφίλ & τα σκορ 6 αξόνων ενημερώθηκαν')
    );
  };

  const handleSubmitStartupApplication = async (
    startupId: string,
    role: string,
    pitchNote: string
  ) => {
    logActivity({
      kind: 'application',
      title: `Applied for ${role} at ${activeStartup?.name || startupId}`,
      titleEl: `Αίτηση για ${role} στο ${activeStartup?.name || startupId}`,
      href: '/fundraising',
    });
    try {
      const res = await fetch(`/api/startups/${startupId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, pitchNote }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.startups) setBackendStartups(json.startups);
      }
    } catch {
      // continue
    }
    setDealRoomModalOpen(false);
    toastSuccess(
      t('Role Application Sent', 'Η αίτηση ρόλου στάλθηκε'),
      t(
        `Applied for ${role}. Conversation thread updated in Messages.`,
        `Υποβλήθηκε αίτηση για ${role}. Η συνομιλία ενημερώθηκε στα Μηνύματα.`
      )
    );
  };

  const handleCreateStartup = async (startupData: Partial<StartupVenture>) => {
    if (startupData.name) {
      writeProfileLocal({ company: startupData.name });
    }
    logActivity({
      kind: 'milestone',
      title: `Published Deal Room: ${startupData.name || 'New Venture'}`,
      titleEl: `Δημοσιεύθηκε Deal Room: ${startupData.name || 'Νέο Venture'}`,
      href: '/fundraising',
    });
    try {
      const res = await fetch('/api/startups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(startupData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.startups) setBackendStartups(json.startups);
        if (json.startup?.id) setActiveStartupId(json.startup.id);
      }
    } catch {
      // fallback
    }
    setDealRoomMode('view');
    toastSuccess(
      t('Venture Deal Room Published', 'Το Deal Room της Startup δημοσιεύθηκε')
    );
  };

  const handleCreateNeedCard = async (
    card: Omit<NeedCardItem, 'id' | 'createdAt' | 'applicantCount' | 'status'>
  ) => {
    const newId = `need-${Date.now()}`;
    upsertNeed({
      id: newId,
      exists: `${card.ventureName} (${card.stage}) — ${card.description}`,
      outcome: `Scale ${card.category} deliverables (${card.commitment})`,
      missing: `${card.title}${card.skills.length ? ` (${card.skills.join(', ')})` : ''}`,
      offer: card.equityOffered,
      status: 'open',
      at: new Date().toISOString(),
    });
    logActivity({
      kind: 'request',
      title: `Published Need Card: ${card.title}`,
      titleEl: `Δημοσιεύθηκε Κάρτα Ανάγκης: ${card.title}`,
      href: '/network?tab=needs',
    });
    try {
      const res = await fetch('/api/needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.needCards) setBackendNeedCards(json.needCards);
      }
    } catch {
      // fallback
    }
    toastSuccess(
      t('Need Card Published & Synced', 'Η κάρτα ανάγκης δημοσιεύθηκε & συγχρονίστηκε')
    );
  };

  const handleExpressInterestNeed = async (card: NeedCardItem) => {
    logActivity({
      kind: 'request',
      title: `Expressed interest in: ${card.title} (${card.ventureName})`,
      titleEl: `Εκδήλωση ενδιαφέροντος: ${card.title} (${card.ventureName})`,
      href: '/network?tab=needs',
    });
    try {
      const res = await fetch(`/api/needs/${card.id}/interest`, {
        method: 'POST',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.needCards) setBackendNeedCards(json.needCards);
      }
    } catch {
      // fallback
    }
    toastSuccess(
      t('Interest Sent to Founder', 'Το ενδιαφέρον στάλθηκε στον ιδρυτή'),
      card.title
    );
  };

  return (
    <>
      {/* 1. 6-Axis Match Breakdown Modal + Founder Switcher Bar */}
      {matchBreakdownModalOpen && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 border border-indigo-500/40 shadow-xl backdrop-blur-md max-w-[95vw] overflow-x-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1 px-2 shrink-0">
            <BarChart2 className="w-3.5 h-3.5" />
            {lang === 'el' ? 'Επιλογή Υποψηφίου:' : 'Inspect Candidate:'}
          </span>
          {founders.slice(0, 10).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFounderId(f.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                activeFounder?.id === f.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {f.name.split(' ')[0]} · {f.matchScore}%
            </button>
          ))}
        </div>
      )}
      <MatchBreakdownModal
        founder={activeFounder}
        myProfile={myProfile}
        isOpen={matchBreakdownModalOpen}
        onClose={() => setMatchBreakdownModalOpen(false)}
        onInitiateChat={(founder) => {
          setMatchBreakdownModalOpen(false);
          ensureChatConversation(founder.id);
          navigate(`/messages?user=${founder.id}`);
          toastSuccess(
            t('Opening Conversation', 'Άνοιγμα Συνομιλίας'),
            founder.name
          );
        }}
        onOpenFullProfile={(founder) => {
          setMatchBreakdownModalOpen(false);
          setFullProfileFounder(founder);
        }}
        lang={lang === 'el' ? 'el' : 'en'}
      />

      {/* 3. Full Founder / My Profile Inspector Modal */}
      <ProfileModal
        profile={fullProfileFounder}
        isOpen={Boolean(fullProfileFounder)}
        onClose={() => setFullProfileFounder(null)}
        isOwnProfile={fullProfileFounder?.id === 'me'}
        onSaveProfile={handleSaveMyProfile}
        onInitiateChat={() => {
          if (fullProfileFounder) {
            ensureChatConversation(fullProfileFounder.id);
            navigate(`/messages?user=${fullProfileFounder.id}`);
          } else {
            navigate('/messages');
          }
          setFullProfileFounder(null);
        }}
        isSaved={fullProfileFounder ? savedFounderIds.includes(fullProfileFounder.id) : false}
        onToggleSave={(id) => {
          if (savedFounderIds.includes(id)) {
            removeSaved(id);
          } else {
            const target = founders.find((f) => f.id === id);
            if (target) {
              saveProfile({
                id: target.id,
                fullName: target.name,
                role: target.role,
                industry: 'Tech',
                location: target.location,
                note: target.headline,
              });
            }
          }
        }}
        lang={lang === 'el' ? 'el' : 'en'}
      />

      {/* 4. Startup Deal Room & Pitch Deck Modal + Venture Switcher Bar */}
      {dealRoomModalOpen && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 border border-indigo-500/40 shadow-xl backdrop-blur-md max-w-[95vw] overflow-x-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1 px-2 shrink-0">
            <Briefcase className="w-3.5 h-3.5" />
            {lang === 'el' ? 'Deal Rooms:' : 'Deal Rooms:'}
          </span>
          {startups.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setActiveStartupId(s.id);
                setDealRoomMode('view');
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                dealRoomMode !== 'create' && activeStartup?.id === s.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {s.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDealRoomMode('create')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all shrink-0 ${
              dealRoomMode === 'create'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            {lang === 'el' ? '+ Νέα Startup' : '+ Launch Venture'}
          </button>
        </div>
      )}
      <StartupDealRoomModal
        startup={activeStartup}
        mode={dealRoomModalOpen ? dealRoomMode : null}
        onClose={() => setDealRoomModalOpen(false)}
        onSubmitApplication={handleSubmitStartupApplication}
        onCreateStartup={handleCreateStartup}
        lang={lang === 'el' ? 'el' : 'en'}
      />

      {/* 5. Need Cards Wall Modal */}
      {needWallModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#030712] text-slate-100 border border-slate-800 shadow-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {lang === 'el'
                      ? 'Πίνακας Αναγκών & Ρόλων Startup (Need Cards Wall)'
                      : 'Startup Role Needs & Co-Founder Bounties (Need Cards Wall)'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {lang === 'el'
                      ? 'Συγχρονισμένο σε πραγματικό χρόνο με το AI Co-Pilot (/need) και το Network'
                      : 'Synchronized in real time with AI Co-Pilot (/need) and Network'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNeedWallModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <NeedCardWall
              needCards={needCards}
              lang={lang === 'el' ? 'el' : 'en'}
              onExpressInterest={handleExpressInterestNeed}
              onCreateNeedCard={handleCreateNeedCard}
            />
          </div>
        </div>
      )}
    </>
  );
};

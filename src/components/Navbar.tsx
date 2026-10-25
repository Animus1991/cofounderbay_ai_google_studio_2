import React, { useState } from 'react';
import { 
  Compass, 
  Rocket, 
  GraduationCap, 
  MessageSquare, 
  Bookmark, 
  Search,
  Building,
  CheckCircle2,
  ChevronDown,
  Layers,
  BarChart2,
  Palette,
  Globe,
  SlidersHorizontal
} from 'lucide-react';
import { FounderProfile, TenantConfig, ThemeName } from '../types';

interface NavbarProps {
  activeTab: 'discover' | 'needs' | 'startups' | 'matchmaker' | 'mentors' | 'analytics' | 'saved';
  setActiveTab: (tab: 'discover' | 'needs' | 'startups' | 'matchmaker' | 'mentors' | 'analytics' | 'saved') => void;
  savedCount: number;
  unreadCount: number;
  tenants: TenantConfig[];
  currentTenant: TenantConfig;
  onSelectTenant: (tenant: TenantConfig) => void;
  onOpenChat: () => void;
  onOpenProfile: () => void;
  myProfile: FounderProfile;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenMatchmaker: () => void;
  lang: 'en' | 'el';
  setLang: (lang: 'en' | 'el') => void;
  currentTheme: ThemeName;
  onSelectTheme: (theme: ThemeName) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  unreadCount,
  tenants,
  currentTenant,
  onSelectTenant,
  onOpenChat,
  onOpenProfile,
  myProfile,
  searchQuery,
  setSearchQuery,
  onOpenMatchmaker,
  lang,
  setLang,
  currentTheme,
  onSelectTheme
}) => {
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const THEMES: { id: ThemeName; labelEn: string; labelEl: string; color: string }[] = [
    { id: 'dark', labelEn: 'Navy Slate', labelEl: 'Σκοτεινό Navy', color: '#6366f1' },
    { id: 'cyan', labelEn: 'Cyan (Alliance)', labelEl: 'Κυανό (Alliance)', color: '#06b6d4' },
    { id: 'mint', labelEn: 'Mint (#588578)', labelEl: 'Μέντα (#588578)', color: '#588578' },
    { id: 'apricot', labelEn: 'Apricot', labelEl: 'Βερικοκί', color: '#f97316' },
    { id: 'lilac', labelEn: 'Lilac', labelEl: 'Πασχαλιά', color: '#a855f7' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      {/* Top Bar Contract: Zone 1 (Single-element Brand) — Zone 2 (Primary Nav Links) — Zone 3 (Primary Action) */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className="text-lg font-extrabold tracking-tight text-foreground hover:text-primary transition-colors whitespace-nowrap shrink-0"
        >
          CoFounderBay
        </button>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'discover'
                ? 'text-foreground underline decoration-primary decoration-2 underline-offset-8'
                : 'hover:text-foreground'
            }`}
          >
            {lang === 'en' ? 'Founders' : 'Συνιδρυτές'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('needs')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'needs'
                ? 'text-foreground underline decoration-primary decoration-2 underline-offset-8'
                : 'hover:text-foreground'
            }`}
          >
            {lang === 'en' ? 'Opportunities' : 'Αγγελίες'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('startups')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'startups'
                ? 'text-foreground underline decoration-primary decoration-2 underline-offset-8'
                : 'hover:text-foreground'
            }`}
          >
            {lang === 'en' ? 'Startups' : 'Startups'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mentors')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'mentors'
                ? 'text-foreground underline decoration-primary decoration-2 underline-offset-8'
                : 'hover:text-foreground'
            }`}
          >
            {lang === 'en' ? 'Mentorship' : 'Μέντορες'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'analytics'
                ? 'text-foreground underline decoration-primary decoration-2 underline-offset-8'
                : 'hover:text-foreground'
            }`}
          >
            {lang === 'en' ? 'Analytics' : 'Στατιστικά'}
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0" />
      </div>

      {/* Workspace Contextual Toolbar below top bar */}
      <div className="border-t border-border/70 bg-card/50 px-4 py-2 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          {/* Left: Mobile Nav + Hub Switcher + Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            {/* Ecosystem / Tenant Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:border-primary/50 transition-colors whitespace-nowrap shrink-0"
              >
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="max-w-[130px] truncate">{currentTenant.name}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>

              {tenantDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-xl border border-border bg-card p-2 shadow-xl z-50">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground">
                    {lang === 'en' ? 'Select Hub / Accelerator' : 'Επιλογή Hub / Incubator'}
                  </div>
                  {tenants.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        onSelectTenant(t);
                        setTenantDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition-colors ${
                        currentTenant.id === t.id 
                          ? 'bg-primary/10 font-semibold text-primary-accessible' 
                          : 'text-foreground hover:bg-accent'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{t.name}</div>
                        <div className="text-[11px] text-muted-foreground">{t.tagline}</div>
                      </div>
                      {currentTenant.id === t.id && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'en' ? 'Filter founders, skills, ventures...' : 'Αναζήτηση συνιδρυτών, δεξιοτήτων...'}
                className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Right: Workspace Utilities (Matchmaker, Shortlist, Messages, Language, Theme, Profile) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenMatchmaker}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary-accessible hover:bg-primary/20 transition-colors whitespace-nowrap shrink-0"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {lang === 'en' ? 'Matchmaker Wizard' : 'Οδηγός Matching'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'saved'
                  ? 'border-primary bg-primary/15 text-primary-accessible'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Saved' : 'Αποθηκευμένα'}</span>
              <span className="font-mono tabular-nums font-bold">({savedCount})</span>
            </button>

            <button
              type="button"
              onClick={onOpenChat}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors whitespace-nowrap shrink-0"
              title="Messages"
            >
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Inbox' : 'Μηνύματα'}</span>
              {unreadCount > 0 && (
                <span className="font-mono tabular-nums font-bold text-primary">
                  ({unreadCount})
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'el' : 'en')}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors whitespace-nowrap shrink-0"
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="uppercase">{lang}</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center justify-center rounded-lg border border-border bg-background p-1.5 text-foreground hover:bg-accent transition-colors"
                title="Theme color palette"
              >
                <Palette className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-xl z-50">
                  <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                    {lang === 'en' ? 'Theme Accents' : 'Χρώμα Θέματος'}
                  </div>
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        onSelectTheme(theme.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                        currentTheme === theme.id ? 'bg-primary/10 text-primary-accessible font-medium' : 'text-foreground hover:bg-accent'
                      }`}
                    >
                      <span 
                        className="h-3 w-3 rounded-full shrink-0 border border-border"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span>{lang === 'en' ? theme.labelEn : theme.labelEl}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1 hover:border-primary/50 transition-colors whitespace-nowrap shrink-0"
              title="My Founder Profile"
            >
              <img
                src={myProfile.avatar}
                alt={myProfile.name}
                referrerPolicy="no-referrer"
                className="h-6 w-6 rounded-md object-cover ring-1 ring-border"
              />
              <span className="hidden lg:inline text-xs font-semibold text-foreground max-w-[110px] truncate">
                {myProfile.name}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Strip */}
        <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar">
          {[
            { id: 'discover', labelEn: 'Founders', labelEl: 'Συνιδρυτές', icon: Compass },
            { id: 'needs', labelEn: 'Needs', labelEl: 'Ανάγκες', icon: Layers },
            { id: 'startups', labelEn: 'Startups', labelEl: 'Startups', icon: Rocket },
            { id: 'mentors', labelEn: 'Mentors', labelEl: 'Μέντορες', icon: GraduationCap },
            { id: 'analytics', labelEn: 'Analytics', labelEl: 'Στατιστικά', icon: BarChart2 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap shrink-0 ${
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{lang === 'en' ? item.labelEn : item.labelEl}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

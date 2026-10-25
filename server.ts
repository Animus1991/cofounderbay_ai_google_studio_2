import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import {
  INITIAL_MY_PROFILE,
  FOUNDER_PROFILES,
  STARTUP_VENTURES,
  MENTOR_SESSIONS,
  INITIAL_MENTOR_BOOKINGS,
  INITIAL_CONVERSATIONS,
  NEED_CARD_ITEMS,
  createAvatarSvg,
} from './src/data/studioCatalog.ts';
import { enrichFoundersWithMatches } from './src/utils/matchingEngine.ts';
import type {
  FounderProfile,
  StartupVenture,
  MentorSession,
  MentorBooking,
  Conversation,
  NeedCardItem,
  ChatMessage,
} from './src/types.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const WORKSPACE_ROOT = process.cwd();
const DATA_DIR = path.join(WORKSPACE_ROOT, '.runtime-store');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

interface PersistedStore {
  myProfile: FounderProfile;
  founders: FounderProfile[];
  savedFounderIds: string[];
  startups: StartupVenture[];
  needCards: NeedCardItem[];
  mentors: MentorSession[];
  mentorBookings: MentorBooking[];
  conversations: Conversation[];
  rsvpedEventIds: string[];
}

function loadStore(): PersistedStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as PersistedStore;
      parsed.founders = enrichFoundersWithMatches(parsed.myProfile, parsed.founders);
      return parsed;
    }
  } catch (err) {
    console.error('Failed to read store.json, initializing fresh store:', err);
  }

  const initialFounders = enrichFoundersWithMatches(INITIAL_MY_PROFILE, FOUNDER_PROFILES);
  const initialStore: PersistedStore = {
    myProfile: INITIAL_MY_PROFILE,
    founders: initialFounders,
    savedFounderIds: ['fp-1', 'fp-2'],
    startups: STARTUP_VENTURES,
    needCards: NEED_CARD_ITEMS,
    mentors: MENTOR_SESSIONS,
    mentorBookings: INITIAL_MENTOR_BOOKINGS,
    conversations: INITIAL_CONVERSATIONS,
    rsvpedEventIds: ['ev-1'],
  };
  saveStore(initialStore);
  return initialStore;
}

function saveStore(store: PersistedStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpPath = `${STORE_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2), 'utf-8');
    fs.renameSync(tmpPath, STORE_PATH);
  } catch (err) {
    console.error('Failed to save store.json:', err);
  }
}

let store: PersistedStore = loadStore();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    return next();
  });

  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
  });
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const pathname = request.url || '';
    if (pathname.startsWith('/socket.io/')) {
      return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  function broadcast(event: string, payload: unknown) {
    const message = JSON.stringify({ event, payload, timestamp: Date.now() });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  wss.on('connection', (ws) => {
    ws.send(
      JSON.stringify({
        event: 'state:init',
        payload: {
          conversations: store.conversations,
          mentorBookings: store.mentorBookings,
          onlineCount: wss.clients.size,
        },
      })
    );

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        if (data.type === 'message:send' && data.conversationId && data.text) {
          const conv = store.conversations.find((c) => c.id === data.conversationId);
          if (conv) {
            const msgId = data.messageId || `msg-${Date.now()}`;
            if (!conv.messages.some((m) => m.id === msgId)) {
              const newMsg: ChatMessage = {
                id: msgId,
                senderId: 'me',
                senderName: store.myProfile.name,
                text: String(data.text).trim(),
                timestamp: 'Just now',
                isMe: true,
              };
              conv.messages.push(newMsg);
              conv.lastMessage = newMsg.text;
              conv.timestamp = 'Just now';
              saveStore(store);
              broadcast('message:created', {
                conversationId: conv.id,
                message: newMsg,
                conversation: conv,
              });
            }
          }
        }
      } catch (err) {
        console.error('WS message parse error:', err);
      }
    });
  });

  // ============================================================================
  // REFERENCE PLATFORM DATABASE & API ROUTES (aecd8fe)
  // ============================================================================
  const db = {
    users: [
      {
        id: '1',
        fullName: 'Alex Rivera',
        email: 'alex@cofounderbay.com',
        roles: ['Founder'],
        profileStatus: 'Published',
        verificationStatus: 'Verified',
        profileCompletionScore: 95,
        emailVerified: true,
        accountStatus: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        fullName: 'Sarah Chen',
        email: 'sarah@cofounderbay.com',
        roles: ['Co-Founder Candidate'],
        profileStatus: 'Published',
        verificationStatus: 'Verified',
        profileCompletionScore: 88,
        emailVerified: true,
        accountStatus: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        fullName: 'Marcus Thorne',
        email: 'marcus@cofounderbay.com',
        roles: ['Mentor'],
        profileStatus: 'Published',
        verificationStatus: 'Verified',
        profileCompletionScore: 100,
        emailVerified: true,
        accountStatus: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        fullName: 'Elena Rodriguez',
        email: 'elena@cofounderbay.com',
        roles: ['Co-Founder Candidate'],
        profileStatus: 'Published',
        verificationStatus: 'Verified',
        profileCompletionScore: 94,
        emailVerified: false,
        accountStatus: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        fullName: 'David Park',
        email: 'david@cofounderbay.com',
        roles: ['Founder'],
        profileStatus: 'Published',
        verificationStatus: 'Verified',
        profileCompletionScore: 89,
        emailVerified: true,
        accountStatus: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    profiles: [
      {
        userId: '1',
        headline: 'Serial Entrepreneur | Building Future of Fintech',
        bio: 'Passionate about democratizing finance. Previously built and exited a SaaS platform in the logistics space.',
        location: 'San Francisco, CA',
        country: 'USA',
        languages: ['English', 'Spanish'],
        startupStageInterest: ['Idea', 'Seed'],
        commitmentLevel: 'Full-time',
        availability: 'Immediate',
        yearsOfExperience: 12,
        education: 'Stanford MBA',
        linkedinUrl: 'https://linkedin.com/in/alexrivera',
        profileVisibility: 'Public',
        profilePhoto: 'https://picsum.photos/seed/alex/200/200',
        interests: ['FinTech', 'SaaS', 'Web3'],
      },
      {
        userId: '2',
        headline: 'Full-Stack Engineer | AI Enthusiast',
        bio: 'Former Senior Engineer at Google. Looking to join a mission-driven startup as a technical co-founder.',
        location: 'Berlin, Germany',
        country: 'Germany',
        languages: ['English', 'German', 'Mandarin'],
        startupStageInterest: ['Seed', 'Series A'],
        commitmentLevel: 'Full-time',
        availability: '1 month notice',
        yearsOfExperience: 8,
        education: 'MIT CS',
        githubUrl: 'https://github.com/sarahchen',
        profileVisibility: 'Public',
        profilePhoto: 'https://picsum.photos/seed/sarah/200/200',
        interests: ['AI', 'FinTech', 'SaaS'],
      },
      {
        userId: '3',
        headline: 'Growth Expert | 3x Founder',
        bio: 'Helping early-stage startups scale from 0 to 1. Expert in GTM strategy and product-market fit.',
        location: 'London, UK',
        country: 'UK',
        languages: ['English'],
        startupStageInterest: ['Pre-seed', 'Seed', 'Series A'],
        commitmentLevel: 'Exploring',
        availability: 'Flexible',
        yearsOfExperience: 20,
        education: 'Oxford University',
        profileVisibility: 'Public',
        profilePhoto: 'https://picsum.photos/seed/marcus/200/200',
        interests: ['SaaS', 'B2B', 'Marketplaces'],
      },
      {
        userId: '4',
        headline: 'UX/UI Designer | Product Strategist',
        bio: 'Obsessed with creating intuitive user experiences. 6 years of experience in early-stage startups.',
        location: 'Barcelona, Spain',
        country: 'Spain',
        languages: ['English', 'Spanish'],
        startupStageInterest: ['Idea', 'Pre-seed'],
        commitmentLevel: 'Part-time',
        availability: 'Immediate',
        yearsOfExperience: 6,
        education: 'ELISAVA Design',
        profileVisibility: 'Public',
        profilePhoto: 'https://picsum.photos/seed/elena/200/200',
        interests: ['Design', 'SaaS', 'Consumer'],
      },
      {
        userId: '5',
        headline: 'Operations & Finance | Scaling Specialist',
        bio: 'Ex-McKinsey consultant with a focus on operational efficiency and financial modeling for high-growth ventures.',
        location: 'New York, NY',
        country: 'USA',
        languages: ['English', 'Korean'],
        startupStageInterest: ['Seed', 'Series A'],
        commitmentLevel: 'Full-time',
        availability: 'Immediate',
        yearsOfExperience: 10,
        education: 'Wharton School',
        profileVisibility: 'Public',
        profilePhoto: 'https://picsum.photos/seed/david/200/200',
        interests: ['FinTech', 'Operations', 'Strategy'],
      },
    ],
    skills: [
      { id: 's1', name: 'Product Management', category: 'Product' },
      { id: 's2', name: 'React / TypeScript', category: 'Technical' },
      { id: 's3', name: 'Node.js / Python', category: 'Technical' },
      { id: 's4', name: 'Fundraising', category: 'Business' },
      { id: 's5', name: 'Growth Marketing', category: 'Business' },
      { id: 's6', name: 'Machine Learning', category: 'Technical' },
      { id: 's7', name: 'UI/UX Design', category: 'Design' },
      { id: 's8', name: 'Financial Modeling', category: 'Business' },
      { id: 's9', name: 'Operations', category: 'Business' },
    ],
    userSkills: [
      { userId: '1', skillId: 's1', proficiency: 5, yearsOfExperience: 8, priorityLevel: 1 },
      { userId: '1', skillId: 's4', proficiency: 5, yearsOfExperience: 10, priorityLevel: 1 },
      { userId: '1', skillId: 's5', proficiency: 4, yearsOfExperience: 8, priorityLevel: 2 },
      { userId: '2', skillId: 's2', proficiency: 5, yearsOfExperience: 7, priorityLevel: 1 },
      { userId: '2', skillId: 's3', proficiency: 5, yearsOfExperience: 6, priorityLevel: 2 },
      { userId: '2', skillId: 's6', proficiency: 4, yearsOfExperience: 3, priorityLevel: 3 },
      { userId: '4', skillId: 's7', proficiency: 5, yearsOfExperience: 6, priorityLevel: 1 },
      { userId: '4', skillId: 's1', proficiency: 3, yearsOfExperience: 4, priorityLevel: 2 },
      { userId: '5', skillId: 's8', proficiency: 5, yearsOfExperience: 10, priorityLevel: 1 },
      { userId: '5', skillId: 's9', proficiency: 5, yearsOfExperience: 8, priorityLevel: 2 },
    ],
    communities: [
      {
        id: 'c1',
        title: 'Fintech Founders',
        description: 'A space for founders building in the financial technology space.',
        category: 'Industry',
        tags: ['Fintech', 'Web3', 'Banking'],
        isPublic: true,
        ownerId: '1',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'c2',
        title: 'AI Builders',
        description: 'Connecting engineers and researchers building the next generation of AI products.',
        category: 'Technology',
        tags: ['AI', 'ML', 'LLM'],
        isPublic: true,
        ownerId: '2',
        createdAt: new Date().toISOString(),
      },
    ],
    tenants: [
      {
        id: 't1',
        slug: 'default',
        name: 'CoFounderBay Global',
        displayName: 'CoFounderBay',
        shortDescription: 'The global ecosystem for startup builders.',
        fullDescription: "CoFounderBay is the world's leading platform for finding co-founders and mentors.",
        supportEmail: 'support@cofounderbay.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        branding: {
          tenantId: 't1',
          logoUrl: '',
          primaryColor: '#1c1917',
          secondaryColor: '#78716c',
          accentColor: '#f5f5f4',
          backgroundStyle: 'solid',
        },
        content: {
          tenantId: 't1',
          heroTitle: 'Build your startup team with precision.',
          heroSubtitle: 'CoFounderBay reduces founder risk by connecting you with compatible partners.',
          ctaLabel: 'Join Platform',
          onboardingIntroText: 'Welcome to the global network of builders.',
          dashboardWelcomeText: "Your profile is {score}% complete. Let's find your partner.",
          communityNamingConvention: 'Communities',
          emailSignature: 'The CoFounderBay Team',
          isBrandingActive: true,
        },
      },
      {
        id: 't2',
        slug: 'techstars',
        name: 'Techstars Accelerator Network',
        displayName: 'Techstars Hub',
        shortDescription: 'Exclusive ecosystem for Techstars founders and alumni.',
        fullDescription: 'Connect with fellow Techstars founders, mentors, and investors across the global network.',
        supportEmail: 'help@techstars.com',
        websiteUrl: 'https://techstars.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        branding: {
          tenantId: 't2',
          logoUrl: 'https://www.techstars.com/assets/techstars-logo.svg',
          primaryColor: '#000000',
          secondaryColor: '#333333',
          accentColor: '#00FFCC',
          backgroundStyle: 'mesh',
        },
        content: {
          tenantId: 't2',
          heroTitle: 'Accelerate your venture with the Techstars network.',
          heroSubtitle: "Exclusive access to the world's best mentors and co-founders for Techstars alumni.",
          ctaLabel: 'Apply to Network',
          onboardingIntroText: "Welcome to the Techstars family. Let's build something great.",
          dashboardWelcomeText: 'Welcome back, Techstars founder. Your network is waiting.',
          communityNamingConvention: 'Accelerator Hubs',
          emailSignature: 'Techstars Network Support',
          isBrandingActive: true,
        },
      },
    ],
    conversations: [
      { id: 'c1', participants: ['1', '2'], status: 'Active', createdAt: new Date().toISOString() },
      { id: 'c2', participants: ['1', '3'], status: 'Active', createdAt: new Date().toISOString() },
      { id: 'c3', participants: ['1', '4'], status: 'Active', createdAt: new Date().toISOString() },
      { id: 'c4', participants: ['1', 'a3'], status: 'Active', createdAt: new Date().toISOString(), isAI: true },
      { id: 'c5', participants: ['1', 'a2'], status: 'Active', createdAt: new Date().toISOString(), isAI: true },
    ],
    messages: [
      {
        id: 'm1',
        conversationId: 'c1',
        senderId: '2',
        body: "Hi Alex! I saw your profile and I'm very interested in the fintech project you're building.",
        createdAt: new Date().toISOString(),
        readStatus: true,
      },
      {
        id: 'm2',
        conversationId: 'c1',
        senderId: '1',
        body: "Thanks Sarah! I'd love to tell you more about it. Are you free for a quick call this week?",
        createdAt: new Date().toISOString(),
        readStatus: true,
      },
      {
        id: 'm3',
        conversationId: 'c1',
        senderId: '2',
        body: "I've reviewed your pitch deck. Let's discuss the market size analysis.",
        createdAt: new Date().toISOString(),
        readStatus: true,
      },
      {
        id: 'm4',
        conversationId: 'c1',
        senderId: '1',
        body: "That sounds great. I've updated the slides with the latest research data.",
        createdAt: new Date().toISOString(),
        readStatus: false,
      },
      {
        id: 'm5',
        conversationId: 'c4',
        senderId: 'a3',
        body: "Hello! I'm your AI Startup Advisor. How can I help you refine your startup idea today?",
        createdAt: new Date().toISOString(),
        readStatus: true,
      },
      {
        id: 'm6',
        conversationId: 'c5',
        senderId: 'a2',
        body: "Hi! I'm the Pitch Deck Reviewer. Upload your deck or share a slide, and I'll give you feedback on clarity and market appeal.",
        createdAt: new Date().toISOString(),
        readStatus: true,
      },
    ],
  };

  app.get('/api/tenants', (_req, res) => res.json(db.tenants));
  app.get('/api/tenants/:slug', (req, res) => {
    const tenant = db.tenants.find((t) => t.slug === req.params.slug);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    return res.json(tenant);
  });
  app.post('/api/tenants/:id/branding', (req, res) => {
    const tenant = db.tenants.find((t) => t.id === req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    tenant.branding = { ...tenant.branding, ...req.body };
    tenant.updatedAt = new Date().toISOString();
    return res.json(tenant.branding);
  });
  app.post('/api/tenants/:id/content', (req, res) => {
    const tenant = db.tenants.find((t) => t.id === req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    tenant.content = { ...tenant.content, ...req.body };
    tenant.updatedAt = new Date().toISOString();
    return res.json(tenant.content);
  });

  app.get('/api/users', (_req, res) => res.json(db.users));
  app.get('/api/users/:id', (req, res) => {
    const user = db.users.find((u) => u.id === req.params.id);
    const profile = db.profiles.find((p) => p.userId === req.params.id);
    const skills = db.userSkills
      .filter((us) => us.userId === req.params.id)
      .map((us) => ({ ...us, ...db.skills.find((s) => s.id === us.skillId) }));
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ ...user, profile, skills });
  });

  app.get('/api/matches/:userId', (req, res) => {
    const userId = req.params.userId;
    const user = db.users.find((u) => u.id === userId);
    const userProfile = db.profiles.find((p) => p.userId === userId);
    const userSkills = db.userSkills.filter((us) => us.userId === userId);

    if (!user || !userProfile) return res.status(404).json({ error: 'User not found' });

    const potentialMatches = db.users.filter(
      (u) => u.id !== userId && !u.roles.includes('Mentor')
    );

    const enrichedMatches = potentialMatches
      .map((otherUser) => {
        const otherProfile = db.profiles.find((p) => p.userId === otherUser.id);
        const otherSkills = db.userSkills.filter((us) => us.userId === otherUser.id);
        if (!otherProfile) return null;

        let score = 50;
        const reasons: string[] = [];

        if (
          (user.roles.includes('Founder') && otherUser.roles.includes('Co-Founder Candidate')) ||
          (user.roles.includes('Co-Founder Candidate') && otherUser.roles.includes('Founder'))
        ) {
          score += 20;
          reasons.push('Complementary roles (Founder + Candidate)');
        }

        const sharedInterests =
          userProfile.interests?.filter((i) => otherProfile.interests?.includes(i)) || [];
        if (sharedInterests.length > 0) {
          score += sharedInterests.length * 10;
          reasons.push(`Shared interests in ${sharedInterests.join(', ')}`);
        }

        const userHasBusiness = userSkills.some(
          (us) => db.skills.find((s) => s.id === us.skillId)?.category === 'Business'
        );
        const otherHasTechnical = otherSkills.some(
          (us) => db.skills.find((s) => s.id === us.skillId)?.category === 'Technical'
        );
        const userHasTechnical = userSkills.some(
          (us) => db.skills.find((s) => s.id === us.skillId)?.category === 'Technical'
        );
        const otherHasBusiness = otherSkills.some(
          (us) => db.skills.find((s) => s.id === us.skillId)?.category === 'Business'
        );

        if ((userHasBusiness && otherHasTechnical) || (userHasTechnical && otherHasBusiness)) {
          score += 15;
          reasons.push('Strong skill complementarity (Business + Technical)');
        }

        const userSkillIds = userSkills.map((us) => us.skillId);
        const otherSkillIds = otherSkills.map((us) => us.skillId);
        const sharedSkillIds = userSkillIds.filter((id) => otherSkillIds.includes(id));
        const sharedSkills = sharedSkillIds
          .map((id) => db.skills.find((s) => s.id === id)?.name)
          .filter(Boolean);

        score = Math.min(score, 98);

        return {
          id: `m-${userId}-${otherUser.id}`,
          otherUser: { ...otherUser, profile: otherProfile },
          score,
          sharedSkills,
          sharedInterests,
          scoreExplanation:
            reasons.length > 0
              ? reasons.join('. ') + '.'
              : 'Good overall alignment in goals and commitment.',
          compatibilityDimensions: {
            skills: 88,
            values: 90,
            goals: 92,
            availability: 94,
          },
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);

    enrichedMatches.sort((a, b) => b.score - a.score);
    return res.json(enrichedMatches.slice(0, 4));
  });

  app.get('/api/communities', (_req, res) => res.json(db.communities));

  app.get('/api/conversations/:userId', (req, res) => {
    const userId = req.params.userId;
    const userConversations = db.conversations.filter((c) => c.participants.includes(userId));
    const enrichedConversations = userConversations.map((conv) => {
      const otherParticipantId = conv.participants.find((id) => id !== userId);
      let otherParticipant: any;
      let otherProfile: any;

      if (otherParticipantId?.startsWith('a')) {
        const agent = [
          { id: 'a1', name: 'Co-Founder Matcher' },
          { id: 'a2', name: 'Pitch Deck Reviewer' },
          { id: 'a3', name: 'Startup Advisor' },
          { id: 'a4', name: 'Market Analyst' },
          { id: 'a5', name: 'Fundraising Coach' },
          { id: 'a6', name: 'Legal & Equity Bot' },
          { id: 'a7', name: 'Technical Advisor' },
          { id: 'a8', name: 'Growth Strategist' },
          { id: 'a9', name: 'Research Assistant' },
          { id: 'a10', name: 'Mentor Finder' },
        ].find((a) => a.id === otherParticipantId);

        otherParticipant = {
          id: otherParticipantId,
          fullName: agent?.name || 'AI Assistant',
          roles: ['AI Assistant'],
          isAI: true,
        };
        otherProfile = {
          profilePhoto: `https://picsum.photos/seed/${otherParticipantId}/100/100`,
          headline: 'AI-Powered Strategy & Insights',
        };
      } else {
        otherParticipant = db.users.find((u) => u.id === otherParticipantId);
        otherProfile = db.profiles.find((p) => p.userId === otherParticipantId);
      }

      const lastMessage = db.messages
        .filter((m) => m.conversationId === conv.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      const unreadCount = db.messages.filter(
        (m) => m.conversationId === conv.id && m.senderId !== userId && !m.readStatus
      ).length;

      return {
        ...conv,
        otherParticipant: {
          ...otherParticipant,
          profile: otherProfile,
        },
        lastMessage: lastMessage?.body || 'No messages yet',
        lastMessageTime: lastMessage
          ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        lastMessageTimestamp: lastMessage ? new Date(lastMessage.createdAt).getTime() : 0,
        unreadCount,
      };
    });

    const sortedConversations = enrichedConversations.sort(
      (a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp
    );
    res.json(sortedConversations);
  });

  app.get('/api/messages/:conversationId', (req, res) => {
    const messages = db.messages.filter((m) => m.conversationId === req.params.conversationId);
    res.json(messages);
  });

  app.post('/api/messages/mark-read', (req, res) => {
    const { conversationId, userId } = req.body;
    db.messages.forEach((m) => {
      if (m.conversationId === conversationId && m.senderId !== userId) {
        m.readStatus = true;
      }
    });
    res.json({ success: true });
  });

  // AI Proxy (server-side GEMINI_API_KEY)
  const aiRateBuckets = new Map<string, { count: number; resetAt: number }>();
  const AI_RATE_LIMIT_PER_MINUTE = parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '30');

  app.post('/api/ai/generate', async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const bucket = aiRateBuckets.get(ip);
    if (!bucket || bucket.resetAt < now) {
      aiRateBuckets.set(ip, { count: 1, resetAt: now + 60_000 });
    } else if (++bucket.count > AI_RATE_LIMIT_PER_MINUTE) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfterMs: bucket.resetAt - now,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'AI proxy not configured — workspace fallback active',
      });
    }

    const { model, contents, config } = req.body ?? {};
    if (typeof model !== 'string' || !model || contents === undefined) {
      return res.status(400).json({ error: '`model` and `contents` are required' });
    }

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({ model, contents, config });
      return res.json({ text: response.text ?? '' });
    } catch (err) {
      console.error('AI proxy upstream error:', err);
      return res.status(502).json({ error: 'Upstream AI provider error' });
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_room', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('send_message', (data) => {
      const { conversationId, senderId, body, file } = data;
      const newMessage = {
        id: `m${db.messages.length + 1}`,
        conversationId,
        senderId,
        body: file ? `${body}\n\n[Attached File: ${file.name}]` : body,
        createdAt: new Date().toISOString(),
        readStatus: false,
        deliveredStatus: true,
        file: file ? { name: file.name } : undefined,
      };
      db.messages.push(newMessage);
      io.to(conversationId).emit('receive_message', newMessage);
    });
  });

  // ============================================================================
  // CORE STUDIO REST API (6-Axis Matching, Deal Room, Mentorship, Store)
  // ============================================================================

  app.get('/api/state', (_req, res) => {
    store.founders = enrichFoundersWithMatches(store.myProfile, store.founders);
    res.json({
      myProfile: store.myProfile,
      founders: store.founders,
      savedFounderIds: store.savedFounderIds,
      startups: store.startups,
      needCards: store.needCards,
      mentors: store.mentors,
      mentorBookings: store.mentorBookings,
      conversations: store.conversations,
      rsvpedEventIds: store.rsvpedEventIds,
    });
  });

  app.put('/api/profile', (req, res) => {
    const updates = req.body as Partial<FounderProfile>;
    const updatedName = updates.name || store.myProfile.name;
    const initials = updatedName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    store.myProfile = {
      ...store.myProfile,
      ...updates,
      id: 'me',
      avatar:
        updates.name && updates.name !== store.myProfile.name
          ? createAvatarSvg(initials || 'AK', '#1E1B4B', '#312E81', '#818CF8')
          : store.myProfile.avatar,
      updatedAtMs: Date.now(),
    };

    store.founders = enrichFoundersWithMatches(store.myProfile, store.founders);
    saveStore(store);
    broadcast('profile:updated', {
      myProfile: store.myProfile,
      founders: store.founders,
    });

    res.json({
      myProfile: store.myProfile,
      founders: store.founders,
    });
  });

  app.post('/api/founders/:id/save', (req, res) => {
    const { id } = req.params;
    const idx = store.savedFounderIds.indexOf(id);
    let saved = false;
    if (idx >= 0) {
      store.savedFounderIds.splice(idx, 1);
      saved = false;
    } else {
      store.savedFounderIds.push(id);
      saved = true;
    }
    saveStore(store);
    res.json({ savedFounderIds: store.savedFounderIds, saved });
  });

  app.post('/api/startups', (req, res) => {
    const body = req.body as Partial<StartupVenture>;
    const name = (body.name || 'New Venture').trim();
    const logoInitials =
      body.logo ||
      name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const newStartup: StartupVenture = {
      id: `sv-${Date.now()}`,
      name,
      logo: logoInitials,
      tagline: body.tagline || 'High-velocity B2B venture recruiting founding partners',
      description: body.description || '',
      industry: body.industry || 'B2B SaaS & AI',
      stage: body.stage || 'Prototype / MVP',
      location: body.location || store.myProfile.location,
      openRoles:
        Array.isArray(body.openRoles) && body.openRoles.length > 0
          ? body.openRoles
          : ['Co-Founder & GTM Lead'],
      equityOffer: body.equityOffer || '25% - 40%',
      fundingRaised: body.fundingRaised || 'Bootstrapped / Pre-Seed',
      teamSize: body.teamSize || '2 people',
      founderName: store.myProfile.name,
      founderAvatar: store.myProfile.avatar,
      tractionMetric: body.tractionMetric || 'MVP live with early design partners',
      verified: true,
      applicationsCount: 1,
      pitchDeck: body.pitchDeck || {
        problem: body.description || 'Solving critical workflow bottlenecks for modern teams.',
        solution: body.tagline || 'Automated platform with deep domain integration.',
        marketSize: '€5B+ addressable B2B market.',
        businessModel: 'Annual B2B SaaS subscription tiers.',
        tractionDetails: body.tractionMetric || 'Early pilot validation underway.',
        useOfFunds: 'Accelerate engineering roadmap and enterprise GTM.',
      },
    };

    store.startups.unshift(newStartup);
    saveStore(store);
    broadcast('startup:created', newStartup);
    res.json({ startup: newStartup, startups: store.startups });
  });

  app.post('/api/startups/:id/apply', (req, res) => {
    const { id } = req.params;
    const { role, pitchNote } = req.body as { role?: string; pitchNote?: string };
    const startup = store.startups.find((s) => s.id === id);
    if (!startup) {
      res.status(404).json({ error: 'Startup not found' });
      return;
    }

    startup.applicationsCount = (startup.applicationsCount || 1) + 1;
    const targetRole = role || startup.openRoles[0] || 'Co-Founder';
    const noteText =
      pitchNote?.trim() ||
      `Hi ${startup.founderName.split(' ')[0]}! I am applying for the "${targetRole}" founding role at ${startup.name}. Let's review our technical and GTM alignment.`;

    let conv = store.conversations.find((c) => c.participantName === startup.founderName);
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: store.myProfile.name,
      text: noteText,
      timestamp: 'Just now',
      isMe: true,
    };

    if (conv) {
      conv.messages.push(msg);
      conv.lastMessage = msg.text;
      conv.timestamp = 'Just now';
    } else {
      conv = {
        id: `c-${Date.now()}`,
        participantId: `founder-${startup.id}`,
        participantName: startup.founderName,
        participantAvatar: startup.founderAvatar,
        participantRole: `Founder @ ${startup.name}`,
        lastMessage: msg.text,
        timestamp: 'Just now',
        unreadCount: 0,
        online: true,
        messages: [msg],
      };
      store.conversations.unshift(conv);
    }

    saveStore(store);
    broadcast('startup:applied', { startup, conversation: conv });
    res.json({
      startup,
      conversation: conv,
      startups: store.startups,
      conversations: store.conversations,
    });
  });

  app.post('/api/needs', (req, res) => {
    const body = req.body as Omit<NeedCardItem, 'id' | 'createdAt' | 'applicantCount' | 'status'>;
    const newCard: NeedCardItem = {
      ...body,
      id: `need-${Date.now()}`,
      createdAt: 'Just now',
      applicantCount: 1,
      status: 'active',
    };
    store.needCards.unshift(newCard);
    saveStore(store);
    broadcast('need:created', newCard);
    res.json({ needCard: newCard, needCards: store.needCards });
  });

  app.post('/api/needs/:id/interest', (req, res) => {
    const { id } = req.params;
    const card = store.needCards.find((c) => c.id === id);
    if (!card) {
      res.status(404).json({ error: 'Need card not found' });
      return;
    }
    card.applicantCount += 1;
    saveStore(store);
    broadcast('need:updated', card);
    res.json({ needCard: card, needCards: store.needCards });
  });

  app.post('/api/conversations', (req, res) => {
    if (Array.isArray(req.body?.participants)) {
      const { participants } = req.body;
      let conversation = db.conversations.find(
        (c) =>
          c.participants.length === participants.length &&
          c.participants.every((p: string) => participants.includes(p))
      );
      if (!conversation) {
        conversation = {
          id: `c${db.conversations.length + 1}`,
          participants,
          status: 'Active',
          createdAt: new Date().toISOString(),
        };
        db.conversations.push(conversation);
      }
      res.json(conversation);
      return;
    }

    const { participantId, participantName, participantAvatar, participantRole, initialMessage } =
      req.body as {
        participantId: string;
        participantName: string;
        participantAvatar: string;
        participantRole: string;
        initialMessage?: string;
      };

    let conv = store.conversations.find(
      (c) => c.participantId === participantId || c.participantName === participantName
    );

    if (!conv) {
      const msgText =
        initialMessage ||
        `Hi ${(participantName || 'Founder').split(' ')[0]}! I saw your CoFounderBay profile and would love to explore co-founder synergy.`;
      conv = {
        id: `c-${Date.now()}`,
        participantId,
        participantName,
        participantAvatar,
        participantRole,
        lastMessage: msgText,
        timestamp: 'Just now',
        unreadCount: 0,
        online: true,
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderId: 'me',
            senderName: store.myProfile.name,
            text: msgText,
            timestamp: 'Just now',
            isMe: true,
          },
        ],
      };
      store.conversations.unshift(conv);
      saveStore(store);
      broadcast('conversation:created', conv);
    }

    res.json({ conversation: conv, conversations: store.conversations });
  });

  app.get(['/health', '/api/health', '/api/v1/health'], (_req, res) => {
    res.json({ status: 'ok', service: 'cofounderbay-unified-server', timestamp: Date.now() });
  });

  // Ensure no /api/* route ever falls through to Vite HTML SPA fallback
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      error: `API endpoint not found (${req.method} ${req.originalUrl})`,
    });
  });

  // ============================================================================
  // VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVING
  // ============================================================================
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(WORKSPACE_ROOT, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(
      `CoFounderBay Unified Full-Stack Server (Express + Socket.IO + WebSocket) listening on http://0.0.0.0:${PORT}`
    );
  });
}

startServer();


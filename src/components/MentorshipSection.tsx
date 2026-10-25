import React, { useState } from 'react';
import { 
  GraduationCap, 
  Star, 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle, 
  Users,
  MessageSquare,
  Trash2,
  X,
  Send
} from 'lucide-react';
import { MentorSession, MentorBooking } from '../types';
import { CardHead, CardFoot } from './CardAnatomy';
import { FactLine } from './FactLine';
import { PageHeader } from './PageHeader';

interface MentorshipSectionProps {
  mentors: MentorSession[];
  bookings: MentorBooking[];
  rsvpedEventIds: string[];
  onBookMentor: (mentor: MentorSession, slot: string, topic: string, notes: string) => void;
  onCancelBooking: (bookingId: string) => void;
  onToggleRsvp: (eventId: string) => void;
  onMessageMentor: (mentorName: string) => void;
  lang?: 'en' | 'el';
}

const UPCOMING_EVENTS = [
  {
    id: 'ev-1',
    title: 'Virtual Co-Founder Speed Pitching (Q4 Cohort)',
    titleEl: 'Διαδικτυακό Speed Pitching Συνιδρυτών (Q4 Cohort)',
    date: 'Thursday, Oct 29 · 6:00 PM CET',
    format: 'Live Video Speed Match',
    rsvps: 142,
    tag: 'Flagship Event',
    host: 'CoFounderBay Global',
  },
  {
    id: 'ev-2',
    title: 'Splitting Founder Equity Without Bitter Lawsuits',
    titleEl: 'Διαμοιρασμός Equity Συνιδρυτών Χωρίς Νομικές Διαμάχες',
    date: 'Tuesday, Nov 3 · 5:00 PM CET',
    format: 'Masterclass + Q&A',
    rsvps: 89,
    tag: 'Legal & Equity',
    host: 'FirstMark & Techstars Legal Guild',
  },
  {
    id: 'ev-3',
    title: 'From MVP to First $100K ARR in B2B SaaS',
    titleEl: 'Από το MVP στα Πρώτα $100K ARR στο B2B SaaS',
    date: 'Saturday, Nov 7 · 4:00 PM CET',
    format: 'Fireside Chat',
    rsvps: 210,
    tag: 'GTM Playbook',
    host: 'Elena Rostova & Marcus Vance',
  },
];

export const MentorshipSection: React.FC<MentorshipSectionProps> = ({
  mentors,
  bookings,
  rsvpedEventIds,
  onBookMentor,
  onCancelBooking,
  onToggleRsvp,
  onMessageMentor,
  lang = 'en',
}) => {
  const [bookingModalTarget, setBookingModalTarget] = useState<{
    mentor: MentorSession;
    slot: string;
  } | null>(null);
  const [topic, setTopic] = useState('Co-Founder Equity & Pre-Seed Pitch Review');
  const [notes, setNotes] = useState(
    'Would love feedback on our GTM milestones and founding team structure.'
  );

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalTarget) return;
    onBookMentor(bookingModalTarget.mentor, bookingModalTarget.slot, topic, notes);
    setBookingModalTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vetted Industry Advisors & Exited Founders"
        eyebrowEl="Έμπειροι Σύμβουλοι & Επιτυχημένοι Ιδρυτές"
        eyebrowIcon={GraduationCap}
        eyebrowColor="text-indigo-400"
        title="Book 1:1 Co-Founder Strategy Office Hours"
        titleEl="Κλείστε 1:1 Συνεδρία Στρατηγικής Συνιδρυτών"
        description="Get unvarnished feedback on your pitch deck, co-founder equity splits, and product-market fit from leaders who have done it before."
        descriptionEl="Λάβετε ειλικρινή ανατροφοδότηση για το pitch deck, το equity split και το product-market fit από έμπειρους mentors."
        lang={lang}
        metrics={[
          { label: 'Active Advisors', labelEl: 'Ενεργοί Mentors', value: mentors.length },
          { label: 'My Bookings', labelEl: 'Οι Κρατήσεις Μου', value: bookings.length, color: 'text-primary' },
          { label: 'Rating', labelEl: 'Αξιολόγηση', value: '4.95 / 5.0', color: 'text-amber-400' },
          { label: 'Upcoming Events', labelEl: 'Προσεχή Events', value: UPCOMING_EVENTS.length },
        ]}
      />

      {/* Confirmed Bookings Panel */}
      {bookings.length > 0 && (
        <div className="rounded-2xl border border-primary/30 bg-card p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                {lang === 'en'
                  ? `My Confirmed 1:1 Office Hours (${bookings.length})`
                  : `Οι Επιβεβαιωμένες Συνεδρίες Μου (${bookings.length})`}
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-background/60 p-4 gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={b.mentorAvatar}
                      alt={b.mentorName}
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-xl object-cover ring-1 ring-border"
                    />
                    <div>
                      <div className="text-xs font-bold text-foreground">{b.mentorName}</div>
                      <div className="text-[11px] text-primary font-medium">
                        {b.mentorCompany} · {b.slot}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 font-medium">
                        {b.topic}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <button
                    type="button"
                    onClick={() => onCancelBooking(b.id)}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{lang === 'en' ? 'Cancel' : 'Ακύρωση'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onMessageMentor(b.mentorName)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground hover:bg-accent"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      <span>{lang === 'en' ? 'Chat' : 'Συνομιλία'}</span>
                    </button>
                    <a
                      href={b.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>{lang === 'en' ? 'Meeting Link' : 'Σύνδεσμος Κλήσης'}</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {mentors.map((mentor) => {
          return (
            <div
              key={mentor.id}
              className="card-interactive group flex flex-col justify-between p-5 shadow-sm"
            >
              <div className="space-y-3.5">
                <CardHead
                  mark={
                    <img
                      src={mentor.mentorAvatar}
                      alt={mentor.mentorName}
                      referrerPolicy="no-referrer"
                      className="h-11 w-11 rounded-xl object-cover ring-1 ring-border"
                      loading="lazy"
                    />
                  }
                  title={
                    <span className="person-name font-semibold text-foreground group-hover:text-primary-accessible transition-colors">
                      {mentor.mentorName}
                    </span>
                  }
                  subtitle={
                    <span className="text-primary-accessible font-medium">
                      {mentor.company}
                    </span>
                  }
                  meta={
                    <FactLine
                      items={[
                        <span key="rating" className="inline-flex items-center gap-1 text-amber-400 font-medium font-mono tabular-nums">
                          <Star className="h-3 w-3 fill-amber-400" />
                          <span>{mentor.rating}</span>
                          <span className="text-muted-foreground">({mentor.reviewsCount})</span>
                        </span>,
                        `${mentor.durationMinutes} min call`,
                      ]}
                    />
                  }
                  aside={
                    <span className="text-xs font-semibold text-emerald-400">
                      {lang === 'en' ? 'Sponsored' : 'Δωρεάν'}
                    </span>
                  }
                  asideStays={false}
                />

                <p className="card-body line-clamp-2 leading-relaxed text-foreground/80">
                  {mentor.mentorTitle}
                </p>

                <FactLine items={mentor.expertise} />

                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-muted-foreground mb-2">
                    {lang === 'en' ? 'Select Available Slot:' : 'Επιλογή Διαθέσιμης Ώρας:'}
                  </div>
                  <div className="space-y-1.5">
                    {mentor.availableSlots.map((slot) => {
                      const isThisSlotBooked = bookings.some(
                        (b) => b.mentorId === mentor.id && b.slot === slot
                      );
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            if (isThisSlotBooked) {
                              onMessageMentor(mentor.mentorName);
                            } else {
                              setBookingModalTarget({ mentor, slot });
                            }
                          }}
                          className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                            isThisSlotBooked
                              ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                              : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-primary" />
                            <span>{slot}</span>
                          </span>
                          {isThisSlotBooked ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                              <CheckCircle className="h-3 w-3" />{' '}
                              {lang === 'en' ? 'Booked · Chat' : 'Κρατήθηκε · Chat'}
                            </span>
                          ) : (
                            <span className="text-[11px] text-primary-accessible font-semibold">
                              {lang === 'en' ? 'Reserve' : 'Κράτηση'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <CardFoot
                className="mt-4"
                meta={
                  <span className="text-muted-foreground font-mono tabular-nums">
                    {mentor.durationMinutes} min 1:1 call
                  </span>
                }
              >
                <button
                  type="button"
                  onClick={() => onMessageMentor(mentor.mentorName)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  <span>{lang === 'en' ? 'Message' : 'Μήνυμα'}</span>
                </button>
              </CardFoot>
            </div>
          );
        })}
      </div>

      {/* Demo Days & Ecosystem Webinars */}
      <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground">
            {lang === 'en' ? 'Upcoming Ecosystem Sessions & Demo Days' : 'Προσεχείς Συνεδρίες Οικοσυστήματος & Demo Days'}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lang === 'en'
              ? 'RSVP to pitch your concept live or discover co-founders in interactive virtual breakout rooms.'
              : 'Δηλώστε συμμετοχή για να παρουσιάσετε την ιδέα σας ή να γνωρίσετε συνιδρυτές σε εικονικά breakout rooms.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {UPCOMING_EVENTS.map((evt) => {
            const isRsvped = rsvpedEventIds.includes(evt.id);
            return (
              <div
                key={evt.id}
                className="card-interactive group flex flex-col justify-between p-4"
              >
                <div className="space-y-2.5">
                  <FactLine items={[evt.tag, evt.format]} />

                  <h4 className="card-title text-sm font-bold text-foreground leading-snug">
                    {lang === 'en' ? evt.title : evt.titleEl}
                  </h4>

                  <FactLine
                    items={[
                      <span key="date" className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-primary" />
                        <span>{evt.date}</span>
                      </span>,
                      `Host: ${evt.host}`,
                    ]}
                  />
                </div>

                <CardFoot
                  className="mt-4"
                  meta={
                    <span className="text-muted-foreground inline-flex items-center gap-1 font-mono tabular-nums">
                      <Users className="h-3 w-3 text-cyan-400" />
                      <span>{isRsvped ? evt.rsvps + 1 : evt.rsvps} {lang === 'en' ? 'attending' : 'συμμετοχές'}</span>
                    </span>
                  }
                >
                  <button
                    type="button"
                    onClick={() => onToggleRsvp(evt.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                      isRsvped
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {isRsvped ? (lang === 'en' ? '✓ Confirmed' : '✓ Επιβεβαιώθηκε') : (lang === 'en' ? 'RSVP Free' : 'Δωρεάν RSVP')}
                  </button>
                </CardFoot>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Agenda Modal */}
      {bookingModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={bookingModalTarget.mentor.mentorAvatar}
                  alt={bookingModalTarget.mentor.mentorName}
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {bookingModalTarget.mentor.mentorName}
                  </h4>
                  <p className="text-xs text-primary font-medium">{bookingModalTarget.slot}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBookingModalTarget(null)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  {lang === 'en' ? 'Session Agenda / Topic' : 'Θέμα Συζήτησης Συνεδρίας'}
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  {lang === 'en'
                    ? 'Context & Questions for Mentor'
                    : 'Σημειώσεις & Ερωτήσεις προς τον Mentor'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background p-3 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setBookingModalTarget(null)}
                  className="h-9 rounded-lg border border-border px-3.5 font-medium text-muted-foreground hover:text-foreground"
                >
                  {lang === 'en' ? 'Cancel' : 'Ακύρωση'}
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{lang === 'en' ? 'Confirm & Open Chat' : 'Επιβεβαίωση & Άνοιγμα Chat'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

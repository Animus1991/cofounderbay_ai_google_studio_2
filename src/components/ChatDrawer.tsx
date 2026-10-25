import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Video, 
  CheckCheck, 
  MessageSquare,
  Wifi
} from 'lucide-react';
import { Conversation } from '../types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  wsConnected?: boolean;
  lang?: 'en' | 'el';
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  wsConnected = false,
  lang = 'en',
}) => {
  const [inputText, setInputText] = useState('');
  const [scheduledToast, setScheduledToast] = useState(false);

  if (!isOpen) return null;

  const currentConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentConv) return;
    onSendMessage(currentConv.id, inputText.trim());
    setInputText('');
  };

  const handleScheduleCall = () => {
    if (!currentConv) return;
    onSendMessage(
      currentConv.id, 
      lang === 'en'
        ? "I'd love to schedule a 20-min Founder Intro call. Here is our meeting room link: https://meet.google.com/cfb-intro-call"
        : "Θα χαρώ να προγραμματίσουμε μια 20λεπτη κλήση γνωριμίας. Ορίστε ο σύνδεσμος: https://meet.google.com/cfb-intro-call"
    );
    setScheduledToast(true);
    setTimeout(() => setScheduledToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-xl flex-col border-l border-border bg-card shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-background/60">
          <div className="flex items-center gap-3">
            {currentConv ? (
              <div className="flex items-center gap-2.5">
                <img
                  src={currentConv.participantAvatar}
                  alt={currentConv.participantName}
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-xl object-cover ring-1 ring-border"
                />
                <div>
                  <h3 className="font-bold text-sm text-foreground">{currentConv.participantName}</h3>
                  <p className="text-[11px] text-muted-foreground">{currentConv.participantRole}</p>
                </div>
              </div>
            ) : (
              <h3 className="font-bold text-sm text-foreground">Co-Founder Inbox</h3>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Real WebSocket connection telemetry */}
            <span
              className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground mr-1"
              title="Real-time WebSocket state"
            >
              <Wifi className={`h-3.5 w-3.5 ${wsConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden sm:inline">{wsConnected ? 'WS Live' : 'HTTP Sync'}</span>
            </span>

            {currentConv && (
              <button
                type="button"
                onClick={handleScheduleCall}
                className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary-accessible hover:bg-primary/20 transition-colors"
                title="Send 20-min Founder Call Link"
              >
                <Video className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {lang === 'en' ? 'Send Call Link' : 'Κλήση Meet'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Schedule Toast notification */}
        {scheduledToast && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-2 text-xs text-emerald-300 flex items-center justify-between">
            <span>
              {lang === 'en'
                ? 'Intro Call invitation sent with video link!'
                : 'Η πρόσκληση κλήσης στάλθηκε στη συνομιλία!'}
            </span>
            <CheckCheck className="h-4 w-4" />
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Conversation List on Left */}
          <div className="w-2/5 border-r border-border bg-background/40 overflow-y-auto">
            <div className="p-2.5 text-[11px] font-semibold text-muted-foreground">
              {lang === 'en' ? `Threads (${conversations.length})` : `Συνομιλίες (${conversations.length})`}
            </div>
            <div className="divide-y divide-border/50">
              {conversations.map((c) => {
                const isSelected = currentConv?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectConversation(c.id)}
                    className={`flex w-full items-start gap-2.5 p-3 text-left transition-colors ${
                      isSelected ? 'bg-primary/15' : 'hover:bg-accent/50'
                    }`}
                  >
                    <img
                      src={c.participantAvatar}
                      alt={c.participantName}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-foreground truncate">
                          {c.participantName}
                        </span>
                        <span className="text-[10px] font-mono tabular-nums text-muted-foreground shrink-0">
                          {c.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {c.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chat Thread */}
          <div className="flex flex-1 flex-col justify-between overflow-hidden bg-background">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="mx-auto max-w-xs rounded-xl bg-card border border-border p-3 text-center text-xs text-muted-foreground">
                <MessageSquare className="h-4 w-4 text-primary mx-auto mb-1" />
                <span>
                  {lang === 'en'
                    ? 'Direct founder-to-founder channel synced via server WebSockets.'
                    : 'Άμεσο κανάλι επικοινωνίας συγχρονισμένο σε πραγματικό χρόνο.'}
                </span>
              </div>

              {currentConv?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      msg.isMe
                        ? 'bg-primary text-primary-foreground rounded-br-none shadow-sm'
                        : 'bg-card border border-border text-foreground rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="mt-1 text-[10px] font-mono tabular-nums text-muted-foreground px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="border-t border-border p-3 bg-card">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={
                    lang === 'en'
                      ? `Message ${currentConv?.participantName.split(' ')[0] || 'founder'}...`
                      : `Μήνυμα προς ${currentConv?.participantName.split(' ')[0] || 'συνιδρυτή'}...`
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

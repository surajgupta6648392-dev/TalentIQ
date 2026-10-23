import React, { useState } from 'react';
import {
  MessageSquare,
  Bot,
  User,
  Send,
  PhoneCall,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Code,
  Smile,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Candidate, PreScreeningMessage } from '../../types';

interface PreScreeningTabProps {
  candidate: Candidate;
  onUpdateCandidate: (updated: Candidate) => void;
  blindScreening: boolean;
}

export const PreScreeningTab: React.FC<PreScreeningTabProps> = ({
  candidate,
  onUpdateCandidate,
  blindScreening,
}) => {
  const pr = candidate.parsedResume;
  const ps = candidate.preScreening;

  const [inputMsg, setInputMsg] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'web_portal'>(
    ps?.channel || 'whatsapp'
  );
  const [isSimulatingCandidate, setIsSimulatingCandidate] = useState(false);

  const messages: PreScreeningMessage[] = ps?.conversation || [];

  const handleSendPrompt = (sender: 'recruiter' | 'ai', customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim()) return;

    const newMsg: PreScreeningMessage = {
      id: `msg_${Date.now()}`,
      sender,
      text: textToSend.trim(),
      timestamp: new Date().toISOString(),
      channel: selectedChannel,
    };

    const updatedConvo = [...messages, newMsg];

    const updatedCandidate: Candidate = {
      ...candidate,
      preScreening: {
        status: 'in_progress',
        channel: selectedChannel,
        conversation: updatedConvo,
        verifiedNoticePeriod: ps?.verifiedNoticePeriod || pr.noticePeriod || '30 days',
        verifiedSalaryExpectation: ps?.verifiedSalaryExpectation || '$140,000 / year',
        verifiedCurrentLocation: ps?.verifiedCurrentLocation || pr.location || 'Remote',
        verifiedTechCompetencies: ps?.verifiedTechCompetencies || pr.technicalSkills.slice(0, 4),
        toneAnalysis: ps?.toneAnalysis || 'Professional',
        suitabilityScore: ps?.suitabilityScore || 90,
        aiExecutiveSummary: ps?.aiExecutiveSummary || 'Interactive AI screening session in progress.',
      },
    };

    onUpdateCandidate(updatedCandidate);
    if (!customText) setInputMsg('');

    // Trigger auto AI candidate response simulation if initiated by recruiter/AI
    if (sender === 'ai' || sender === 'recruiter') {
      setIsSimulatingCandidate(true);
      setTimeout(() => {
        const candidateReplies = [
          `Thanks for confirming! Yes, my notice period is strictly 30 days but buy-out is negotiable. I am comfortable with hybrid or remote models.`,
          `Regarding technical depth: I've worked extensively with high-load microservices, distributed caching, and write end-to-end automated tests with Jest and Cypress.`,
          `I am available for the live engineering round this week after 3:00 PM EST.`,
        ];
        const randomReply = candidateReplies[Math.floor(Math.random() * candidateReplies.length)];

        const candMsg: PreScreeningMessage = {
          id: `msg_cand_${Date.now()}`,
          sender: 'candidate',
          text: randomReply,
          timestamp: new Date().toISOString(),
          channel: selectedChannel,
        };

        const finalConvo = [...updatedConvo, candMsg];
        const completedCandidate: Candidate = {
          ...updatedCandidate,
          preScreening: {
            ...updatedCandidate.preScreening!,
            status: 'completed',
            conversation: finalConvo,
            completedAt: new Date().toISOString(),
          },
        };
        onUpdateCandidate(completedCandidate);
        setIsSimulatingCandidate(false);
      }, 900);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Pre-Screening Summary Card */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-600 text-white rounded-lg">
                <Bot className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-900 text-sm">
                Conversational AI Pre-Screening & Candidate Verification
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                {ps?.status === 'completed' ? 'Screening Verified' : 'Session Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Automated multi-channel screening bot conducting instant WhatsApp/Web verification on notice period, salary bands, and core competencies.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-xl font-black text-emerald-700">
                {ps?.suitabilityScore || 88}/100
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Pre-Screen Suitability
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-left">
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[10px] block">
                Tone: {ps?.toneAnalysis || 'Professional'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Channel: {selectedChannel.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Executive AI Summary Box */}
        {ps?.aiExecutiveSummary && (
          <div className="mt-4 p-3 bg-white/90 rounded-xl border border-emerald-100 text-slate-700 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 mr-1">AI Executive Recruiter Summary:</span>
              <span>{ps.aiExecutiveSummary}</span>
            </div>
          </div>
        )}
      </div>

      {/* Verified Data Badges Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Verified Notice Period</span>
          </div>
          <div className="text-xs font-bold text-slate-800">
            {ps?.verifiedNoticePeriod || pr.noticePeriod || '30 days'}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Salary Expectations</span>
          </div>
          <div className="text-xs font-bold text-slate-800">
            {ps?.verifiedSalaryExpectation || '$130,000 - $155,000 / yr'}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span>Verified Location</span>
          </div>
          <div className="text-xs font-bold text-slate-800">
            {ps?.verifiedCurrentLocation || pr.location || 'Bengaluru / Remote'}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
            <Code className="w-3.5 h-3.5 text-amber-600" />
            <span>Core Competencies</span>
          </div>
          <div className="text-xs font-bold text-slate-800 truncate">
            {(ps?.verifiedTechCompetencies || pr.technicalSkills.slice(0, 3)).join(', ')}
          </div>
        </div>
      </div>

      {/* Interactive Conversation Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[400px]">
        {/* Chat Header */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800 text-xs">
              {selectedChannel === 'whatsapp' ? 'WhatsApp Business AI Assistant' : 'Web Portal Screening Chat'}
            </span>
            <span className="text-[10px] text-slate-400">
              with {blindScreening ? 'Candidate' : pr.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedChannel('whatsapp')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                selectedChannel === 'whatsapp'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              WhatsApp Bot
            </button>
            <button
              onClick={() => setSelectedChannel('web_portal')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                selectedChannel === 'web_portal'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Web Portal
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.map((m) => {
            const isBot = m.sender === 'ai';
            const isCandidate = m.sender === 'candidate';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[82%] ${
                  isCandidate ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold ${
                    isBot ? 'bg-emerald-600' : isCandidate ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`p-3 rounded-2xl text-xs space-y-1 shadow-2xs ${
                    isCandidate
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : isBot
                      ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] opacity-75">
                    <span className="font-bold">
                      {isBot ? 'TalentIQ Screening AI' : isCandidate ? (blindScreening ? 'Candidate' : pr.name) : 'Recruiter'}
                    </span>
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            );
          })}

          {isSimulatingCandidate && (
            <div className="flex gap-2 max-w-[80%] ml-auto flex-row-reverse items-center">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px]">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full text-[11px] animate-pulse">
                Candidate is typing response...
              </div>
            </div>
          )}
        </div>

        {/* Chat Control Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask candidate a custom verification question (or send quick prompt)..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt('recruiter')}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSendPrompt('ai', 'Could you describe a challenging bug or architecture problem you recently solved in production?')}
            className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold transition-colors hidden sm:inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Ask Tech Scenario</span>
          </button>
          <button
            onClick={() => handleSendPrompt('recruiter')}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shrink-0 shadow-2xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

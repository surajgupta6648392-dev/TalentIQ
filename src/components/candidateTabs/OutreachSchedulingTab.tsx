import React, { useState } from 'react';
import {
  Send,
  Calendar,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Globe,
  Sparkles,
  Link,
  Copy,
  Check
} from 'lucide-react';
import { Candidate, MultiChannelOutreach, InterviewBookingSlot } from '../../types';

interface OutreachSchedulingTabProps {
  candidate: Candidate;
  onUpdateCandidate: (updated: Candidate) => void;
  blindScreening: boolean;
}

export const OutreachSchedulingTab: React.FC<OutreachSchedulingTabProps> = ({
  candidate,
  onUpdateCandidate,
  blindScreening,
}) => {
  const pr = candidate.parsedResume;
  const out: MultiChannelOutreach = candidate.outreach || {
    stageAutomatedTriggers: true,
    whatsappOptIn: true,
    smsOptIn: true,
    emailOptIn: true,
    outreachHistory: [],
  };

  const [selectedTemplateLang, setSelectedTemplateLang] = useState<'en' | 'es' | 'hi' | 'de'>('en');
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Available interview slots
  const availableSlots: InterviewBookingSlot[] = [
    { id: 's1', datetime: '2026-10-15T10:00:00Z', recruiterName: 'Pankaj Gupta', bookedByCandidate: false, meetingLink: 'https://meet.google.com/tlq-int-01' },
    { id: 's2', datetime: '2026-10-15T14:30:00Z', recruiterName: 'David Chen', bookedByCandidate: false, meetingLink: 'https://meet.google.com/tlq-int-02' },
    { id: 's3', datetime: '2026-10-16T11:00:00Z', recruiterName: 'Elena Rostova', bookedByCandidate: false, meetingLink: 'https://meet.google.com/tlq-int-03' },
    { id: 's4', datetime: '2026-10-16T16:00:00Z', recruiterName: 'David Chen', bookedByCandidate: false, meetingLink: 'https://meet.google.com/tlq-int-04' },
  ];

  const candidateSlot = out.scheduledInterviewSlot;

  const handleBookSlot = (slot: InterviewBookingSlot) => {
    const updatedCandidate: Candidate = {
      ...candidate,
      status: 'interview',
      outreach: {
        ...out,
        scheduledInterviewSlot: { ...slot, bookedByCandidate: true },
        outreachHistory: [
          {
            id: `out_${Date.now()}`,
            channel: 'whatsapp',
            templateTitle: 'Interview Confirmation & Calendar Invite',
            sentAt: new Date().toISOString(),
            delivered: true,
            opened: true,
            replied: true,
            preview: `Interview confirmed for ${new Date(slot.datetime).toLocaleString()} with ${slot.recruiterName}. Meeting link: ${slot.meetingLink}`,
          },
          ...out.outreachHistory,
        ],
      },
      timeline: [
        {
          id: `tm_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorName: 'Candidate Self-Scheduler',
          action: 'Self-Scheduled Interview Slot',
          details: `Booked slot for ${new Date(slot.datetime).toLocaleString()} with ${slot.recruiterName}`,
        },
        ...candidate.timeline,
      ],
    };

    onUpdateCandidate(updatedCandidate);
  };

  const handleCancelSlot = () => {
    onUpdateCandidate({
      ...candidate,
      outreach: {
        ...out,
        scheduledInterviewSlot: undefined,
      },
    });
  };

  const handleSendTrigger = (type: 'status_update' | 'custom') => {
    setIsSending(true);
    setTimeout(() => {
      const newHistoryItem = {
        id: `out_${Date.now()}`,
        channel: selectedChannel,
        templateTitle: `${selectedChannel.toUpperCase()} Stage Notification (${candidate.status.toUpperCase()})`,
        sentAt: new Date().toISOString(),
        delivered: true,
        opened: true,
        preview: `Hello ${blindScreening ? 'Candidate' : pr.name}, your application status has moved to ${candidate.status.toUpperCase()}. Check your portal link for details.`,
      };

      onUpdateCandidate({
        ...candidate,
        outreach: {
          ...out,
          outreachHistory: [newHistoryItem, ...out.outreachHistory],
        },
      });
      setIsSending(false);
    }, 700);
  };

  const calendlyUrl = `https://talentiq.app/schedule/${candidate.id}?job=${candidate.jobId}`;

  const copyScheduleLink = () => {
    navigator.clipboard.writeText(calendlyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50 border border-sky-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-sky-600 text-white rounded-lg">
                <Calendar className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-900 text-sm">
                Multi-Channel Outreach & Self-Scheduling Engine
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 uppercase tracking-wide">
                Direct Sync Enabled
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Automated WhatsApp, SMS, and Email messaging sequences triggered on pipeline stage transitions, paired with a Calendly-style booking portal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyScheduleLink}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Candidate Invite Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendly-Style Self-Scheduling Slot Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Interactive Interview Slot Booking (Calendly-Style)</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Candidate selects their preferred time slot from recruiter calendar availability.
            </p>
          </div>

          {candidateSlot && (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Confirmed for {new Date(candidateSlot.datetime).toLocaleDateString()}</span>
              </span>
              <button
                onClick={handleCancelSlot}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
              >
                Reschedule
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {availableSlots.map((slot) => {
            const isSelected = candidateSlot?.datetime === slot.datetime;
            const dateObj = new Date(slot.datetime);
            return (
              <div
                key={slot.id}
                className={`p-3.5 rounded-xl border transition-all text-left space-y-2 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">
                    {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500">
                  Interviewer: <span className="font-semibold text-slate-700">{slot.recruiterName}</span>
                </div>

                <button
                  onClick={() => handleBookSlot(slot)}
                  className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700'
                  }`}
                >
                  {isSelected ? 'Confirmed Slot' : 'Select Slot'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Channel Notification Sequences & Dispatcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dispatch Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            <span>Send Direct Outreach</span>
          </h4>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-700 block">Outreach Channel</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                { id: 'sms', label: 'SMS', icon: Smartphone },
                { id: 'email', label: 'Email', icon: Mail },
              ].map((ch) => {
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChannel(ch.id as any)}
                    className={`p-2 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-colors ${
                      selectedChannel === ch.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-700 block">Template Language</label>
              <select
                value={selectedTemplateLang}
                onChange={(e) => setSelectedTemplateLang(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 mt-1"
              >
                <option value="en">English (US/UK)</option>
                <option value="es">Spanish (Español)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="de">German (Deutsch)</option>
              </select>
            </div>

            <button
              onClick={() => handleSendTrigger('status_update')}
              disabled={isSending}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs mt-2 disabled:opacity-50"
            >
              {isSending ? 'Sending Dispatch...' : `Send ${selectedChannel.toUpperCase()} Notification`}
            </button>
          </div>
        </div>

        {/* Outreach History Stream */}
        <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Multi-Channel Outreach History & Delivery Receipts</span>
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              {out.outreachHistory.length} Dispatches Sent
            </span>
          </h4>

          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {out.outreachHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.channel === 'whatsapp'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.channel === 'sms'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-violet-100 text-violet-800'
                      }`}
                    >
                      {item.channel}
                    </span>
                    <span className="font-bold text-slate-800">{item.templateTitle}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 italic">"{item.preview}"</p>
                <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-semibold pt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Delivered & Read</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

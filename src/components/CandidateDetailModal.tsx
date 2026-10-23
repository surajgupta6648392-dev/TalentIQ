import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Briefcase,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Tag,
  MessageSquare,
  UserCheck,
  UserX,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Trash2,
  Download,
  Share2,
  RefreshCw,
  Bot,
  Code2,
  TrendingUp,
  Send
} from 'lucide-react';
import { PreScreeningTab } from './candidateTabs/PreScreeningTab';
import { CodeVerificationTab } from './candidateTabs/CodeVerificationTab';
import { RetentionModelingTab } from './candidateTabs/RetentionModelingTab';
import { OutreachSchedulingTab } from './candidateTabs/OutreachSchedulingTab';
import {
  Candidate,
  JobDescription,
  CandidateStatus,
  UserProfile,
  CandidateNote,
} from '../types';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  jobs: JobDescription[];
  onStatusChange: (candidateId: string, newStatus: CandidateStatus, details?: string) => void;
  onAddNote: (candidateId: string, noteText: string) => void;
  onAddTag: (candidateId: string, tag: string) => void;
  onRemoveTag: (candidateId: string, tag: string) => void;
  onAssignRecruiter: (candidateId: string, recruiterId: string, recruiterName: string) => void;
  onReevaluateAgainstJob: (candidateId: string, jobId: string) => Promise<void>;
  onDeleteCandidate: (candidateId: string) => void;
  allUsers: UserProfile[];
  currentUser: UserProfile;
  blindScreening: boolean;
  onCompareWith?: (candidate: Candidate) => void;
  onUpdateCandidate?: (updated: Candidate) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  isOpen,
  onClose,
  jobs,
  onStatusChange,
  onAddNote,
  onAddTag,
  onRemoveTag,
  onAssignRecruiter,
  onReevaluateAgainstJob,
  onDeleteCandidate,
  allUsers,
  currentUser,
  blindScreening,
  onCompareWith,
  onUpdateCandidate,
}) => {
  if (!isOpen || !candidate) return null;

  const [activeTab, setActiveTab] = useState<
    'match' | 'profile' | 'screening' | 'code' | 'retention' | 'outreach' | 'notes' | 'raw'
  >('match');
  const [newNote, setNewNote] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [isReevaluating, setIsReevaluating] = useState(false);

  const pr = candidate.parsedResume;
  const ma = candidate.matchAnalysis;
  const currentJob = jobs.find((j) => j.id === candidate.jobId) || jobs[0];

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(candidate.id, newNote.trim());
    setNewNote('');
  };

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    onAddTag(candidate.id, newTagInput.trim());
    setNewTagInput('');
  };

  const handleJobSwitch = async (jobId: string) => {
    setIsReevaluating(true);
    try {
      await onReevaluateAgainstJob(candidate.id, jobId);
    } finally {
      setIsReevaluating(false);
    }
  };

  const score = ma?.matchScore ?? 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header Card */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shrink-0">
              {blindScreening ? 'C#' : pr.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-black text-slate-900">
                  {blindScreening ? `Candidate #${candidate.id.slice(-4)}` : pr.name}
                </h2>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    candidate.status === 'shortlisted'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : candidate.status === 'interview'
                      ? 'bg-violet-50 text-violet-700 border-violet-200'
                      : candidate.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {candidate.status}
                </span>

                {candidate.duplicateWarning && (
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Duplicate Warning
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-1">
                {pr.currentTitle || 'Not specified'} • {pr.totalExperienceYears} yrs experience •{' '}
                {blindScreening ? 'Region Masked' : pr.location || 'Not specified'}
              </p>

              {/* Tags */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {candidate.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md shadow-2xs"
                  >
                    <Tag className="w-2.5 h-2.5 text-slate-400" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => onRemoveTag(candidate.id, tag)}
                      className="text-slate-400 hover:text-slate-600 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <form onSubmit={handleAddTagSubmit} className="inline-flex">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="+ Add tag"
                    className="text-[10px] px-2 py-0.5 rounded-md border border-dashed border-slate-300 bg-transparent text-slate-600 hover:border-slate-400 focus:outline-none focus:border-indigo-500 w-20"
                  />
                </form>
              </div>
            </div>
          </div>

          {/* Quick Match Badge & Top Actions */}
          <div className="flex md:flex-col items-end justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xl font-black text-indigo-700">{score}%</span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Match Score
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onStatusChange(candidate.id, 'shortlisted', 'Recruiter verified strong match')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Shortlist</span>
              </button>
              <button
                onClick={() => onStatusChange(candidate.id, 'interview', 'Interview loop requested')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors shadow-2xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Interview</span>
              </button>
              <button
                onClick={() => onStatusChange(candidate.id, 'rejected', 'Did not meet requirements')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-semibold transition-colors"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 flex space-x-5 text-xs font-semibold bg-white overflow-x-auto">
          {[
            { id: 'match', label: 'Match Analysis' },
            { id: 'screening', label: 'AI Pre-Screening' },
            { id: 'code', label: 'GitHub & Code Audit' },
            { id: 'retention', label: 'Retention & Flight Risk' },
            { id: 'outreach', label: 'Outreach & Scheduling' },
            { id: 'profile', label: 'Resume Profile' },
            { id: 'notes', label: `Notes (${candidate.notes.length})` },
            { id: 'raw', label: 'Raw Text' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs space-y-6">
          {/* TAB 1: AI MATCH ANALYSIS */}
          {activeTab === 'match' && (
            <div className="space-y-6">
              {/* Target Job Switcher / Re-evaluator */}
              <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                    Evaluating Against Job:
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{currentJob?.title}</p>
                  <p className="text-[11px] text-slate-500">
                    Department: {currentJob?.department} • Min Experience: {currentJob?.minExperienceYears} yrs
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    disabled={isReevaluating}
                    value={candidate.jobId}
                    onChange={(e) => handleJobSwitch(e.target.value)}
                    className="text-xs font-semibold border border-indigo-200 rounded-lg px-2.5 py-1.5 bg-white text-indigo-950 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        Cross-evaluate: {j.title}
                      </option>
                    ))}
                  </select>
                  {isReevaluating && <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />}
                </div>
              </div>

              {/* Explainable AI Summary Banner */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Explainable AI Evaluation ({ma?.aiModelVersion || 'gemini-3.8-flash'})</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ma?.category === 'Strong Match'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        : ma?.category === 'Potential Match'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    {ma?.category}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  {ma?.explanationSummary || 'Candidate evaluated across all configured job criteria.'}
                </p>
              </div>

              {/* 6-Factor Score Breakdown */}
              {ma?.scoreBreakdown && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Transparent Score Breakdown (Configured Weights)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>Required Skills ({ma.weightsUsed.requiredSkills}%)</span>
                        <span className="font-mono font-bold text-indigo-600">
                          {ma.scoreBreakdown.requiredSkillsScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${ma.scoreBreakdown.requiredSkillsScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>Relevant Experience ({ma.weightsUsed.relevantExperience}%)</span>
                        <span className="font-mono font-bold text-indigo-600">
                          {ma.scoreBreakdown.relevantExperienceScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${ma.scoreBreakdown.relevantExperienceScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>Role Alignment ({ma.weightsUsed.jobRoleAlignment}%)</span>
                        <span className="font-mono font-bold text-indigo-600">
                          {ma.scoreBreakdown.jobRoleAlignmentScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${ma.scoreBreakdown.jobRoleAlignmentScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>Preferred Skills ({ma.weightsUsed.preferredSkills}%)</span>
                        <span className="font-mono font-bold text-indigo-600">
                          {ma.scoreBreakdown.preferredSkillsScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${ma.scoreBreakdown.preferredSkillsScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>Education/Certs ({ma.weightsUsed.educationCertifications}%)</span>
                        <span className="font-mono font-bold text-indigo-600">
                          {ma.scoreBreakdown.educationCertScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${ma.scoreBreakdown.educationCertScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex justify-between font-medium text-slate-700 mb-1">
                        <span>Projects & Domain ({ma.weightsUsed.projectsDomain}%)</span>
                        <span className="font-mono font-bold text-indigo-600">
                          {ma.scoreBreakdown.projectsDomainScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${ma.scoreBreakdown.projectsDomainScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Matched vs Missing Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Matched Requirements ({ma?.matchedRequiredSkills.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ma?.matchedRequiredSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-800 font-semibold"
                      >
                        ✓ {s}
                      </span>
                    ))}
                    {(!ma?.matchedRequiredSkills || ma.matchedRequiredSkills.length === 0) && (
                      <span className="text-slate-400">None matched</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Missing Mandatory Requirements ({ma?.missingRequiredSkills.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ma?.missingRequiredSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white border border-rose-200 text-rose-800 font-semibold"
                      >
                        ✕ {s}
                      </span>
                    ))}
                    {(!ma?.missingRequiredSkills || ma.missingRequiredSkills.length === 0) && (
                      <span className="text-emerald-700 font-semibold">Zero missing requirements!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Evidence Quotes from Resume */}
              {ma?.evidenceQuotes && ma.evidenceQuotes.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Direct Evidence Quotes from Candidate's Resume</span>
                  </h3>
                  <div className="space-y-2.5">
                    {ma.evidenceQuotes.map((eq, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{eq.claim}</span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-sm ${
                              eq.confidence === 'high'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {eq.confidence} confidence
                          </span>
                        </div>
                        <p className="text-slate-600 italic">"{eq.evidence}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Potential Concerns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-emerald-700">
                    Key Strengths Relative to Job
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    {ma?.keyStrengths.map((str, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-amber-700">
                    Potential Concerns & Discussion Points
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    {ma?.potentialConcerns.map((con, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {con}
                      </li>
                    ))}
                    {(!ma?.potentialConcerns || ma.potentialConcerns.length === 0) && (
                      <li className="text-slate-400 list-none">No concerns flagged.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARSED QUALIFICATIONS */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Contact & Availability */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Email</span>
                  <span className="font-semibold text-slate-800 break-all">
                    {blindScreening ? '[Protected]' : pr.email || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Phone</span>
                  <span className="font-semibold text-slate-800">
                    {blindScreening ? '[Protected]' : pr.phone || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Location</span>
                  <span className="font-semibold text-slate-800">{pr.location || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Notice Period</span>
                  <span className="font-semibold text-slate-800">{pr.noticePeriod || 'Not specified'}</span>
                </div>
              </div>

              {/* Technical & Soft Skills */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Technical Skills ({pr.technicalSkills.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {pr.technicalSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                  {pr.technicalSkills.length === 0 && <span className="text-slate-400">None extracted</span>}
                </div>

                {pr.softSkills.length > 0 && (
                  <div className="pt-2">
                    <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                      Soft & Leadership Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {pr.softSkills.map((ss, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {ss}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Work Experience */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Employment History ({pr.employmentHistory.length} roles)</span>
                </h3>
                <div className="space-y-3">
                  {pr.employmentHistory.map((role, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 space-y-1 bg-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{role.title}</h4>
                          <p className="text-slate-600 font-medium text-[11px]">{role.company}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {role.startDate} - {role.endDate || (role.current ? 'Present' : '')}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-2 leading-relaxed">{role.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Education</span>
                  </h4>
                  {pr.education.map((edu, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <p className="font-bold text-slate-900">
                        {edu.degree} in {edu.field}
                      </p>
                      <p className="text-slate-500">
                        {blindScreening ? 'Accredited University' : edu.institution} •{' '}
                        {blindScreening ? 'Completed' : edu.graduationYear}
                      </p>
                    </div>
                  ))}
                  {pr.education.length === 0 && <p className="text-slate-400">Not specified</p>}
                </div>

                <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Certifications</span>
                  </h4>
                  {pr.certifications.map((cert, idx) => (
                    <div key={idx} className="text-slate-800 font-medium">
                      • {cert}
                    </div>
                  ))}
                  {pr.certifications.length === 0 && <p className="text-slate-400">None specified</p>}
                </div>
              </div>

              {/* Projects & External Links */}
              {pr.projects.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Featured Projects
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pr.projects.map((proj, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-slate-200 space-y-1 bg-white">
                        <p className="font-bold text-slate-900">{proj.title}</p>
                        <div className="flex flex-wrap gap-1">
                          {proj.technologies?.map((tech, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                        <p className="text-slate-600 text-[11px]">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: CONVERSATIONAL AI PRE-SCREENING */}
          {activeTab === 'screening' && (
            <PreScreeningTab
              candidate={candidate}
              onUpdateCandidate={onUpdateCandidate || (() => {})}
              blindScreening={blindScreening}
            />
          )}

          {/* TAB: DEEP GITHUB & CODE AUDIT */}
          {activeTab === 'code' && (
            <CodeVerificationTab
              candidate={candidate}
              onUpdateCandidate={onUpdateCandidate || (() => {})}
              blindScreening={blindScreening}
            />
          )}

          {/* TAB: PREDICTIVE RETENTION & FLIGHT RISK */}
          {activeTab === 'retention' && (
            <RetentionModelingTab
              candidate={candidate}
              blindScreening={blindScreening}
            />
          )}

          {/* TAB: MULTI-CHANNEL OUTREACH & SELF-SCHEDULING */}
          {activeTab === 'outreach' && (
            <OutreachSchedulingTab
              candidate={candidate}
              onUpdateCandidate={onUpdateCandidate || (() => {})}
              blindScreening={blindScreening}
            />
          )}

          {/* TAB: NOTES & TIMELINE */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Add Note Form */}
              <form onSubmit={handleAddNoteSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Add Recruiter Evaluation Note</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record interview notes, compensation requirements, technical feedback..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500/20"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-2xs"
                  >
                    Post Note as {currentUser.name}
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                  Internal Notes ({candidate.notes.length})
                </h4>
                {candidate.notes.map((note) => (
                  <div key={note.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <img
                          src="/WIN_20260330_16_38_52_Pro.jpg"
                          alt={note.authorName}
                          referrerPolicy="no-referrer"
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <span className="font-bold text-slate-800">
                          {note.authorName}{' '}
                          <span className="font-normal text-slate-400">({note.authorRole.replace('_', ' ')})</span>
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed pl-7">{note.text}</p>
                  </div>
                ))}
                {candidate.notes.length === 0 && (
                  <p className="text-slate-400 italic">No notes added yet.</p>
                )}
              </div>

              {/* Activity Timeline */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Activity History Trail</span>
                </h4>
                <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-2">
                  {candidate.timeline.map((event) => (
                    <div key={event.id} className="text-[11px] space-y-0.5 relative">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 absolute -left-[17px] top-1.5" />
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{event.action}</span>
                        <span className="text-slate-400 text-[10px]">by {event.actorName}</span>
                      </div>
                      <p className="text-slate-500">{event.details}</p>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RAW RESUME */}
          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-mono text-[11px]">
                  File: {candidate.originalFileName} ({(candidate.originalFileSize / 1024).toFixed(1)} KB)
                </span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm text-[10px]">
                  OCR / Text Ingestion Verified
                </span>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
                {pr.rawText}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDeleteCandidate(candidate.id)}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Candidate (GDPR)</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

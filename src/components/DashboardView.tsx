import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Briefcase,
  TrendingUp,
  AlertCircle,
  Award,
  Sparkles,
  ArrowRight,
  UploadCloud,
  Layers,
  ShieldCheck,
  CalendarCheck,
  Mail,
  Phone,
  Calendar,
  UserCheck
} from 'lucide-react';
import { Candidate, JobDescription, AuditLogEntry, UserProfile } from '../types';

interface DashboardViewProps {
  candidates: Candidate[];
  jobs: JobDescription[];
  auditLogs: AuditLogEntry[];
  currentUser?: UserProfile;
  onNavigateTab: (tab: string) => void;
  onSelectCandidate: (candidate: Candidate) => void;
  onOpenUpload: () => void;
  onOpenNewJob: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  candidates,
  jobs,
  auditLogs,
  currentUser,
  onNavigateTab,
  onSelectCandidate,
  onOpenUpload,
  onOpenNewJob,
}) => {
  const totalResumes = candidates.length;
  const processedCount = candidates.filter(c => c.matchAnalysis).length;
  const shortlistedCount = candidates.filter(c => c.status === 'shortlisted').length;
  const interviewCount = candidates.filter(c => c.status === 'interview').length;
  const needsReviewCount = candidates.filter(c => c.matchAnalysis?.category === 'Needs Review').length;

  const validScores = candidates
    .map(c => c.matchAnalysis?.matchScore)
    .filter((s): s is number => typeof s === 'number');
  const avgScore = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 0;

  // Category counts
  const strongMatches = candidates.filter(c => c.matchAnalysis?.category === 'Strong Match');
  const potentialMatches = candidates.filter(c => c.matchAnalysis?.category === 'Potential Match');
  const reviewMatches = candidates.filter(c => c.matchAnalysis?.category === 'Needs Review');
  const doesNotMeet = candidates.filter(c => c.matchAnalysis?.category === 'Does Not Meet Requirements');

  // Score distribution buckets: 90-100, 80-89, 70-79, 60-69, <60
  const b90 = validScores.filter(s => s >= 90).length;
  const b80 = validScores.filter(s => s >= 80 && s < 90).length;
  const b70 = validScores.filter(s => s >= 70 && s < 80).length;
  const b60 = validScores.filter(s => s >= 60 && s < 70).length;
  const bLow = validScores.filter(s => s < 60).length;

  const maxBucket = Math.max(1, b90, b80, b70, b60, bLow);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Talent Intelligence & Screening Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Autonomous Resume Screening with Transparent Matching
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Parse hundreds of resumes across PDF, DOCX, and text formats. Evaluate candidates with configurable 6-factor weighting, auditable resume evidence, and verified demographic bias protection.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Bulk Upload Resumes</span>
            </button>
            <button
              onClick={() => onNavigateTab('candidates')}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>View Ranked Candidates ({candidates.length})</span>
            </button>
            <button
              onClick={onOpenNewJob}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              <span>Create New Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Resumes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalResumes}</span>
            <span className="text-xs font-medium text-emerald-600">100% indexed</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{processedCount} AI-analyzed</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shortlisted</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{shortlistedCount}</span>
            <span className="text-xs font-medium text-slate-500">
              ({totalResumes ? Math.round((shortlistedCount / totalResumes) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">High qualification match</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interview Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-violet-700">{interviewCount}</span>
            <span className="text-xs font-medium text-violet-600">Scheduled</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Next round interviews</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Match Score</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-700">{avgScore}%</span>
            <span className="text-xs font-medium text-slate-500">Benchmark: 75%</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{needsReviewCount} candidates in review</p>
        </div>
      </div>

      {/* Analytics & Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Categorization Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Screening Categories</h3>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">
                Rule-Based
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Automated classification using configurable thresholds and mandatory skill requirements.
            </p>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Strong Match (≥80%)
                  </span>
                  <span className="font-bold text-slate-800">{strongMatches.length}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${totalResumes ? (strongMatches.length / totalResumes) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-blue-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Potential Match (65–79%)
                  </span>
                  <span className="font-bold text-slate-800">{potentialMatches.length}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${totalResumes ? (potentialMatches.length / totalResumes) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Needs Review (50–64%)
                  </span>
                  <span className="font-bold text-slate-800">{reviewMatches.length}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${totalResumes ? (reviewMatches.length / totalResumes) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-rose-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Does Not Meet (&lt;50%)
                  </span>
                  <span className="font-bold text-slate-800">{doesNotMeet.length}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${totalResumes ? (doesNotMeet.length / totalResumes) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('candidates')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-between w-full"
            >
              <span>Review all candidates</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Score Distribution Histogram */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Score Range Histogram</h3>
              <span className="text-[11px] text-slate-400">Total Scores: {validScores.length}</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Distribution of candidate match scores (0–100) generated by Gemini 3.8 Flash.
            </p>

            <div className="h-40 flex items-end gap-3 pt-4">
              {[
                { label: '90-100', count: b90, color: 'bg-emerald-500' },
                { label: '80-89', count: b80, color: 'bg-emerald-400' },
                { label: '70-79', count: b70, color: 'bg-blue-400' },
                { label: '60-69', count: b60, color: 'bg-amber-400' },
                { label: '<60', count: bLow, color: 'bg-rose-400' },
              ].map((bar, idx) => {
                const heightPercent = (bar.count / maxBucket) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[11px] font-bold text-slate-700">{bar.count}</span>
                    <div
                      className={`w-full rounded-t-md ${bar.color} transition-all duration-500 min-h-[4px]`}
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                    />
                    <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap mt-1">{bar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Auditable scoring weights
            </span>
            <span className="font-semibold text-slate-700">Avg: {avgScore}%</span>
          </div>
        </div>

        {/* Active Jobs & Pipeline Funnel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Active Roles ({jobs.length})</h3>
              <button
                onClick={() => onNavigateTab('jobs')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {jobs.slice(0, 3).map((job) => {
                const jobCandidates = candidates.filter(c => c.jobId === job.id);
                return (
                  <div
                    key={job.id}
                    onClick={() => onNavigateTab('jobs')}
                    className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{job.title}</p>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700">
                        {job.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                      <span>{job.department}</span>
                      <span>•</span>
                      <span>{jobCandidates.length} applicants</span>
                      <span>•</span>
                      <span className="text-indigo-600 font-medium">{job.workplaceType}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('pipeline')}
              className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Open Pipeline Kanban Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Ranked Candidates Table & Recent Recruiter Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Shortlisted Candidates */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Highest Ranked Candidates</h3>
              <p className="text-xs text-slate-500">Ranked by explainable multi-factor match score</p>
            </div>
            <button
              onClick={() => onNavigateTab('candidates')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View All ({candidates.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {candidates
              .slice()
              .sort((a, b) => (b.matchAnalysis?.matchScore || 0) - (a.matchAnalysis?.matchScore || 0))
              .slice(0, 5)
              .map((candidate) => {
                const pr = candidate.parsedResume;
                const ma = candidate.matchAnalysis;
                const score = ma?.matchScore ?? 0;

                return (
                  <div
                    key={candidate.id}
                    onClick={() => onSelectCandidate(candidate)}
                    className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                        {pr.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{pr.name}</p>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 capitalize">
                            {candidate.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {pr.currentTitle} • {pr.totalExperienceYears} yrs experience • {pr.location}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {pr.technicalSkills.slice(0, 4).map((skill, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {pr.technicalSkills.length > 4 && (
                            <span className="text-[10px] text-slate-400">+{pr.technicalSkills.length - 4}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span
                          className={`text-base font-black ${
                            score >= 80 ? 'text-emerald-700' : score >= 65 ? 'text-blue-700' : 'text-amber-700'
                          }`}
                        >
                          {score}%
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          ma?.category === 'Strong Match'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : ma?.category === 'Potential Match'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}
                      >
                        {ma?.category}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Audit Log & Activity Stream */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Recruiter Activity</h3>
                <p className="text-xs text-slate-500">Immutable audit log trail</p>
              </div>
              <button
                onClick={() => onNavigateTab('settings')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                All Logs
              </button>
            </div>

            <div className="p-4 space-y-3.5 divide-y divide-slate-100">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800">{log.actorName}</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {log.action.replace(/_/g, ' ')}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Full compliance & recruiter action auditing active.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

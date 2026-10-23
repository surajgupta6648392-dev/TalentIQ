import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Users,
  Copy,
  Edit3,
  Trash2,
  Sliders,
  Sparkles,
  ExternalLink,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { JobDescription, Candidate } from '../types';

interface JobsViewProps {
  jobs: JobDescription[];
  candidates: Candidate[];
  onOpenNewJob: () => void;
  onEditJob: (job: JobDescription) => void;
  onDuplicateJob: (job: JobDescription) => void;
  onDeleteJob: (jobId: string) => void;
  onSelectJobForCandidates: (jobId: string) => void;
  templates: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[];
  onInstantiateTemplate: (tmpl: any) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  candidates,
  onOpenNewJob,
  onEditJob,
  onDuplicateJob,
  onDeleteJob,
  onSelectJobForCandidates,
  templates,
  onInstantiateTemplate,
}) => {
  const [filterDept, setFilterDept] = useState('all');

  const departments = Array.from(new Set(jobs.map(j => j.department)));
  const filteredJobs = jobs.filter(
    j => filterDept === 'all' || j.department === filterDept
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Job Descriptions & Pools</h1>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
              {jobs.length} Active Positions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain independent candidate pools, role requirements, and calibrated AI matching weights per job.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-medium text-slate-700"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenNewJob}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job</span>
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((job) => {
          const jobCandidates = candidates.filter(c => c.jobId === job.id);
          const shortlistedCount = jobCandidates.filter(c => c.status === 'shortlisted').length;
          const scores = jobCandidates.map(c => c.matchAnalysis?.matchScore).filter((s): s is number => typeof s === 'number');
          const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

          return (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {job.department}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">{job.title}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      job.status === 'Open'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location} ({job.workplaceType})
                  </span>
                  <span>•</span>
                  <span>{job.minExperienceYears}-{job.maxExperienceYears} yrs exp</span>
                </div>

                <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {job.overview || 'No overview specified.'}
                </p>

                {/* Required Skills Chips */}
                <div className="mt-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Mandatory Skills ({job.requiredSkills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills.slice(0, 4).map((s, idx) => (
                      <span key={idx} className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {s}
                      </span>
                    ))}
                    {job.requiredSkills.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-medium px-1 py-0.5">
                        +{job.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Pool Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Pool</span>
                    <span className="font-bold text-slate-800">{jobCandidates.length}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <span className="text-[10px] text-emerald-600 block">Shortlisted</span>
                    <span className="font-bold text-emerald-700">{shortlistedCount}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50">
                    <span className="text-[10px] text-indigo-600 block">Avg Score</span>
                    <span className="font-bold text-indigo-700">{avgScore !== null ? `${avgScore}%` : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectJobForCandidates(job.id)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Candidates ({jobCandidates.length})</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditJob(job)}
                    title="Edit Job & Scoring Weights"
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDuplicateJob(job)}
                    title="Duplicate as New Job"
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteJob(job.id)}
                    title="Delete Job"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reusable Template Library Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Pre-configured Role Templates</h2>
          </div>
          <span className="text-xs text-slate-400">Instant setup with calibrated scoring weights</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((tmpl, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                  {tmpl.department}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-2">{tmpl.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tmpl.overview}</p>
              </div>

              <button
                onClick={() => onInstantiateTemplate(tmpl)}
                className="mt-4 w-full py-1.5 px-3 bg-white hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-transparent text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Use This Template</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

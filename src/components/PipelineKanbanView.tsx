import React, { useState } from 'react';
import {
  Columns3,
  UserCheck,
  Calendar,
  XCircle,
  Clock,
  MoreVertical,
  Plus,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Candidate, CandidateStatus, JobDescription } from '../types';

interface PipelineKanbanViewProps {
  candidates: Candidate[];
  jobs: JobDescription[];
  selectedJobId: string;
  onStatusChange: (candidateId: string, newStatus: CandidateStatus, details?: string) => void;
  onSelectCandidate: (candidate: Candidate) => void;
  blindScreening: boolean;
}

const PIPELINE_COLUMNS: { id: CandidateStatus; label: string; color: string; badge: string }[] = [
  { id: 'applied', label: 'Applied', color: 'border-slate-300', badge: 'bg-slate-100 text-slate-700' },
  { id: 'screening', label: 'Screening', color: 'border-blue-300', badge: 'bg-blue-50 text-blue-700' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'border-emerald-300', badge: 'bg-emerald-50 text-emerald-700' },
  { id: 'interview', label: 'Interview', color: 'border-violet-300', badge: 'bg-violet-50 text-violet-700' },
  { id: 'selected', label: 'Selected / Offer', color: 'border-teal-300', badge: 'bg-teal-50 text-teal-700' },
  { id: 'rejected', label: 'Rejected', color: 'border-rose-300', badge: 'bg-rose-50 text-rose-700' },
];

export const PipelineKanbanView: React.FC<PipelineKanbanViewProps> = ({
  candidates,
  jobs,
  selectedJobId,
  onStatusChange,
  onSelectCandidate,
  blindScreening,
}) => {
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null);

  const filteredCandidates = candidates.filter(
    (c) => selectedJobId === 'all' || c.jobId === selectedJobId
  );

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCandidateId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: CandidateStatus) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('text/plain') || draggedCandidateId;
    if (candidateId) {
      onStatusChange(candidateId, newStatus, `Moved via drag & drop to ${newStatus}`);
    }
    setDraggedCandidateId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Columns3 className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Hiring Pipeline Board</h1>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
              {filteredCandidates.length} Active Candidates
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Drag candidates across stages: Applied → Screening → Shortlisted → Interview → Selected → Rejected.
          </p>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {PIPELINE_COLUMNS.map((column) => {
          const colCandidates = filteredCandidates.filter((c) => c.status === column.id);

          return (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              className="bg-slate-100/70 rounded-2xl p-3 flex flex-col min-w-[260px] xl:min-w-0 border border-slate-200/60 shadow-2xs"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${column.badge}`}>
                    {column.label}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">{colCandidates.length}</span>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-260px)]">
                {colCandidates.map((cand) => {
                  const pr = cand.parsedResume;
                  const ma = cand.matchAnalysis;
                  const score = ma?.matchScore ?? 0;

                  return (
                    <div
                      key={cand.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, cand.id)}
                      onClick={() => onSelectCandidate(cand)}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">
                            {blindScreening ? `Candidate #${cand.id.slice(-4)}` : pr.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{pr.currentTitle}</p>
                        </div>
                        <span
                          className={`font-mono text-xs font-black shrink-0 ${
                            score >= 80 ? 'text-emerald-700' : score >= 65 ? 'text-blue-700' : 'text-amber-700'
                          }`}
                        >
                          {score}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{pr.totalExperienceYears} yrs exp</span>
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded-sm ${
                            ma?.category === 'Strong Match'
                              ? 'bg-emerald-50 text-emerald-700'
                              : ma?.category === 'Potential Match'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {ma?.category?.split(' ')[0]}
                        </span>
                      </div>

                      {/* Quick skills */}
                      <div className="flex flex-wrap gap-1">
                        {pr.technicalSkills.slice(0, 2).map((sk, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded-sm"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>

                      {/* Stage Transition Quick Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-mono">
                          {new Date(cand.uploadedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {column.id !== 'shortlisted' && (
                            <button
                              onClick={() => onStatusChange(cand.id, 'shortlisted')}
                              title="Quick Shortlist"
                              className="px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100"
                            >
                              SL
                            </button>
                          )}
                          {column.id !== 'interview' && (
                            <button
                              onClick={() => onStatusChange(cand.id, 'interview')}
                              title="Schedule Interview"
                              className="px-1.5 py-0.5 rounded-sm bg-violet-50 text-violet-700 font-bold hover:bg-violet-100"
                            >
                              Int
                            </button>
                          )}
                          {column.id !== 'rejected' && (
                            <button
                              onClick={() => onStatusChange(cand.id, 'rejected')}
                              title="Reject"
                              className="px-1.5 py-0.5 rounded-sm bg-rose-50 text-rose-700 font-bold hover:bg-rose-100"
                            >
                              Rej
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colCandidates.length === 0 && (
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                    Drop candidates here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

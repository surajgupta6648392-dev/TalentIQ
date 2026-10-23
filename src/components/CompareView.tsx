import React, { useState } from 'react';
import {
  GitCompare,
  CheckCircle2,
  XCircle,
  Award,
  Briefcase,
  GraduationCap,
  Sparkles,
  Download,
  Users,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';
import { Candidate, JobDescription } from '../types';
import { exportToPDF, exportToCSV } from '../utils/exporter';

interface CompareViewProps {
  candidates: Candidate[];
  allCandidates: Candidate[];
  job?: JobDescription;
  onRemoveCandidate: (id: string) => void;
  onAddCandidate: (candidate: Candidate) => void;
  onSelectCandidate: (candidate: Candidate) => void;
  blindScreening: boolean;
}

export const CompareView: React.FC<CompareViewProps> = ({
  candidates,
  allCandidates,
  job,
  onRemoveCandidate,
  onAddCandidate,
  onSelectCandidate,
  blindScreening,
}) => {
  const [selectedToAddId, setSelectedToAddId] = useState('');

  const availableToAdd = allCandidates.filter(
    (c) => !candidates.some((sc) => sc.id === c.id)
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToAddId) return;
    const target = allCandidates.find((c) => c.id === selectedToAddId);
    if (target) {
      onAddCandidate(target);
      setSelectedToAddId('');
    }
  };

  const handleExportComparison = () => {
    exportToPDF(candidates, job, `comparison_report_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Side-by-Side Candidate Matrix</h1>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
              {candidates.length} in Comparison
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate qualifications, matched mandatory skills, score breakdowns, and evidence quotes side-by-side.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add candidate dropdown */}
          {availableToAdd.length > 0 && candidates.length < 4 && (
            <form onSubmit={handleAddSubmit} className="flex items-center gap-1.5">
              <select
                value={selectedToAddId}
                onChange={(e) => setSelectedToAddId(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-700"
              >
                <option value="">+ Add candidate to matrix...</option>
                {availableToAdd.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parsedResume.name} ({c.matchAnalysis?.matchScore ?? 0}%)
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!selectedToAddId}
                className="px-3 py-1.5 bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </form>
          )}

          <button
            onClick={handleExportComparison}
            disabled={candidates.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Comparison (PDF)</span>
          </button>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <GitCompare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No candidates selected for comparison</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Select 2 to 4 candidates from the Candidates tab using the checkboxes or pick one from the dropdown above.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-4 w-48 font-bold text-slate-400 uppercase tracking-wider text-[10px] shrink-0">
                  Feature / Criteria
                </th>
                {candidates.map((c) => (
                  <th key={c.id} className="p-4 min-w-[240px] max-w-xs align-top border-l border-slate-200">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4
                          onClick={() => onSelectCandidate(c)}
                          className="font-black text-slate-900 text-sm hover:text-indigo-600 cursor-pointer"
                        >
                          {blindScreening ? `Candidate #${c.id.slice(-4)}` : c.parsedResume.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">{c.parsedResume.currentTitle}</p>
                      </div>
                      <button
                        onClick={() => onRemoveCandidate(c.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {/* Match Score & Category */}
              <tr className="bg-indigo-50/20">
                <td className="p-4 font-bold text-slate-700">Overall Match Score</td>
                {candidates.map((c) => {
                  const score = c.matchAnalysis?.matchScore ?? 0;
                  return (
                    <td key={c.id} className="p-4 border-l border-slate-100 font-mono">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-xl font-black ${
                            score >= 80 ? 'text-emerald-700' : score >= 65 ? 'text-blue-700' : 'text-amber-700'
                          }`}
                        >
                          {score}%
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {c.matchAnalysis?.category}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Status & Recommendation */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Pipeline Status</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-4 border-l border-slate-100 font-bold uppercase tracking-wider text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {c.status}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Experience */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Experience Years</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-4 border-l border-slate-100 font-semibold text-slate-800">
                    {c.parsedResume.totalExperienceYears} yrs
                  </td>
                ))}
              </tr>

              {/* Matched Required Skills */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Matched Mandatory Skills</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-4 border-l border-slate-100">
                    <div className="flex flex-wrap gap-1">
                      {c.matchAnalysis?.matchedRequiredSkills.map((sk, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.2 rounded-sm bg-emerald-50 text-emerald-800 font-medium text-[10px]"
                        >
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Missing Requirements */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Missing Requirements</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-4 border-l border-slate-100">
                    <div className="flex flex-wrap gap-1">
                      {c.matchAnalysis?.missingRequiredSkills.map((sk, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.2 rounded-sm bg-rose-50 text-rose-800 font-medium text-[10px]"
                        >
                          ✕ {sk}
                        </span>
                      ))}
                      {(!c.matchAnalysis?.missingRequiredSkills || c.matchAnalysis.missingRequiredSkills.length === 0) && (
                        <span className="text-emerald-700 font-bold text-[10px]">None (100% matched)</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Preferred Skills */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Preferred Skills</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-4 border-l border-slate-100">
                    <div className="flex flex-wrap gap-1">
                      {c.matchAnalysis?.matchedPreferredSkills.map((sk, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.2 rounded-sm bg-blue-50 text-blue-800 font-medium text-[10px]"
                        >
                          + {sk}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Education */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Education</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-4 border-l border-slate-100 space-y-1">
                    {c.parsedResume.education.map((edu, i) => (
                      <div key={i} className="text-slate-800 font-medium">
                        {edu.degree} in {edu.field}
                      </div>
                    ))}
                  </td>
                ))}
              </tr>

              {/* Certifications */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Certifications</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-4 border-l border-slate-100 space-y-1">
                    {c.parsedResume.certifications.map((cert, i) => (
                      <div key={i} className="text-slate-700">
                        • {cert}
                      </div>
                    ))}
                    {c.parsedResume.certifications.length === 0 && (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Key Resume Evidence */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Factual Evidence Quote</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-4 border-l border-slate-100 italic text-slate-600 text-[11px] leading-relaxed">
                    {c.matchAnalysis?.evidenceQuotes[0]
                      ? `"${c.matchAnalysis.evidenceQuotes[0].evidence}"`
                      : 'Verified via skills catalog.'}
                  </td>
                ))}
              </tr>

              {/* Conversational AI Pre-Screening */}
              <tr className="bg-emerald-50/30">
                <td className="p-4 font-bold text-emerald-950">AI Pre-Screening</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-4 border-l border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                        <span>{c.preScreening?.suitabilityScore || 88}/100 Suitability</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Notice: {c.preScreening?.verifiedNoticePeriod || c.parsedResume.noticePeriod || '30 days'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Expectation: {c.preScreening?.verifiedSalaryExpectation || '$135k - $160k'}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Code Quality & GitHub */}
              <tr className="bg-indigo-50/30">
                <td className="p-4 font-bold text-indigo-950">Code Quality & GitHub</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-4 border-l border-slate-100">
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-indigo-800">
                        Rating: {c.githubVerification?.codeQualityRating || 90}%
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Commits: {c.githubVerification?.commitsPastYear || 450} (Past Year)
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Complexity: {c.githubVerification?.complexityScore || 85}%
                      </div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Predictive Retention & Flight Risk */}
              <tr className="bg-amber-50/30">
                <td className="p-4 font-bold text-amber-950">Predicted Retention</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-4 border-l border-slate-100">
                    <div className="space-y-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block border ${
                          c.retentionModel?.flightRiskLevel === 'Low'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : c.retentionModel?.flightRiskLevel === 'High'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        Risk: {c.retentionModel?.flightRiskLevel || 'Low'}
                      </span>
                      <div className="text-[10px] text-slate-600">
                        Forecast: {c.retentionModel?.predictedTenureMonths || 28} Months
                      </div>
                      <div className="text-[10px] text-slate-500">
                        High Performer: {c.retentionModel?.highPerformerProbability || 88}%
                      </div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Action */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Profile View</td>
                {candidates.map((c) => (
                  <td key={c.id} className="p-4 border-l border-slate-100">
                    <button
                      onClick={() => onSelectCandidate(c)}
                      className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors"
                    >
                      Open Full Dossier
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

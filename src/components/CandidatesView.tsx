import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Sparkles,
  ArrowUpDown,
  CheckSquare,
  Square,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Download,
  Eye,
  Tag,
  GitCompare,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Candidate, JobDescription, CandidateStatus, MatchCategory } from '../types';

interface CandidatesViewProps {
  candidates: Candidate[];
  jobs: JobDescription[];
  selectedJobId: string;
  onSelectCandidate: (candidate: Candidate) => void;
  onStatusChange: (candidateId: string, newStatus: CandidateStatus, details?: string) => void;
  onBulkStatusChange: (candidateIds: string[], newStatus: CandidateStatus) => void;
  onBulkExport: (selectedCandidates: Candidate[]) => void;
  onCompareCandidates: (selectedCandidates: Candidate[]) => void;
  blindScreening: boolean;
  onOpenUpload: () => void;
}

export const CandidatesView: React.FC<CandidatesViewProps> = ({
  candidates,
  jobs,
  selectedJobId,
  onSelectCandidate,
  onStatusChange,
  onBulkStatusChange,
  onBulkExport,
  onCompareCandidates,
  blindScreening,
  onOpenUpload,
}) => {
  // Search & Filters
  const [keywordSearch, setKeywordSearch] = useState('');
  const [nlSearchQuery, setNlSearchQuery] = useState('');
  const [nlExplanation, setNlExplanation] = useState<string | null>(null);
  const [isNlSearching, setIsNlSearching] = useState(false);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [minExpFilter, setMinExpFilter] = useState<number>(0);
  const [filterSkill, setFilterSkill] = useState<string>('all');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<'score' | 'exp' | 'name' | 'date'>('score');
  const [sortAsc, setSortAsc] = useState(false);

  // Multi-selection for bulk operations / compare
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Extract unique skills across candidate pool
  const allSkills = useMemo(() => {
    const s = new Set<string>();
    candidates.forEach((c) => {
      c.parsedResume.technicalSkills.forEach((sk) => s.add(sk));
    });
    return Array.from(s).sort();
  }, [candidates]);

  // Handle Natural Language Search via API
  const handleNlSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlSearchQuery.trim()) {
      setNlExplanation(null);
      return;
    }

    setIsNlSearching(true);
    try {
      const res = await fetch('/api/ai/nl-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: nlSearchQuery }),
      });
      const data = await res.json();
      if (data.minExperience) {
        setMinExpFilter(data.minExperience);
      }
      if (data.minScore) {
        setMinScoreFilter(data.minScore);
      }
      if (data.skills && data.skills.length > 0) {
        setKeywordSearch(data.skills.join(' '));
      }
      setNlExplanation(data.explanation || `Filter set by AI for: "${nlSearchQuery}"`);
    } catch (err) {
      console.warn('NL Search fallback:', err);
      setKeywordSearch(nlSearchQuery);
      setNlExplanation(`Applied text filter for "${nlSearchQuery}"`);
    } finally {
      setIsNlSearching(false);
    }
  };

  const handleResetFilters = () => {
    setKeywordSearch('');
    setNlSearchQuery('');
    setNlExplanation(null);
    setFilterCategory('all');
    setFilterStatus('all');
    setMinScoreFilter(0);
    setMinExpFilter(0);
    setFilterSkill('all');
  };

  // Filtered & Sorted candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      const pr = cand.parsedResume;
      const ma = cand.matchAnalysis;
      const score = ma?.matchScore ?? 0;

      // Job context
      if (selectedJobId !== 'all' && cand.jobId !== selectedJobId) {
        return false;
      }

      // Category
      if (filterCategory !== 'all' && ma?.category !== filterCategory) {
        return false;
      }

      // Status
      if (filterStatus !== 'all' && cand.status !== filterStatus) {
        return false;
      }

      // Min Score
      if (score < minScoreFilter) {
        return false;
      }

      // Min Experience
      if (pr.totalExperienceYears < minExpFilter) {
        return false;
      }

      // Skill
      if (filterSkill !== 'all' && !pr.technicalSkills.includes(filterSkill)) {
        return false;
      }

      // Keyword / Text Search
      if (keywordSearch.trim()) {
        const q = keywordSearch.toLowerCase();
        const inName = pr.name.toLowerCase().includes(q);
        const inTitle = pr.currentTitle.toLowerCase().includes(q);
        const inSkills = pr.technicalSkills.some((s) => s.toLowerCase().includes(q));
        const inRaw = pr.rawText.toLowerCase().includes(q);
        if (!inName && !inTitle && !inSkills && !inRaw) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'score') {
        comparison = (b.matchAnalysis?.matchScore || 0) - (a.matchAnalysis?.matchScore || 0);
      } else if (sortField === 'exp') {
        comparison = (b.parsedResume.totalExperienceYears || 0) - (a.parsedResume.totalExperienceYears || 0);
      } else if (sortField === 'name') {
        comparison = a.parsedResume.name.localeCompare(b.parsedResume.name);
      } else if (sortField === 'date') {
        comparison = new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      return sortAsc ? -comparison : comparison;
    });
  }, [
    candidates,
    selectedJobId,
    filterCategory,
    filterStatus,
    minScoreFilter,
    minExpFilter,
    filterSkill,
    keywordSearch,
    sortField,
    sortAsc,
  ]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredCandidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCandidates.map((c) => c.id)));
    }
  };

  const selectedCandidatesList = candidates.filter((c) => selectedIds.has(c.id));

  return (
    <div className="space-y-4">
      {/* Search & Natural Language Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Natural Language Query Bar */}
          <form onSubmit={handleNlSearch} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Sparkles className="w-4 h-4 text-indigo-600 absolute left-3 top-3" />
              <input
                type="text"
                value={nlSearchQuery}
                onChange={(e) => setNlSearchQuery(e.target.value)}
                placeholder='Ask AI Search: "Show candidates with 4+ years React and Docker in Austin" or "AWS certified"'
                className="w-full pl-9 pr-24 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isNlSearching}
                className="absolute right-1.5 top-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
              >
                {isNlSearching ? 'Searching...' : 'AI Search'}
              </button>
            </div>
          </form>

          {/* Quick Filter Buttons & Drawer Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                showFiltersDrawer
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {minScoreFilter > 0 || minExpFilter > 0 || filterSkill !== 'all' ? '●' : ''}</span>
            </button>

            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* AI Interpretation pill */}
        {nlExplanation && (
          <div className="p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                <strong>AI Query Applied:</strong> {nlExplanation}
              </span>
            </div>
            <button
              onClick={() => {
                setNlExplanation(null);
                setNlSearchQuery('');
              }}
              className="text-indigo-400 hover:text-indigo-700 font-bold ml-2"
            >
              Clear
            </button>
          </div>
        )}

        {/* Expandable Advanced Filters Drawer */}
        {showFiltersDrawer && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs animate-in fade-in duration-100">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">All Categories</option>
                <option value="Strong Match">Strong Match</option>
                <option value="Potential Match">Potential Match</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Does Not Meet Requirements">Does Not Meet</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Pipeline Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Min Score ({minScoreFilter}%)
              </label>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Min Exp ({minExpFilter} yrs)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={minExpFilter}
                onChange={(e) => setMinExpFilter(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Specific Skill
              </label>
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="w-full p-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="all">Any Skill</option>
                {allSkills.map((sk) => (
                  <option key={sk} value={sk}>
                    {sk}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Text Keyword
              </label>
              <input
                type="text"
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                placeholder="Title, company..."
                className="w-full p-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Toolbar when items are checked */}
      {selectedIds.size > 0 && (
        <div className="bg-indigo-900 text-white p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2 font-bold">
            <CheckSquare className="w-4 h-4 text-indigo-300" />
            <span>{selectedIds.size} candidates selected</span>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.size >= 2 && selectedIds.size <= 4 && (
              <button
                onClick={() => onCompareCandidates(selectedCandidatesList)}
                className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Side-by-Side Compare ({selectedIds.size})</span>
              </button>
            )}

            <button
              onClick={() => onBulkStatusChange(Array.from(selectedIds), 'shortlisted')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold transition-colors"
            >
              Shortlist Selected
            </button>

            <button
              onClick={() => onBulkStatusChange(Array.from(selectedIds), 'interview')}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 rounded-lg font-bold transition-colors"
            >
              Move to Interview
            </button>

            <button
              onClick={() => onBulkStatusChange(Array.from(selectedIds), 'rejected')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 rounded-lg font-bold transition-colors"
            >
              Reject Selected
            </button>

            <button
              onClick={() => onBulkExport(selectedCandidatesList)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg font-semibold flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-indigo-300 hover:text-white underline ml-1"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Candidate Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    {selectedIds.size === filteredCandidates.length && filteredCandidates.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th
                  onClick={() => {
                    setSortField('name');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Candidate</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('score');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Match Score</span>
                    <ArrowUpDown className="w-3 h-3 text-indigo-600" />
                  </div>
                </th>
                <th className="py-3 px-4">Classification</th>
                <th
                  onClick={() => {
                    setSortField('exp');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Experience</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Matched Skills / Mandatory</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map((cand) => {
                const pr = cand.parsedResume;
                const ma = cand.matchAnalysis;
                const score = ma?.matchScore ?? 0;
                const isSelected = selectedIds.has(cand.id);

                return (
                  <tr
                    key={cand.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleSelect(cand.id)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Candidate Name & Current Title */}
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => onSelectCandidate(cand)}
                        className="cursor-pointer group"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {blindScreening ? `Candidate #${cand.id.slice(-4)}` : pr.name}
                          </p>
                          {cand.duplicateWarning && (
                            <span title={cand.duplicateWarning.reason}>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            </span>
                          )}
                          {cand.sourceChannel && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {cand.sourceChannel}
                            </span>
                          )}
                          {cand.preScreening?.status === 'completed' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Pre-Screened
                            </span>
                          )}
                          {cand.githubVerification?.verified && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                              Code {cand.githubVerification.codeQualityRating}%
                            </span>
                          )}
                          {cand.retentionModel?.flightRiskLevel && (
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                                cand.retentionModel.flightRiskLevel === 'Low'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : cand.retentionModel.flightRiskLevel === 'High'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              Risk: {cand.retentionModel.flightRiskLevel}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                          {pr.currentTitle} • {blindScreening ? 'Masked' : pr.location}
                        </p>
                      </div>
                    </td>

                    {/* Score (0-100) */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-sm font-black ${
                            score >= 80 ? 'text-emerald-700' : score >= 65 ? 'text-blue-700' : 'text-amber-700'
                          }`}
                        >
                          {score}%
                        </span>
                      </div>
                      <div className="w-16 bg-slate-200 rounded-full h-1 mt-1">
                        <div
                          className={`h-1 rounded-full ${
                            score >= 80 ? 'bg-emerald-500' : score >= 65 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block border ${
                          ma?.category === 'Strong Match'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ma?.category === 'Potential Match'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : ma?.category === 'Needs Review'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {ma?.category || 'Evaluating'}
                      </span>
                    </td>

                    {/* Experience */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {pr.totalExperienceYears} yrs
                    </td>

                    {/* Matched skills */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(ma?.matchedRequiredSkills || pr.technicalSkills).slice(0, 3).map((sk, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded-sm"
                          >
                            {sk}
                          </span>
                        ))}
                        {ma?.missingRequiredSkills && ma.missingRequiredSkills.length > 0 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 bg-rose-50 text-rose-700 rounded-sm">
                            -{ma.missingRequiredSkills.length} missing
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Pipeline Status Select */}
                    <td className="py-3.5 px-4">
                      <select
                        value={cand.status}
                        onChange={(e) => onStatusChange(cand.id, e.target.value as CandidateStatus)}
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 border focus:outline-none ${
                          cand.status === 'shortlisted'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : cand.status === 'interview'
                            ? 'bg-violet-50 text-violet-800 border-violet-200'
                            : cand.status === 'rejected'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="applied">Applied</option>
                        <option value="screening">Screening</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Row Quick Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectCandidate(cand)}
                        className="px-2.5 py-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-bold rounded-lg transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCandidates.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No candidates match current filters.</p>
              <p className="text-xs text-slate-400">
                Try resetting search parameters or upload new resumes to this role.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold mr-2"
                >
                  Reset Filters
                </button>
                <button
                  onClick={onOpenUpload}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  Upload Resumes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{filteredCandidates.length}</strong> of {candidates.length} total candidates
          </span>
          <span className="font-mono text-[11px]">Ranked via Gemini 3.8 Flash AI Match Engine</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  BarChart3,
  PieChart,
  CheckCircle2,
  Sliders,
  FileText,
  Layers,
  Sparkles,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { Candidate, JobDescription } from '../types';
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  DEFAULT_EXPORT_COLUMNS,
  ExportColumnConfig,
} from '../utils/exporter';

interface AnalyticsViewProps {
  candidates: Candidate[];
  jobs: JobDescription[];
  selectedJobId: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  candidates,
  jobs,
  selectedJobId,
}) => {
  const [columns, setColumns] = useState<ExportColumnConfig[]>(DEFAULT_EXPORT_COLUMNS);
  const [exportFilterJob, setExportFilterJob] = useState<string>(selectedJobId);
  const [exportCategory, setExportCategory] = useState<string>('all');

  const filteredCandidates = candidates.filter((c) => {
    if (exportFilterJob !== 'all' && c.jobId !== exportFilterJob) return false;
    if (exportCategory !== 'all' && c.matchAnalysis?.category !== exportCategory) return false;
    return true;
  });

  const targetJob = jobs.find((j) => j.id === exportFilterJob);

  const toggleColumn = (key: string) => {
    setColumns(
      columns.map((c) => (c.key === key ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredCandidates,
      columns,
      `candidates_${targetJob ? targetJob.title.replace(/\s+/g, '_') : 'all'}_${Date.now()}.csv`
    );
  };

  const handleExportExcel = () => {
    exportToExcel(
      filteredCandidates,
      columns,
      `candidates_${targetJob ? targetJob.title.replace(/\s+/g, '_') : 'all'}_${Date.now()}.xlsx`
    );
  };

  const handleExportPDF = () => {
    exportToPDF(
      filteredCandidates,
      targetJob,
      `candidate_shortlist_report_${Date.now()}.pdf`
    );
  };

  // Funnel numbers
  const total = candidates.length;
  const applied = candidates.filter((c) => c.status === 'applied').length;
  const screening = candidates.filter((c) => c.status === 'screening').length;
  const shortlisted = candidates.filter((c) => c.status === 'shortlisted').length;
  const interview = candidates.filter((c) => c.status === 'interview').length;
  const selected = candidates.filter((c) => c.status === 'selected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Hiring Analytics & Report Exports</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Export candidate shortlists to CSV, Excel (.xlsx), or PDF with customizable data columns and executive summaries.
        </p>
      </div>

      {/* Enterprise Velocity & Sourcing Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Time-to-Fill Velocity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Pipeline Velocity & Time-to-Fill</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
              Avg. 14.2 Days
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Resume Ingestion ➔ AI Screening:</span>
              <span className="font-bold text-slate-900">&lt; 3 Minutes</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Screening ➔ Interview Booking:</span>
              <span className="font-bold text-slate-900">1.8 Days</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Interview Loop ➔ Offer Decision:</span>
              <span className="font-bold text-slate-900">8.4 Days</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Offer ➔ Acceptance Rate:</span>
              <span className="font-bold text-emerald-600">92%</span>
            </div>
          </div>
        </div>

        {/* Source-wise Conversion Tracking */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Sourcing Channel Conversion</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">ROI Optimization</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { channel: 'GitHub & Portfolios', applicants: 18, hires: 5, conv: '27.7%', color: 'bg-indigo-600' },
              { channel: 'Employee Referrals', applicants: 12, hires: 4, conv: '33.3%', color: 'bg-emerald-600' },
              { channel: 'LinkedIn Recruiter', applicants: 45, hires: 6, conv: '13.3%', color: 'bg-sky-600' },
              { channel: 'Direct Careers Page', applicants: 28, hires: 2, conv: '7.1%', color: 'bg-slate-600' },
            ].map((ch) => (
              <div key={ch.channel} className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                  <span>{ch.channel}</span>
                  <span className="text-slate-900">{ch.hires} Hired ({ch.conv})</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${ch.color} h-1.5 rounded-full`}
                    style={{ width: ch.conv }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage-wise Drop-off Analysis */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-amber-600" />
              <span>Stage Drop-off Diagnostics</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Leakage Points</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-800">
                <span>Screening ➔ Shortlist</span>
                <span className="text-rose-600">38% Filtered</span>
              </div>
              <p className="text-[10px] text-slate-500">Filtered by mandatory skills & experience thresholds</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-800">
                <span>Shortlist ➔ Interview</span>
                <span className="text-amber-600">14% Drop-off</span>
              </div>
              <p className="text-[10px] text-slate-500">Notice period mismatch or competing offers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Funnel & Conversion Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          { label: 'Applied', count: applied + screening + shortlisted + interview + selected, pct: '100%' },
          { label: 'Screened', count: screening + shortlisted + interview + selected, pct: total ? `${Math.round(((screening + shortlisted + interview + selected) / total) * 100)}%` : '0%' },
          { label: 'Shortlisted', count: shortlisted + interview + selected, pct: total ? `${Math.round(((shortlisted + interview + selected) / total) * 100)}%` : '0%' },
          { label: 'Interviewed', count: interview + selected, pct: total ? `${Math.round(((interview + selected) / total) * 100)}%` : '0%' },
          { label: 'Selected / Hired', count: selected, pct: total ? `${Math.round((selected / total) * 100)}%` : '0%' },
        ].map((step, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Stage {idx + 1}: {step.label}
            </span>
            <span className="text-2xl font-black text-slate-900 block">{step.count}</span>
            <span className="text-xs font-semibold text-indigo-600 block">{step.pct} Conversion</span>
          </div>
        ))}
      </div>

      {/* Export Configuration Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Custom Export Generator</h2>
            <p className="text-xs text-slate-500">
              Select columns and formats to generate customized recruiting reports for stakeholders.
            </p>
          </div>

          {/* Quick Format Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF Summary</span>
            </button>
          </div>
        </div>

        {/* Filters for export */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Job / Pool</label>
            <select
              value={exportFilterJob}
              onChange={(e) => setExportFilterJob(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
            >
              <option value="all">All Jobs ({candidates.length} candidates)</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Match Category Filter</label>
            <select
              value={exportCategory}
              onChange={(e) => setExportCategory(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
            >
              <option value="all">All Match Categories</option>
              <option value="Strong Match">Strong Match only (≥80%)</option>
              <option value="Potential Match">Potential Match only</option>
              <option value="Needs Review">Needs Review only</option>
            </select>
          </div>
        </div>

        {/* Configurable Columns Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Configurable Report Columns
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {columns.filter((c) => c.enabled).length} of {columns.length} columns selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {columns.map((col) => (
              <label
                key={col.key}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  col.enabled
                    ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900 font-semibold'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={col.enabled}
                  onChange={() => toggleColumn(col.key)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="truncate">{col.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Export Preview Table */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-700">
              Export Dataset Preview ({filteredCandidates.length} rows to be exported)
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-60">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                <tr>
                  {columns
                    .filter((c) => c.enabled)
                    .map((c) => (
                      <th key={c.key} className="p-2.5 whitespace-nowrap">
                        {c.label}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredCandidates.slice(0, 5).map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50">
                    {columns.find((c) => c.key === 'name')?.enabled && (
                      <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap font-sans">
                        {cand.parsedResume.name}
                      </td>
                    )}
                    {columns.find((c) => c.key === 'email')?.enabled && (
                      <td className="p-2.5 text-slate-600 whitespace-nowrap">
                        {cand.parsedResume.email}
                      </td>
                    )}
                    {columns.find((c) => c.key === 'phone')?.enabled && (
                      <td className="p-2.5 text-slate-600 whitespace-nowrap">
                        {cand.parsedResume.phone}
                      </td>
                    )}
                    {columns.find((c) => c.key === 'status')?.enabled && (
                      <td className="p-2.5 font-bold uppercase text-slate-700 whitespace-nowrap">
                        {cand.status}
                      </td>
                    )}
                    {columns.find((c) => c.key === 'matchScore')?.enabled && (
                      <td className="p-2.5 font-bold text-indigo-600 whitespace-nowrap">
                        {cand.matchAnalysis?.matchScore ?? 'N/A'}%
                      </td>
                    )}
                    {columns.find((c) => c.key === 'category')?.enabled && (
                      <td className="p-2.5 text-slate-700 whitespace-nowrap">
                        {cand.matchAnalysis?.category ?? 'Pending'}
                      </td>
                    )}
                    {columns.find((c) => c.key === 'totalExp')?.enabled && (
                      <td className="p-2.5 text-slate-700 whitespace-nowrap">
                        {cand.parsedResume.totalExperienceYears} yrs
                      </td>
                    )}
                    {columns.find((c) => c.key === 'currentTitle')?.enabled && (
                      <td className="p-2.5 text-slate-700 whitespace-nowrap font-sans">
                        {cand.parsedResume.currentTitle}
                      </td>
                    )}
                    {columns.find((c) => c.key === 'skills')?.enabled && (
                      <td className="p-2.5 text-slate-600 truncate max-w-xs font-sans">
                        {cand.parsedResume.technicalSkills.slice(0, 3).join(', ')}
                      </td>
                    )}
                    {columns.find((c) => c.key === 'matchedSkills')?.enabled && (
                      <td className="p-2.5 text-emerald-700 font-sans">
                        {cand.matchAnalysis?.matchedRequiredSkills.join(', ') || 'None'}
                      </td>
                    )}
                    {columns.find((c) => c.key === 'missingSkills')?.enabled && (
                      <td className="p-2.5 text-rose-700 font-sans">
                        {cand.matchAnalysis?.missingRequiredSkills.join(', ') || 'None'}
                      </td>
                    )}
                    {columns.find((c) => c.key === 'education')?.enabled && (
                      <td className="p-2.5 text-slate-600 whitespace-nowrap font-sans">
                        {cand.parsedResume.education[0]?.degree || 'N/A'}
                      </td>
                    )}
                    {columns.find((c) => c.key === 'location')?.enabled && (
                      <td className="p-2.5 text-slate-600 whitespace-nowrap font-sans">
                        {cand.parsedResume.location}
                      </td>
                    )}
                    {columns.find((c) => c.key === 'noticePeriod')?.enabled && (
                      <td className="p-2.5 text-slate-600 whitespace-nowrap font-sans">
                        {cand.parsedResume.noticePeriod}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

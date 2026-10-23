import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  FileCode,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { JobDescription, Candidate } from '../types';

interface UploadViewProps {
  jobs: JobDescription[];
  selectedJobId: string;
  onUploadResumes: (
    files: { file: File; text?: string; base64?: string }[],
    targetJobId: string
  ) => Promise<void>;
  onGenerateSampleCandidates: (count: number, targetJobId: string) => Promise<void>;
  onNavigateCandidates: () => void;
  isProcessing: boolean;
  uploadProgress: { current: number; total: number; stage: string };
}

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'valid' | 'invalid' | 'processing' | 'success' | 'error';
  errorMessage?: string;
  extractedText?: string;
}

export const UploadView: React.FC<UploadViewProps> = ({
  jobs,
  selectedJobId,
  onUploadResumes,
  onGenerateSampleCandidates,
  onNavigateCandidates,
  isProcessing,
  uploadProgress,
}) => {
  const [targetJobId, setTargetJobId] = useState<string>(
    selectedJobId !== 'all' && selectedJobId ? selectedJobId : (jobs[0]?.id || '')
  );
  const [dragActive, setDragActive] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [batchSuccessCount, setBatchSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
  const maxFileSize = 15 * 1024 * 1024; // 15MB

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndQueueFiles = (files: FileList | File[]) => {
    const newItems: QueuedFile[] = [];

    Array.from(files).forEach((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      let status: QueuedFile['status'] = 'valid';
      let errorMessage: string | undefined = undefined;

      // Validate unsupported extension
      if (!supportedExtensions.includes(ext)) {
        status = 'invalid';
        errorMessage = `Unsupported format (${ext}). Supported: PDF, DOC, DOCX, TXT.`;
      } else if (file.size === 0) {
        status = 'invalid';
        errorMessage = 'File is empty (0 bytes).';
      } else if (file.size > maxFileSize) {
        status = 'invalid';
        errorMessage = `File exceeds max size limit of 15MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`;
      }

      newItems.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type || ext,
        status,
        errorMessage,
      });
    });

    setQueuedFiles((prev) => [...prev, ...newItems]);
    setBatchSuccessCount(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndQueueFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndQueueFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setQueuedFiles(queuedFiles.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    setQueuedFiles([]);
    setBatchSuccessCount(null);
  };

  const handleStartUpload = async () => {
    const valid = queuedFiles.filter((f) => f.status === 'valid');
    if (valid.length === 0 || !targetJobId) return;

    const payload = valid.map((vf) => ({ file: vf.file }));
    try {
      await onUploadResumes(payload, targetJobId);
      setBatchSuccessCount(valid.length);
      setQueuedFiles([]);
    } catch (err) {
      console.error(err);
    }
  };

  const validCount = queuedFiles.filter((f) => f.status === 'valid').length;
  const invalidCount = queuedFiles.filter((f) => f.status === 'invalid').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-600" />
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Bulk Resume Ingestion</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Upload multiple candidate resumes simultaneously (PDF, DOCX, DOC, TXT). Preserves experience, education, skills, projects, and certifications.
            </p>
          </div>

          {/* Target Job Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Target Role:</span>
            <select
              value={targetJobId}
              onChange={(e) => setTargetJobId(e.target.value)}
              className="text-xs font-bold border border-indigo-200 bg-indigo-50/50 text-indigo-900 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500/20"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Success Notification after batch */}
      {batchSuccessCount !== null && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold">Successfully ingested {batchSuccessCount} candidate resumes!</p>
              <p className="text-[11px] text-emerald-700">AI parsing, scoring breakdown, and deduplication complete.</p>
            </div>
          </div>
          <button
            onClick={onNavigateCandidates}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs"
          >
            <span>View Shortlist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-white ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/40 ring-4 ring-indigo-500/10'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Drag & drop resumes here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-600 hover:underline font-extrabold"
              >
                browse files
              </button>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports bulk upload of tens or hundreds of resumes. Formats: PDF, DOC, DOCX, TXT (up to 15MB each)
            </p>
          </div>

          {/* Quick Real Sample Resumes Generator */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-medium text-slate-400">Need sample test resumes?</span>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onGenerateSampleCandidates(5, targetJobId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Generate 5 Realistic Resumes</span>
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onGenerateSampleCandidates(15, targetJobId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Bulk Generate 15 Resumes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Processing Indicator */}
      {isProcessing && (
        <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-md space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>AI Screening Engine Processing ({uploadProgress.stage})</span>
            </span>
            <span className="font-mono font-bold text-indigo-700">
              {uploadProgress.current} / {uploadProgress.total} completed
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${uploadProgress.total ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Extracting candidate profiles, resolving skill synonyms, running bias-free 6-factor scoring, and generating explainable evidence...
          </p>
        </div>
      )}

      {/* Queued Files List */}
      {queuedFiles.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-slate-900">Queued for Ingestion ({queuedFiles.length})</h3>
              <div className="flex gap-2 text-xs">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  {validCount} ready
                </span>
                {invalidCount > 0 && (
                  <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-sm">
                    {invalidCount} invalid
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear All
              </button>
              <button
                type="button"
                disabled={validCount === 0 || isProcessing}
                onClick={handleStartUpload}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Process & Screen {validCount} Resumes</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {queuedFiles.map((file) => (
              <div key={file.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      file.status === 'valid' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB • {file.type || 'Document'}
                    </p>
                    {file.errorMessage && (
                      <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        {file.errorMessage}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {file.status === 'valid' ? (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm text-[10px]">
                      Verified Format
                    </span>
                  ) : (
                    <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-sm text-[10px]">
                      Rejected
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fairness & Privacy Assurance Card */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-start gap-4 shadow-md">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Protected & Auditable Ingestion Guarantee
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Resumes are parsed strictly for job-relevant skills, experience periods, degrees, and project evidence. Candidate photos, gender, race, age, and personal demographic traits are never used or inferred for scoring algorithms.
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Lock,
  Users,
  Clock,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';
import {
  AuditLogEntry,
  SystemSettings,
  UserProfile,
  UserRole,
} from '../types';
import {
  User,
  Camera,
  RefreshCw,
  Phone,
  Calendar,
} from 'lucide-react';
import { ADMIN_PHOTO_BASE64 } from '../assets/adminPhotoB64';

interface SettingsViewProps {
  auditLogs: AuditLogEntry[];
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onClearOldData: (days: number) => void;
  onUpdateUserPhoto?: (photoUrl: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  auditLogs,
  settings,
  onUpdateSettings,
  currentUser,
  allUsers,
  onClearOldData,
  onUpdateUserPhoto,
}) => {
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');

  const isAdmin = currentUser.role === 'admin';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Security, Compliance & Audit Trail
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Review immutable recruiter action logs, role-based permission matrices, and GDPR data-retention controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: System Policies & Controls */}
        <div className="space-y-6">
          {/* Recruiter Profile & Photo */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Recruiter Profile & Photo</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentUser.role.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={currentUser.role === 'admin' ? ADMIN_PHOTO_BASE64 : (currentUser.avatar || ADMIN_PHOTO_BASE64)}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-600/20 shadow-xs"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full ring-2 ring-white" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                {currentUser.phone && (
                  <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-indigo-500" />
                    <span>+91 {currentUser.phone}</span>
                  </p>
                )}
                {currentUser.dateOfBirth && (
                  <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-indigo-500" />
                    <span>DOB: {currentUser.dateOfBirth}</span>
                  </p>
                )}
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] mt-0.5">
                  <span>WIN_20260330_16_38_52_Pro.jpg</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-semibold cursor-pointer transition-colors text-center">
                <Camera className="w-4 h-4" />
                <span>Upload New Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && onUpdateUserPhoto) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (reader.result) {
                          onUpdateUserPhoto(reader.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => onUpdateUserPhoto && onUpdateUserPhoto(ADMIN_PHOTO_BASE64)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset to Original Uploaded Photo</span>
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSave}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>Screening & Privacy Policies</span>
              </h2>
              {saveSuccess && (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>

            {/* Blind Screening Default */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-800 flex items-center justify-between">
                <span>Default Blind Screening</span>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={localSettings.blindScreeningDefault}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, blindScreeningDefault: e.target.checked })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>
              <p className="text-[11px] text-slate-400">
                Anonymize candidate names, emails, and phone numbers during initial review to eliminate bias.
              </p>
            </div>

            {/* AI Auto Screen */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-800 flex items-center justify-between">
                <span>AI Automated Screening on Upload</span>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={localSettings.aiAutoScreenNewUploads}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, aiAutoScreenNewUploads: e.target.checked })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>
              <p className="text-[11px] text-slate-400">
                Automatically extract candidate facts and calculate 6-factor score when resumes are ingested.
              </p>
            </div>

            {/* Data Retention Period */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-800">
                Data Retention Window (GDPR Compliance)
              </label>
              <select
                disabled={!isAdmin}
                value={localSettings.dataRetentionDays}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, dataRetentionDays: Number(e.target.value) })
                }
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-700"
              >
                <option value={30}>30 Days</option>
                <option value={90}>90 Days</option>
                <option value={180}>180 Days (Default)</option>
                <option value={365}>365 Days (1 Year)</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Configure automatic purge timeline for inactive applicant resumes and PII.
              </p>
            </div>

            {/* Duplicate Detection Strictness */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-800">
                Duplicate Candidate Detection
              </label>
              <select
                disabled={!isAdmin}
                value={localSettings.duplicateDetectionStrictness}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    duplicateDetectionStrictness: e.target.value as any,
                  })
                }
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-700"
              >
                <option value="high">High (Email, Phone & Name+Company Overlap)</option>
                <option value="medium">Medium (Email and Phone)</option>
                <option value="low">Low (Exact Email only)</option>
              </select>
            </div>

            {isAdmin && (
              <button
                type="submit"
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-xs"
              >
                Save Policy Configurations
              </button>
            )}
            {!isAdmin && (
              <p className="text-[11px] text-amber-600 italic">
                * Only administrators (Pankaj Gupta) can modify system-wide policies.
              </p>
            )}
          </form>

          {/* Role Permissions Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Role-Based Access Control (RBAC)</span>
            </h3>

            <div className="space-y-2 border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
              <div className="p-2.5 bg-slate-50 flex justify-between font-bold text-slate-700">
                <span>Role</span>
                <span>Permissions</span>
              </div>
              <div className="p-2.5 flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-800 block">Admin</span>
                  <span className="text-[10px] text-slate-400">Pankaj Gupta</span>
                </div>
                <span className="text-[11px] text-slate-600 text-right">
                  Full control: audit logs, scoring weights, jobs, candidates, purge data.
                </span>
              </div>
              <div className="p-2.5 flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-800 block">Recruiter</span>
                  <span className="text-[10px] text-slate-400">David Chen</span>
                </div>
                <span className="text-[11px] text-slate-600 text-right">
                  Screen candidates, upload resumes, change status, assign recruiters, export reports.
                </span>
              </div>
              <div className="p-2.5 flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-800 block">Hiring Manager</span>
                  <span className="text-[10px] text-slate-400">Elena Rostova</span>
                </div>
                <span className="text-[11px] text-slate-600 text-right">
                  View candidates, leave interview notes, change status to interview/selected.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Full Searchable Audit Trail */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>Compliance & Audit Log Trail ({auditLogs.length})</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Immutable record of uploads, status updates, scoring modifications, and AI evaluations.
                </p>
              </div>

              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search actor, action, details..."
                className="text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 w-full sm:w-60"
              />
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[550px]">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.actorName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-sm capitalize">
                        {log.actorRole.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="font-semibold text-indigo-700 text-[11px]">{log.action}</p>
                  <p className="text-slate-600 leading-relaxed">{log.details}</p>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No audit logs matching search query.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SOC2 and GDPR compliance audit logging active</span>
            </span>
            <span className="font-mono">{auditLogs.length} total entries</span>
          </div>
        </div>
      </div>
    </div>
  );
};

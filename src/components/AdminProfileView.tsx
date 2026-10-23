import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Camera,
  RefreshCw,
  Save,
  CheckCircle2,
  KeyRound,
  Building,
  UserCheck,
  BadgeCheck,
  Globe
} from 'lucide-react';
import { UserProfile, AuditLogEntry } from '../types';
import { ADMIN_PHOTO_BASE64 } from '../assets/adminPhotoB64';

interface AdminProfileViewProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  auditLogs: AuditLogEntry[];
  onUpdateUserPhoto?: (photoUrl: string) => void;
  onUpdateUserDetails?: (updatedUser: Partial<UserProfile>) => void;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({
  currentUser,
  allUsers,
  auditLogs,
  onUpdateUserPhoto,
  onUpdateUserDetails,
}) => {
  const [formData, setFormData] = useState({
    name: currentUser.name || 'Pankaj Gupta',
    email: currentUser.email || 'p6440099@gmail.com',
    phone: currentUser.phone || '9219681548',
    dateOfBirth: currentUser.dateOfBirth || '01/01/2006',
    department: 'Administration & System Architecture',
    role: currentUser.role || 'admin',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUserDetails) {
      onUpdateUserDetails(formData);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const adminLogs = auditLogs
    .filter((log) => log.actorName === currentUser.name || log.targetType === 'system')
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin & Account Profile</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your authenticated administrator credentials, verified contact details, security credentials, and system privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
            <BadgeCheck className="w-4 h-4 text-indigo-600" />
            <span>Super Administrator</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Photo & Quick Credentials Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5 text-center">
            {/* Profile Avatar */}
            <div className="relative inline-block mx-auto">
              <img
                src={currentUser.role === 'admin' ? ADMIN_PHOTO_BASE64 : (currentUser.avatar || ADMIN_PHOTO_BASE64)}
                alt={currentUser.name}
                className="w-28 h-28 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-lg mx-auto"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full ring-2 ring-white" title="Active Online" />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{currentUser.name}</h2>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-0.5">
                {currentUser.role.replace('_', ' ')}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-1">ID: {currentUser.id}</p>
            </div>

            {/* Quick Contact Badges */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate font-medium">{currentUser.email}</span>
              </div>
              {currentUser.phone && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-medium">+91 {currentUser.phone}</span>
                </div>
              )}
              {currentUser.dateOfBirth && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-medium">DOB: {currentUser.dateOfBirth}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-700">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium">Administration & Architecture</span>
              </div>
            </div>

            {/* Photo Action Controls */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-semibold cursor-pointer transition-colors text-xs text-center">
                <Camera className="w-4 h-4" />
                <span>Upload New Avatar</span>
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
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset to WIN Photo</span>
              </button>
            </div>
          </div>

          {/* System Security Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Security & Access Scope</span>
            </h3>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>Access Level:</span>
                <span className="font-bold text-slate-900">Full Root / Super Admin</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span>API Endpoint:</span>
                <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">/api/admin/profile</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Audit Logging:</span>
                <span className="font-bold text-emerald-600">Strict Auditing Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Account Details & Activity Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Editable Account Form */}
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Personal & Professional Information</span>
              </h2>
              {savedSuccess && (
                <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Changes Saved Successfully
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile / WhatsApp Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-slate-200 rounded-l-xl bg-slate-100 text-slate-500 font-semibold text-xs">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-r-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">System Role</label>
                <input
                  type="text"
                  disabled
                  value="Administrator (Root Privileges)"
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-100 font-medium text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>

          {/* Recent Admin Audit Activity */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Administrator Audit Actions
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              {adminLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">{log.action}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {adminLogs.length === 0 && (
                <p className="py-4 text-center text-slate-400 text-xs">No recent actions recorded for this admin session.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

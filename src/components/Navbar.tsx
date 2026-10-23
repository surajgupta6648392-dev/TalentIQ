import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  UploadCloud,
  Columns3,
  BarChart3,
  Settings,
  Bell,
  Eye,
  EyeOff,
  Plus,
  PlayCircle,
  FileCheck2,
  GitCompare,
  ShieldCheck,
  CheckCircle2,
  Camera,
  Upload,
  UserCheck
} from 'lucide-react';
import { JobDescription, UserProfile, AppNotification } from '../types';
import { ADMIN_PHOTO_BASE64 } from '../assets/adminPhotoB64';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  jobs: JobDescription[];
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  allUsers: UserProfile[];
  blindScreening: boolean;
  setBlindScreening: (val: boolean) => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenUpload: () => void;
  onOpenNewJob: () => void;
  onOpenTestSuite: () => void;
  onUpdateUserPhoto?: (photoUrl: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  jobs,
  selectedJobId,
  setSelectedJobId,
  currentUser,
  setCurrentUser,
  allUsers,
  blindScreening,
  setBlindScreening,
  notifications,
  onOpenNotifications,
  onOpenUpload,
  onOpenNewJob,
  onOpenTestSuite,
  onUpdateUserPhoto,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'pipeline', label: 'Pipeline', icon: Columns3 },
    { id: 'upload', label: 'Upload', icon: UploadCloud },
    { id: 'analytics', label: 'Analytics & Export', icon: FileCheck2 },
    { id: 'settings', label: 'Audit & Settings', icon: Settings },
    { id: 'admin-profile', label: 'Admin Profile', icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner for Blind Screening if active */}
      {blindScreening && (
        <div className="bg-indigo-600 px-4 py-1.5 text-center text-xs font-medium text-white flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-200" />
          <span>
            <strong>Blind Screening Mode Active:</strong> Candidate names, contact info, and institutions are anonymized to eliminate unconscious demographic bias.
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-6">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-100 text-white font-bold text-lg">
                T
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 tracking-tight text-lg">Talent<span className="text-indigo-600">IQ</span></span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    AI ATS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 -mt-0.5 font-medium">Screening & Shortlisting</p>
              </div>
            </div>

            {/* Active Job Filter Selector */}
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Role:</span>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-slate-100/80 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[220px] truncate"
              >
                <option value="all">All Active Jobs ({jobs.length})</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Blind Screening Toggle */}
            <button
              onClick={() => setBlindScreening(!blindScreening)}
              title={blindScreening ? 'Disable Blind Screening' : 'Enable Blind Screening (Mask Names & PII)'}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                blindScreening
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {blindScreening ? <EyeOff className="w-3.5 h-3.5 text-indigo-600" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden sm:inline">Blind Screening</span>
            </button>

            {/* Interactive Test Suite */}
            <button
              onClick={onOpenTestSuite}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all shadow-2xs"
            >
              <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Verification Tests</span>
            </button>

            {/* Notifications */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Upload Button */}
            <button
              onClick={onOpenUpload}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Resumes</span>
            </button>

            {/* Create Job */}
            <button
              onClick={onOpenNewJob}
              className="hidden md:flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Job</span>
            </button>

            {/* User Profile Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <img
                  src={currentUser.role === 'admin' ? ADMIN_PHOTO_BASE64 : (currentUser.avatar || ADMIN_PHOTO_BASE64)}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="hidden xl:block text-left text-xs">
                  <div className="font-semibold text-slate-800 leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-medium text-slate-400">Switch Active Role:</p>
                  </div>
                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                    >
                      <img
                        src={user.role === 'admin' ? ADMIN_PHOTO_BASE64 : (user.avatar || ADMIN_PHOTO_BASE64)}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      {currentUser.id === user.id && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </button>
                  ))}

                  {/* Change Profile Photo Action */}
                  <div className="pt-2 mt-1 border-t border-slate-100 px-2 space-y-1">
                    <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 text-indigo-700 cursor-pointer text-[11px] font-semibold transition-colors">
                      <Camera className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Change Photo (Upload)</span>
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
                                setUserDropdownOpen(false);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateUserPhoto) {
                          onUpdateUserPhoto(ADMIN_PHOTO_BASE64);
                          setUserDropdownOpen(false);
                        }
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 text-[11px] font-medium transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Apply WIN Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('admin-profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors mt-1"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>View Admin Profile</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex space-x-1 overflow-x-auto py-1 scrollbar-none border-t border-slate-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-50/80 text-indigo-600 font-bold border-b-2 border-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

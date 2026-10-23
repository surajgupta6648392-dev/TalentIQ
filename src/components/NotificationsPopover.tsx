import React from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, Info, Clock, Check } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-2xs flex justify-end p-3 sm:p-5">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-xs">Recruiting Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (notif.linkTab) {
                  onNavigateTab(notif.linkTab);
                  onClose();
                }
              }}
              className={`p-3 rounded-xl transition-colors cursor-pointer text-xs space-y-1 ${
                notif.read ? 'hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50/70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  {notif.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {notif.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                  {notif.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-600" />}
                  <span>{notif.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{notif.timestamp}</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{notif.message}</p>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No recent notifications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

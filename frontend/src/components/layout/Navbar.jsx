import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  LogOut,
  User,
  Shield,
  GraduationCap,
  BookOpen,
  Users,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          icon: Shield,
          label: 'System Admin',
        };
      case 'teacher':
        return {
          bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
          icon: BookOpen,
          label: 'Faculty / Teacher',
        };
      case 'student':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: GraduationCap,
          label: 'Student',
        };
      case 'parent':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: Users,
          label: 'Parent / Guardian',
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          icon: User,
          label: 'User',
        };
    }
  };

  const badge = getRoleBadge(user?.role);
  const BadgeIcon = badge.icon;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Search / Brand Info */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Academic Session: <strong>Spring 2026</strong></span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Role Badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.bg}`}>
          <BadgeIcon className="w-3.5 h-3.5" />
          <span>{badge.label}</span>
        </div>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 glass-dropdown rounded-xl p-4 shadow-2xl border border-slate-800 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                <span className="font-semibold text-slate-200">Recent Campus Alerts</span>
                <span className="text-[10px] text-indigo-400">Live</span>
              </div>
              <div className="space-y-2.5">
                <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-slate-300">
                  <div className="font-medium text-slate-100">Mid-Sem Exams Schedule Released</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Check the official notice board for details.</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-slate-300">
                  <div className="font-medium text-slate-100">Fee Payment Reminder</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Semester dues for 2025-26 are now active.</div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-center">
                <Link
                  to="/notices"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  View All Notices →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-800/80 transition-all border border-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white text-xs shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                {user?.name || 'User'}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                {user?.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 glass-dropdown rounded-xl py-2 shadow-2xl z-50">
              <div className="px-4 py-2 border-b border-slate-800/80">
                <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

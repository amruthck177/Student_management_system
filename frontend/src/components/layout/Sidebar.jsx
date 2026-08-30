import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  Award,
  CreditCard,
  Bell,
  Calendar,
  ShieldAlert,
  FileDown,
  UserCheck,
  BookOpen,
  Library,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
          { to: '/admin/users', icon: Users, label: 'User Directory' },
          { to: '/admin/students', icon: GraduationCap, label: 'Students & Import' },
          { to: '/admin/fees', icon: CreditCard, label: 'Fee Management' },
          { to: '/library', icon: Library, label: 'Library Catalog' },
          { to: '/notices', icon: Bell, label: 'Notices Board' },
          { to: '/timetable', icon: Calendar, label: 'Class Timetable' },
          { to: '/admin/audit-logs', icon: ShieldAlert, label: 'Audit Trail' },
        ];
      case 'teacher':
        return [
          { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/teacher/students', icon: GraduationCap, label: 'My Students' },
          { to: '/teacher/attendance', icon: ClipboardCheck, label: 'Mark Attendance' },
          { to: '/teacher/grades', icon: Award, label: 'Grade & Marks' },
          { to: '/library', icon: Library, label: 'Library Center' },
          { to: '/timetable', icon: Calendar, label: 'My Timetable' },
          { to: '/notices', icon: Bell, label: 'Campus Notices' },
        ];
      case 'student':
        return [
          { to: '/student/dashboard', icon: LayoutDashboard, label: 'My Overview' },
          { to: '/student/attendance', icon: ClipboardCheck, label: 'Attendance & %' },
          { to: '/student/grades', icon: Award, label: 'Grades & CGPA' },
          { to: '/student/fees', icon: CreditCard, label: 'Fees & Payment' },
          { to: '/library', icon: Library, label: 'Library Catalog' },
          { to: '/student/documents', icon: FileDown, label: 'ID & Report Cards' },
          { to: '/timetable', icon: Calendar, label: 'My Schedule' },
          { to: '/notices', icon: Bell, label: 'Notice Board' },
        ];
      case 'parent':
        return [
          { to: '/parent/dashboard', icon: LayoutDashboard, label: 'Children Overview' },
          { to: '/library', icon: Library, label: 'Library Books' },
          { to: '/notices', icon: Bell, label: 'Parent Notices' },
          { to: '/timetable', icon: Calendar, label: 'Class Schedule' },
        ];
      default:
        return [
          { to: '/library', icon: Library, label: 'Library' },
          { to: '/notices', icon: Bell, label: 'Notices' },
          { to: '/timetable', icon: Calendar, label: 'Timetable' },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/95 min-h-screen flex flex-col justify-between shrink-0">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              CampusLedger
            </h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Student System
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu Navigation
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer Support Card */}
      <div className="p-4 border-t border-slate-800">
        <div className="glass-card p-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Campus Support</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Need help? Reach out to support@campusledger.edu
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

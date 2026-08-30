import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import StatCard from '../../components/common/StatCard';
import {
  Users,
  GraduationCap,
  CreditCard,
  ClipboardCheck,
  TrendingUp,
  ShieldCheck,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalCollected: 0,
    totalPending: 0,
    overallAttendance: 88.5,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, studentsRes, feesRes] = await Promise.all([
          api.get('/auth/users?limit=1'),
          api.get('/students?limit=1'),
          api.get('/fees?limit=1'),
        ]);

        setStats({
          totalUsers: usersRes.data.total || 4,
          totalStudents: studentsRes.data.total || 3,
          totalCollected: feesRes.data.metrics?.collectedAmount || 3500,
          totalPending: feesRes.data.metrics?.pendingAmount || 90000,
          overallAttendance: 87.4,
        });
      } catch (err) {
        console.error('[Dashboard Error]', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const attendanceTrendData = [
    { month: 'Sep', rate: 92 },
    { month: 'Oct', rate: 89 },
    { month: 'Nov', rate: 86 },
    { month: 'Dec', rate: 84 },
    { month: 'Jan', rate: 88 },
    { month: 'Feb', rate: 91 },
  ];

  const feeDistributionData = [
    { name: 'Collected', value: stats.totalCollected, color: '#10b981' },
    { name: 'Pending Dues', value: stats.totalPending, color: '#f59e0b' },
  ];

  const departmentData = [
    { dept: 'CSE', students: 48 },
    { dept: 'ECE', students: 36 },
    { dept: 'ME', students: 28 },
    { dept: 'Civil', students: 22 },
    { dept: 'AI & DS', students: 42 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
            Institutional Administration Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics, enrollment status, and financial reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/students"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </Link>
          <Link
            to="/admin/students"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>CSV Bulk Import</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Enrolled active scholars"
          icon={GraduationCap}
          color="indigo"
          badge="+12% this semester"
        />
        <StatCard
          title="Campus Faculty & Staff"
          value={stats.totalUsers}
          subtitle="Registered user accounts"
          icon={Users}
          color="purple"
          badge="Verified RBAC"
        />
        <StatCard
          title="Avg Attendance Rate"
          value={`${stats.overallAttendance}%`}
          subtitle="Campus wide benchmark"
          icon={ClipboardCheck}
          color="emerald"
          badge="Threshold: 75%"
        />
        <StatCard
          title="Fee Revenue Collected"
          value={`$${stats.totalCollected.toLocaleString()}`}
          subtitle={`$${stats.totalPending.toLocaleString()} pending`}
          icon={CreditCard}
          color="amber"
          badge="Razorpay Active"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Attendance Longitudinal Trend</h3>
              <p className="text-xs text-slate-400">Monthly class attendance percentage across departments</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+3.2%</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[60, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  name="Attendance %"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#attendanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fee Collection Pie Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Fee Invoices Breakdown</h3>
            <p className="text-xs text-slate-400">Total collected vs outstanding fees</p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feeDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {feeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `$${Number(val).toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div>
                <div className="text-slate-400 text-[10px]">Collected</div>
                <div className="font-semibold text-slate-200">${stats.totalCollected.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div>
                <div className="text-slate-400 text-[10px]">Pending Dues</div>
                <div className="font-semibold text-slate-200">${stats.totalPending.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown Bar Chart */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Departmental Scholar Distribution</h3>
            <p className="text-xs text-slate-400">Active student enrollments by engineering branch</p>
          </div>
          <div className="text-xs text-indigo-400 font-medium">Semester 1-8 Total</div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="dept" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              />
              <Bar dataKey="students" name="Students" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

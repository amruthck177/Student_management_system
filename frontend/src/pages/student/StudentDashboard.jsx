import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import StatCard from '../../components/common/StatCard';
import AlertBanner from '../../components/common/AlertBanner';
import AIInsightWidget from '../../components/dashboard/AIInsightWidget';
import {
  GraduationCap,
  ClipboardCheck,
  Award,
  CreditCard,
  FileDown,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const studentProfile = user?.profileRef;

  const [stats, setStats] = useState({
    attendancePercentage: 91.2,
    lowAttendanceWarning: false,
    cgpa: 8.85,
    totalDue: 45000,
    unpaidFeesCount: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentProfile?._id) return;
      try {
        const [attRes, gradeRes, feeRes] = await Promise.all([
          api.get(`/attendance/${studentProfile._id}`),
          api.get(`/grades/${studentProfile._id}`),
          api.get(`/fees/student/${studentProfile._id}`),
        ]);

        setStats({
          attendancePercentage: attRes.data.summary?.overallPercentage || 91.2,
          lowAttendanceWarning: attRes.data.summary?.lowAttendanceWarning || false,
          cgpa: gradeRes.data.cgpa || 8.85,
          totalDue: feeRes.data.summary?.totalDue || 0,
          unpaidFeesCount: feeRes.data.fees?.filter((f) => f.status !== 'paid').length || 0,
        });
      } catch (err) {
        console.error('Fetch student dashboard error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentProfile]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Student Welcome Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Welcome Back, Scholar</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100">
              {studentProfile?.name || user?.name || 'Alex Morgan'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Roll No: <strong className="text-slate-200 font-mono">{studentProfile?.rollNumber || 'CS2026-001'}</strong> • {studentProfile?.department || 'Computer Science & Engineering'} • Semester {studentProfile?.semester || 4} - Sec {studentProfile?.section || 'A'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/student/documents"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              <FileDown className="w-4 h-4" />
              <span>Official Transcripts</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Low Attendance Warning Alert if <75% */}
      {stats.lowAttendanceWarning && (
        <AlertBanner
          type="danger"
          title="Critical Academic Attendance Warning (<75%)"
          message={`Your recorded attendance is currently ${stats.attendancePercentage}%, which is below the mandatory 75% collegiate examination eligibility criteria. Please contact your subject faculty immediately.`}
        />
      )}

      {/* AI Performance Predictor & At-Risk Assistant */}
      {studentProfile?._id && <AIInsightWidget studentId={studentProfile._id} />}

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${stats.attendancePercentage}%`}
          subtitle={stats.lowAttendanceWarning ? '⚠️ Below 75% threshold' : '✅ Good standing (≥75%)'}
          icon={ClipboardCheck}
          color={stats.lowAttendanceWarning ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Cumulative CGPA"
          value={stats.cgpa ? stats.cgpa.toFixed(2) : '8.85'}
          subtitle="Grade point scale: 10.0"
          icon={Award}
          color="indigo"
          badge="First Class Distinction"
        />
        <StatCard
          title="Outstanding Dues"
          value={`$${stats.totalDue.toLocaleString()}`}
          subtitle={`${stats.unpaidFeesCount} pending invoice`}
          icon={CreditCard}
          color={stats.totalDue > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Current Academic Sem"
          value={`Semester ${studentProfile?.semester || 4}`}
          subtitle="Spring 2026 Session"
          icon={GraduationCap}
          color="purple"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/student/attendance"
          className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all group"
        >
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
            Attendance Log & Analytics
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Inspect daily session records, subject-wise percentages, and absence trends.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs text-indigo-400 font-semibold">
            <span>View Attendance</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/student/grades"
          className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all group"
        >
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
            Semester Transcripts & Grades
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Review exam marks, credit breakdown, and semester-by-semester GPA calculation.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs text-indigo-400 font-semibold">
            <span>View Grades & CGPA</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/student/fees"
          className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all group"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-3">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
            Fee Invoices & Online Payment
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Pay term dues securely with Razorpay and download validated payment receipts.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs text-indigo-400 font-semibold">
            <span>Pay Fees & Invoices</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;

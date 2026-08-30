import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import StatCard from '../../components/common/StatCard';
import AlertBanner from '../../components/common/AlertBanner';
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  Award,
  CreditCard,
  FileDown,
  AlertTriangle,
} from 'lucide-react';

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const res = await api.get('/parent/students');
      if (res.data.success) {
        setChildren(res.data.children || []);
      }
    } catch (err) {
      console.error('Fetch parent children error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const activeChild = children[selectedChildIndex] || null;
  const student = activeChild?.student;
  const metrics = activeChild?.metrics;

  const downloadReport = async () => {
    if (!student?._id) return;
    try {
      const res = await api.get(`/students/${student._id}/report-card`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `ReportCard_${student.rollNumber}.pdf`;
      link.click();
    } catch (err) {
      alert('Report download error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-400" />
          <span>Parent & Guardian Academic Console</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your linked children's daily attendance rates, term grades, and college dues
        </p>
      </div>

      {/* Multi-Child Switcher Tabs */}
      {children.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {children.map((child, idx) => (
            <button
              key={child.student._id}
              onClick={() => setSelectedChildIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                selectedChildIndex === idx
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{child.student.name} ({child.student.rollNumber})</span>
            </button>
          ))}
        </div>
      )}

      {student ? (
        <>
          {/* Child Profile Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
                Linked Scholar Record
              </div>
              <h2 className="text-xl font-bold text-slate-100">{student.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Roll No: <strong className="text-slate-200 font-mono">{student.rollNumber}</strong> • {student.department} • Semester {student.semester} - Sec {student.section}
              </p>
            </div>

            <button
              onClick={downloadReport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md self-start sm:self-auto"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Official Report Card</span>
            </button>
          </div>

          {/* Low Attendance Alert for Parent */}
          {metrics?.lowAttendanceWarning && (
            <AlertBanner
              type="danger"
              title="Parent Advisory: Low Attendance Alert (<75%)"
              message={`Your child ${student.name}'s attendance is currently at ${metrics.attendancePercentage}%, which is below the mandatory 75% college requirement. Please advise them to attend pending lectures.`}
            />
          )}

          {/* Child Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Class Attendance"
              value={`${metrics?.attendancePercentage}%`}
              subtitle={`${metrics?.presentClasses} of ${metrics?.totalClasses} sessions attended`}
              icon={ClipboardCheck}
              color={metrics?.lowAttendanceWarning ? 'rose' : 'emerald'}
              badge={metrics?.lowAttendanceWarning ? 'Below 75%' : 'Optimal'}
            />

            <StatCard
              title="Cumulative CGPA"
              value={metrics?.cgpa ? metrics.cgpa.toFixed(2) : '0.00'}
              subtitle="10.0 Grade Point Scale"
              icon={Award}
              color="indigo"
              badge="First Class"
            />

            <StatCard
              title="Outstanding Dues"
              value={`$${metrics?.totalDue?.toLocaleString() || 0}`}
              subtitle={`${metrics?.pendingFeesCount || 0} unpaid semester invoice(s)`}
              icon={CreditCard}
              color={metrics?.totalDue > 0 ? 'amber' : 'emerald'}
            />
          </div>
        </>
      ) : (
        <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 text-slate-400">
          No linked student records found for this parent account.
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;

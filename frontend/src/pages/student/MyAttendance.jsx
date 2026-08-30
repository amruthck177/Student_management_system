import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import AlertBanner from '../../components/common/AlertBanner';
import DataTable from '../../components/common/DataTable';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  BookOpen,
} from 'lucide-react';

const MyAttendance = () => {
  const { user } = useAuth();
  const studentId = user?.profileRef?._id;

  const [summary, setSummary] = useState({
    totalClasses: 0,
    presentCount: 0,
    absentCount: 0,
    excusedCount: 0,
    overallPercentage: 100,
    lowAttendanceWarning: false,
  });
  const [subjectStats, setSubjectStats] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!studentId) return;
      setLoading(true);
      try {
        const res = await api.get(`/attendance/${studentId}`);
        if (res.data.success) {
          setSummary(res.data.summary || {});
          setSubjectStats(res.data.subjectStats || []);
          setRecords(res.data.records || []);
        }
      } catch (err) {
        console.error('Fetch attendance error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId]);

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (row) => (
        <span className="font-mono text-xs text-slate-300">
          {new Date(row.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Subject / Course',
      accessor: 'subject',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-200">{row.subject}</div>
          <div className="text-[10px] text-slate-500">Semester {row.semester}</div>
        </div>
      ),
    },
    {
      header: 'Session Status',
      accessor: 'status',
      render: (row) => {
        const isPresent = row.status === 'present';
        const isAbsent = row.status === 'absent';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
              isPresent
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : isAbsent
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {isPresent ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : isAbsent ? (
              <XCircle className="w-3 h-3" />
            ) : (
              <AlertTriangle className="w-3 h-3" />
            )}
            <span>{row.status}</span>
          </span>
        );
      },
    },
    {
      header: 'Marked By Faculty',
      accessor: 'markedBy',
      render: (row) => (
        <span className="text-xs text-slate-400">{row.markedBy?.name || 'Faculty Member'}</span>
      ),
    },
    {
      header: 'Remarks',
      accessor: 'remarks',
      render: (row) => <span className="text-xs text-slate-500">{row.remarks || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-emerald-400" />
          <span>My Attendance & Eligibility Ledger</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed class participation history and mandatory 75% attendance threshold monitoring
        </p>
      </div>

      {summary.lowAttendanceWarning && (
        <AlertBanner
          type="danger"
          title="Attendance Below Mandatory 75% Threshold!"
          message={`Your attendance is ${summary.overallPercentage}%. University regulations require a minimum of 75% class attendance to sit for final semester examinations.`}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Sessions</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{summary.totalClasses}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-[11px] text-emerald-400 font-semibold uppercase">Attended</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{summary.presentCount}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-[11px] text-rose-400 font-semibold uppercase">Absences</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{summary.absentCount}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-[11px] text-indigo-400 font-semibold uppercase">Overall Rate</div>
          <div
            className={`text-2xl font-bold mt-1 ${
              summary.lowAttendanceWarning ? 'text-rose-400' : 'text-indigo-400'
            }`}
          >
            {summary.overallPercentage}%
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Progress */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Subject-Wise Attendance Metrics</span>
        </h3>

        <div className="space-y-4">
          {subjectStats.map((subj) => (
            <div key={subj.subject} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{subj.subject}</span>
                <span
                  className={`font-mono font-bold ${
                    subj.isLow ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {subj.percentage}% ({subj.present}/{subj.total} sessions)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    subj.isLow ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(subj.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed History Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-100">Session Attendance Log</h3>
        <DataTable columns={columns} data={records} searchPlaceholder="Filter by subject or date..." />
      </div>
    </div>
  );
};

export default MyAttendance;

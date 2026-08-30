import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import DataTable from '../../components/common/DataTable';
import { GraduationCap, AlertTriangle, CheckCircle, FileDown } from 'lucide-react';

const AssignedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await api.get('/students?semester=4');
        if (res.data.success) {
          // Fetch attendance metrics for each to highlight low attendance (<75%)
          const enriched = await Promise.all(
            (res.data.students || []).map(async (st) => {
              try {
                const attRes = await api.get(`/attendance/${st._id}`);
                const stats = attRes.data.summary || {};
                const gradeRes = await api.get(`/grades/${st._id}`);
                return {
                  ...st,
                  attendancePercentage: stats.overallPercentage || 100,
                  isLowAttendance: stats.lowAttendanceWarning || false,
                  cgpa: gradeRes.data.cgpa || 0,
                };
              } catch (e) {
                return { ...st, attendancePercentage: 100, isLowAttendance: false, cgpa: 0 };
              }
            })
          );
          setStudents(enriched);
        }
      } catch (err) {
        console.error('Fetch assigned students error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const downloadReport = async (studentId, roll) => {
    try {
      const res = await api.get(`/students/${studentId}/report-card`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `ReportCard_${roll}.pdf`;
      link.click();
    } catch (err) {
      alert('Report download error: ' + err.message);
    }
  };

  const columns = [
    {
      header: 'Roll No. & Student Name',
      accessor: 'rollNumber',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-200">{row.name}</div>
          <div className="text-[11px] text-indigo-400 font-mono font-medium">{row.rollNumber}</div>
        </div>
      ),
    },
    {
      header: 'Department / Section',
      accessor: 'department',
      render: (row) => (
        <div>
          <div className="text-slate-200">{row.department}</div>
          <div className="text-[10px] text-slate-400">
            Semester {row.semester} • Section {row.section}
          </div>
        </div>
      ),
    },
    {
      header: 'Attendance Rate',
      accessor: 'attendancePercentage',
      render: (row) => {
        const isLow = row.isLowAttendance;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                isLow
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {row.attendancePercentage}%
            </span>
            {isLow && (
              <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" />
                <span>Low &lt;75%</span>
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Computed CGPA',
      accessor: 'cgpa',
      render: (row) => (
        <span className="font-bold text-slate-100 font-mono text-xs">
          {row.cgpa ? row.cgpa.toFixed(2) : '—'}
        </span>
      ),
    },
    {
      header: 'Parent Contact',
      accessor: 'parentPhone',
      render: (row) => (
        <div>
          <div className="text-slate-300 text-xs">{row.parentName || 'N/A'}</div>
          <div className="text-[10px] text-slate-500">{row.parentPhone || row.parentEmail}</div>
        </div>
      ),
    },
    {
      header: 'Transcript',
      render: (row) => (
        <button
          onClick={() => downloadReport(row._id, row.rollNumber)}
          className="px-2.5 py-1 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 text-xs flex items-center gap-1 transition-colors"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Report PDF</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-100">
          Assigned Students Roster
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Scholars enrolled in your assigned department, subjects, and sections
        </p>
      </div>

      <DataTable
        columns={columns}
        data={students}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search scholars by name or roll number..."
      />
    </div>
  );
};

export default AssignedStudents;

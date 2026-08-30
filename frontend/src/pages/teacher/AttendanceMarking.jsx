import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const AttendanceMarking = () => {
  const [subject, setSubject] = useState('Database Management Systems');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState(4);
  const [section, setSection] = useState('A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const subjectsList = [
    'Database Management Systems',
    'Computer Networks',
    'Operating Systems',
    'Design & Analysis of Algorithms',
    'Artificial Intelligence',
  ];

  useEffect(() => {
    const fetchStudentsForClass = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/students?department=${department}&semester=${semester}&section=${section}`
        );
        if (res.data.success) {
          const list = res.data.students || [];
          setStudents(list);

          // Default all to 'present'
          const initialStatus = {};
          const initialRemarks = {};
          list.forEach((st) => {
            initialStatus[st._id] = 'present';
            initialRemarks[st._id] = '';
          });
          setAttendanceMap(initialStatus);
          setRemarksMap(initialRemarks);
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsForClass();
  }, [department, semester, section]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId, text) => {
    setRemarksMap((prev) => ({ ...prev, [studentId]: text }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((st) => {
      updated[st._id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    const records = students.map((st) => ({
      studentId: st._id,
      status: attendanceMap[st._id] || 'present',
      remarks: remarksMap[st._id] || '',
    }));

    try {
      const res = await api.post('/attendance', {
        subject,
        date,
        department,
        semester,
        section,
        records,
      });

      if (res.data.success) {
        setSuccessMessage(`Attendance saved for ${records.length} scholars on ${date}`);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-indigo-400" />
          <span>Interactive Class Attendance Register</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Take roll call, log absences, and synchronize real-time attendance thresholds
        </p>
      </div>

      {/* Filter / Class Controls Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {subjectsList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Session Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Semester & Section</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="A">Sec A</option>
                <option value="B">Sec B</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                className="flex-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                className="flex-1 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors"
              >
                All Absent
              </button>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Roll Call Student Roster Table */}
      <form onSubmit={handleSubmitAttendance} className="space-y-4">
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Scholar</th>
                <th className="py-3 px-4 text-center">Attendance Status</th>
                <th className="py-3 px-4">Notes / Excused Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {students.map((st, index) => {
                const currentStatus = attendanceMap[st._id] || 'present';
                return (
                  <tr key={st._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono">{index + 1}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-400">
                      {st.rollNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{st.name}</div>
                      <div className="text-[10px] text-slate-500">{st.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st._id, 'present')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            currentStatus === 'present'
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st._id, 'absent')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            currentStatus === 'absent'
                              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(st._id, 'excused')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            currentStatus === 'excused'
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={remarksMap[st._id] || ''}
                        onChange={(e) => handleRemarkChange(st._id, e.target.value)}
                        placeholder="Optional remarks..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Submit Attendance Toolbar */}
        <div className="flex items-center justify-between p-4 glass-panel rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400">
            Total Class Roster: <strong className="text-slate-200">{students.length}</strong> scholars
          </div>
          <button
            type="submit"
            disabled={saving || students.length === 0}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Synchronizing Records...' : 'Save & Post Attendance Record'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceMarking;

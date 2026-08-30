import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { Award, GraduationCap, Calculator, FileDown, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyGrades = () => {
  const { user } = useAuth();
  const studentId = user?.profileRef?._id;

  const [cgpa, setCgpa] = useState(0);
  const [semesterSummary, setSemesterSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!studentId) return;
      setLoading(true);
      try {
        const res = await api.get(`/grades/${studentId}`);
        if (res.data.success) {
          setCgpa(res.data.cgpa || 0);
          setSemesterSummary(res.data.semesterSummary || []);
        }
      } catch (err) {
        console.error('Fetch grades error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [studentId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span>Academic Transcript & CGPA</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Certified examination results, credit weightages, and 10-point scale grade analytics
          </p>
        </div>

        <Link
          to="/student/documents"
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto"
        >
          <FileDown className="w-4 h-4" />
          <span>Download Official PDF Transcript</span>
        </Link>
      </div>

      {/* Top CGPA Benchmark Hero Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              Cumulative Academic Score
            </div>
            <div className="text-3xl font-extrabold text-slate-100 mt-0.5 flex items-baseline gap-2">
              <span>{cgpa ? cgpa.toFixed(2) : '0.00'}</span>
              <span className="text-xs font-medium text-slate-400 font-mono">/ 10.00 CGPA</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Status: <strong className="text-emerald-400">First Class with Distinction</strong>
            </p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 text-xs space-y-1.5 sm:min-w-[200px]">
          <div className="flex justify-between text-slate-400">
            <span>Total Semesters:</span>
            <strong className="text-slate-200">{semesterSummary.length}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Total Credits Completed:</span>
            <strong className="text-slate-200">
              {semesterSummary.reduce((sum, sem) => sum + sem.totalCredits, 0)}
            </strong>
          </div>
        </div>
      </div>

      {/* Semester Breakdown Lists */}
      <div className="space-y-6">
        {semesterSummary.map((sem) => (
          <div
            key={sem.semester}
            className="glass-panel rounded-2xl border border-slate-800 overflow-hidden"
          >
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs">
                  Semester {sem.semester}
                </div>
                <span className="text-xs text-slate-400">Total Credits: {sem.totalCredits}</span>
              </div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span className="text-slate-400 font-normal">Semester GPA:</span>
                <span className="text-amber-400 font-mono text-sm">{sem.gpa.toFixed(2)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-900/50 border-b border-slate-800/80 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4">Marks Obtained</th>
                    <th className="py-3 px-4 text-center">Grade Letter</th>
                    <th className="py-3 px-4 text-center">Grade Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {sem.grades.map((g) => (
                    <tr key={g._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-200">{g.subject}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{g.subjectCode || 'CS40x'}</td>
                      <td className="py-3 px-4 text-slate-300">{g.credits || 3}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-100">
                        {g.marksObtained} / {g.maxMarks || 100}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
                            g.gradeLetter === 'O'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : g.gradeLetter === 'A+' || g.gradeLetter === 'A'
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          }`}
                        >
                          {g.gradeLetter || 'A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-200 font-mono">
                        {g.gradePoint !== undefined ? g.gradePoint : 9}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyGrades;

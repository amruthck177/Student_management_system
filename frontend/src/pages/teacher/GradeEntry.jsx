import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { Award, Save, CheckCircle2, AlertCircle, Calculator } from 'lucide-react';

const GradeEntry = () => {
  const [subject, setSubject] = useState('Database Management Systems');
  const [subjectCode, setSubjectCode] = useState('CS401');
  const [examType, setExamType] = useState('Final');
  const [semester, setSemester] = useState(4);
  const [credits, setCredits] = useState(4);
  const [maxMarks, setMaxMarks] = useState(100);

  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const subjectsList = [
    { name: 'Database Management Systems', code: 'CS401', credits: 4 },
    { name: 'Computer Networks', code: 'CS402', credits: 4 },
    { name: 'Operating Systems', code: 'CS403', credits: 4 },
    { name: 'Design & Analysis of Algorithms', code: 'CS404', credits: 4 },
    { name: 'Artificial Intelligence', code: 'CS405', credits: 3 },
  ];

  useEffect(() => {
    const fetchStudentsAndExistingGrades = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/students?semester=${semester}`);
        if (res.data.success) {
          const list = res.data.students || [];
          setStudents(list);

          const initialMarks = {};
          const initialRemarks = {};

          // Check if grades already exist for this subject & semester
          await Promise.all(
            list.map(async (st) => {
              try {
                const gradeRes = await api.get(`/grades/${st._id}?semester=${semester}`);
                const match = (gradeRes.data.filteredGrades || []).find(
                  (g) => g.subject === subject && g.examType === examType
                );
                if (match) {
                  initialMarks[st._id] = match.marksObtained;
                  initialRemarks[st._id] = match.remarks || '';
                } else {
                  initialMarks[st._id] = 85;
                  initialRemarks[st._id] = '';
                }
              } catch (e) {
                initialMarks[st._id] = 85;
              }
            })
          );

          setMarksMap(initialMarks);
          setRemarksMap(initialRemarks);
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndExistingGrades();
  }, [semester, subject, examType]);

  const handleSubjectChange = (subjName) => {
    setSubject(subjName);
    const found = subjectsList.find((s) => s.name === subjName);
    if (found) {
      setSubjectCode(found.code);
      setCredits(found.credits);
    }
  };

  const computeGrade = (marks) => {
    const percentage = (Number(marks) / Number(maxMarks)) * 100;
    if (percentage >= 90) return { letter: 'O', point: 10, label: 'Outstanding' };
    if (percentage >= 80) return { letter: 'A+', point: 9, label: 'Excellent' };
    if (percentage >= 70) return { letter: 'A', point: 8, label: 'Very Good' };
    if (percentage >= 60) return { letter: 'B+', point: 7, label: 'Good' };
    if (percentage >= 50) return { letter: 'B', point: 6, label: 'Above Average' };
    if (percentage >= 40) return { letter: 'P', point: 4, label: 'Pass' };
    return { letter: 'F', point: 0, label: 'Fail' };
  };

  const handleSaveGrades = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    const records = students.map((st) => ({
      studentId: st._id,
      marksObtained: Number(marksMap[st._id] || 0),
      maxMarks: Number(maxMarks),
      remarks: remarksMap[st._id] || '',
    }));

    try {
      const res = await api.post('/grades/batch', {
        subject,
        subjectCode,
        semester,
        examType,
        credits,
        records,
      });

      if (res.data.success) {
        setSuccessMessage(`Grades for ${records.length} scholars recorded & CGPA updated`);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit marks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-400" />
          <span>Academic Grade & Marks Entry</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Record examination marks with automated 10-point scale GPA / CGPA computation
        </p>
      </div>

      {/* Control Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {subjectsList.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Exam Type</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="Final">Semester Final Examination</option>
              <option value="Internal-1">Internal Assessment 1</option>
              <option value="Internal-2">Internal Assessment 2</option>
              <option value="Practical">Laboratory Practical</option>
              <option value="Assignment">Term Assignment</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Semester & Credits</label>
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
              <input
                type="number"
                value={credits}
                min="1"
                max="10"
                onChange={(e) => setCredits(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder="Credits"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Maximum Marks</label>
            <input
              type="number"
              value={maxMarks}
              min="10"
              max="500"
              onChange={(e) => setMaxMarks(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
            />
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

      {/* Marks Entry Grid */}
      <form onSubmit={handleSaveGrades} className="space-y-4">
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Roll No</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4 w-36">Marks (Out of {maxMarks})</th>
                <th className="py-3.5 px-4 text-center">Computed Grade</th>
                <th className="py-3.5 px-4 text-center">Grade Point</th>
                <th className="py-3.5 px-4">Faculty Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {students.map((st) => {
                const mark = marksMap[st._id] !== undefined ? marksMap[st._id] : 85;
                const evaluated = computeGrade(mark);
                return (
                  <tr key={st._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-indigo-400 font-semibold">
                      {st.rollNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{st.name}</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        max={maxMarks}
                        value={mark}
                        onChange={(e) =>
                          setMarksMap({ ...marksMap, [st._id]: Number(e.target.value) })
                        }
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
                          evaluated.letter === 'F'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : evaluated.letter === 'O'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        }`}
                      >
                        {evaluated.letter}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-200 font-mono">
                      {evaluated.point} / 10
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={remarksMap[st._id] || ''}
                        onChange={(e) =>
                          setRemarksMap({ ...remarksMap, [st._id]: e.target.value })
                        }
                        placeholder="e.g. Excellent conceptual grasp"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 glass-panel rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span>CGPA is recalculated and updated automatically upon saving</span>
          </div>
          <button
            type="submit"
            disabled={saving || students.length === 0}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Recording Marks...' : 'Publish & Sync Grades'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default GradeEntry;

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import StatCard from '../../components/common/StatCard';
import AlertBanner from '../../components/common/AlertBanner';
import {
  GraduationCap,
  ClipboardCheck,
  Award,
  Calendar,
  Clock,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/students?semester=4');
        if (res.data.success) {
          setStudents(res.data.students || []);
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">Faculty Academic Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Department of Computer Science & Engineering • Academic Year 2025-2026
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/teacher/attendance"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Mark Today's Attendance</span>
          </Link>
          <Link
            to="/teacher/grades"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Enter Exam Marks</span>
          </Link>
        </div>
      </div>

      {/* Critical Alert Warning for Low Attendance Students */}
      <AlertBanner
        type="warning"
        title="Faculty Low Attendance Alert Notification"
        message="Scholars with attendance rate under 75% in Semester 4 are flagged. Automated warning notifications have been sent to their parent and student portals."
        action={
          <Link
            to="/teacher/students"
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-semibold border border-amber-500/30 transition-colors"
          >
            Inspect Roster
          </Link>
        }
      />

      {/* Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Scholars"
          value={students.length || 3}
          subtitle="Semester 4 - Section A"
          icon={GraduationCap}
          color="indigo"
        />
        <StatCard
          title="Avg Class Attendance"
          value="87.6%"
          subtitle="Across 5 active subjects"
          icon={ClipboardCheck}
          color="emerald"
        />
        <StatCard
          title="Today's Lectures"
          value="3 Sessions"
          subtitle="DBMS, Networks, OS Lab"
          icon={Clock}
          color="purple"
        />
        <StatCard
          title="Grading Status"
          value="Mid-Term Active"
          subtitle="Grades synced with CGPA"
          icon={Award}
          color="amber"
        />
      </div>

      {/* Grid of Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Schedule Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Today's Assigned Lecture Schedule</span>
            </h3>
            <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full">
              Live Day Plan
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200 text-xs">
                  Database Management Systems (CS401)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Semester 4 - Sec A • Room 301
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-indigo-400 font-mono">09:00 - 10:00 AM</div>
                <span className="text-[10px] text-emerald-400">Completed</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200 text-xs">
                  Operating Systems Lab (CS403P)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Semester 4 - Sec A • Advanced Systems Lab
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-amber-400 font-mono">01:15 - 03:15 PM</div>
                <span className="text-[10px] text-amber-400">Upcoming Next</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-right">
            <Link
              to="/timetable"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
            >
              <span>View Full Weekly Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Academic Actions Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 mb-1">
              Rapid Academic Workflows
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Single-click shortcuts for grading, attendance, and student transcripts
            </p>

            <div className="space-y-2.5">
              <Link
                to="/teacher/attendance"
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                      Submit Class Attendance
                    </div>
                    <div className="text-[10px] text-slate-400">Mark Present, Absent or Excused</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/teacher/grades"
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
                      Enter Subject Marks
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Automated 10-point GPA & CGPA recalculation
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 text-xs text-slate-400">
            Current Grading Cycle: <strong>Spring 2026 Regular Exams</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

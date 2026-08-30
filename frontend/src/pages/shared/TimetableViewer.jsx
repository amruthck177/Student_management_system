import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

const TimetableViewer = () => {
  const [timetables, setTimetables] = useState([]);
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState(4);
  const [section, setSection] = useState('A');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/timetable?department=${department}&semester=${semester}&section=${section}`
        );
        if (res.data.success) {
          setTimetables(res.data.timetables || []);
        }
      } catch (err) {
        console.error('Fetch timetable error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [department, semester, section]);

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            <span>Academic Class Timetable</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Weekly scheduled lectures, laboratory sessions, and assigned faculty
          </p>
        </div>

        {/* Filter Selection */}
        <div className="flex items-center gap-2">
          <select
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>
      </div>

      {/* Days Schedule Matrix */}
      <div className="space-y-4">
        {daysOrder.map((dayName) => {
          const daySchedule = timetables.find((t) => t.day === dayName);
          const periods = daySchedule?.periods || [];

          return (
            <div
              key={dayName}
              className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>{dayName}</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {periods.length} Scheduled Periods
                </span>
              </div>

              {periods.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {periods.map((period) => (
                    <div
                      key={period._id || period.periodNumber}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2 hover:border-indigo-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] text-indigo-400 font-mono font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{period.startTime} - {period.endTime}</span>
                        </span>
                        <span className="text-[10px] text-slate-500">P-{period.periodNumber}</span>
                      </div>

                      <div>
                        <div className="font-bold text-slate-100 text-xs truncate">
                          {period.subject}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {period.subjectCode || 'CS40x'}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 truncate">
                          <User className="w-3 h-3 text-slate-500" />
                          <span>{period.teacherName || period.teacher?.name || 'Faculty'}</span>
                        </span>
                        <span className="flex items-center gap-1 shrink-0 text-slate-500">
                          <MapPin className="w-3 h-3" />
                          <span>{period.roomNumber || 'Room 301'}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-3 text-center">
                  No lectures scheduled for {dayName}.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimetableViewer;

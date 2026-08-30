import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import Modal from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  CheckCircle2,
  AlertCircle,
  User,
  Users,
  ExternalLink,
} from 'lucide-react';

const AppointmentScheduler = () => {
  const { user } = useAuth();
  const isParent = user?.role === 'parent';
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const [appointments, setAppointments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    teacherId: '',
    studentId: '',
    requestedDate: '',
    timeSlot: '10:30 AM - 10:45 AM',
    topic: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, usersRes, parentRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/auth/users?role=teacher'),
        isParent ? api.get('/parent/students') : Promise.resolve({ data: { children: [] } }),
      ]);

      if (appRes.data.success) setAppointments(appRes.data.appointments || []);
      if (usersRes.data.success) setTeachers(usersRes.data.users || []);
      if (parentRes.data?.success) setChildren(parentRes.data.children || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/appointments', formData);
      if (res.data.success) {
        setIsBookModalOpen(false);
        setFormData({
          teacherId: '',
          studentId: '',
          requestedDate: '',
          timeSlot: '10:30 AM - 10:45 AM',
          topic: '',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  const handleConfirm = async (appId) => {
    try {
      const res = await api.patch(`/appointments/${appId}/status`, {
        status: 'confirmed',
        meetingLink: 'https://meet.google.com/cmp-ldgr-edu',
        notes: 'Consultation slot confirmed by subject faculty.',
      });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            <span>Parent-Faculty Consultation Scheduler</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Book 1-on-1 virtual consultation slots between parents and subject professors
          </p>
        </div>

        {isParent && (
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Request Consultation Slot</span>
          </button>
        )}
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointments.map((app) => {
          const isConfirmed = app.status === 'confirmed';
          return (
            <div
              key={app._id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      isConfirmed
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {app.status}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{app.timeSlot}</span>
                  </span>
                </div>

                <h3 className="font-bold text-slate-100 text-sm">{app.topic}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Date: <strong className="text-slate-200">{new Date(app.requestedDate).toLocaleDateString()}</strong>
                </p>

                <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 text-slate-300">
                  <div>Faculty: <strong>{app.teacher?.name || 'Subject Professor'}</strong></div>
                  <div>Parent: <strong>{app.parent?.name}</strong> • Scholar: <strong>{app.student?.name}</strong></div>
                  {app.notes && <div className="text-[11px] text-indigo-300 mt-1">Note: {app.notes}</div>}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                {isConfirmed && app.meetingLink ? (
                  <a
                    href={app.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Google Meet</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-500">Meeting link will be provided upon confirmation</span>
                )}

                {isTeacher && !isConfirmed && (
                  <button
                    onClick={() => handleConfirm(app._id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    Confirm Slot
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Faculty Consultation"
      >
        <form onSubmit={handleBook} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-200 mb-1">Select Student</label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Choose Child --</option>
              {children.map((c) => (
                <option key={c.student._id} value={c.student._id}>
                  {c.student.name} ({c.student.rollNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-200 mb-1">Select Subject Professor</label>
            <select
              required
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Choose Faculty --</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Preferred Date</label>
              <input
                type="date"
                required
                value={formData.requestedDate}
                onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-200 mb-1">Time Slot</label>
              <select
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="09:30 AM - 09:45 AM">09:30 AM - 09:45 AM</option>
                <option value="10:30 AM - 10:45 AM">10:30 AM - 10:45 AM</option>
                <option value="02:00 PM - 02:15 PM">02:00 PM - 02:15 PM</option>
                <option value="04:30 PM - 04:45 PM">04:30 PM - 04:45 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-200 mb-1">Discussion Agenda / Topic</label>
            <input
              type="text"
              required
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g. Mid-term review & low attendance guidance"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md"
            >
              Request Slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AppointmentScheduler;

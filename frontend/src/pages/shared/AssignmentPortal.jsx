import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import Modal from '../../components/common/Modal';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Send,
  Upload,
  AlertCircle,
  ExternalLink,
  Award,
} from 'lucide-react';

const AssignmentPortal = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'Database Management Systems',
    department: 'Computer Science & Engineering',
    semester: 4,
    section: 'A',
    deadline: '',
    maxMarks: 25,
  });

  const [submitData, setSubmitData] = useState({
    content: '',
    fileUrl: '',
  });

  const [gradeData, setGradeData] = useState({
    marksObtained: '',
    feedback: '',
  });

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assignments');
      if (res.data.success) {
        setAssignments(res.data.assignments || []);
      }
    } catch (err) {
      console.error('Fetch assignments error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/assignments', formData);
      if (res.data.success) {
        setIsCreateModalOpen(false);
        setFormData({
          title: '',
          description: '',
          subject: 'Database Management Systems',
          department: 'Computer Science & Engineering',
          semester: 4,
          section: 'A',
          deadline: '',
          maxMarks: 25,
        });
        fetchAssignments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleOpenSubmit = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmitData({ content: '', fileUrl: '' });
    setIsSubmitModalOpen(true);
  };

  const handleSubmitCoursework = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/assignments/${selectedAssignment._id}/submit`, submitData);
      if (res.data.success) {
        alert(res.data.message);
        setIsSubmitModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission error');
    }
  };

  const handleViewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    try {
      const res = await api.get(`/assignments/${assignment._id}/submissions`);
      if (res.data.success) {
        setSubmissions(res.data.submissions || []);
      }
    } catch (err) {
      alert('Error fetching submissions: ' + err.message);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/assignments/submissions/${selectedSubmission._id}/grade`, gradeData);
      if (res.data.success) {
        setIsGradeModalOpen(false);
        handleViewSubmissions(selectedAssignment);
      }
    } catch (err) {
      alert('Error grading submission: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span>Assignments & Coursework LMS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish academic assignments, submit coursework, and evaluate submissions
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Assignment List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((item) => {
          const isPastDeadline = new Date() > new Date(item.deadline);
          return (
            <div
              key={item._id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-md font-semibold border border-indigo-500/20">
                    {item.subject}
                  </span>
                  <span
                    className={`flex items-center gap-1 font-mono text-[10px] ${
                      isPastDeadline ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due: {new Date(item.deadline).toLocaleDateString()}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Max Marks: <strong className="text-slate-200">{item.maxMarks} pts</strong>
                </span>

                <div className="flex items-center gap-2">
                  {isStudent && (
                    <button
                      onClick={() => handleOpenSubmit(item)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Submit Solution</span>
                    </button>
                  )}

                  {isTeacher && (
                    <button
                      onClick={() => handleViewSubmissions(item)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1"
                    >
                      <span>Submissions</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submissions Drawer for Teachers */}
      {isTeacher && selectedAssignment && submissions.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Submissions for: {selectedAssignment.title} ({submissions.length})</span>
            </h3>
            <button
              onClick={() => setSelectedAssignment(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
          </div>

          <div className="space-y-2">
            {submissions.map((sub) => (
              <div
                key={sub._id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-200">{sub.student?.name} ({sub.student?.rollNumber})</div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{sub.content}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        sub.status === 'graded'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {sub.status === 'graded' ? `${sub.marksObtained} / ${selectedAssignment.maxMarks} pts` : 'Pending Grade'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setGradeData({ marksObtained: sub.marksObtained || '', feedback: sub.feedback || '' });
                      setIsGradeModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                  >
                    Grade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Publish Coursework Assignment"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-200 mb-1">Assignment Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-200 mb-1">Subject</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Submission Deadline</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Max Marks (Points)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-200 mb-1">Instructions & Problem Statement</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md"
            >
              Publish Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Submit Assignment Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={`Submit Coursework: ${selectedAssignment?.title}`}
      >
        <form onSubmit={handleSubmitCoursework} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-200 mb-1">Solution Description / Repository Link</label>
            <textarea
              rows={4}
              required
              value={submitData.content}
              onChange={(e) => setSubmitData({ ...submitData, content: e.target.value })}
              placeholder="Paste your code explanation, solution summary, or GitHub repository link..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-200 mb-1">Attachment File URL (Optional)</label>
            <input
              type="url"
              value={submitData.fileUrl}
              onChange={(e) => setSubmitData({ ...submitData, fileUrl: e.target.value })}
              placeholder="https://drive.google.com/your-submission.pdf"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md"
            >
              Submit Coursework
            </button>
          </div>
        </form>
      </Modal>

      {/* Grade Submission Modal */}
      <Modal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        title="Grade Student Submission"
      >
        <form onSubmit={handleGradeSubmission} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-200 mb-1">
              Score (Max: {selectedAssignment?.maxMarks} pts)
            </label>
            <input
              type="number"
              min="0"
              max={selectedAssignment?.maxMarks}
              required
              value={gradeData.marksObtained}
              onChange={(e) => setGradeData({ ...gradeData, marksObtained: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-200 mb-1">Faculty Feedback & Rubric Notes</label>
            <textarea
              rows={3}
              value={gradeData.feedback}
              onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
              placeholder="Constructive feedback on code methodology, correctness, and presentation..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsGradeModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
            >
              Submit Grade
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssignmentPortal;

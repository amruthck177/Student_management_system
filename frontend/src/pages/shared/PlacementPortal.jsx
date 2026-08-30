import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import Modal from '../../components/common/Modal';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Send,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const PlacementPortal = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const [drives, setDrives] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [studentCGPA, setStudentCGPA] = useState(8.85);

  const [formData, setFormData] = useState({
    companyName: '',
    roleTitle: '',
    packageCTC: '',
    location: 'Hybrid / Boston, MA',
    minCGPA: 7.5,
    applicationDeadline: '',
    jobDescription: '',
  });

  const fetchDrivesAndApps = async () => {
    setLoading(true);
    try {
      const [drivesRes, appsRes] = await Promise.all([
        api.get('/placements/drives'),
        isStudent ? api.get('/placements/my-applications') : Promise.resolve({ data: { applications: [] } }),
      ]);

      if (drivesRes.data.success) {
        setDrives(drivesRes.data.drives || []);
      }
      if (appsRes.data?.success) {
        setMyApplications(appsRes.data.applications || []);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivesAndApps();
  }, [isStudent]);

  const handleApply = async (driveId) => {
    try {
      const res = await api.post('/placements/apply', { driveId });
      if (res.data.success) {
        alert(res.data.message);
        fetchDrivesAndApps();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Application failed');
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/placements/drives', formData);
      if (res.data.success) {
        setIsCreateModalOpen(false);
        setFormData({
          companyName: '',
          roleTitle: '',
          packageCTC: '',
          location: 'Hybrid / Boston, MA',
          minCGPA: 7.5,
          applicationDeadline: '',
          jobDescription: '',
        });
        fetchDrivesAndApps();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post drive');
    }
  };

  const appliedDriveIds = new Set(myApplications.map((a) => a.placementDrive?._id));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            <span>Career & Placement Cell Portal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Corporate recruitment drives, automated CGPA eligibility checks, and job tracking
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post Placement Drive</span>
          </button>
        )}
      </div>

      {/* Student Application Status Banner */}
      {isStudent && myApplications.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>My Active Job Applications ({myApplications.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myApplications.map((app) => (
              <div
                key={app._id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">{app.placementDrive?.companyName}</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    {app.status}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">{app.placementDrive?.roleTitle}</p>
                <p className="text-[10px] text-slate-500">
                  Round: <strong className="text-amber-400">{app.interviewRound}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placement Drives List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drives.map((drive) => {
          const isEligible = studentCGPA >= drive.minCGPA;
          const isApplied = appliedDriveIds.has(drive._id);

          return (
            <div
              key={drive._id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <span>{drive.companyName}</span>
                    </h3>
                    <div className="text-xs font-semibold text-indigo-300 mt-0.5">{drive.roleTitle}</div>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {drive.packageCTC}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 my-2.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{drive.location}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Deadline: {new Date(drive.applicationDeadline).toLocaleDateString()}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {drive.jobDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">Min CGPA: </span>
                  <strong className={isEligible ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                    {drive.minCGPA.toFixed(1)}
                  </strong>
                </div>

                {isStudent && (
                  <button
                    onClick={() => handleApply(drive._id)}
                    disabled={isApplied || !isEligible}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                      isApplied
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                        : isEligible
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'bg-rose-900/40 text-rose-300 border border-rose-800/60 cursor-not-allowed'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Applied</span>
                      </>
                    ) : isEligible ? (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Apply Now</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Ineligible (CGPA &lt; {drive.minCGPA})</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Placement Drive Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Post Corporate Placement Drive"
      >
        <form onSubmit={handleCreateDrive} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-200 mb-1">Company Name</label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Role Title</label>
              <input
                type="text"
                required
                value={formData.roleTitle}
                onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Package CTC</label>
              <input
                type="text"
                required
                value={formData.packageCTC}
                onChange={(e) => setFormData({ ...formData, packageCTC: e.target.value })}
                placeholder="e.g. $140,000 / annum"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Minimum CGPA Filter</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={formData.minCGPA}
                onChange={(e) => setFormData({ ...formData, minCGPA: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Application Deadline</label>
              <input
                type="date"
                required
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-200 mb-1">Job Description & Requirements</label>
            <textarea
              rows={4}
              required
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
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
              Post Drive
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlacementPortal;

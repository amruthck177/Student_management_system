import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import {
  GraduationCap,
  UserPlus,
  FileSpreadsheet,
  FileDown,
  CreditCard,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  Upload,
} from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importStatus, setImportStatus] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    department: 'Computer Science & Engineering',
    semester: 4,
    section: 'A',
    phone: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    bloodGroup: 'O+',
    gender: 'Male',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/students?department=${departmentFilter}&semester=${semesterFilter}&search=${search}`
      );
      if (res.data.success) {
        setStudents(res.data.students || []);
      }
    } catch (err) {
      console.error('Fetch students error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [departmentFilter, semesterFilter, search]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await api.post('/students', formData);
      if (res.data.success) {
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          rollNumber: '',
          email: '',
          department: 'Computer Science & Engineering',
          semester: 4,
          section: 'A',
          phone: '',
          parentName: '',
          parentPhone: '',
          parentEmail: '',
          bloodGroup: 'O+',
          gender: 'Male',
        });
        fetchStudents();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create student profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setSubmitting(true);
    setImportStatus(null);

    const data = new FormData();
    data.append('file', selectedFile);

    try {
      const res = await api.post('/students/import', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setImportStatus({
          success: true,
          message: res.data.message,
          errors: res.data.errors,
        });
        fetchStudents();
      }
    } catch (err) {
      setImportStatus({
        success: false,
        message: err.response?.data?.message || 'Import failed',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id, roll) => {
    if (window.confirm(`Are you sure you want to permanently delete student record [${roll}]?`)) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete student record');
      }
    }
  };

  const downloadPDF = async (url, filename) => {
    try {
      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to download PDF: ' + err.message);
    }
  };

  const columns = [
    {
      header: 'Roll No. & Student',
      accessor: 'rollNumber',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
            {row.rollNumber?.slice(-3)}
          </div>
          <div>
            <div className="font-semibold text-slate-200">{row.name}</div>
            <div className="text-[11px] text-indigo-400 font-mono font-medium">{row.rollNumber}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Department / Sem',
      accessor: 'department',
      render: (row) => (
        <div>
          <div className="text-slate-200 font-medium">{row.department}</div>
          <div className="text-[10px] text-slate-400">
            Semester {row.semester} • Section {row.section}
          </div>
        </div>
      ),
    },
    {
      header: 'Contact / Parent',
      accessor: 'email',
      render: (row) => (
        <div>
          <div className="text-slate-300">{row.email}</div>
          <div className="text-[10px] text-slate-500">{row.phone || 'No phone'}</div>
        </div>
      ),
    },
    {
      header: 'Documents',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              downloadPDF(`/students/${row._id}/report-card`, `ReportCard_${row.rollNumber}.pdf`)
            }
            title="Download Official Report Card"
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              downloadPDF(`/students/${row._id}/id-card`, `ID_Card_${row.rollNumber}.pdf`)
            }
            title="Download Official Student ID Card"
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDeleteStudent(row._id, row.rollNumber)}
            className="p-1.5 rounded-lg border border-rose-900/40 hover:bg-rose-500/10 text-rose-400 transition-colors"
            title="Delete student"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Add & CSV Import Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">Student Directory & Records</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enroll scholars, inspect academic documents, and bulk-import class rosters
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Single Student</span>
          </button>
          <button
            onClick={() => {
              setImportStatus(null);
              setSelectedFile(null);
              setIsImportModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>CSV / Excel Ingestion</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Departments</option>
          <option value="Computer Science & Engineering">Computer Science & Engineering</option>
          <option value="Electronics & Communication">Electronics & Communication</option>
          <option value="Mechanical Engineering">Mechanical Engineering</option>
          <option value="Civil Engineering">Civil Engineering</option>
        </select>

        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>

      {/* Students DataTable */}
      <DataTable
        columns={columns}
        data={students}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by student name, roll number, or email..."
      />

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll New Scholar Record"
        maxWidth="max-w-2xl"
      >
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Roll Number</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. CS2026-042"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Student Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex.morgan@campusledger.edu"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 019-7788"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Parent / Guardian Name</label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="Guardian Full Name"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Parent Email</label>
              <input
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                placeholder="parent@email.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Enrolling...' : 'Enroll Scholar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CSV / Excel Ingestion Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Bulk Ingestion (CSV / Excel Roster)"
      >
        <form onSubmit={handleBulkImport} className="space-y-4">
          <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 text-center">
            <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-200">
              Select or Drop CSV / Excel (.xlsx) Roster
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              File must contain columns: <code>name</code>, <code>email</code>, <code>rollNumber</code>, <code>department</code>, <code>semester</code>
            </p>

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              required
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="mt-3 block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
          </div>

          {importStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex flex-col gap-1 border ${
                importStatus.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {importStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{importStatus.message}</span>
              </div>
              {importStatus.errors && importStatus.errors.length > 0 && (
                <div className="text-[11px] text-slate-400 mt-1 max-h-24 overflow-y-auto pl-2 border-l border-slate-700">
                  {importStatus.errors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedFile}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? 'Parsing & Ingesting...' : 'Upload & Process'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentManagement;

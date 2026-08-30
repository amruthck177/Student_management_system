import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import StatCard from '../../components/common/StatCard';
import {
  CreditCard,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt,
  DollarSign,
} from 'lucide-react';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [metrics, setMetrics] = useState({ collectedAmount: 0, pendingAmount: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    title: 'Semester 4 Tuition Fee',
    category: 'Tuition',
    amount: 45000,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    semester: 4,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/fees?status=${statusFilter}`);
      if (res.data.success) {
        setFees(res.data.fees || []);
        if (res.data.metrics) setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Fetch fees error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [statusFilter]);

  useEffect(() => {
    // Fetch students list for dropdown assignment
    const loadStudents = async () => {
      try {
        const res = await api.get('/students?limit=100');
        if (res.data.success) {
          setStudents(res.data.students || []);
          if (res.data.students?.length > 0) {
            setFormData((prev) => ({ ...prev, studentId: res.data.students[0]._id }));
          }
        }
      } catch (err) {
        console.error(err.message);
      }
    };
    loadStudents();
  }, []);

  const handleCreateFee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/fees', formData);
      if (res.data.success) {
        setIsModalOpen(false);
        fetchFees();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign fee invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Student Scholar',
      accessor: 'student',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-200">{row.student?.name || 'N/A'}</div>
          <div className="text-[11px] text-slate-400 font-mono">{row.student?.rollNumber}</div>
        </div>
      ),
    },
    {
      header: 'Fee Title / Category',
      accessor: 'title',
      render: (row) => (
        <div>
          <div className="text-slate-200 font-medium">{row.title}</div>
          <div className="text-[10px] text-slate-500 uppercase">{row.category}</div>
        </div>
      ),
    },
    {
      header: 'Invoice Amount',
      accessor: 'amount',
      render: (row) => (
        <span className="font-bold text-slate-100">${row.amount?.toLocaleString()}</span>
      ),
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      render: (row) => (
        <span className="text-slate-400 text-xs">
          {new Date(row.dueDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Payment Status',
      accessor: 'status',
      render: (row) => {
        const isPaid = row.status === 'paid';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
              isPaid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {isPaid ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            <span>{row.status}</span>
          </span>
        );
      },
    },
    {
      header: 'Receipt Ref',
      render: (row) => (
        <span className="font-mono text-[10px] text-slate-400">
          {row.paymentDetails?.receiptNumber || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">Fee Ledger & Payments</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track student dues, generate invoice billings, and reconcile gateway receipts
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Fee Invoice</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Reconciled Collections"
          value={`$${metrics.collectedAmount.toLocaleString()}`}
          subtitle="Processed via Razorpay gateway"
          icon={CreditCard}
          color="emerald"
        />
        <StatCard
          title="Outstanding Tuition Receivables"
          value={`$${metrics.pendingAmount.toLocaleString()}`}
          subtitle="Pending semester invoices"
          icon={DollarSign}
          color="amber"
        />
        <StatCard
          title="Active Invoices"
          value={fees.length}
          subtitle="Total assigned invoices in ledger"
          icon={Receipt}
          color="indigo"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'unpaid', 'paid', 'overdue'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all ${
              statusFilter === s
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Fees DataTable */}
      <DataTable columns={columns} data={fees} searchPlaceholder="Search fee invoices..." />

      {/* Assign Fee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Fee Invoice to Scholar"
      >
        <form onSubmit={handleCreateFee} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Student</label>
            <select
              value={formData.studentId}
              required
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.rollNumber}) - Sem {s.semester}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Fee Description / Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ($ / INR)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Assign Invoice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeManagement;

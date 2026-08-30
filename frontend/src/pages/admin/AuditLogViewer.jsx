import React, { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import DataTable from '../../components/common/DataTable';
import { ShieldAlert, Activity, Filter } from 'lucide-react';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/audit-logs?action=${actionFilter}&entityType=${entityFilter}&limit=50`
      );
      if (res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Fetch logs error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-400">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Operator / User',
      accessor: 'userName',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-200">{row.userName}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">{row.userRole}</div>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => {
        const colors = {
          CREATE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          UPDATE: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          LOGIN: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          PAYMENT: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          IMPORT: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        };
        return (
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase font-mono ${colors[row.action] || 'bg-slate-800 text-slate-400'}`}>
            {row.action}
          </span>
        );
      },
    },
    {
      header: 'Entity Model',
      accessor: 'entityType',
      render: (row) => (
        <span className="font-medium text-slate-300 font-mono text-xs">{row.entityType}</span>
      ),
    },
    {
      header: 'Audit Payload Details',
      accessor: 'details',
      render: (row) => (
        <div className="max-w-md truncate text-[11px] font-mono text-slate-400 bg-slate-900/60 p-1 rounded border border-slate-800/80">
          {JSON.stringify(row.details)}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`text-[10px] font-bold uppercase ${
            row.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-400" />
            <span>Immutable System Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time security governance recording who created, updated, or deleted institutional records
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="LOGIN">LOGIN</option>
          <option value="PAYMENT">PAYMENT</option>
          <option value="IMPORT">IMPORT</option>
        </select>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Entity Models</option>
          <option value="User">User</option>
          <option value="Student">Student</option>
          <option value="Attendance">Attendance</option>
          <option value="Grade">Grade</option>
          <option value="Fee">Fee</option>
          <option value="Notice">Notice</option>
          <option value="Timetable">Timetable</option>
        </select>
      </div>

      <DataTable columns={columns} data={logs} searchPlaceholder="Search audit trail..." />
    </div>
  );
};

export default AuditLogViewer;

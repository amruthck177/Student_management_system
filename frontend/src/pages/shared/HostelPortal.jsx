import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import Modal from '../../components/common/Modal';
import {
  Home,
  Wrench,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';

const HostelPortal = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const [rooms, setRooms] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'rooms'
  const [loading, setLoading] = useState(true);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState({
    hostelBlock: 'Aryabhatta Hall Block-A',
    roomNumber: '304',
    title: '',
    category: 'Electrical',
    description: '',
    priority: 'Medium',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, ticketsRes] = await Promise.all([
        api.get('/hostel/rooms'),
        api.get('/hostel/tickets'),
      ]);

      if (roomsRes.data.success) setRooms(roomsRes.data.rooms || []);
      if (ticketsRes.data.success) setTickets(ticketsRes.data.tickets || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/hostel/tickets', ticketData);
      if (res.data.success) {
        setIsTicketModalOpen(false);
        setTicketData({
          hostelBlock: 'Aryabhatta Hall Block-A',
          roomNumber: '304',
          title: '',
          category: 'Electrical',
          description: '',
          priority: 'Medium',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to raise ticket');
    }
  };

  const handleResolveTicket = async (ticketId) => {
    try {
      const res = await api.patch(`/hostel/tickets/${ticketId}/resolve`, {
        status: 'Resolved',
        resolutionNotes: 'Maintenance completed and verified by warden.',
      });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Home className="w-6 h-6 text-indigo-400" />
            <span>Hostel & Facility Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dormitory allocations, room availability, and maintenance repair ticketing
          </p>
        </div>

        {isStudent && (
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Raise Repair Ticket</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'tickets'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Maintenance Tickets ({tickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'rooms'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Hostel Rooms & Allocations ({rooms.length})</span>
        </button>
      </div>

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const isResolved = ticket.status === 'Resolved';
            return (
              <div
                key={ticket._id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{ticket.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {ticket.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        ticket.priority === 'High' || ticket.priority === 'Urgent'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {ticket.priority} Priority
                    </span>
                  </div>

                  <p className="text-slate-400 text-xs">{ticket.description}</p>
                  <p className="text-[10px] text-slate-500">
                    Location: <strong>{ticket.hostelBlock} - Room {ticket.roomNumber}</strong> • Student: <strong>{ticket.student?.name || 'Scholar'}</strong>
                  </p>
                  {ticket.resolutionNotes && (
                    <p className="text-[10px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 mt-1">
                      Resolution: {ticket.resolutionNotes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      isResolved
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {ticket.status}
                  </span>

                  {isAdmin && !isResolved && (
                    <button
                      onClick={() => handleResolveTicket(ticket._id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-base">Room {room.roomNumber}</span>
                <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  {room.roomType}
                </span>
              </div>

              <p className="text-xs text-slate-400">{room.hostelBlock} • Floor {room.floor}</p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Occupancy:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {room.residents?.length || room.occupiedCount} / {room.capacity} Beds
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raise Ticket Modal */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title="Raise Facility Repair Ticket"
      >
        <form onSubmit={handleRaiseTicket} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Hostel Block</label>
              <input
                type="text"
                required
                value={ticketData.hostelBlock}
                onChange={(e) => setTicketData({ ...ticketData, hostelBlock: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Room Number</label>
              <input
                type="text"
                required
                value={ticketData.roomNumber}
                onChange={(e) => setTicketData({ ...ticketData, roomNumber: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Issue Category</label>
              <select
                value={ticketData.category}
                onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Air Conditioning">Air Conditioning</option>
                <option value="WiFi / Network">WiFi / Network</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Priority</label>
              <select
                value={ticketData.priority}
                onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-200 mb-1">Issue Title</label>
            <input
              type="text"
              required
              value={ticketData.title}
              onChange={(e) => setTicketData({ ...ticketData, title: e.target.value })}
              placeholder="e.g. Broken bathroom tap leakage"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-200 mb-1">Detailed Description</label>
            <textarea
              rows={3}
              required
              value={ticketData.description}
              onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsTicketModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HostelPortal;

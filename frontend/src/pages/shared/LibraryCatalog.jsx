import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  Plus,
  BookmarkPlus,
  BookMarked,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const LibraryCatalog = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const [books, setBooks] = useState([]);
  const [myBorrowed, setMyBorrowed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    totalCopies: 5,
    shelfLocation: 'Stack CS-101',
  });
  const [message, setMessage] = useState('');

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/library/books?category=${categoryFilter}&search=${search}`);
      if (res.data.success) {
        setBooks(res.data.books || []);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBorrowed = async () => {
    if (!isStudent) return;
    try {
      const res = await api.get('/library/my-books');
      if (res.data.success) {
        setMyBorrowed(res.data.borrowed || []);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [categoryFilter, search]);

  useEffect(() => {
    fetchMyBorrowed();
  }, [isStudent]);

  const handleBorrow = async (bookId) => {
    try {
      const res = await api.post('/library/borrow', { bookId });
      if (res.data.success) {
        setMessage(res.data.message);
        fetchBooks();
        fetchMyBorrowed();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to borrow book');
    }
  };

  const handleReturn = async (borrowId) => {
    try {
      const res = await api.post(`/library/return/${borrowId}`);
      if (res.data.success) {
        setMessage('Book returned successfully');
        fetchBooks();
        fetchMyBorrowed();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return book');
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/library/books', addFormData);
      if (res.data.success) {
        setIsAddBookModalOpen(false);
        setAddFormData({
          title: '',
          author: '',
          isbn: '',
          category: 'Computer Science',
          totalCopies: 5,
          shelfLocation: 'Stack CS-101',
        });
        fetchBooks();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add book');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span>Collegiate Library & Resource Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search physical books, inspect shelf availability, and reserve reading materials
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Catalog New Book</span>
          </button>
        )}
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Active Borrowed Books by Scholar */}
      {isStudent && myBorrowed.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
            <BookMarked className="w-4 h-4 text-indigo-400" />
            <span>My Active Borrowed Books ({myBorrowed.filter((b) => b.status === 'borrowed').length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myBorrowed
              .filter((b) => b.status === 'borrowed')
              .map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <h5 className="font-bold text-slate-100 text-xs truncate max-w-[200px]">
                      {item.book?.title}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      Due: <strong className="text-amber-400">{new Date(item.dueDate).toLocaleDateString()}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => handleReturn(item._id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Return</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Categories</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Electronics">Electronics</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Mechanical">Mechanical</option>
          <option value="General Reference">General Reference</option>
        </select>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => {
          const isAvailable = book.availableCopies > 0;
          return (
            <div
              key={book._id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-indigo-400 font-semibold mb-2">
                  <span className="uppercase">{book.category}</span>
                  <span className="font-mono text-slate-400">{book.shelfLocation}</span>
                </div>

                <h3 className="font-bold text-slate-100 text-sm leading-snug">{book.title}</h3>
                <p className="text-xs text-slate-400 mt-1">by {book.author}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{book.isbn}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold ${
                    isAvailable ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isAvailable
                    ? `${book.availableCopies} of ${book.totalCopies} Available`
                    : 'Out of Stock'}
                </span>

                {isStudent && (
                  <button
                    onClick={() => handleBorrow(book._id)}
                    disabled={!isAvailable}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-all shadow-md"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Reserve</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Book Modal for Admin */}
      <Modal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        title="Catalog New Academic Book"
      >
        <form onSubmit={handleAddBook} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Book Title</label>
            <input
              type="text"
              required
              value={addFormData.title}
              onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Author(s)</label>
            <input
              type="text"
              required
              value={addFormData.author}
              onChange={(e) => setAddFormData({ ...addFormData, author: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={addFormData.category}
                onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="General Reference">General Reference</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Copies</label>
              <input
                type="number"
                min="1"
                required
                value={addFormData.totalCopies}
                onChange={(e) =>
                  setAddFormData({ ...addFormData, totalCopies: Number(e.target.value) })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Shelf / Stack Location</label>
            <input
              type="text"
              value={addFormData.shelfLocation}
              onChange={(e) => setAddFormData({ ...addFormData, shelfLocation: e.target.value })}
              placeholder="e.g. Stack CS-204"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddBookModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Add to Catalog
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LibraryCatalog;

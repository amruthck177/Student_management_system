import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Bell, Sparkles, X, CheckCircle, Info } from 'lucide-react';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to real-time event stream');
    });

    newSocket.on('notice_broadcast', (data) => {
      addToast({
        title: '📢 New Campus Notice',
        message: data.title,
        type: 'info',
      });
    });

    newSocket.on('grades_updated', (data) => {
      addToast({
        title: '📊 Examination Results Published',
        message: `New marks recorded for ${data.subject || 'your class'}.`,
        type: 'success',
      });
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const addToast = ({ title, message, type = 'info' }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 6000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <SocketContext.Provider value={{ socket, addToast }}>
      {children}

      {/* Floating Real-Time Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto glass-dropdown p-4 rounded-2xl border border-indigo-500/30 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 flex items-start justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-slate-100">{toast.title}</h5>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

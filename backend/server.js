const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Enable CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Helper to make io available in req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'CampusLedger Enterprise ERP API (v2.0)',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Core & Enterprise Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/grades', require('./routes/gradeRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));
app.use('/api/audit-logs', require('./routes/auditRoutes'));
app.use('/api/parent', require('./routes/parentRoutes'));
app.use('/api/library', require('./routes/libraryRoutes'));
app.use('/api/2fa', require('./routes/twoFactorRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/placements', require('./routes/placementRoutes'));
app.use('/api/hostel', require('./routes/hostelRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// Custom Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[CampusLedger] Enterprise Server running on port ${PORT} with WebSockets & LMS active`);
});

module.exports = { app, server, io };

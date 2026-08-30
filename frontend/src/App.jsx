import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import StudentManagement from './pages/admin/StudentManagement';
import FeeManagement from './pages/admin/FeeManagement';
import AuditLogViewer from './pages/admin/AuditLogViewer';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AssignedStudents from './pages/teacher/AssignedStudents';
import AttendanceMarking from './pages/teacher/AttendanceMarking';
import GradeEntry from './pages/teacher/GradeEntry';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyAttendance from './pages/student/MyAttendance';
import MyGrades from './pages/student/MyGrades';
import MyFees from './pages/student/MyFees';
import DocumentDownload from './pages/student/DocumentDownload';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';

// Shared Pages
import NoticeBoard from './pages/shared/NoticeBoard';
import TimetableViewer from './pages/shared/TimetableViewer';
import LibraryCatalog from './pages/shared/LibraryCatalog';

const RootRedirect = () => {
  const { user, token } = useAuth();
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/${user.role}/dashboard`} replace />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Root Redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* Shared Routes */}
                <Route path="/notices" element={<NoticeBoard />} />
                <Route path="/timetable" element={<TimetableViewer />} />
                <Route path="/library" element={<LibraryCatalog />} />

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/students" element={<StudentManagement />} />
                  <Route path="/admin/fees" element={<FeeManagement />} />
                  <Route path="/admin/audit-logs" element={<AuditLogViewer />} />
                </Route>

                {/* Teacher Routes */}
                <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
                  <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                  <Route path="/teacher/students" element={<AssignedStudents />} />
                  <Route path="/teacher/attendance" element={<AttendanceMarking />} />
                  <Route path="/teacher/grades" element={<GradeEntry />} />
                </Route>

                {/* Student Routes */}
                <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/attendance" element={<MyAttendance />} />
                  <Route path="/student/grades" element={<MyGrades />} />
                  <Route path="/student/fees" element={<MyFees />} />
                  <Route path="/student/documents" element={<DocumentDownload />} />
                </Route>

                {/* Parent Routes */}
                <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
                  <Route path="/parent/dashboard" element={<ParentDashboard />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

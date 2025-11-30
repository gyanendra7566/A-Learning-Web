import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentLayout from './student/StudentLayout';
import StudentDashboard from './student/StudentDashboard';
import CourseCatalog from './student/CourseCatalog';
import MyCourses from './student/MyCourses';
import CoursePlayer from './student/CoursePlayer';
import Assignments from './student/Assignments';
import SubmitAssignment from './student/SubmitAssignment';
import MyCertificates from './student/MyCertificates';
import CertificateView from './student/CertificateView';

// Admin Pages
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import UsersManagement from './admin/UsersManagement';
import CourseManagement from './admin/CourseManagement';
import PaymentManagement from './admin/PaymentManagement';

// Public Pages
import VerifyCertificate from './pages/VerifyCertificate';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-certificate/:certificateId" element={<VerifyCertificate />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="catalog" element={<CourseCatalog />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="courses/:courseId" element={<CoursePlayer />} />
            <Route path="course/:courseId/assignments" element={<Assignments />} />
            <Route path="course/:courseId/assignment/:assignmentId" element={<SubmitAssignment />} />
            <Route path="certificates" element={<MyCertificates />} />
            <Route path="certificate/:certificateId" element={<CertificateView />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

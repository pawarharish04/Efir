import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import OfficerLogin from './pages/OfficerLogin';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AnonymousFIR from './pages/AnonymousFIR';

// Helper to determine the default landing path for a given role
export const getRoleDashboardPath = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'officer') return '/officer/dashboard';
  return '/citizen/dashboard';
};

// Root redirector: on app load/refresh or accessing '/', redirects to their role's dashboard if logged in
const RoleAwareRoot = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FAFAFA]">
        <div className="animate-spin h-6 w-6 border-2 border-gov-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return <Home />;
};

// Protected Route Guard with strict role access and redirection to the user's rightful dashboard or login
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FAFAFA]">
        <div className="animate-spin h-6 w-6 border-2 border-gov-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Not authenticated -> send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and user role is not permitted -> redirect to their authorized role dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return children;
};

// Public route that redirects to dashboard if already authenticated
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return children;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
              <Navbar />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<RoleAwareRoot />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                <Route path="/officer-login" element={<PublicOnlyRoute><OfficerLogin /></PublicOnlyRoute>} />
                <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
                <Route path="/anonymous-report" element={<AnonymousFIR />} />

                {/* Citizen Routes */}
                <Route
                  path="/citizen/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                      <CitizenDashboard />
                    </ProtectedRoute>
                  }
                />
                {/* Backwards-compatibility redirect */}
                <Route path="/citizen-dashboard" element={<Navigate to="/citizen/dashboard" replace />} />

                {/* Officer Routes */}
                <Route
                  path="/officer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['officer', 'admin']}>
                      <OfficerDashboard />
                    </ProtectedRoute>
                  }
                />
                {/* Backwards-compatibility redirect */}
                <Route path="/officer-dashboard" element={<Navigate to="/officer/dashboard" replace />} />

                {/* Analytics */}
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['officer', 'admin']}>
                      <AnalyticsDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                {/* Backwards-compatibility redirect */}
                <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster position="top-right" toastOptions={{ style: { fontSize: '13px', borderRadius: '4px' } }} />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
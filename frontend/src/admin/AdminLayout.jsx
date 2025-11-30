import { useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname.includes(path);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-600">
                  Admin Panel
                </h1>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/admin/dashboard"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/admin/dashboard')
                    ? 'bg-primary-100 text-primary-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/users"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/admin/users')
                    ? 'bg-primary-100 text-primary-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Users
              </Link>
              <Link
                to="/admin/courses"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/admin/courses')
                    ? 'bg-primary-100 text-primary-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Courses
              </Link>
              <Link
                to="/admin/payments"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/admin/payments')
                    ? 'bg-primary-100 text-primary-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Payments
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

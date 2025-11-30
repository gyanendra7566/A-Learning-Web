import { useState, useEffect } from 'react';
import api from '../utils/api';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/admin/users', { params });
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      console.error('Fetch users error:', error);
      setLoading(false);
    }
  };

  const handleBanUser = async (userId, currentBanStatus) => {
    const action = currentBanStatus ? 'unban' : 'ban';
    const confirmMessage = currentBanStatus
      ? 'Are you sure you want to unban this user?'
      : 'Are you sure you want to ban this user? They will not be able to access the platform.';

    if (!window.confirm(confirmMessage)) return;

    const reason = currentBanStatus
      ? ''
      : prompt('Enter ban reason (optional):') || 'Violated terms of service';

    try {
      setActionLoading(userId);
      await api.put(`/admin/users/${userId}/ban`, { reason });
      alert(`✅ User ${action}ned successfully!`);
      fetchUsers();
      setActionLoading(null);
    } catch (error) {
      console.error(`${action} user error:`, error);
      alert(`Failed to ${action} user`);
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('⚠️ Are you sure? This will permanently delete the user and all their data (enrollments, certificates, etc.). This action cannot be undone!')) {
      return;
    }

    try {
      setActionLoading(userId);
      await api.delete(`/admin/users/${userId}`);
      alert('✅ User deleted successfully!');
      fetchUsers();
      setActionLoading(null);
    } catch (error) {
      console.error('Delete user error:', error);
      alert('Failed to delete user');
      setActionLoading(null);
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Fetch user details error:', error);
      alert('Failed to load user details');
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'student' ? 'admin' : 'student';
    
    if (!window.confirm(`Change user role from ${currentRole} to ${newRole}?`)) {
      return;
    }

    try {
      setActionLoading(userId);
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      alert('✅ User role updated successfully!');
      fetchUsers();
      setActionLoading(null);
    } catch (error) {
      console.error('Change role error:', error);
      alert('Failed to change user role');
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          User Management
        </h1>
        <p className="text-gray-600">
          Manage all users, ban/unban accounts, and view user details
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Users
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="input-field"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-primary-50 border-primary-200">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-primary-600">{users.length}</p>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Students</p>
          <p className="text-3xl font-bold text-blue-600">
            {users.filter(u => u.role === 'student').length}
          </p>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Admins</p>
          <p className="text-3xl font-bold text-purple-600">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
        <div className="card bg-red-50 border-red-200">
          <p className="text-sm text-gray-600 mb-1">Banned</p>
          <p className="text-3xl font-bold text-red-600">
            {users.filter(u => u.isBanned).length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.role === 'student' ? (
                        <div>
                          <div>{user.enrollmentCount || 0} courses</div>
                          <div className="text-xs text-gray-500">
                            {user.certificateCount || 0} certificates
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        user.isBanned
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(user._id)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>

                        {user.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleBanUser(user._id, user.isBanned)}
                              disabled={actionLoading === user._id}
                              className={`${
                                user.isBanned
                                  ? 'text-green-600 hover:text-green-900'
                                  : 'text-orange-600 hover:text-orange-900'
                              } disabled:opacity-50`}
                              title={user.isBanned ? 'Unban User' : 'Ban User'}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleChangeRole(user._id, user.role)}
                              disabled={actionLoading === user._id}
                              className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                              title="Change Role"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={actionLoading === user._id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Delete User"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedUser.user.profilePicture}
                    alt={selectedUser.user.name}
                    className="w-20 h-20 rounded-full"
                  />
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedUser.user.name}</h4>
                    <p className="text-gray-600">{selectedUser.user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`badge ${
                        selectedUser.user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedUser.user.role}
                      </span>
                      <span className={`badge ${
                        selectedUser.user.isBanned
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {selectedUser.user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                {selectedUser.user.role === 'student' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="card bg-primary-50">
                      <p className="text-sm text-gray-600">Enrollments</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {selectedUser.enrollments.length}
                      </p>
                    </div>
                    <div className="card bg-green-50">
                      <p className="text-sm text-gray-600">Certificates</p>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedUser.certificates.length}
                      </p>
                    </div>
                    <div className="card bg-secondary-50">
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-secondary-600">
                        {selectedUser.enrollments.filter(e => e.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                )}

                {/* Account Details */}
                <div className="border-t pt-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Account Details</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Joined</p>
                      <p className="font-semibold">{new Date(selectedUser.user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">User ID</p>
                      <p className="font-mono text-xs">{selectedUser.user._id}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Enrollments */}
                {selectedUser.enrollments.length > 0 && (
                  <div className="border-t pt-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Recent Enrollments</h5>
                    <div className="space-y-2">
                      {selectedUser.enrollments.slice(0, 5).map(enrollment => (
                        <div key={enrollment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <img
                              src={enrollment.course.thumbnail}
                              alt={enrollment.course.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div>
                              <p className="font-semibold text-sm">{enrollment.course.title}</p>
                              <p className="text-xs text-gray-600">
                                {new Date(enrollment.enrolledAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`badge text-xs ${
                            enrollment.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {enrollment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;

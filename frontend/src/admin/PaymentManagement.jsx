import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FaDollarSign, FaFileInvoice, FaChartLine, FaTrophy, FaEye, FaTimes } from 'react-icons/fa';

const PaymentManagement = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageOrderValue: 0,
    topCourses: []
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('💰 Fetching payment data...');

      // Fetch all enrollments (admin endpoint)
      const enrollmentsRes = await api.get('/admin/enrollments');
      console.log('✅ Enrollments response:', enrollmentsRes.data);

      const allEnrollments = enrollmentsRes.data.data || enrollmentsRes.data.enrollments || [];
      console.log('📊 Total enrollments:', allEnrollments.length);

      // Filter by status if selected
      const filteredEnrollments = statusFilter
        ? allEnrollments.filter(e => e.status === statusFilter)
        : allEnrollments;

      setEnrollments(filteredEnrollments);

      // Calculate stats
      const paidEnrollments = allEnrollments.filter(e => 
        e.status === 'paid' || e.status === 'active' || e.status === 'completed'
      );

      const totalRevenue = paidEnrollments.reduce((sum, e) => sum + (e.amount || 0), 0);
      const totalTransactions = paidEnrollments.length;
      const averageOrderValue = totalTransactions > 0 
        ? Math.round(totalRevenue / totalTransactions) 
        : 0;

      // Calculate top courses
      const courseRevenue = {};
      paidEnrollments.forEach(enrollment => {
        const courseId = enrollment.course?._id || enrollment.course;
        const courseTitle = enrollment.course?.title || 'Unknown Course';
        const amount = enrollment.amount || 0;

        if (!courseRevenue[courseId]) {
          courseRevenue[courseId] = {
            _id: courseId,
            title: courseTitle,
            revenue: 0,
            enrollments: 0
          };
        }
        courseRevenue[courseId].revenue += amount;
        courseRevenue[courseId].enrollments += 1;
      });

      const topCourses = Object.values(courseRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setStats({
        totalRevenue,
        totalTransactions,
        averageOrderValue,
        topCourses
      });

      console.log('📊 Calculated stats:', {
        totalRevenue,
        totalTransactions,
        averageOrderValue,
        topCoursesCount: topCourses.length
      });

      setLoading(false);
    } catch (error) {
      console.error('❌ Fetch payments error:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      alert('Failed to fetch payment data: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const handleViewDetails = (enrollment) => {
    setSelectedTransaction(enrollment);
    setShowModal(true);
  };

  const filteredEnrollments = enrollments.filter(e => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    const studentName = e.student?.name?.toLowerCase() || '';
    const studentEmail = e.student?.email?.toLowerCase() || '';
    const courseTitle = e.course?.title?.toLowerCase() || '';
    
    return studentName.includes(searchLower) || 
           studentEmail.includes(searchLower) || 
           courseTitle.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Management</h1>
        <p className="text-gray-600">Track all transactions, revenue, and payment analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Revenue</p>
              <p className="text-4xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FaDollarSign className="text-3xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Transactions</p>
              <p className="text-4xl font-bold">{stats.totalTransactions}</p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FaFileInvoice className="text-3xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Average Order Value</p>
              <p className="text-4xl font-bold">₹{stats.averageOrderValue.toLocaleString()}</p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FaChartLine className="text-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Courses */}
      {stats.topCourses && stats.topCourses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FaTrophy className="mr-2 text-yellow-500" />
            Top Selling Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stats.topCourses.map((item, index) => (
              <div key={item._id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900 line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-600">{item.enrollments} enrollments</p>
                    <p className="text-xs text-green-600 font-bold">₹{item.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Transactions
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, email, or course..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map(enrollment => (
                  <tr key={enrollment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={enrollment.student?.profilePicture || `https://ui-avatars.com/api/?name=${enrollment.student?.name || 'User'}&background=6366f1&color=fff`}
                          alt={enrollment.student?.name || 'Student'}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {enrollment.student?.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {enrollment.student?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {enrollment.course?.thumbnail && (
                          <img
                            src={enrollment.course.thumbnail}
                            alt={enrollment.course?.title || 'Course'}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {enrollment.course?.title || 'Unknown Course'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        ₹{(enrollment.amount || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        enrollment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : enrollment.status === 'active' || enrollment.status === 'paid'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(enrollment.enrolledAt || enrollment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {enrollment.progress || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(enrollment)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FaEye className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Transaction Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Student Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Student Information</h4>
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedTransaction.student?.profilePicture || `https://ui-avatars.com/api/?name=${selectedTransaction.student?.name || 'User'}&background=6366f1&color=fff`}
                      alt={selectedTransaction.student?.name || 'Student'}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{selectedTransaction.student?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{selectedTransaction.student?.email || 'No email'}</p>
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Course Information</h4>
                  <div className="flex gap-4">
                    {selectedTransaction.course?.thumbnail && (
                      <img
                        src={selectedTransaction.course.thumbnail}
                        alt={selectedTransaction.course?.title || 'Course'}
                        className="w-24 h-24 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{selectedTransaction.course?.title || 'Unknown Course'}</p>
                      <p className="text-sm text-gray-600 mb-2">{selectedTransaction.course?.category || 'No category'}</p>
                      <p className="text-lg font-bold text-green-600">₹{(selectedTransaction.amount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Transaction Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedTransaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedTransaction.status}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Progress</p>
                      <p className="text-xl font-bold text-blue-600">{selectedTransaction.progress || 0}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Enrolled Date</p>
                      <p className="font-semibold">{new Date(selectedTransaction.enrolledAt || selectedTransaction.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                      <p className="text-xl font-bold text-green-600">₹{(selectedTransaction.amount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;

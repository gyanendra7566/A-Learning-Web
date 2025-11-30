import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { 
  FaBook, 
  FaCertificate, 
  FaTrophy, 
  FaClock,
  FaChartLine,
  FaGraduationCap,
  FaStar,
  FaPlay,
  FaFire,
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    certificates: 0,
    inProgress: 0,
    totalHours: 0,
    averageProgress: 0
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    console.log('🚀 Dashboard mounted, user:', user);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching dashboard data...');

      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);

      // Fetch enrolled courses
      try {
        console.log('📡 Calling /enrollments/my-enrollments...');
        const enrollmentsRes = await api.get('/enrollments/my-enrollments');
        console.log('✅ Enrollments response:', enrollmentsRes);
        
        const enrollments = enrollmentsRes.data.data || [];
        console.log('📚 Enrollments count:', enrollments.length);
        console.log('📚 Raw enrollments:', enrollments);
        
        const coursesData = enrollments.map(enrollment => {
          console.log('Processing enrollment:', enrollment);
          const courseData = enrollment.course;
          
          if (!courseData) {
            console.warn('⚠️ No course data for enrollment:', enrollment._id);
            return null;
          }

          return {
            _id: courseData._id || courseData,
            title: courseData.title || 'Unknown Course',
            description: courseData.description || '',
            category: courseData.category || 'General',
            price: courseData.price || 0,
            thumbnail: courseData.thumbnail || '',
            duration: courseData.duration || 0,
            instructor: courseData.instructor || null,
            enrollmentId: enrollment._id,
            progress: enrollment.progress || 0,
            enrolledAt: enrollment.enrolledAt,
            status: enrollment.status
          };
        }).filter(course => course !== null && course._id);

        console.log('✅ Processed courses:', coursesData);
        setEnrolledCourses(coursesData);

        // Calculate stats
        const totalProgress = coursesData.reduce((sum, c) => sum + (c.progress || 0), 0);
        const avgProgress = coursesData.length > 0 ? Math.round(totalProgress / coursesData.length) : 0;
        const completedCount = coursesData.filter(c => c.progress === 100).length;
        const inProgressCount = coursesData.filter(c => c.progress > 0 && c.progress < 100).length;
        const totalHours = coursesData.reduce((sum, c) => sum + (c.duration || 0), 0);

        const calculatedStats = {
          enrolledCourses: coursesData.length,
          completedCourses: completedCount,
          certificates: 0,
          inProgress: inProgressCount,
          totalHours: Math.round(totalHours),
          averageProgress: avgProgress
        };

        console.log('📊 Calculated stats:', calculatedStats);
        setStats(calculatedStats);

      } catch (enrollError) {
        console.error('❌ Enrollment fetch error:', enrollError);
        console.error('❌ Error response:', enrollError.response);
        console.error('❌ Error status:', enrollError.response?.status);
        console.error('❌ Error data:', enrollError.response?.data);
        
        if (enrollError.response?.status === 401) {
          console.error('🔒 Auth failed - redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Dashboard error:', error);
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleCourseClick = (courseId) => {
    console.log('🎯 Course clicked:', courseId);
    console.log('🎯 Current location:', window.location.pathname);
    console.log('🎯 Target path:', `/student/courses/${courseId}`);
    navigate(`/student/courses/${courseId}`);
    console.log('🎯 Navigation called');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-blue-100 text-lg">{user?.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FaBook className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stats.enrolledCourses}</h3>
            <p className="text-gray-600 text-sm font-medium">Enrolled Courses</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stats.completedCourses}</h3>
            <p className="text-gray-600 text-sm font-medium">Completed</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <FaCertificate className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stats.certificates}</h3>
            <p className="text-gray-600 text-sm font-medium">Certificates</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaChartLine className="text-white text-2xl" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stats.inProgress}</h3>
            <p className="text-gray-600 text-sm font-medium">In Progress</p>
          </div>

        </div>

        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <p className="text-sm font-mono text-yellow-900">
            <strong>Debug:</strong> Enrolled courses count: {enrolledCourses.length}
          </p>
          {enrolledCourses.length > 0 && (
            <p className="text-sm font-mono text-yellow-900 mt-2">
              First course: {enrolledCourses[0]?.title}
            </p>
          )}
        </div>

        {/* Continue Learning Section */}
        {enrolledCourses.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.slice(0, 4).map((course) => (
                <div
                  key={course._id}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => handleCourseClick(course._id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-2">{course.title}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {course.category}
                      </span>
                    </div>
                    <button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(course._id);
                      }}
                    >
                      <FaPlay />
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-bold text-blue-600">{course.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Enrolled Courses</h3>
            <p className="text-gray-600 mb-6">Start learning by enrolling in a course!</p>
            <Link
              to="/student/catalog"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700"
            >
              Browse Courses <FaArrowRight className="ml-2" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;

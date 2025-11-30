import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FaBook, FaPlay, FaCertificate, FaCheckCircle } from 'react-icons/fa';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      console.log('📚 Fetching my courses...');
      
      // Use enrollment endpoint
      const response = await api.get('/enrollments/my-enrollments');
      console.log('✅ Enrollments response:', response.data);
      
      const enrollments = response.data.data || [];
      
      // Process enrollments to get course data
      const coursesData = enrollments.map(enrollment => {
        const courseData = enrollment.course;
        
        if (!courseData) {
          console.warn('No course data for enrollment:', enrollment._id);
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
          instructor: courseData.instructor || { name: 'Unknown Instructor' },
          enrollmentId: enrollment._id,
          progress: enrollment.progress || 0,
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status
        };
      }).filter(course => course !== null && course._id);

      console.log('✅ Processed courses:', coursesData);
      setCourses(coursesData);
      setLoading(false);
    } catch (error) {
      console.error('❌ Fetch my courses error:', error);
      
      // Handle 401 - redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600 text-lg">
            You are enrolled in <span className="font-bold text-blue-600">{courses.length}</span> courses
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBook className="text-5xl text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No courses yet</h3>
            <p className="text-gray-600 mb-8 text-lg">Start your learning journey by enrolling in a course</p>
            <Link
              to="/student/catalog"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <FaBook className="mr-2" />
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map(course => (
              <div
                key={course._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="flex gap-4 p-6">
                  
                  {/* Course Thumbnail */}
                  <div className="flex-shrink-0">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-32 h-32 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <FaBook className="text-white text-4xl" />
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          by {course.instructor?.name || 'Unknown Instructor'}
                        </p>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          {course.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span className="font-semibold">Progress</span>
                        <span className="font-bold text-blue-600">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {course.progress === 100 ? (
                        <Link
                          to="/student/certificates"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
                        >
                          <FaCertificate className="text-lg" />
                          View Certificate
                        </Link>
                      ) : (
                        <Link
                          to={`/student/courses/${course._id}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                        >
                          <FaPlay className="text-sm" />
                          {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                        </Link>
                      )}
                    </div>

                    {/* Completion Badge */}
                    {course.progress === 100 && (
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          <FaCheckCircle />
                          Course Completed!
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;

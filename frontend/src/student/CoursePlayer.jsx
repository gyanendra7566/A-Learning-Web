import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import VideoPlayer from '../components/VideoPlayer';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/enrolled/${courseId}`);
      
      setCourse(response.data.course);
      setEnrollment(response.data.enrollment);
      
      if (!currentLesson) {
        const lastLessonId = response.data.enrollment.lastAccessedLesson;
        if (lastLessonId) {
          const lastLesson = response.data.course.lessons.find(
            l => l._id === lastLessonId
          );
          setCurrentLesson(lastLesson || response.data.course.lessons[0]);
        } else {
          setCurrentLesson(response.data.course.lessons[0]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Fetch course error:', error);
      if (error.response?.status === 403) {
        alert('You must be enrolled to access this course');
        navigate('/student/catalog');
      }
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProgressUpdate = () => {
    api.get(`/courses/enrolled/${courseId}`).then(response => {
      setEnrollment(response.data.enrollment);
      if (course) {
        const updatedLessons = course.lessons.map(lesson => {
          const updatedLesson = response.data.course.lessons.find(
            l => l._id === lesson._id
          );
          return updatedLesson || lesson;
        });
        setCourse({ ...course, lessons: updatedLessons });
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <button onClick={() => navigate('/student/my-courses')} className="btn-primary">
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/student/my-courses')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-600">by {course.instructor?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/student/course/${courseId}/assignments`)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Assignments
              </button>
              <div className="hidden md:block text-right">
                <p className="text-xs text-gray-500">Your Progress</p>
                <p className="text-lg font-bold text-primary-600">{enrollment.progress}%</p>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="btn-secondary text-sm lg:hidden"
              >
                {sidebarOpen ? '✕ Hide' : '☰ Show'} Lessons
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Player */}
          <div className={`${sidebarOpen ? 'lg:w-2/3' : 'w-full'}`}>
            <VideoPlayer
              lesson={currentLesson}
              courseId={courseId}
              onProgressUpdate={handleProgressUpdate}
            />
          </div>

          {/* Lessons Sidebar */}
          <div className={`${sidebarOpen ? 'w-full lg:w-1/3' : 'hidden'}`}>
            <div className="card sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Course Content</h3>
                <span className="text-sm text-gray-500">{course.lessons.length} lessons</span>
              </div>
              
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <button
                    key={lesson._id}
                    onClick={() => handleLessonSelect(lesson)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      currentLesson._id === lesson._id
                        ? 'bg-primary-50 border-2 border-primary-500 shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-500">
                            Lesson {lesson.order || index + 1}
                          </span>
                          {lesson.isCompleted && (
                            <span className="text-green-600 text-sm">✓</span>
                          )}
                          {lesson.isPreview && (
                            <span className="text-xs badge bg-blue-100 text-blue-700">Preview</span>
                          )}
                        </div>
                        <p className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-600">⏱️ {lesson.duration} min</p>
                      </div>
                      {currentLesson._id === lesson._id && (
                        <div className="ml-2 mt-1">
                          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Overall Progress */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-700">Overall Progress</span>
                    <span className="font-bold text-primary-600">{enrollment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center mt-2">
                  {enrollment.completedLessons?.length || 0} of {course.lessons.length} lessons completed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;

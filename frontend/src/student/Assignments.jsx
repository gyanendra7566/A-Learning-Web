import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import AssignmentCard from '../components/AssignmentCard';

const Assignments = () => {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, submitted, graded

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch course info
      const courseRes = await api.get(`/courses/enrolled/${courseId}`);
      setCourse(courseRes.data.course);
      
      // Fetch assignments
      const assignmentsRes = await api.get(`/assignments/course/${courseId}`);
      setAssignments(assignmentsRes.data.assignments);
      
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setLoading(false);
    }
  };

  const getFilteredAssignments = () => {
    if (filter === 'all') return assignments;
    
    if (filter === 'pending') {
      return assignments.filter(a => !a.submission);
    }
    
    if (filter === 'submitted') {
      return assignments.filter(a => a.submission && a.submission.status === 'pending');
    }
    
    if (filter === 'graded') {
      return assignments.filter(a => a.submission && a.submission.status === 'graded');
    }
    
    return assignments;
  };

  const filteredAssignments = getFilteredAssignments();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/student/course/${courseId}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-semibold mb-4 inline-block"
          >
            ← Back to Course
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Assignments
          </h1>
          <p className="text-gray-600">
            {course?.title}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <p className="text-sm opacity-90 mb-1">Total Assignments</p>
            <p className="text-3xl font-bold">{assignments.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <p className="text-sm opacity-90 mb-1">Pending</p>
            <p className="text-3xl font-bold">
              {assignments.filter(a => !a.submission).length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-sm opacity-90 mb-1">Submitted</p>
            <p className="text-3xl font-bold">
              {assignments.filter(a => a.submission && a.submission.status === 'pending').length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <p className="text-sm opacity-90 mb-1">Graded</p>
            <p className="text-3xl font-bold">
              {assignments.filter(a => a.submission && a.submission.status === 'graded').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({assignments.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'pending'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({assignments.filter(a => !a.submission).length})
            </button>
            <button
              onClick={() => setFilter('submitted')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'submitted'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Submitted ({assignments.filter(a => a.submission && a.submission.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('graded')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'graded'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Graded ({assignments.filter(a => a.submission && a.submission.status === 'graded').length})
            </button>
          </div>
        </div>

        {/* Assignments Grid */}
        {filteredAssignments.length === 0 ? (
          <div className="card text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No assignments found
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No assignments have been created yet'
                : `No ${filter} assignments`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map(assignment => (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
                courseId={courseId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;

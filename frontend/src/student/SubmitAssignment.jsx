import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const SubmitAssignment = () => {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/assignments/${assignmentId}`);
      setAssignment(response.data.assignment);
      
      if (response.data.submission) {
        setSubmission(response.data.submission);
        setContent(response.data.submission.content);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load assignment');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter your answer');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/submissions', {
        assignmentId: assignment._id,
        content
      });

      alert('✅ Assignment submitted successfully!');
      navigate(`/student/course/${courseId}/assignments`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit assignment');
      setSubmitting(false);
    }
  };

  const getDueStatus = () => {
    if (!assignment) return null;
    
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = now > dueDate;
    
    return { isOverdue, dueDate };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignment...</p>
        </div>
      </div>
    );
  }

  const dueStatus = getDueStatus();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/student/course/${courseId}/assignments`)}
            className="text-primary-600 hover:text-primary-700 text-sm font-semibold mb-4 inline-block"
          >
            ← Back to Assignments
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {assignment?.title}
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              📊 Max Score: {assignment?.maxScore} points
            </span>
            <span className={`badge ${dueStatus?.isOverdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              📅 Due: {new Date(assignment?.dueDate).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Assignment Details */}
        <div className="card mb-6">
          <h2 className="font-bold text-xl text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 mb-6 whitespace-pre-wrap">
            {assignment?.description}
          </p>

          <h2 className="font-bold text-xl text-gray-900 mb-4">Instructions</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {assignment?.instructions}
          </p>

          {assignment?.attachments && assignment.attachments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">📎 Reference Materials</h3>
              <ul className="space-y-2">
                {assignment.attachments.map((url, index) => (
                  <li key={index}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm hover:underline"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Submission Status */}
        {submission && (
          <div className={`card mb-6 ${
            submission.status === 'graded' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {submission.status === 'graded' ? '✅ Graded' : '📝 Submitted'}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Submitted on: {new Date(submission.submittedAt).toLocaleString()}
                </p>
                {submission.isLate && (
                  <span className="badge bg-red-100 text-red-700 text-xs">
                    Late Submission
                  </span>
                )}
              </div>
              {submission.status === 'graded' && (
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">
                    {submission.score}/{assignment.maxScore}
                  </p>
                  <p className="text-sm text-gray-600">points</p>
                </div>
              )}
            </div>

            {submission.status === 'graded' && submission.feedback && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                <h4 className="font-semibold text-gray-900 mb-2">Feedback:</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{submission.feedback}</p>
              </div>
            )}
          </div>
        )}

        {/* Submission Form */}
        {(!submission || submission.status !== 'graded') && (
          <div className="card">
            <h2 className="font-bold text-xl text-gray-900 mb-4">
              {submission ? 'Update Your Submission' : 'Submit Your Answer'}
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {dueStatus?.isOverdue && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
                ⚠️ This assignment is overdue. Your submission will be marked as late.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Answer *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="input-field min-h-[300px] font-mono text-sm"
                  placeholder="Write your answer here..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {content.length} characters
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/student/course/${courseId}/assignments`)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : submission ? 'Update Submission' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View Previous Submission */}
        {submission && (
          <div className="card mt-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Your Submission</h3>
            <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm">
              {submission.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitAssignment;

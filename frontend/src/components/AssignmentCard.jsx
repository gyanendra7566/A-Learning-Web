import { Link } from 'react-router-dom';

const AssignmentCard = ({ assignment, courseId }) => {
  const getDueStatus = () => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Overdue', color: 'red' };
    } else if (diffDays === 0) {
      return { text: 'Due Today', color: 'orange' };
    } else if (diffDays <= 3) {
      return { text: `Due in ${diffDays} days`, color: 'yellow' };
    } else {
      return { text: `Due in ${diffDays} days`, color: 'green' };
    }
  };

  const getStatusBadge = () => {
    if (!assignment.submission) {
      return <span className="badge bg-gray-200 text-gray-700">Not Submitted</span>;
    }

    if (assignment.submission.status === 'pending') {
      return <span className="badge bg-blue-100 text-blue-700">Submitted - Pending Review</span>;
    }

    if (assignment.submission.status === 'graded') {
      return (
        <span className="badge bg-green-100 text-green-700">
          Graded - {assignment.submission.score}/{assignment.maxScore}
        </span>
      );
    }

    return <span className="badge bg-yellow-100 text-yellow-700">Resubmit Required</span>;
  };

  const dueStatus = getDueStatus();

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            {assignment.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {assignment.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm">
          <span className={`badge bg-${dueStatus.color}-100 text-${dueStatus.color}-700`}>
            📅 {dueStatus.text}
          </span>
          <span className="text-gray-600">
            📊 {assignment.maxScore} points
          </span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="flex gap-2">
        <Link
          to={`/student/course/${courseId}/assignment/${assignment._id}`}
          className="btn-primary text-sm flex-1 text-center"
        >
          {assignment.submission ? 'View Submission' : 'Submit Assignment'}
        </Link>
      </div>
    </div>
  );
};

export default AssignmentCard;

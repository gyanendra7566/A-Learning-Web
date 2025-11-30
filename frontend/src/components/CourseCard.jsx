import { Link } from 'react-router-dom';

const CourseCard = ({ course, onEnroll }) => {
  return (
    <div className="card hover:shadow-xl transition-shadow duration-300">
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        {course.isPremium && (
          <span className="absolute top-2 right-2 badge bg-yellow-500 text-white">
            ⭐ Premium
          </span>
        )}
        <span className="absolute top-2 left-2 badge bg-primary-600 text-white">
          {course.level}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Category */}
        <span className="badge bg-secondary-100 text-secondary-700">
          {course.category}
        </span>

        {/* Title */}
        <h3 className="font-bold text-gray-900 line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center space-x-2">
          <img
            src={course.instructor?.profilePicture}
            alt={course.instructor?.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-xs text-gray-500">
            {course.instructor?.name}
          </span>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>⭐ {course.rating.toFixed(1)} ({course.totalReviews})</span>
          <span>👥 {course.enrolledStudents} students</span>
          <span>⏱️ {course.duration}h</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div>
            {course.price === 0 ? (
              <span className="text-2xl font-bold text-secondary-600">Free</span>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                ₹{course.price}
              </span>
            )}
          </div>
          <button
            onClick={() => onEnroll(course)}
            className="btn-primary text-sm"
          >
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

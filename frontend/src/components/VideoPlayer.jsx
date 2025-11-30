import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const VideoPlayer = ({ lesson, courseId, onProgressUpdate }) => {
  const [isCompleted, setIsCompleted] = useState(lesson.isCompleted || false);
  const progressInterval = useRef(null);
  const hasLoaded = useRef(false);

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(lesson.videoUrl);

  useEffect(() => {
    setIsCompleted(lesson.isCompleted || false);
    hasLoaded.current = false;
    
    // Auto-save progress every 30 seconds
    progressInterval.current = setInterval(() => {
      if (hasLoaded.current && !isCompleted) {
        saveProgress();
      }
    }, 30000);

    // Mark as loaded after 5 seconds
    const loadTimer = setTimeout(() => {
      hasLoaded.current = true;
    }, 5000);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      clearTimeout(loadTimer);
    };
  }, [lesson._id]);

  const saveProgress = async () => {
    try {
      await api.post('/progress/update', {
        courseId,
        lessonId: lesson._id,
        videoProgress: lesson.duration * 60,
        totalDuration: lesson.duration * 60
      });
      
      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (error) {
      console.error('Save progress error:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await api.post('/progress/complete', {
        courseId,
        lessonId: lesson._id
      });
      
      setIsCompleted(true);
      
      if (onProgressUpdate) {
        onProgressUpdate();
      }
      
      alert('✅ Lesson marked as complete!');
    } catch (error) {
      console.error('Complete lesson error:', error);
      alert('❌ Failed to mark lesson as complete');
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="relative bg-black rounded-lg overflow-hidden shadow-xl" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={lesson.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Lesson Info */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {lesson.title}
            </h2>
            <p className="text-gray-600 mb-4">
              {lesson.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {lesson.duration} minutes
              </span>
              {isCompleted && (
                <span className="badge bg-green-100 text-green-700">
                  ✅ Completed
                </span>
              )}
            </div>
          </div>
          
          {!isCompleted && (
            <button
              onClick={handleComplete}
              className="btn-primary whitespace-nowrap"
            >
              ✓ Mark Complete
            </button>
          )}
        </div>

        {/* Resources */}
        {lesson.resources && lesson.resources.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
              </svg>
              Resources
            </h3>
            <ul className="space-y-2">
              {lesson.resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm hover:underline"
                  >
                    📎 {resource}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;

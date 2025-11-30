import { useState, useEffect } from 'react';
import api from '../utils/api';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [actionLoading, setActionLoading] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    level: 'Beginner',
    price: '',
    thumbnail: '',
    whatYouWillLearn: [''],
    lessons: []
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses/admin/all');
      setCourses(response.data.courses);
      setLoading(false);
    } catch (error) {
      console.error('Fetch courses error:', error);
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('⚠️ Delete this course? All enrollments, certificates, and assignments will be permanently deleted. This cannot be undone!')) {
      return;
    }

    try {
      setActionLoading(courseId);
      await api.delete(`/courses/${courseId}`);
      alert('✅ Course deleted successfully!');
      fetchCourses();
      setActionLoading(null);
    } catch (error) {
      console.error('Delete course error:', error);
      alert('Failed to delete course');
      setActionLoading(null);
    }
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price,
      thumbnail: course.thumbnail,
      whatYouWillLearn: course.whatYouWillLearn || [''],
      lessons: course.lessons || []
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCreateCourse = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Web Development',
      level: 'Beginner',
      price: '',
      thumbnail: '',
      whatYouWillLearn: [''],
      lessons: []
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await api.post('/courses', formData);
        alert('✅ Course created successfully!');
      } else if (modalMode === 'edit') {
        await api.put(`/courses/${selectedCourse._id}`, formData);
        alert('✅ Course updated successfully!');
      }
      setShowModal(false);
      fetchCourses();
    } catch (error) {
      console.error('Submit course error:', error);
      alert(error.response?.data?.message || 'Failed to save course');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Lesson management functions
  const addLesson = () => {
    setFormData({
      ...formData,
      lessons: [
        ...formData.lessons,
        {
          title: '',
          description: '',
          videoUrl: '',
          duration: '',
          order: formData.lessons.length + 1,
          isPreview: false
        }
      ]
    });
  };

  const removeLesson = (index) => {
    const newLessons = formData.lessons.filter((_, i) => i !== index);
    // Reorder remaining lessons
    const reorderedLessons = newLessons.map((lesson, i) => ({
      ...lesson,
      order: i + 1
    }));
    setFormData({ ...formData, lessons: reorderedLessons });
  };

  const updateLesson = (index, field, value) => {
    const newLessons = [...formData.lessons];
    newLessons[index] = {
      ...newLessons[index],
      [field]: value
    };
    setFormData({ ...formData, lessons: newLessons });
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Course Management
          </h1>
          <p className="text-gray-600">
            Manage all courses, view stats, and edit course details
          </p>
        </div>
        <button
          onClick={handleCreateCourse}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Course
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses by title or category..."
          className="input-field"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-primary-50 border-primary-200">
          <p className="text-sm text-gray-600 mb-1">Total Courses</p>
          <p className="text-3xl font-bold text-primary-600">{courses.length}</p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <p className="text-sm text-gray-600 mb-1">Total Enrollments</p>
          <p className="text-3xl font-bold text-green-600">
            {courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0)}
          </p>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-3xl font-bold text-blue-600">
            {courses.reduce((sum, c) => sum + (c.completedCount || 0), 0)}
          </p>
        </div>
        <div className="card bg-orange-50 border-orange-200">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-orange-600">
            ₹{courses.reduce((sum, c) => sum + (c.revenue || 0), 0)}
          </p>
        </div>
      </div>

      {/* Courses Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lessons
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No courses found
                  </td>
                </tr>
              ) : (
                filteredCourses.map(course => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {course.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            by {course.instructor?.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge bg-blue-100 text-blue-700">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{course.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {course.enrollmentCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {course.completedCount || 0} completed
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ₹{course.revenue || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {course.lessons?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(course)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleEditCourse(course)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Course"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          disabled={actionLoading === course._id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete Course"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Modal (View/Edit/Create) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'create' ? 'Create New Course' : modalMode === 'edit' ? 'Edit Course' : 'Course Details'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {modalMode === 'view' && selectedCourse ? (
                <div className="space-y-4">
                  <img
                    src={selectedCourse.thumbnail}
                    alt={selectedCourse.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedCourse.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="card bg-primary-50">
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="text-2xl font-bold text-primary-600">₹{selectedCourse.price}</p>
                    </div>
                    <div className="card bg-green-50">
                      <p className="text-sm text-gray-600">Enrollments</p>
                      <p className="text-2xl font-bold text-green-600">{selectedCourse.enrollmentCount || 0}</p>
                    </div>
                    <div className="card bg-blue-50">
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-blue-600">{selectedCourse.completedCount || 0}</p>
                    </div>
                    <div className="card bg-orange-50">
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-orange-600">₹{selectedCourse.revenue || 0}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Lessons ({selectedCourse.lessons?.length || 0})</h4>
                    <div className="space-y-2">
                      {selectedCourse.lessons?.map((lesson, index) => (
                        <div key={lesson._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-semibold text-gray-500">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{lesson.title}</p>
                            <p className="text-xs text-gray-600">{lesson.duration} mins</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitCourse} className="space-y-6">
                  {/* Basic Course Info */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Course Information</h4>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Course Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="e.g., Complete Web Development Bootcamp"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="input-field"
                        rows="3"
                        placeholder="Describe what students will learn in this course..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="input-field"
                          required
                        >
                          <option value="Web Development">Web Development</option>
                          <option value="Mobile Development">Mobile Development</option>
                          <option value="Data Science">Data Science</option>
                          <option value="Design">Design</option>
                          <option value="Business">Business</option>
                          <option value="Marketing">Marketing</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Level *
                        </label>
                        <select
                          name="level"
                          value={formData.level}
                          onChange={handleInputChange}
                          className="input-field"
                          required
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="999"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Thumbnail URL *
                        </label>
                        <input
                          type="url"
                          name="thumbnail"
                          value={formData.thumbnail}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="https://example.com/image.jpg"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lessons Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Course Lessons ({formData.lessons.length})
                      </h4>
                      <button
                        type="button"
                        onClick={addLesson}
                        className="btn-secondary text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Lesson
                      </button>
                    </div>

                    {formData.lessons.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 mb-2">No lessons added yet</p>
                        <p className="text-sm text-gray-500">Click "Add Lesson" to create your first lesson</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.lessons.map((lesson, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-gray-50 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-gray-900">Lesson {index + 1}</h5>
                              <button
                                type="button"
                                onClick={() => removeLesson(index)}
                                className="text-red-600 hover:text-red-800"
                                title="Remove Lesson"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Lesson Title *
                              </label>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => updateLesson(index, 'title', e.target.value)}
                                className="input-field text-sm"
                                placeholder="e.g., Introduction to HTML"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Description
                              </label>
                              <textarea
                                value={lesson.description}
                                onChange={(e) => updateLesson(index, 'description', e.target.value)}
                                className="input-field text-sm"
                                rows="2"
                                placeholder="Brief description of what this lesson covers..."
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  YouTube Video URL *
                                </label>
                                <input
                                  type="url"
                                  value={lesson.videoUrl}
                                  onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                                  className="input-field text-sm"
                                  placeholder="https://www.youtube.com/watch?v=..."
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Duration (minutes) *
                                </label>
                                <input
                                  type="number"
                                  value={lesson.duration}
                                  onChange={(e) => updateLesson(index, 'duration', e.target.value)}
                                  className="input-field text-sm"
                                  placeholder="30"
                                  min="1"
                                  required
                                />
                              </div>
                            </div>

                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`preview-${index}`}
                                checked={lesson.isPreview}
                                onChange={(e) => updateLesson(index, 'isPreview', e.target.checked)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <label htmlFor={`preview-${index}`} className="ml-2 text-sm text-gray-700">
                                Allow preview (free access to this lesson)
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                    <button type="submit" className="btn-primary flex-1">
                      {modalMode === 'create' ? '✅ Create Course' : '💾 Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;

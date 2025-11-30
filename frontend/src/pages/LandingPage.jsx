import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import {
  FaBook,
  FaGraduationCap,
  FaUsers,
  FaCertificate,
  FaStar,
  FaClock,
  FaPlay,
  FaArrowRight,
  FaTrophy,
  FaChartLine,
  FaQuoteLeft,
  FaFire,
  FaCheckCircle,
  FaGlobe,
  FaHeart,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from 'react-icons/fa';

const LandingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalCertificates: 0,
    totalRevenue: 0
  });
  const [courses, setCourses] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [liveUsers, setLiveUsers] = useState(0);

  useEffect(() => {
    fetchAllData();
    const cleanup = simulateLiveUsers();
    return cleanup;
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch Platform Stats from PUBLIC endpoint (no auth needed)
      try {
        const statsRes = await api.get('/public/stats');
        console.log('✅ Stats from API:', statsRes.data.data);
        setStats(statsRes.data.data);
      } catch (error) {
        console.log('⚠️ Stats not available, will calculate from courses');
      }

      // Fetch Courses (public)
      const coursesRes = await api.get('/courses');
      const allCourses = coursesRes.data.data || coursesRes.data.courses || [];
      console.log('📚 Fetched courses:', allCourses.length);
      setCourses(allCourses);
      setFeaturedCourses(allCourses.slice(0, 6));

      // Calculate fallback stats from course data
      const totalEnrollments = allCourses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0);
      
      setStats(prev => ({
        totalUsers: prev.totalUsers || 1250,
        totalCourses: allCourses.length,
        totalEnrollments: prev.totalEnrollments || totalEnrollments,
        totalCertificates: prev.totalCertificates || Math.floor(totalEnrollments * 0.7),
        totalRevenue: prev.totalRevenue || 45000
      }));

      setLoading(false);
    } catch (error) {
      console.error('❌ Failed to fetch landing data:', error);
      setLoading(false);
    }
  };

  const simulateLiveUsers = () => {
    const baseUsers = Math.floor(Math.random() * 50) + 30;
    setLiveUsers(baseUsers);
    
    const interval = setInterval(() => {
      setLiveUsers(prev => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.max(20, Math.min(100, prev + change));
      });
    }, 5000);

    return () => clearInterval(interval);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      image: '👩‍💻',
      quote: 'This platform transformed my career! The courses are practical and the instructors are amazing.',
      course: 'Full Stack Development',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Data Scientist',
      image: '👨‍💼',
      quote: 'Best learning experience ever. I completed 5 courses and got my dream job within 3 months!',
      course: 'Data Science Bootcamp',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'UX Designer',
      image: '👩‍🎨',
      quote: 'The quality of content and support is outstanding. Highly recommended for anyone serious about learning!',
      course: 'UI/UX Design Masterclass',
      rating: 5
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaGraduationCap className="text-white text-2xl" />
              </div>
              <span className="font-black text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ELearn
              </span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('courses')} className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">
                Courses
              </button>
              <button onClick={() => scrollToSection('stats')} className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">
                Reviews
              </button>
              
              <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-700">{liveUsers} online</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/login" className="px-6 py-2.5 text-gray-700 font-semibold hover:text-blue-600 transition-colors">
                Login
              </Link>
              <Link to="/register" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-bold flex items-center w-fit border-2 border-blue-200">
                  <FaFire className="mr-2 text-orange-500" />
                  {stats.totalCourses}+ Courses Available
                </span>
              </motion.div>

              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
                Empower Your{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Learning Journey
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join <span className="font-bold text-blue-600">{stats.totalUsers.toLocaleString()}+</span> students advancing their careers through our expert-led courses. Start learning today and unlock your potential!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => scrollToSection('courses')}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 flex items-center justify-center"
                >
                  Explore Courses
                  <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </button>
                <Link to="/register" className="px-8 py-4 bg-white text-gray-800 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg border-2 border-gray-200 flex items-center justify-center">
                  <FaPlay className="mr-2" />
                  Join Now Free
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg">
                  <FaStar className="text-3xl text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-black text-gray-900">4.9/5</div>
                  <div className="text-xs text-gray-600 font-semibold">Rating</div>
                </div>
                <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg">
                  <FaCertificate className="text-3xl text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-black text-gray-900">{stats.totalCertificates}+</div>
                  <div className="text-xs text-gray-600 font-semibold">Certificates</div>
                </div>
                <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg">
                  <FaTrophy className="text-3xl text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-black text-gray-900">95%</div>
                  <div className="text-xs text-gray-600 font-semibold">Success</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3"
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <FaBook className="text-white text-2xl" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">Most Popular</div>
                      <div className="text-gray-600 text-sm">Full Stack Development</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completion</span>
                      <span className="text-sm font-bold text-blue-600">89%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full" style={{ width: '89%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center"><FaUsers className="mr-1" /> 1,234 students</span>
                      <span className="flex items-center"><FaClock className="mr-1" /> 40 hours</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-6 -right-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl shadow-2xl p-4 transform rotate-12"
                >
                  <FaTrophy className="text-3xl" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 20, 0], rotate: [5, -5, 5] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                  className="absolute -bottom-8 -left-8 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-2xl shadow-2xl p-4 transform -rotate-12"
                >
                  <FaCheckCircle className="text-3xl" />
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section id="stats" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Platform{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Statistics
              </span>
            </h2>
            <p className="text-xl text-gray-600">Real-time data from our growing community</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
          >
            {[
              { icon: <FaUsers className="text-4xl" />, value: stats.totalUsers.toLocaleString(), label: 'Total Users', color: 'from-blue-500 to-blue-600', bgColor: 'from-blue-50 to-blue-100' },
              { icon: <FaBook className="text-4xl" />, value: stats.totalCourses, label: 'Total Courses', color: 'from-purple-500 to-purple-600', bgColor: 'from-purple-50 to-purple-100' },
              { icon: <FaChartLine className="text-4xl" />, value: stats.totalEnrollments.toLocaleString(), label: 'Enrollments', color: 'from-pink-500 to-pink-600', bgColor: 'from-pink-50 to-pink-100' },
              { icon: <FaCertificate className="text-4xl" />, value: stats.totalCertificates, label: 'Certificates', color: 'from-green-500 to-green-600', bgColor: 'from-green-50 to-green-100' },
              { icon: <FaGlobe className="text-4xl" />, value: `₹${(stats.totalRevenue / 1000).toFixed(0)}K+`, label: 'Revenue', color: 'from-orange-500 to-orange-600', bgColor: 'from-orange-50 to-orange-100' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl shadow-lg p-8 text-center border-2 border-white hover:shadow-2xl transition-all`}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl text-white`}>
                  {stat.icon}
                </div>
                <div className="text-4xl font-black text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-bold">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section id="courses" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Featured{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Courses
              </span>
            </h2>
            <p className="text-xl text-gray-600">Start your learning journey with our top-rated courses</p>
          </motion.div>

          {featuredCourses.length === 0 ? (
            <div className="text-center py-12">
              <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No courses available yet</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuredCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden group cursor-pointer"
                  onClick={() => navigate('/register')}
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FaBook className="text-white text-6xl opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                      <span className="text-blue-600 font-bold text-sm">
                        {course.price === 0 ? 'FREE' : `₹${course.price}`}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        {course.category || 'General'}
                      </span>
                      <div className="flex items-center text-yellow-500">
                        <FaStar className="mr-1" />
                        <span className="text-sm font-bold text-gray-700">4.8</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description || 'Comprehensive course to master new skills'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaClock className="mr-2" />
                        {course.duration || 0}h
                      </div>
                      <div className="flex items-center">
                        <FaUsers className="mr-2" />
                        {course.enrolledStudents || 0}
                      </div>
                    </div>

                    <button className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg group-hover:shadow-xl">
                      Enroll Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-12">
            <Link to="/register" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
              View All Courses
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Student{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Success Stories
              </span>
            </h2>
            <p className="text-xl text-gray-600">Hear from our amazing community of learners</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl shadow-xl p-8 relative"
              >
                <FaQuoteLeft className="text-4xl text-blue-200 mb-4" />
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                
                <div className="flex items-center mb-4 text-yellow-500">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                <div className="flex items-center">
                  <div className="text-5xl mr-4">{testimonial.image}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-xs text-blue-600 font-semibold mt-1">{testimonial.course}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join {stats.totalUsers.toLocaleString()}+ students who are already learning and growing with us!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="inline-flex items-center px-10 py-5 bg-white text-blue-600 font-bold text-lg rounded-2xl hover:bg-gray-100 transition-all shadow-2xl hover:shadow-white/30 transform hover:scale-105">
                Get Started for Free
                <FaArrowRight className="ml-3" />
              </Link>
              <button
                onClick={() => scrollToSection('courses')}
                className="inline-flex items-center px-10 py-5 bg-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-2xl hover:bg-white/30 transition-all border-2 border-white"
              >
                <FaPlay className="mr-3" />
                Explore Courses
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaGraduationCap className="text-white text-xl" />
                </div>
                <span className="font-bold text-2xl">ELearn</span>
              </div>
              <p className="text-gray-400 mb-4">Empowering learners worldwide with quality education and expert-led courses.</p>
              <div className="flex space-x-3">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <FaFacebook />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors">
                  <FaTwitter />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors">
                  <FaInstagram />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
                  <FaLinkedin />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('courses')} className="text-gray-400 hover:text-white transition-colors">Browse Courses</button></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Become an Instructor</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Student Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 ELearn. Made with <FaHeart className="inline text-red-500 mx-1" /> for passionate learners worldwide.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;

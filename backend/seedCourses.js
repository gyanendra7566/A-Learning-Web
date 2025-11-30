const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const User = require('./models/User');

dotenv.config();

const sampleCourses = [
  {
    title: 'Complete Web Development Bootcamp',
    description: 'Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB from scratch. Build real-world projects and become a full-stack developer.',
    category: 'Programming',
    level: 'Beginner',
    price: 2999,
    isPremium: true,
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop',
    duration: 40,
    rating: 4.8,
    totalReviews: 1250,
    syllabus: [
      'HTML5 & CSS3 Fundamentals',
      'JavaScript ES6+',
      'React.js & Redux',
      'Node.js & Express',
      'MongoDB & Mongoose',
      'Building Full-Stack Apps'
    ],
    tags: ['web development', 'javascript', 'react', 'nodejs'],
    lessons: [
      {
        title: 'Introduction to Web Development',
        description: 'Overview of web development and course structure',
        videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
        duration: 15,
        order: 1,
        isPreview: true
      },
      {
        title: 'HTML Basics',
        description: 'Learn HTML tags and structure',
        videoUrl: 'https://www.youtube.com/watch?v=qz0aGYrrlhU',
        duration: 30,
        order: 2,
        isPreview: true
      },
      {
        title: 'CSS Styling',
        description: 'Style your web pages with CSS',
        videoUrl: 'https://www.youtube.com/watch?v=1PnVor36_40',
        duration: 45,
        order: 3
      }
    ]
  },
  {
    title: 'Python for Data Science',
    description: 'Master Python programming and data analysis with Pandas, NumPy, and Matplotlib. Perfect for aspiring data scientists.',
    category: 'Data Science',
    level: 'Intermediate',
    price: 3499,
    isPremium: true,
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=225&fit=crop',
    duration: 35,
    rating: 4.7,
    totalReviews: 890,
    syllabus: [
      'Python Fundamentals',
      'NumPy for Numerical Computing',
      'Pandas for Data Analysis',
      'Data Visualization with Matplotlib',
      'Machine Learning Basics'
    ],
    tags: ['python', 'data science', 'pandas', 'machine learning'],
    lessons: [
      {
        title: 'Python Installation & Setup',
        description: 'Get started with Python',
        videoUrl: 'https://www.youtube.com/watch?v=YYXdXT2l-Gg',
        duration: 20,
        order: 1,
        isPreview: true
      }
    ]
  },
  {
    title: 'UI/UX Design Masterclass',
    description: 'Learn user interface and user experience design principles. Master Figma and create stunning designs.',
    category: 'Design',
    level: 'Beginner',
    price: 1999,
    isPremium: true,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop',
    duration: 25,
    rating: 4.9,
    totalReviews: 650,
    syllabus: [
      'Design Principles',
      'Color Theory',
      'Typography',
      'Figma Basics',
      'Prototyping',
      'User Research'
    ],
    tags: ['design', 'ui', 'ux', 'figma'],
    lessons: [
      {
        title: 'Introduction to UI/UX',
        description: 'What is UI/UX design?',
        videoUrl: 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU',
        duration: 25,
        order: 1,
        isPreview: true
      }
    ]
  },
  {
    title: 'Digital Marketing Complete Course',
    description: 'Master SEO, social media marketing, email marketing, and Google Ads. Grow your business online.',
    category: 'Marketing',
    level: 'Beginner',
    price: 2499,
    isPremium: true,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
    duration: 30,
    rating: 4.6,
    totalReviews: 420,
    syllabus: [
      'Marketing Fundamentals',
      'SEO Basics',
      'Social Media Strategy',
      'Content Marketing',
      'Google Ads',
      'Analytics & Tracking'
    ],
    tags: ['marketing', 'seo', 'social media', 'advertising'],
    lessons: [
      {
        title: 'Digital Marketing Overview',
        description: 'Introduction to digital marketing channels',
        videoUrl: 'https://www.youtube.com/watch?v=nU-IIXBWlS4',
        duration: 18,
        order: 1,
        isPreview: true
      }
    ]
  },
  {
    title: 'JavaScript ES6+ Modern Development',
    description: 'Deep dive into modern JavaScript. Learn ES6+ features, async programming, and best practices.',
    category: 'Programming',
    level: 'Intermediate',
    price: 1499,
    isPremium: true,
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=225&fit=crop',
    duration: 20,
    rating: 4.8,
    totalReviews: 780,
    syllabus: [
      'Arrow Functions',
      'Destructuring',
      'Promises & Async/Await',
      'ES6 Modules',
      'Classes',
      'Advanced Array Methods'
    ],
    tags: ['javascript', 'es6', 'programming'],
    lessons: [
      {
        title: 'Modern JavaScript Introduction',
        description: 'What is ES6+?',
        videoUrl: 'https://www.youtube.com/watch?v=NCwa_xi0Uuc',
        duration: 22,
        order: 1,
        isPreview: true
      }
    ]
  },
  {
    title: 'FREE - Introduction to Programming',
    description: 'Start your programming journey with this free course. Learn basic concepts and problem-solving.',
    category: 'Programming',
    level: 'Beginner',
    price: 0,
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=225&fit=crop',
    duration: 10,
    rating: 4.5,
    totalReviews: 2100,
    syllabus: [
      'What is Programming?',
      'Variables and Data Types',
      'Control Flow',
      'Functions',
      'Problem Solving'
    ],
    tags: ['programming', 'basics', 'free'],
    lessons: [
      {
        title: 'What is Programming?',
        description: 'Introduction to programming concepts',
        videoUrl: 'https://www.youtube.com/watch?v=zOjov-2OZ0E',
        duration: 15,
        order: 1,
        isPreview: true
      }
    ]
  },
  {
    title: 'Business Strategy & Management',
    description: 'Learn strategic planning, leadership, and business management fundamentals.',
    category: 'Business',
    level: 'Advanced',
    price: 3999,
    isPremium: true,
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=225&fit=crop',
    duration: 28,
    rating: 4.7,
    totalReviews: 310,
    syllabus: [
      'Strategic Planning',
      'Leadership Skills',
      'Financial Management',
      'Operations Management',
      'Marketing Strategy',
      'Human Resources'
    ],
    tags: ['business', 'management', 'strategy', 'leadership'],
    lessons: [
      {
        title: 'Introduction to Business Strategy',
        description: 'Overview of strategic management',
        videoUrl: 'https://www.youtube.com/watch?v=YLHBkej50ko',
        duration: 20,
        order: 1,
        isPreview: true
      }
    ]
  },
  {
    title: 'Mobile App Development with React Native',
    description: 'Build iOS and Android apps using React Native. One codebase for both platforms.',
    category: 'Programming',
    level: 'Advanced',
    price: 3499,
    isPremium: true,
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=225&fit=crop',
    duration: 32,
    rating: 4.6,
    totalReviews: 540,
    syllabus: [
      'React Native Setup',
      'Components & Styling',
      'Navigation',
      'State Management',
      'APIs & Data',
      'Deployment'
    ],
    tags: ['react native', 'mobile', 'ios', 'android'],
    lessons: [
      {
        title: 'React Native Introduction',
        description: 'Getting started with mobile development',
        videoUrl: 'https://www.youtube.com/watch?v=0-S5a0eXPoc',
        duration: 25,
        order: 1,
        isPreview: true
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Find an admin or create one
    let admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('⚠️ No admin found. Creating default admin...');
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@elearning.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin created');
    }

    // Delete existing courses
    await Course.deleteMany({});
    console.log('🗑️ Cleared existing courses');

    // Add instructor ID to all courses
    const coursesWithInstructor = sampleCourses.map(course => ({
      ...course,
      instructor: admin._id
    }));

    // Insert sample courses
    const courses = await Course.insertMany(coursesWithInstructor);
    console.log(`✅ Created ${courses.length} sample courses`);

    console.log('\n📚 Sample Courses:');
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} - ₹${course.price} (${course.level})`);
    });

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

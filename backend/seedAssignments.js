const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Assignment = require('./models/Assignment');
const Course = require('./models/Course');
const User = require('./models/User');

dotenv.config();

const sampleAssignments = [
  {
    courseTitle: 'Complete Web Development Bootcamp',
    assignments: [
      {
        title: 'Build a Personal Portfolio Website',
        description: 'Create a responsive portfolio website using HTML, CSS, and JavaScript to showcase your projects and skills.',
        instructions: `Requirements:
1. Create at least 4 pages: Home, About, Projects, Contact
2. Make it fully responsive (mobile, tablet, desktop)
3. Use modern CSS (Flexbox or Grid)
4. Add smooth scrolling and animations
5. Include a contact form with validation
6. Deploy to Netlify or Vercel

Submission:
- Submit the live URL
- Include GitHub repository link
- Write a brief description of challenges faced`,
        maxScore: 100,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        attachments: [
          'https://www.w3schools.com/css/css_rwd_intro.asp',
          'https://css-tricks.com/snippets/css/a-guide-to-flexbox/'
        ]
      },
      {
        title: 'JavaScript Array Methods Practice',
        description: 'Solve 10 JavaScript problems using array methods like map, filter, reduce, and forEach.',
        instructions: `Complete the following tasks:

1. Filter an array of numbers to get only even numbers
2. Map an array of names to uppercase
3. Reduce an array of prices to get the total sum
4. Find the first person older than 30 in an array of objects
5. Sort an array of products by price (low to high)
6. Remove duplicate values from an array
7. Group people by age range (0-18, 19-35, 36+)
8. Chain multiple array methods to get specific results
9. Create a custom array method using prototype
10. Performance comparison: for loop vs array methods

Submit your solutions with explanations.`,
        maxScore: 50,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        title: 'React Todo App with CRUD Operations',
        description: 'Build a fully functional Todo application using React hooks with add, edit, delete, and mark as complete features.',
        instructions: `Build a React Todo App with the following features:

Features Required:
- Add new todos
- Edit existing todos
- Delete todos
- Mark todos as complete/incomplete
- Filter: All, Active, Completed
- Local storage persistence
- Clean, modern UI design

Technical Requirements:
- Use React Hooks (useState, useEffect)
- Component-based architecture
- Props and state management
- CSS modules or styled-components
- Responsive design

Bonus Points:
- Add due dates to todos
- Priority levels (High, Medium, Low)
- Search functionality
- Dark mode toggle

Submission:
Include GitHub repo link and live demo URL.`,
        maxScore: 150,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      }
    ]
  },
  {
    courseTitle: 'Python for Data Science',
    assignments: [
      {
        title: 'Data Analysis with Pandas',
        description: 'Analyze a real-world dataset using Pandas and create visualizations with Matplotlib.',
        instructions: `Assignment Tasks:

1. Load the provided CSV dataset (Sales Data)
2. Clean the data (handle missing values, duplicates)
3. Perform exploratory data analysis (EDA)
4. Answer the following questions:
   - What are the top 5 best-selling products?
   - Which month had the highest sales?
   - What is the average order value?
   - Sales trend over time
5. Create at least 5 visualizations:
   - Bar chart of top products
   - Line chart of monthly sales
   - Pie chart of category distribution
   - Histogram of order values
   - Correlation heatmap

Deliverables:
- Jupyter Notebook (.ipynb file)
- Written analysis report (PDF)
- All visualizations saved as images`,
        maxScore: 100,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        attachments: [
          'https://pandas.pydata.org/docs/',
          'https://matplotlib.org/stable/tutorials/index.html'
        ]
      },
      {
        title: 'Machine Learning Model Training',
        description: 'Train a classification model to predict customer churn using scikit-learn.',
        instructions: `Project Requirements:

Dataset: Customer Churn Dataset (will be provided)

Tasks:
1. Data Preprocessing
   - Handle missing values
   - Encode categorical variables
   - Feature scaling
   - Train-test split (80-20)

2. Model Training
   - Train at least 3 different models:
     * Logistic Regression
     * Decision Tree
     * Random Forest
   - Use cross-validation

3. Model Evaluation
   - Calculate accuracy, precision, recall, F1-score
   - Create confusion matrix
   - Compare models and choose the best one

4. Feature Importance
   - Identify which features are most important
   - Visualize feature importance

Submission Format:
- Python script or Jupyter Notebook
- Model comparison report
- Recommendations for business`,
        maxScore: 150,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      }
    ]
  },
  {
    courseTitle: 'UI/UX Design Masterclass',
    assignments: [
      {
        title: 'Mobile App Wireframe Design',
        description: 'Create low-fidelity wireframes for a food delivery mobile app using Figma.',
        instructions: `Design Brief:
Create wireframes for a food delivery app called "QuickBite"

Required Screens:
1. Splash Screen
2. Login/Signup
3. Home Screen (Restaurant listings)
4. Restaurant Detail Page
5. Menu Items List
6. Cart Screen
7. Checkout Process (2-3 screens)
8. Order Tracking
9. User Profile

Design Requirements:
- Use proper grid system
- Maintain consistency in spacing and sizing
- Include navigation flow
- Add annotations for interactions
- Use placeholder content
- Mobile-first approach (375x812px)

Deliverables:
- Figma file link (with view access)
- PDF export of all screens
- Brief explanation of design decisions (300 words)`,
        maxScore: 100,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        attachments: [
          'https://www.figma.com/resources/learn-design/',
          'https://material.io/design'
        ]
      },
      {
        title: 'User Research & Persona Creation',
        description: 'Conduct user research and create detailed user personas for an e-learning platform.',
        instructions: `Assignment Overview:
Research users for an online learning platform targeting working professionals.

Tasks:

1. User Research (Choose 2 methods):
   - Conduct 5+ user interviews
   - Create and distribute surveys (min 20 responses)
   - Competitive analysis of 3 platforms
   - User behavior analysis

2. Create 3 User Personas including:
   - Name, age, occupation, photo
   - Goals and motivations
   - Pain points and frustrations
   - Technology proficiency
   - Daily routine/schedule
   - Quote that represents them

3. Journey Map
   - Create a user journey map for ONE persona
   - Include touchpoints, emotions, pain points
   - Identify opportunities for improvement

Deliverables:
- Research findings report (2-3 pages)
- 3 detailed persona documents
- 1 user journey map
- Present in PDF or Figma format`,
        maxScore: 120,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      }
    ]
  },
  {
    courseTitle: 'Digital Marketing Complete Course',
    assignments: [
      {
        title: 'SEO Audit & Strategy Report',
        description: 'Perform a comprehensive SEO audit of a website and create an optimization strategy.',
        instructions: `Assignment Brief:
Choose any small business website or create a fictional one.

Part 1: SEO Audit
- Technical SEO analysis
- On-page SEO review
- Keyword research (at least 20 keywords)
- Competitor analysis (3 competitors)
- Backlink profile analysis
- Page speed analysis

Part 2: Strategy Document
- Identify top 10 issues
- Prioritized action plan
- Keyword targeting strategy
- Content recommendations
- Link building strategy
- Expected timeline and results

Tools to Use:
- Google Search Console
- Google Analytics
- Ubersuggest or SEMrush (free trial)
- PageSpeed Insights
- Mobile-Friendly Test

Deliverable:
Professional SEO audit report (8-10 pages) in PDF format`,
        maxScore: 100,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      }
    ]
  },
  {
    courseTitle: 'FREE - Introduction to Programming',
    assignments: [
      {
        title: 'Basic Programming Concepts Quiz',
        description: 'Answer conceptual questions about programming fundamentals.',
        instructions: `Answer the following questions:

1. What is a variable? Explain with an example.
2. What is the difference between a for loop and a while loop?
3. What are functions and why are they useful?
4. Explain the concept of data types with examples.
5. What is the difference between '==' and '===' in programming?
6. Write pseudocode for a program that calculates the average of 5 numbers.
7. What is debugging? Mention 3 common debugging techniques.
8. Explain what an array is and when to use it.
9. What is the purpose of comments in code?
10. Describe the problem-solving approach in programming.

Word Count: 100-150 words per answer

Format: Submit as a text document or PDF`,
        maxScore: 50,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    ]
  }
];

const seedAssignments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin found. Please create an admin user first.');
      process.exit(1);
    }

    // Delete existing assignments
    await Assignment.deleteMany({});
    console.log('🗑️ Cleared existing assignments');

    let totalCreated = 0;

    // Create assignments for each course
    for (const courseData of sampleAssignments) {
      const course = await Course.findOne({ title: courseData.courseTitle });
      
      if (!course) {
        console.log(`⚠️ Course not found: ${courseData.courseTitle}`);
        continue;
      }

      console.log(`\n📚 Creating assignments for: ${course.title}`);

      for (const assignmentData of courseData.assignments) {
        const assignment = await Assignment.create({
          course: course._id,
          createdBy: admin._id,
          ...assignmentData
        });
        
        console.log(`  ✓ ${assignment.title}`);
        totalCreated++;
      }
    }

    console.log(`\n✅ Successfully created ${totalCreated} assignments!`);
    console.log('\n📊 Assignment Summary:');
    
    const courses = await Course.find();
    for (const course of courses) {
      const count = await Assignment.countDocuments({ course: course._id });
      if (count > 0) {
        console.log(`  ${course.title}: ${count} assignments`);
      }
    }

    console.log('\n🎉 Database seeded with assignments!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding assignments:', error);
    process.exit(1);
  }
};

seedAssignments();

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
if (!process.env.FIREBASE_PROJECT_ID) {
  console.error('❌ FIREBASE_PROJECT_ID not found in environment variables');
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();

// Initial data
const domains = [
  {
    name: 'Frontend',
    description: 'User interface and user experience development',
  },
  {
    name: 'Backend',
    description: 'Server-side development and API design',
  },
  {
    name: 'DevOps',
    description: 'Infrastructure, deployment, and operational excellence',
  },
  {
    name: 'Mobile',
    description: 'iOS and Android application development',
  },
  {
    name: 'Data Engineering',
    description: 'Data pipelines, analytics, and machine learning infrastructure',
  },
  {
    name: 'QA Engineering',
    description: 'Quality assurance, testing automation, and release management',
  },
];

const genericSkills = [
  {
    name: 'Problem Solving',
    description: 'Ability to analyze complex problems and develop effective solutions',
    category: 'generic',
    applicableLevels: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: 'Communication',
    description: 'Clear written and verbal communication with team members and stakeholders',
    category: 'generic',
    applicableLevels: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: 'Code Quality',
    description: 'Writing clean, maintainable, and well-documented code',
    category: 'generic',
    applicableLevels: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: 'Testing',
    description: 'Writing and maintaining automated tests',
    category: 'generic',
    applicableLevels: [2, 3, 4, 5, 6, 7],
  },
  {
    name: 'Code Review',
    description: 'Providing constructive feedback on code changes',
    category: 'generic',
    applicableLevels: [2, 3, 4, 5, 6, 7],
  },
  {
    name: 'Documentation',
    description: 'Creating and maintaining technical documentation',
    category: 'generic',
    applicableLevels: [2, 3, 4, 5, 6, 7],
  },
  {
    name: 'System Design',
    description: 'Designing scalable and maintainable software architectures',
    category: 'generic',
    applicableLevels: [4, 5, 6, 7],
  },
  {
    name: 'Mentoring',
    description: 'Guiding and developing junior team members',
    category: 'generic',
    applicableLevels: [3, 4, 5, 6, 7],
  },
  {
    name: 'Technical Leadership',
    description: 'Leading technical decisions and driving architectural changes',
    category: 'generic',
    applicableLevels: [5, 6, 7],
  },
  {
    name: 'Strategic Thinking',
    description: 'Understanding business impact and long-term technical strategy',
    category: 'generic',
    applicableLevels: [6, 7],
  },
];

const domainSkills = {
  frontend: [
    {
      name: 'HTML/CSS',
      description: 'Proficiency in semantic HTML and modern CSS',
      category: 'domain',
      domain: 'frontend',
      applicableLevels: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      name: 'JavaScript',
      description: 'Deep understanding of JavaScript fundamentals and ES6+ features',
      category: 'domain',
      domain: 'frontend',
      applicableLevels: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      name: 'React/Vue.js',
      description: 'Proficiency in modern frontend frameworks',
      category: 'domain',
      domain: 'frontend',
      applicableLevels: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      name: 'State Management',
      description: 'Managing application state with Redux, Zustand, or similar',
      category: 'domain',
      domain: 'frontend',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Performance Optimization',
      description: 'Frontend performance analysis and optimization techniques',
      category: 'domain',
      domain: 'frontend',
      applicableLevels: [3, 4, 5, 6, 7],
    },
    {
      name: 'Accessibility',
      description: 'Building accessible web applications following WCAG guidelines',
      category: 'domain',
      domain: 'frontend',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Build Tools',
      description: 'Webpack, Vite, or similar build tool configuration',
      category: 'domain',
      domain: 'frontend',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
  ],
  backend: [
    {
      name: 'Programming Language',
      description: 'Proficiency in Python, Java, Go, or similar backend language',
      category: 'domain',
      domain: 'backend',
      applicableLevels: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      name: 'API Design',
      description: 'Designing RESTful APIs and GraphQL schemas',
      category: 'domain',
      domain: 'backend',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Database Design',
      description: 'Relational and NoSQL database design and optimization',
      category: 'domain',
      domain: 'backend',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Authentication & Authorization',
      description: 'Implementing secure authentication and authorization systems',
      category: 'domain',
      domain: 'backend',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Microservices',
      description: 'Designing and implementing microservice architectures',
      category: 'domain',
      domain: 'backend',
      applicableLevels: [4, 5, 6, 7],
    },
    {
      name: 'Message Queues',
      description: 'Working with message brokers like RabbitMQ, Kafka, or Redis',
      category: 'domain',
      domain: 'backend',
      applicableLevels: [3, 4, 5, 6, 7],
    },
    {
      name: 'Caching Strategies',
      description: 'Implementing effective caching at various levels',
      category: 'domain',
      domain: 'backend',
      applicableLevels: [3, 4, 5, 6, 7],
    },
  ],
  devops: [
    {
      name: 'Linux Administration',
      description: 'Proficiency in Linux system administration and shell scripting',
      category: 'domain',
      domain: 'devops',
      applicableLevels: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Containerization',
      description: 'Docker and container orchestration with Kubernetes',
      category: 'domain',
      domain: 'devops',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
    {
      name: 'CI/CD Pipelines',
      description: 'Building and maintaining continuous integration and deployment pipelines',
      category: 'domain',
      domain: 'devops',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Cloud Platforms',
      description: 'AWS, GCP, or Azure infrastructure and services',
      category: 'domain',
      domain: 'devops',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Infrastructure as Code',
      description: 'Terraform, CloudFormation, or similar IaC tools',
      category: 'domain',
      domain: 'devops',
      applicableLevels: [3, 4, 5, 6, 7],
    },
    {
      name: 'Monitoring & Observability',
      description: 'Setting up monitoring, logging, and alerting systems',
      category: 'domain',
      domain: 'devops',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Security Best Practices',
      description: 'Implementing security measures and compliance requirements',
      category: 'domain',
      domain: 'devops',
      applicableLevels: [3, 4, 5, 6, 7],
    },
  ],
  mobile: [
    {
      name: 'iOS Development',
      description: 'Swift and iOS app development with UIKit or SwiftUI',
      category: 'domain',
      domain: 'mobile',
      applicableLevels: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Android Development',
      description: 'Kotlin/Java and Android app development',
      category: 'domain',
      domain: 'mobile',
      applicableLevels: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Cross-Platform Development',
      description: 'React Native, Flutter, or similar cross-platform frameworks',
      category: 'domain',
      domain: 'mobile',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Mobile UI/UX',
      description: 'Designing intuitive mobile user interfaces',
      category: 'domain',
      domain: 'mobile',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
    {
      name: 'App Store Deployment',
      description: 'Publishing and maintaining apps on App Store and Google Play',
      category: 'domain',
      domain: 'mobile',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
  ],
  'data-engineering': [
    {
      name: 'Data Modeling',
      description: 'Designing data models and schemas for analytics',
      category: 'domain',
      domain: 'data-engineering',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
    {
      name: 'ETL/ELT Pipelines',
      description: 'Building data pipelines for extraction, transformation, and loading',
      category: 'domain',
      domain: 'data-engineering',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Big Data Technologies',
      description: 'Hadoop, Spark, or similar big data processing frameworks',
      category: 'domain',
      domain: 'data-engineering',
      applicableLevels: [3, 4, 5, 6, 7],
    },
    {
      name: 'Data Warehousing',
      description: 'Designing and maintaining data warehouses',
      category: 'domain',
      domain: 'data-engineering',
      applicableLevels: [3, 4, 5, 6, 7],
    },
    {
      name: 'Machine Learning Infrastructure',
      description: 'Building infrastructure for ML model training and deployment',
      category: 'domain',
      domain: 'data-engineering',
      applicableLevels: [4, 5, 6, 7],
    },
  ],
  'qa-engineering': [
    {
      name: 'Manual Testing',
      description: 'Comprehensive manual testing strategies and techniques',
      category: 'domain',
      domain: 'qa-engineering',
      applicableLevels: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Test Automation',
      description: 'Building automated test suites for web and mobile applications',
      category: 'domain',
      domain: 'qa-engineering',
      applicableLevels: [2, 3, 4, 5, 6, 7],
    },
    {
      name: 'Performance Testing',
      description: 'Load testing and performance analysis of applications',
      category: 'domain',
      domain: 'qa-engineering',
      applicableLevels: [3, 4, 5, 6, 7],
    },
    {
      name: 'Security Testing',
      description: 'Identifying security vulnerabilities in applications',
      category: 'domain',
      domain: 'qa-engineering',
      applicableLevels: [3, 4, 5, 6, 7],
    },
    {
      name: 'Test Strategy',
      description: 'Developing comprehensive testing strategies for complex systems',
      category: 'domain',
      domain: 'qa-engineering',
      applicableLevels: [4, 5, 6, 7],
    },
  ],
};

// Sample team-specific skills (these will be created by team leaders)
const sampleTeamSkills = [
  {
    name: 'Next.js Framework',
    description: 'Proficiency in Next.js for full-stack React applications',
    category: 'team',
    teamId: 'sample-team-id', // This will be replaced with actual team ID
    applicableLevels: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    name: 'Firebase Integration',
    description: 'Working with Firebase services (Auth, Firestore, Functions)',
    category: 'team',
    teamId: 'sample-team-id',
    applicableLevels: [2, 3, 4, 5, 6, 7],
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Seed Domains
    console.log('📋 Creating domains...');
    const domainRefs = [];
    for (const domain of domains) {
      const docRef = await db.collection('domains').add({
        ...domain,
        createdAt: new Date(),
      });
      domainRefs.push({ id: docRef.id, ...domain });
      console.log(`  ✅ Created domain: ${domain.name}`);
    }

    // 2. Seed Generic Skills
    console.log('\n🔧 Creating generic skills...');
    const genericSkillRefs = [];
    for (const skill of genericSkills) {
      const docRef = await db.collection('skills').add({
        ...skill,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      genericSkillRefs.push({ id: docRef.id, ...skill });
      console.log(`  ✅ Created skill: ${skill.name}`);
    }

    // 3. Seed Domain-Specific Skills
    console.log('\n🎯 Creating domain-specific skills...');
    const domainSkillRefs = {};
    
    for (const [domainKey, skills] of Object.entries(domainSkills)) {
      domainSkillRefs[domainKey] = [];
      console.log(`  📁 Creating skills for ${domainKey} domain:`);
      
      for (const skill of skills) {
        const docRef = await db.collection('skills').add({
          ...skill,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        domainSkillRefs[domainKey].push({ id: docRef.id, ...skill });
        console.log(`    ✅ Created skill: ${skill.name}`);
      }
    }

    // 4. Create a sample team (you'll need to update this with actual user IDs)
    console.log('\n👥 Creating sample team structure...');
    console.log('  ⚠️  Note: You\'ll need to update team leader and member IDs after user registration');
    
    const sampleTeam = {
      name: 'Sample Development Team',
      leaderId: 'PLACEHOLDER_LEADER_ID', // Update this after user registration
      domains: ['frontend', 'backend', 'devops'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const teamRef = await db.collection('teams').add(sampleTeam);
    console.log(`  ✅ Created team: ${sampleTeam.name} (ID: ${teamRef.id})`);

    // 5. Create sample ladder configuration
    console.log('\n📊 Creating sample ladder configuration...');
    
    const ladderConfig = {
      teamId: teamRef.id,
      domain: 'frontend', // Example for frontend domain
      skillsByLevel: {
        1: {
          genericSkills: genericSkillRefs.slice(0, 3).map(s => s.id), // First 3 generic skills
          domainSkills: domainSkillRefs.frontend.slice(0, 2).map(s => s.id), // First 2 frontend skills
          teamSkills: [], // Will be added by team leader
        },
        2: {
          genericSkills: genericSkillRefs.slice(0, 5).map(s => s.id), // First 5 generic skills
          domainSkills: domainSkillRefs.frontend.slice(0, 4).map(s => s.id), // First 4 frontend skills
          teamSkills: [], // Will be added by team leader
        },
        3: {
          genericSkills: genericSkillRefs.slice(0, 7).map(s => s.id), // First 7 generic skills
          domainSkills: domainSkillRefs.frontend.slice(0, 6).map(s => s.id), // First 6 frontend skills
          teamSkills: [], // Will be added by team leader
        },
        4: {
          genericSkills: genericSkillRefs.slice(0, 8).map(s => s.id), // First 8 generic skills
          domainSkills: domainSkillRefs.frontend.map(s => s.id), // All frontend skills
          teamSkills: [], // Will be added by team leader
        },
        5: {
          genericSkills: genericSkillRefs.slice(0, 9).map(s => s.id), // First 9 generic skills
          domainSkills: domainSkillRefs.frontend.map(s => s.id), // All frontend skills
          teamSkills: [], // Will be added by team leader
        },
        6: {
          genericSkills: genericSkillRefs.map(s => s.id), // All generic skills
          domainSkills: domainSkillRefs.frontend.map(s => s.id), // All frontend skills
          teamSkills: [], // Will be added by team leader
        },
        7: {
          genericSkills: genericSkillRefs.map(s => s.id), // All generic skills
          domainSkills: domainSkillRefs.frontend.map(s => s.id), // All frontend skills
          teamSkills: [], // Will be added by team leader
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.collection('ladderConfigs').add(ladderConfig);
    console.log(`  ✅ Created ladder configuration for ${ladderConfig.domain} domain`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Register your first user with Google OAuth');
    console.log('  2. Promote that user to admin in Firebase Console (see README)');
    console.log('  3. Update the sample team with actual user IDs');
    console.log('  4. Create additional teams and ladder configurations as needed');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase(); 
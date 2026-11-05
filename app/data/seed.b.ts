import { Job, CandidateProfile, Application, Interview } from '../types';

// Mock candidate resumes for Abdul Wahab's features
export const mockCandidates: CandidateProfile[] = [
  {
    id: 'cand-001',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 9876543210',
    location: 'Bangalore, India',
    summary: 'Senior Full Stack Developer with 6 years of experience in React, Node.js, and cloud technologies.',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'Redis'],
    experienceYears: 6,
    education: 'B.Tech in Computer Science, IIT Bangalore (2018)',
    projects: [
      {
        id: 'proj-001',
        name: 'E-commerce Platform',
        description: 'Built a scalable e-commerce platform handling 100K+ daily users',
        techStack: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
        relevanceScore: 85,
      },
      {
        id: 'proj-002',
        name: 'Real-time Analytics Dashboard',
        description: 'Developed real-time data visualization dashboard using WebSocket',
        techStack: ['React', 'D3.js', 'WebSocket', 'Redis'],
        relevanceScore: 70,
      },
    ],
    rawResumeText: 'Priya Sharma - Senior Full Stack Developer\n\nSummary: Experienced developer with 6 years...',
    excerpts: {
      React: 'Led frontend architecture for e-commerce platform serving 100K+ users',
      Node.js: 'Designed RESTful APIs handling 5000+ requests per minute',
      AWS: 'Deployed microservices on AWS EC2 with Auto Scaling',
    },
    createdAt: new Date('2025-01-15').toISOString(),
  },
  {
    id: 'cand-002',
    name: 'Rahul Verma',
    email: 'rahul.verma@email.com',
    phone: '+91 8765432109',
    location: 'Pune, India',
    summary: 'Backend Engineer specializing in distributed systems and database optimization.',
    skills: ['Python', 'Django', 'PostgreSQL', 'MongoDB', 'Kubernetes', 'GCP', 'GraphQL'],
    experienceYears: 4,
    education: 'M.Tech in Software Engineering, IIIT Delhi (2021)',
    projects: [
      {
        id: 'proj-003',
        name: 'Microservices Architecture',
        description: 'Refactored monolith to microservices improving scalability by 300%',
        techStack: ['Python', 'Kubernetes', 'GCP', 'GraphQL'],
        relevanceScore: 90,
      },
    ],
    rawResumeText: 'Rahul Verma - Backend Engineer\n\nSpecialized in backend systems...',
    excerpts: {
      Python: 'Built high-performance API services using Django REST Framework',
      PostgreSQL: 'Optimized complex queries reducing response time by 60%',
      Kubernetes: 'Managed container orchestration across 50+ pods',
    },
    createdAt: new Date('2025-01-18').toISOString(),
  },
  {
    id: 'cand-003',
    name: 'Anjali Patel',
    email: 'anjali.patel@email.com',
    phone: '+91 7654321098',
    location: 'Ahmedabad, India',
    summary: 'Frontend Specialist with expertise in modern JavaScript frameworks and UI/UX design.',
    skills: ['React', 'Vue.js', 'TypeScript', 'TailwindCSS', 'Figma', 'Jest', 'Storybook'],
    experienceYears: 5,
    education: 'B.E. in Information Technology, Gujarat University (2019)',
    projects: [
      {
        id: 'proj-004',
        name: 'Design System Library',
        description: 'Created company-wide design system used by 20+ teams',
        techStack: ['React', 'Storybook', 'TailwindCSS'],
        relevanceScore: 95,
      },
    ],
    rawResumeText: 'Anjali Patel - Frontend Specialist\n\nPassionate about building beautiful user interfaces...',
    excerpts: {
      React: 'Architected reusable component library adopted enterprise-wide',
      TypeScript: 'Implemented strict type checking improving code quality significantly',
      Figma: 'Collaborated with UX designers to implement pixel-perfect designs',
    },
    createdAt: new Date('2025-01-20').toISOString(),
  },
];

// Mock interviews for Abdul Wahab's features
export const mockInterviews: Interview[] = [
  {
    id: 'interview-001',
    applicationId: 'app-001',
    candidateId: 'cand-001',
    candidateName: 'Priya Sharma',
    jobId: 'job-001',
    jobTitle: 'Senior Full Stack Developer',
    scheduledDate: '2025-02-15',
    scheduledTime: '14:00',
    durationMinutes: 60,
    interviewer: 'Zaid Ahmed',
    interviewType: 'Technical',
    status: 'scheduled',
    questions: [
      {
        id: 'q-001',
        text: 'Explain how you would optimize database queries for a high-traffic e-commerce platform.',
        difficulty: 'advanced',
        category: 'Database Performance',
        expectedAnswerGuidelines: 'Discussion of indexing, query optimization, caching strategies (Redis), read replicas, and horizontal scaling',
        projectContext: 'Refer to Priya\'s e-commerce project where she handled 100K+ daily users',
      },
      {
        id: 'q-002',
        text: 'Describe your approach to state management in large-scale React applications.',
        difficulty: 'intermediate',
        category: 'Frontend Architecture',
        expectedAnswerGuidelines: 'Comparison of Context API, Redux, Zustand; when to use each; avoiding over-engineering',
      },
      {
        id: 'q-003',
        text: 'How do you ensure security in Node.js applications?',
        difficulty: 'intermediate',
        category: 'Security',
        expectedAnswerGuidelines: 'Input validation, authentication (JWT/OAuth), rate limiting, SQL injection prevention, XSS protection',
      },
    ],
    feedback: undefined,
  },
  {
    id: 'interview-002',
    applicationId: 'app-002',
    candidateId: 'cand-002',
    candidateName: 'Rahul Verma',
    jobId: 'job-002',
    jobTitle: 'Backend Engineer',
    scheduledDate: '2025-02-18',
    scheduledTime: '10:30',
    durationMinutes: 45,
    interviewer: 'Zaid Ahmed',
    interviewType: 'System Design',
    status: 'scheduled',
    questions: [
      {
        id: 'q-004',
        text: 'Design a real-time notification system that needs to handle 1M+ concurrent connections.',
        difficulty: 'advanced',
        category: 'System Architecture',
        expectedAnswerGuidelines: 'WebSocket vs SSE discussion, load balancing, connection pooling, message queuing (RabbitMQ/Kafka), horizontal scaling strategy',
        projectContext: 'Build upon Rahul\'s microservices experience',
      },
      {
        id: 'q-005',
        text: 'How would you implement eventual consistency in a distributed database?',
        difficulty: 'advanced',
        category: 'Distributed Systems',
        expectedAnswerGuidelines: 'CAP theorem trade-offs, conflict resolution strategies, vector clocks, CRDTs',
      },
    ],
    feedback: undefined,
  },
];

// Export all seed data
export const recruitmentSeedData = {
  candidates: mockCandidates,
  interviews: mockInterviews,
};

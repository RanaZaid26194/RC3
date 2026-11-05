import { registerSeed } from '@/lib/storage';
import type { CandidateProfile, Interview } from '@/types';

export const SEED_CANDIDATES: CandidateProfile[] = [
  {
    id: 'cand_1',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    summary: 'Senior Backend Engineer with 4.5+ years experience designing robust RESTful APIs in Python and Django. Passionate about scalable database design and containerization.',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Redis', 'REST APIs', 'Git', 'Linux'],
    experienceYears: 4.5,
    education: 'B.S. in Computer Science, University of California, Berkeley (2020)',
    projects: [
      {
        id: 'proj_1',
        name: 'Distributed Cloud Storage Gateway',
        description: 'Engineered Python/Django REST API processing 10k requests/sec with Redis caching and PostgreSQL partitioning. Fully containerized with Docker.',
        techStack: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Redis'],
        relevanceScore: 95,
      },
      {
        id: 'proj_2',
        name: 'Asynchronous Background Task Worker',
        description: 'Implemented Celery worker queues with Docker orchestration to process asynchronous customer notifications.',
        techStack: ['Python', 'Docker', 'Celery', 'PostgreSQL'],
        relevanceScore: 88,
      },
    ],
    excerpts: {
      Python: 'Architected and built backend services in Python 3.11 with Django REST framework.',
      Django: 'Built 12+ enterprise endpoints in Django ORM with caching layers.',
      PostgreSQL: 'Tuned complex PostgreSQL queries and maintained schema migrations for 500k DAU.',
      Docker: 'Containerized microservices using Docker and docker-compose for multi-environment deployments.',
    },
    rawResumeText: `ALEX RIVERA
Email: alex.rivera@example.com | Phone: +1 (555) 234-5678 | San Francisco, CA

SUMMARY
Senior Backend Engineer with 4.5+ years experience designing robust RESTful APIs in Python and Django. Passionate about scalable database design and containerization.

EXPERIENCE
Senior Backend Developer - Nexus Tech (2022 - Present)
- Architected and built backend services in Python 3.11 with Django REST framework.
- Built 12+ enterprise endpoints in Django ORM with caching layers.
- Tuned complex PostgreSQL queries and maintained schema migrations for 500k DAU.
- Containerized microservices using Docker and docker-compose for multi-environment deployments.

PROJECTS
- Distributed Cloud Storage Gateway: Engineered Python/Django REST API with Redis caching and PostgreSQL.
- Asynchronous Background Task Worker: Implemented Celery worker queues with Docker orchestration.

EDUCATION
B.S. in Computer Science, UC Berkeley (2020)`,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'cand_2',
    name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    phone: '+1 (555) 876-5432',
    location: 'Austin, TX',
    summary: 'Full Stack & Data Developer with 3 years experience. Skilled in Python, Flask, FastAPI, PostgreSQL, and JavaScript.',
    skills: ['Python', 'FastAPI', 'Flask', 'PostgreSQL', 'JavaScript', 'HTML/CSS', 'SQL'],
    experienceYears: 3,
    education: 'B.S. in Software Engineering, UT Austin (2021)',
    projects: [
      {
        id: 'proj_3',
        name: 'Financial Ledger Microservice',
        description: 'Built financial reporting API in Python and FastAPI backed by PostgreSQL relational database.',
        techStack: ['Python', 'FastAPI', 'PostgreSQL'],
        relevanceScore: 78,
      },
    ],
    excerpts: {
      Python: 'Developed Python data analysis scripts and backend utilities.',
      PostgreSQL: 'Wrote relational SQL queries on Postgres databases.',
    },
    rawResumeText: `MARCUS CHEN
Austin, TX | marcus.chen@example.com

SUMMARY
Full Stack & Data Developer with 3 years experience. Skilled in Python, Flask, FastAPI, PostgreSQL, and JavaScript.

EXPERIENCE
Software Engineer - DataFlow Systems (2021 - Present)
- Developed Python data analysis scripts and backend utilities.
- Wrote relational SQL queries on Postgres databases.

EDUCATION
B.S. in Software Engineering, UT Austin (2021)`,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'cand_3',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+1 (555) 432-1098',
    location: 'Seattle, WA',
    summary: 'Junior Software Engineer eager to build cloud services. Experienced with Python, basic algorithms, and Git.',
    skills: ['Python', 'Git', 'Data Structures', 'C++', 'Linux'],
    experienceYears: 1,
    education: 'B.S. in Computer Science, University of Washington (2023)',
    projects: [
      {
        id: 'proj_4',
        name: 'Campus Event Portal',
        description: 'Built event registration backend with Python and SQLite.',
        techStack: ['Python', 'SQLite'],
        relevanceScore: 60,
      },
    ],
    excerpts: {
      Python: 'Academic and internship projects using Python and basic REST APIs.',
    },
    rawResumeText: `PRIYA SHARMA
Seattle, WA | priya.sharma@example.com

SUMMARY
Junior Software Engineer eager to build cloud services. Experienced with Python, basic algorithms, and Git.

EDUCATION
B.S. in Computer Science, University of Washington (2023)`,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const SEED_INTERVIEWS: Interview[] = [
  {
    id: 'int_101',
    applicationId: 'app_cand_1',
    candidateId: 'cand_1',
    candidateName: 'Alex Rivera',
    jobId: 'job_backend_101',
    jobTitle: 'Senior Backend Developer',
    scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    scheduledTime: '14:00',
    durationMinutes: 45,
    interviewer: 'David Vance (Principal Architect)',
    interviewType: 'Technical',
    status: 'scheduled',
    questions: [
      {
        id: 'q_1',
        text: 'How do you optimize Django ORM queries when facing N+1 database select queries in high-traffic endpoints?',
        difficulty: 'intermediate',
        category: 'Django & Database',
        expectedAnswerGuidelines: 'Candidate should discuss select_related (for single-valued relationships), prefetch_related (for multi-valued relationships), and annotate with subqueries.',
        projectContext: 'Relevant to candidate experience in tuning complex PostgreSQL queries.',
      },
      {
        id: 'q_2',
        text: 'Walk us through how you would architect a multi-stage Docker build to keep Python production image size minimal and secure.',
        difficulty: 'advanced',
        category: 'Docker & DevOps',
        expectedAnswerGuidelines: 'Candidate should highlight builder stage with gcc/dev headers, compiling wheels, and copying only runtime wheels to a slim base image running as non-root user.',
        projectContext: 'Relevant to candidate Distributed Cloud Storage Gateway containerization project.',
      },
    ],
  },
];

registerSeed('candidates', SEED_CANDIDATES);
registerSeed('interviews', SEED_INTERVIEWS);

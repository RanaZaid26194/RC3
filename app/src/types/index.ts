export type UserRole = 'recruiter' | 'candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface SkillRequirement {
  skill: string;
  weight: number; // 1 to 5 (e.g. 5 = critical, 1 = nice to have)
  required: boolean;
  category?: 'backend' | 'frontend' | 'database' | 'devops' | 'soft-skills' | 'general';
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid';
  salary: string;
  description: string;
  status: 'open' | 'closed';
  requiredSkills: SkillRequirement[];
  preferredSkills: string[];
  minExperienceYears: number;
  qualification: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedProject {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  relevanceScore?: number;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experienceYears: number;
  education: string;
  projects: ParsedProject[];
  rawResumeText?: string;
  excerpts?: Record<string, string>; // skill -> quote from resume
  createdAt: string;
}

export type PipelineStatus =
  | 'Submitted'
  | 'Parsed'
  | 'AI Assessment Available'
  | 'Recruiter Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Selected'
  | 'Rejected';

export interface AuditLogEntry {
  id: string;
  applicationId: string;
  fromStatus: PipelineStatus;
  toStatus: PipelineStatus;
  changedBy: string;
  timestamp: string;
  note?: string;
}

export interface ApplicationNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface SkillEvidence {
  skill: string;
  normalizedSkill: string;
  evidence: string; // excerpt from resume
  confidence: number; // 0 to 1
  isExplicit: boolean;
}

export interface MatchScoreBreakdown {
  skillsScore: number;       // weight: 50%
  experienceScore: number;   // weight: 25%
  projectScore: number;      // weight: 15%
  qualificationScore: number;// weight: 10%
  totalScore: number;        // 0 - 100
  matchedSkills: SkillEvidence[];
  missingSkills: string[];    // skill needed, not verified
  confirmedAbsentSkills: string[];
  suggestedLearning: string[];
  biasCheckPassed: boolean;
  explanations: string[];
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  status: PipelineStatus;
  appliedAt: string;
  updatedAt: string;
  matchScore?: number;
  scoreBreakdown?: MatchScoreBreakdown;
  notes: ApplicationNote[];
  auditTrail: AuditLogEntry[];
  recruiterOverrideScore?: number;
  recruiterOverrideReason?: string;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  expectedAnswerGuidelines: string;
  projectContext?: string;
}

export interface InterviewFeedback {
  rating: number; // 1-5
  technicalRating: number; // 1-5
  communicationRating: number; // 1-5
  comments: string;
  decision: 'Hire' | 'No Hire' | 'Strong Hire' | 'Borderline';
  submittedAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  durationMinutes: number;
  interviewer: string;
  interviewType: 'Technical' | 'Behavioral' | 'System Design' | 'Cultural Fit';
  status: 'scheduled' | 'completed' | 'cancelled';
  questions: InterviewQuestion[];
  feedback?: InterviewFeedback;
}

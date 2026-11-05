import {
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  Sparkles,
  UserCheck,
  FolderKanban,
  FileText,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: ('recruiter' | 'candidate')[];
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/jobs',
    label: 'Job Openings',
    icon: Briefcase,
    roles: ['recruiter'],
  },
  {
    to: '/pipeline',
    label: 'Pipeline & Matching',
    icon: FolderKanban,
    roles: ['recruiter'],
  },
  {
    to: '/candidates',
    label: 'Candidate Review',
    icon: Users,
    roles: ['recruiter'],
  },
  {
    to: '/interviews',
    label: 'Interviews & Questions',
    icon: Calendar,
    roles: ['recruiter'],
  },
  {
    to: '/analytics',
    label: 'Talent Analytics',
    icon: BarChart3,
    roles: ['recruiter'],
  },
  {
    to: '/resumes',
    label: 'Resume Intake',
    icon: FileText,
    roles: ['recruiter'],
  },
  {
    to: '/intelligence',
    label: 'Talent Intelligence',
    icon: Sparkles,
    roles: ['recruiter'],
  },
  {
    to: '/portal',
    label: 'Candidate Portal',
    icon: UserCheck,
    roles: ['candidate', 'recruiter'],
  },
];

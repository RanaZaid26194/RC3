import React from 'react';
import {
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import { InterviewCalendar, AnalyticsChart, ResumeDocument, SemanticQuery, PortalUser, PipelineKanban, TalentMatch } from '@/components/ui/CustomIcons';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
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
    icon: PipelineKanban,
    roles: ['recruiter'],
  },
  {
    to: '/candidates',
    label: 'Candidate Review',
    icon: TalentMatch,
    roles: ['recruiter'],
  },
  {
    to: '/interviews',
    label: 'Interviews & Questions',
    icon: InterviewCalendar,
    roles: ['recruiter'],
  },
  {
    to: '/analytics',
    label: 'Talent Analytics',
    icon: AnalyticsChart,
    roles: ['recruiter'],
  },
  {
    to: '/resumes',
    label: 'Resume Intake',
    icon: ResumeDocument,
    roles: ['recruiter'],
  },
  {
    to: '/intelligence',
    label: 'Talent Intelligence',
    icon: SemanticQuery,
    roles: ['recruiter'],
  },
  {
    to: '/portal',
    label: 'Candidate Portal',
    icon: PortalUser,
    roles: ['candidate', 'recruiter'],
  },
];

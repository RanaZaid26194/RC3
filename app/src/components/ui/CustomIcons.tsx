import { type ComponentProps } from 'react';

/**
 * Custom premium icons tailored for recruiting/talent intelligence domain
 * Replaces generic Lucide icons with branded variants
 */

export function RecruLensLogo(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props} aria-hidden="true">
      <defs>
        <linearGradient id="lens-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" stroke="url(#lens-gradient)" strokeWidth="2" fill="none" />
      <path d="M16 8a8 8 0 0 1 0 16 8 8 0 0 1 0-16Z" fill="url(#lens-gradient)" fillOpacity="0.1" />
      <circle cx="16" cy="16" r="3" fill="url(#lens-gradient)" />
      <path d="M16 3v4M16 25v4M3 16h4M25 16h4" stroke="url(#lens-gradient)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function TalentMatch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="match-icon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <path
        d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9Z"
        stroke="url(#match-icon)"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="12" cy="12" r="3" fill="url(#match-icon)" opacity="0.2" />
      <circle cx="12" cy="12" r="1.5" fill="url(#match-icon)" />
    </svg>
  );
}

export function InterviewCalendar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="#047857" strokeWidth="2" />
      <path d="M3 8h18" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="11" width="3" height="6" rx="1" fill="#047857" opacity="0.1" />
      <path d="M8.5 11v6" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16.5" cy="14" r="2" fill="#f59e0b" />
    </svg>
  );
}

export function AnalyticsChart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#6366f1" strokeWidth="2" />
      <path d="M3 12h4l3-4 4 3 4-6" stroke="#6366f1" strokeWidth="1.5" fill="none" />
      <path d="M13 11l-2 3-1 3" stroke="#0ea5e9" strokeWidth="1.5" fill="none" />
      <circle cx="7" cy="8" r="1.5" fill="#6366f1" opacity="0.2" />
      <circle cx="11" cy="11" r="1.5" fill="#6366f1" />
      <circle cx="15" cy="5" r="1.5" fill="#0ea5e9" />
    </svg>
  );
}

export function ResumeDocument({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 3h8l4 4v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="#6366f1"
        strokeWidth="2"
        fill="none"
      />
      <path d="M14 3v4h4" stroke="#6366f1" strokeWidth="1.5" />
      <rect x="8" y="9" width="6" height="1" rx="0.5" fill="#6366f1" opacity="0.3" />
      <rect x="8" y="12" width="8" height="1" rx="0.5" fill="#6366f1" opacity="0.3" />
      <rect x="8" y="15" width="6" height="1" rx="0.5" fill="#6366f1" opacity="0.3" />
    </svg>
  );
}

export function IntelligenceSpark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2Z"
        stroke="url(#spark)"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="12" cy="12" r="2" fill="#f59e0b" />
      <defs>
        <linearGradient id="spark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function PortalUser({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="#6366f1" strokeWidth="2" fill="none" />
      <path d="M4 20c2-3 6-4 8-4s6 1 8 4" stroke="#6366f1" strokeWidth="2" fill="none" />
      <circle cx="12" cy="8" r="2" fill="#6366f1" opacity="0.2" />
      <circle cx="12" cy="8" r="1" fill="#6366f1" />
    </svg>
  );
}

export function PipelineKanban({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="5" width="6" height="14" rx="1.5" stroke="#6366f1" strokeWidth="2" />
      <rect x="9" y="3" width="6" height="18" rx="1.5" stroke="#8b5cf6" strokeWidth="2" />
      <rect x="16" y="7" width="6" height="14" rx="1.5" stroke="#0ea5e9" strokeWidth="2" />
      <circle cx="5" cy="8" r="1.5" fill="#6366f1" opacity="0.2" />
      <circle cx="5" cy="14" r="1.5" fill="#6366f1" />
      <circle cx="12" cy="7" r="1.5" fill="#8b5cf6" opacity="0.2" />
      <circle cx="12" cy="12" r="1.5" fill="#8b5cf6" />
      <circle cx="12" cy="17" r="1.5" fill="#8b5cf6" opacity="0.2" />
      <circle cx="19" cy="11" r="1.5" fill="#0ea5e9" />
      <circle cx="19" cy="16" r="1.5" fill="#0ea5e9" opacity="0.2" />
    </svg>
  );
}

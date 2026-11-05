import { type ComponentProps } from 'react';

/**
 * Custom RecruLens icon set.
 * Every glyph is drawn with currentColor so it inherits the surrounding text
 * color (active, muted, dark mode) and stays free of gradients.
 */

export function RecuLensLogo(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props} aria-hidden="true">
      <circle cx="16" cy="16" r="12.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="6.5" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
      <path
        d="M16 1.5v4M16 26.5v4M1.5 16h4M26.5 16h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Two candidate rings converging on a shared center — match, not magic. */
export function TalentMatch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="9" cy="12" r="5.25" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="15" cy="12" r="5.25" stroke="currentColor" strokeWidth="1.7" opacity="0.55" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

/** Document + lens: requirement / resume extraction. */
export function ExtractionEvidence({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 3.5h7.25L18 8.25v3.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.25 3.5v4.75H18" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M6 3.5A1.5 1.5 0 0 0 4.5 5v13.5A1.5 1.5 0 0 0 6 20h5.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M7.5 8.5h3.25M7.5 11.5h5.25M7.5 14.5h3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="16" cy="16" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="m18.4 18.4 2.4 2.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** Lens over a connected skill graph: semantic search. */
export function SemanticQuery({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5.75" stroke="currentColor" strokeWidth="1.7" />
      <path d="m15 15 4.75 4.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="8.5" cy="9" r="1" fill="currentColor" />
      <circle cx="12.5" cy="8.5" r="1" fill="currentColor" />
      <circle cx="10.5" cy="12.5" r="1" fill="currentColor" />
      <path
        d="M8.5 9 12.5 8.5M8.5 9l2 3.5M12.5 8.5l-2 4"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

/** Speech bubble with ascending tiers: beginner → intermediate → advanced. */
export function QuestionTiers({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 5.5A1.5 1.5 0 0 1 6 4h12a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 18 16H9.5L5 20v-4H6a1.5 1.5 0 0 1-1.5-1.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M8 12.5v-2M12 12.5V8M16 12.5V6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function InterviewCalendar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 8.5h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 2.5v3M16.5 2.5v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 12h3v3h-3z" fill="currentColor" opacity="0.18" />
      <path d="M8 12.5v2M16 12.2v3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="16.6" cy="16.2" r="1.5" fill="#d9942b" />
    </svg>
  );
}

export function AnalyticsChart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 19.5h17M5 16.5V11M10 16.5V6.5M15 16.5v-4M20 16.5V8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="10" cy="6.5" r="1.5" fill="currentColor" />
      <path d="M5 11l5-4.5 5 4 5-3.5" stroke="#d9942b" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

export function ResumeDocument({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 3h7.5L18 7.5v13a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-17A.5.5 0 0 1 6 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M13.5 3v4.5H18" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 11h8M8 14h8M8 17h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function PortalUser({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.75" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4.5 20c1.8-3 5-4.5 7.5-4.5s5.7 1.5 7.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="8" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function PipelineKanban({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4.5" width="5.5" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="9.25" y="4.5" width="5.5" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.7" opacity="0.65" />
      <rect x="15.5" y="4.5" width="5.5" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.7" opacity="0.4" />
      <circle cx="5.75" cy="8.5" r="1" fill="currentColor" />
      <circle cx="12" cy="8.5" r="1" fill="currentColor" opacity="0.65" />
      <path d="M5.75 12.5v4M12 12.5v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="aurora-blob -left-20 top-[-80px] h-80 w-80 bg-brand-300/30 dark:bg-brand-800/20" />
        <div className="aurora-blob right-[-60px] top-1/2 h-72 w-72 bg-accent-500/20 dark:bg-accent-500/10" />
      </div>

      <div className="relative mx-auto max-w-3xl space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Sign Up
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs">
                Sign In
              </Button>
            </Link>
            <Link to="/privacy">
              <Button variant="outline" size="sm" className="text-xs">
                Privacy Policy
              </Button>
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
            <FileText className="h-3.5 w-3.5" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Effective Date: November 5, 2026 • Version 1.2
          </p>
        </div>

        {/* Content Card */}
        <Card className="p-8 shadow-lg border border-neutral-200/80 dark:border-neutral-800 space-y-6 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-semibold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              1. Acceptance of Terms
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              By registering an account, accessing, or utilizing the RecruLens talent intelligence platform ("Platform"), you agree to be legally bound by these Terms of Service. If you are entering into these terms on behalf of an enterprise recruiting department or employer, you represent that you possess the authority to bind such entity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              2. Explainable AI & Human-in-the-Loop Decision Authority
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              RecruLens provides automated semantic parsing, resume extraction, and mathematical relevance scoring (50% skills, 25% experience, 15% projects, 10% qualifications). You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
              <li>All match scores and gap analyses are algorithmic recommendations designed exclusively for decision-support.</li>
              <li>The Platform prohibits fully autonomous adverse employment actions; human recruiters maintain sole authority and responsibility for all shortlisting, interview invitations, offers, or rejections.</li>
              <li>Recruiters retain full capability to manually override, adjust, or supplement parsed scores and skill tags with documented audit notes.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              3. User Roles & Account Responsibilities
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              <strong>Talent Recruiters:</strong> You agree to use candidate evidence solely for legitimate hiring evaluations and adhere to applicable labor and anti-discrimination laws.
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              <strong>Job Candidates:</strong> You warrant that all resume information, career tenure, degrees, and project claims submitted are accurate and genuine. The Platform reserves the right to flag unsubstantiated claims as "Missing Evidence".
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              4. Document Uploads & Content Ownership
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              You retain all ownership rights in any resumes, portfolios, or job descriptions uploaded to RecruLens. You grant RecruLens a limited, non-exclusive license to process, parse, extract entities from, and score such materials solely to deliver platform functionality.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              5. Data Security & Storage
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              RecruLens enforces client-side cryptographic hashing, strict Content Security Policies (CSP), and local sandbox persistence. We do not sell or monetize personal candidate dossiers to third-party ad networks or data brokers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-600" />
              6. Limitation of Liability
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              In no event shall RecruLens or its engineering team be liable for indirect, punitive, or consequential damages resulting from hiring decisions made by employers or candidate employment outcomes.
            </p>
          </section>

          {/* Footer actions */}
          <div className="border-t border-neutral-200 pt-6 flex items-center justify-between dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Shield className="h-4 w-4 text-brand-600" />
              <span>Compliant with modern fair hiring standards</span>
            </div>
            <Link to="/register">
              <Button size="sm">
                Agree & Continue to Sign Up
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

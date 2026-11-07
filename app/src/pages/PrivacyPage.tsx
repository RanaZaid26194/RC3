import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, EyeOff, Database, Cpu, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function PrivacyPage() {
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
            <Link to="/terms">
              <Button variant="outline" size="sm" className="text-xs">
                Terms of Service
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Lock className="h-3.5 w-3.5" />
            <span>Privacy & Data Protection</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Last Updated: November 5, 2026 • Version 1.2
          </p>
        </div>

        {/* Content Card */}
        <Card className="p-8 shadow-lg border border-neutral-200/80 dark:border-neutral-800 space-y-6 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-semibold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-600" />
              1. Information We Collect
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              RecruLens collects only data required to perform semantic talent matching and recruitment workflow management:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
              <li><strong>Account Credentials:</strong> Full name, professional work email address, user role (Recruiter vs. Candidate), and salted password hashes.</li>
              <li><strong>Resume & Profile Data:</strong> Contact details (phone, LinkedIn/GitHub URLs), technical skills, work history, degree qualifications, and project descriptions.</li>
              <li><strong>Hiring Notes & Audit History:</strong> Recruiter private evaluation notes, interview schedules, and stage progression timestamps.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-brand-600" />
              2. Anti-Bias Safeguards & Blind Hiring Protection
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              RecruLens is architected from the ground up to prevent demographic bias in AI screening:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
              <li>Protected attributes such as gender, race, age, religion, marital status, and photos are strictly excluded from mathematical ranking calculations.</li>
              <li>Recruiters can toggle <strong>Blind Evaluation Mode</strong> to obfuscate candidate names, pictures, gender pronouns, and educational institutions, guaranteeing evaluations focus purely on demonstrated skills and verified project evidence.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-brand-600" />
              3. AI Model Usage & Google Gemini API Disclosures
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              When Google Gemini AI features are active (configured in Settings):
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
              <li>Customer data processed via API is never retained or used to train Google's foundation models.</li>
              <li>If no external API key is configured or when offline, RecruLens switches to embedded deterministic NLP algorithms with zero network calls.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-brand-600" />
              4. Client-Side Persistence & Storage
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              All demo candidate data, active vacancies, and interview records are maintained in isolated local storage (`localStorage`). No tracking pixels, third-party analytics trackers, or surveillance cookies are injected into your sessions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-brand-600" />
              5. Candidate Rights & Data Control
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              You maintain full sovereignty over your hiring records:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
              <li><strong>Inspection:</strong> Candidates can view all extracted skills and evidence excerpts directly in the Candidate Portal.</li>
              <li><strong>Correction:</strong> Recruiters and candidates can manually edit or remove incorrect skills.</li>
              <li><strong>Purge:</strong> Any user can click "Reset Demo Data" in Settings to instantly wipe all stored application records and local sessions.</li>
            </ul>
          </section>

          {/* Footer actions */}
          <div className="border-t border-neutral-200 pt-6 flex items-center justify-between dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Zero-knowledge client hashing • Data sovereignty guaranteed</span>
            </div>
            <Link to="/register">
              <Button size="sm">
                Accept & Return to Sign Up
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

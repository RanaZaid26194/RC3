import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { registerUser } from '@/lib/auth';
import type { UserRole } from '@/types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 9) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    return score; // 0 - 4
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-neutral-200 dark:bg-neutral-800',
    'bg-rose-500',
    'bg-amber-500',
    'bg-blue-500',
    'bg-emerald-500',
  ];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your confirmation password.');
      return;
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy to create an account.');
      return;
    }

    setIsLoading(true);

    try {
      const user = registerUser(name, email, role, password);
      if (user.role === 'recruiter') {
        navigate('/jobs');
      } else {
        navigate('/portal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      {/* Ambient brand backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="aurora-blob -left-24 top-[-80px] h-80 w-80 bg-brand-300/40 dark:bg-brand-800/25" />
        <div
          className="aurora-blob right-[-60px] top-1/3 h-72 w-72 bg-accent-500/25 dark:bg-accent-500/10"
          style={{ animationDelay: '-5s' }}
        />
        <div
          className="aurora-blob bottom-[-100px] left-1/3 h-72 w-72 bg-brand-400/25 dark:bg-brand-900/30"
          style={{ animationDelay: '-9s' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.7),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(15,23,42,0.6),transparent_60%)]" />
      </div>

      <div className="relative w-full max-w-lg space-y-6 animate-fade-up">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30 animate-float">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Create your <span className="animate-gradient-text">RecruLens</span> account
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Join thousands of talent teams and candidates on the explainable hiring platform
          </p>
        </div>

        {/* Register Card */}
        <Card className="sheen p-6 space-y-5 shadow-lg border border-neutral-200/80 dark:border-neutral-800">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                I am signing up as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition ${
                    role === 'recruiter'
                      ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-xs ring-2 ring-brand-500/20 dark:border-brand-500 dark:bg-brand-950/50 dark:text-brand-200 font-semibold'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900'
                  }`}
                >
                  <ShieldCheck className="h-5 w-5 mb-1.5 text-brand-600 dark:text-brand-400" />
                  <span className="text-xs font-medium">Talent Recruiter</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">Post jobs & review matches</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition ${
                    role === 'candidate'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-200 font-semibold'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900'
                  }`}
                >
                  <UserCheck className="h-5 w-5 mb-1.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium">Job Candidate</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">Browse roles & apply</span>
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Work Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="register-password"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
                >
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="pl-9 pr-9 text-xs"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
                >
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="pl-9 pr-9 text-xs"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password strength meter */}
            {password.length > 0 && (
              <div className="rounded-lg bg-neutral-50 p-2.5 border border-neutral-200/70 dark:bg-neutral-900/60 dark:border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500">Security strength:</span>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {strengthLabels[strength]}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-colors ${
                        strength >= step ? strengthColors[strength] : 'bg-neutral-200 dark:bg-neutral-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[10px] text-neutral-400">
                  <span className={password.length >= 6 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                    ✓ 6+ characters
                  </span>
                  <span className={/[0-9]/.test(password) ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                    ✓ Includes number
                  </span>
                  <span
                    className={
                      /[A-Z]/.test(password) && /[a-z]/.test(password)
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : ''
                    }
                  >
                    ✓ Mixed case
                  </span>
                </div>
              </div>
            )}

            {/* Terms & Conditions Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-neutral-600 dark:text-neutral-400">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
                  required
                />
                <span>
                  I agree to the{' '}
                  <span className="text-brand-600 font-medium hover:underline">Terms of Service</span> and{' '}
                  <span className="text-brand-600 font-medium hover:underline">Privacy Policy</span>.
                </span>
              </label>
            </div>

            <Button type="submit" loading={isLoading} className="w-full gap-2 font-semibold mt-2">
              Create Account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Login link */}
          <div className="border-t border-neutral-200 pt-4 text-center dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>

        {/* Security assurance */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500">
          <Shield className="h-3.5 w-3.5" />
          <span>Zero-knowledge client hashing • Instant workspace activation</span>
        </div>
      </div>
    </div>
  );
}

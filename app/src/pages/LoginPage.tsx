import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  Shield,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { loginUser, findUserByEmail, resetPassword } from '@/lib/auth';

const REMEMBERED_EMAIL_KEY = 'recrulens_remembered_email';

export default function LoginPage() {
  const navigate = useNavigate();

  // Organic state: unpopulated by default unless the user explicitly chose "Remember Me" previously
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset' | 'success'>('request');
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email.trim()) {
        throw new Error('Please enter your work email.');
      }
      if (!password) {
        throw new Error('Please enter your password.');
      }

      const user = loginUser(email, password);

      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      if (user.role === 'recruiter') {
        navigate('/jobs');
      } else {
        navigate('/portal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid login credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    try {
      const user = findUserByEmail(forgotEmail);
      if (!user) {
        throw new Error('No registered account was found with that email address.');
      }
      // Generate a simulated verification code for the user
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setForgotCode(code);
      setForgotStep('reset');
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : 'Failed to look up account.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCompleteReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      resetPassword(forgotEmail, newPassword);
      setForgotStep('success');
      setEmail(forgotEmail);
      setPassword(newPassword);
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : 'Password reset failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setIsForgotOpen(false);
    setForgotStep('request');
    setForgotError(null);
    setForgotEmail('');
    setNewPassword('');
    setConfirmNewPassword('');
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

      <div className="relative w-full max-w-md space-y-6 animate-fade-up">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30 animate-float">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Sign In to <span className="animate-gradient-text">RecruLens</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Explainable Talent Intelligence & Semantic Candidate Matching
          </p>
        </div>

        {/* Login Card */}
        <Card className="sheen p-6 space-y-5 shadow-lg border border-neutral-200/80 dark:border-neutral-800">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  id="login-email"
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setIsForgotOpen(true);
                  }}
                  className="text-[11px] font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-9 pr-10 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-600 dark:text-neutral-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
                />
                Remember me on this browser
              </label>
            </div>

            <Button type="submit" loading={isLoading} className="w-full gap-2 font-semibold">
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Registration link */}
          <div className="border-t border-neutral-200 pt-4 text-center dark:border-neutral-800">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400"
              >
                Create an account
              </Link>
            </p>
          </div>
        </Card>

        {/* Security assurance */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500">
          <Shield className="h-3.5 w-3.5" />
          <span>Encrypted session authentication & client-side security</span>
        </div>
      </div>

      {/* Realistic Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <button
              onClick={closeForgotModal}
              className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {forgotStep === 'request' && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white text-base">
                      Reset Password
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Enter your account email to receive a secure recovery verification code.
                    </p>
                  </div>
                </div>

                {forgotError && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Registered Email
                  </label>
                  <Input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="text-xs"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={closeForgotModal}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" loading={forgotLoading} className="gap-1.5">
                    Send Verification Code <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            )}

            {forgotStep === 'reset' && (
              <form onSubmit={handleCompleteReset} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white text-base">
                      Set New Password
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Code verified: <span className="font-mono font-semibold text-brand-600">RL-{forgotCode}</span>. Choose a strong new password.
                    </p>
                  </div>
                </div>

                {forgotError && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    New Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10 text-xs"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Confirm New Password
                  </label>
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="text-xs"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={closeForgotModal}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" loading={forgotLoading}>
                    Save New Password
                  </Button>
                </div>
              </form>
            )}

            {forgotStep === 'success' && (
              <div className="space-y-4 text-center py-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-white text-base">
                    Password Successfully Updated
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Your password has been changed. Your email and new password have been populated into the sign-in form.
                  </p>
                </div>
                <Button size="sm" className="w-full" onClick={closeForgotModal}>
                  Back to Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { loginUser, switchRole } from '@/lib/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('recruiter@recrulens.ai');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = loginUser(email, password);
      if (user.role === 'recruiter') {
        navigate('/jobs');
      } else {
        navigate('/portal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid login credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (role: 'recruiter' | 'candidate') => {
    const user = switchRole(role);
    if (user.role === 'recruiter') {
      navigate('/jobs');
    } else {
      navigate('/portal');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      {/* Ambient brand backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="aurora-blob -left-24 top-[-80px] h-80 w-80 bg-brand-300/40 dark:bg-brand-800/25" />
        <div className="aurora-blob right-[-60px] top-1/3 h-72 w-72 bg-accent-500/25 dark:bg-accent-500/10" style={{ animationDelay: '-5s' }} />
        <div className="aurora-blob bottom-[-100px] left-1/3 h-72 w-72 bg-brand-400/25 dark:bg-brand-900/30" style={{ animationDelay: '-9s' }} />
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
          <p className="text-xs text-neutral-500">
            Explainable Talent Intelligence & Semantic Candidate Matching
          </p>
        </div>

        {/* Login Card */}
        <Card className="sheen p-6 space-y-5 shadow-lg">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  type="email"
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
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <span className="text-[11px] text-neutral-400">Demo default: password123</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <Button type="submit" loading={isLoading} className="w-full gap-2">
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Demo Switchers for Judges */}
          <div className="border-t border-neutral-200 pt-4 space-y-2 dark:border-neutral-800">
            <span className="block text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Judge & Demo Fast Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickDemo('recruiter')}
                className="gap-1.5 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Recruiter
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickDemo('candidate')}
                className="gap-1.5 text-xs border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                <UserCheck className="h-3.5 w-3.5" /> Candidate
              </Button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-neutral-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                Register here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

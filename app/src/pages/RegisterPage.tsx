import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Lock, Mail, User, ArrowRight, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';
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
  const [role, setRole] = useState<UserRole>('candidate');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Create an Account
          </h1>
          <p className="text-xs text-neutral-500">
            Join RecruLens as a Hiring Recruiter or Job Candidate
          </p>
        </div>

        {/* Register Card */}
        <Card className="p-6 space-y-5 shadow-lg">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Password * (minimum 6 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 text-xs"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Account Role *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition ${
                    role === 'candidate'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900'
                  }`}
                >
                  <UserCheck className="h-5 w-5 mb-1" />
                  <span className="text-xs">Job Candidate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition ${
                    role === 'recruiter'
                      ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900'
                  }`}
                >
                  <ShieldCheck className="h-5 w-5 mb-1" />
                  <span className="text-xs">Talent Recruiter</span>
                </button>
              </div>
            </div>

            <Button type="submit" loading={isLoading} className="w-full gap-2 mt-2">
              Create Account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-neutral-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

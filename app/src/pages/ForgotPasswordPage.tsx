import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { generateVerificationCode, saveVerificationCode, sendPasswordResetEmail, checkRateLimit, type RateLimitData } from '@/lib/emailService';
import { load } from '@/lib/storage';

const RATE_LIMIT_KEY = 'password_reset:rate_limit_ui_state';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfterMs, setRetryAfterMs] = useState<number | null>(null);

  useEffect(() => {
    // Check rate limit on page load
    const rateLimits = load<RateLimitData[]>(RATE_LIMIT_KEY, []);
    const now = Date.now();
    
    // Clean expired limits
    const cleanLimits = rateLimits.filter(l => now - l.lastRequestAt < 5 * 60 * 1000);
    
    // Find current user's limit
    const emailLower = email.toLowerCase();
    const recentRequests = cleanLimits.filter(
      l => l.email === emailLower && now - l.lastRequestAt < 5 * 60 * 1000
    );

    if (recentRequests.length >= 3) {
      const latestRequest = recentRequests.reduce((a, b) => 
        a.lastRequestAt > b.lastRequestAt ? a : b
      );
      const retryAfter = Math.max(0, 5 * 60 * 1000 - (now - latestRequest.lastRequestAt));
      setRateLimited(true);
      setRetryAfterMs(retryAfter);
      
      // Start countdown
      const interval = setInterval(() => {
        setRetryAfterMs(prev => {
          if (prev === null || prev <= 1000) {
            clearInterval(interval);
            return null;
          }
          setTimeout(() => {}, 1000);
          return prev - 1000;
        });
      }, 1000);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Check rate limit
      const { allowed, retryAfterMs: retryAfter } = checkRateLimit(email);
      
      if (!allowed) {
        setRateLimited(true);
        const waitMs = retryAfter ?? 5 * 60 * 1000;
        setRetryAfterMs(waitMs);
        setError(`Too many requests. Please wait ${Math.ceil(waitMs / 1000 / 60)} minute(s).`);
        setLoading(false);
        return;
      }

      // Generate code and send email
      const code = generateVerificationCode();
      saveVerificationCode({
        id: `reset_${Date.now().toString(36)}`,
        email: email.trim().toLowerCase(),
        code,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0,
        lastAttemptAt: Date.now(),
      });
      const result = sendPasswordResetEmail(email, code);
      
      if (result.sent) {
        setSuccess(true);
        setEmail('');
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-brand-950 px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-scale">
        <div className="mb-8 text-center">
          <Link to="/login" className="inline-block mb-6">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </Link>
          
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Shield className="h-8 w-8 text-white" />
          </div>
          
          <PageHeader
            title="Forgot Password?"
            subtitle="Enter your email address and we'll send you a verification code to reset your password."
          />
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>
        )}

        {success && (
          <div role="status" className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Verification code sent. Check the browser console in demo mode.</div>
        )}

        {rateLimited && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
              ⚠️ Rate limit active
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              You've requested too many codes. Please wait {Math.ceil((retryAfterMs ?? 300) / 1000 / 60)} minute(s) before trying again.
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8">
          {!success && !rateLimited ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || rateLimited}
                    required
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Enter the email associated with your account. We'll send a 6-digit verification code.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading || rateLimited}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" color="brand" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Verification Code
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                <Mail className="h-8 w-8 text-brand-600 dark:text-brand-400" />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Check Your Email
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  We've sent a 6-digit verification code to
                </p>
                <p className="text-base font-mono font-medium text-brand-600 dark:text-brand-400">
                  {email}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  💡 <strong>Demo Mode:</strong> The verification code is logged to your browser console. Open DevTools (F12) → Console to see the code.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Request Another Code
                </Button>
                
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Remember your password?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

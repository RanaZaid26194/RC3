import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { findUserByEmail, resetPassword as authResetPassword } from '@/lib/auth';

export function SetNewPasswordPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      setError('Invalid or expired verification link.');
      return;
    }

    // Verify code was already entered (should have redirected from VerifyCodePage)
    // Check if user exists
    const user = findUserByEmail(email);
    if (!user) {
      setError('No account found with this email address.');
    }
  }, [email]);

  const validatePassword = (pwd: string): string | null => {
    if (!pwd) return null;
    
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    
    if (pwd.length > 128) {
      return 'Password is too long. Please use a shorter password.';
    }
    
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter.';
    }
    
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter.';
    }
    
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number.';
    }
    
    // Optional: Recommend special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return 'Consider adding a special character (!@#$%^&*) for extra security.';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Invalid or expired link.');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate password strength
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Reset password using the verified token (code)
      await authResetPassword(email, password);
      
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 dark:bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-scale">
        <div className="mb-8 text-center">
          <Link to="/login" className="inline-block mb-6">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </Link>
          
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-brand-600 flex items-center justify-center shadow-md">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          
          {!success && (
            <PageHeader
              title="Set New Password"
              subtitle={`Create a strong password for your account (${email})`}
            />
          )}
        </div>

        {error && !success && (
          <div role="alert" className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>
        )}

        {success ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center">
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center animate-pop">
              <ShieldCheck className="h-8 w-8 text-brand-600 dark:text-brand-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
              Password Reset Successful!
            </h2>
            
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            
            <Link to="/login">
              <Button variant="primary" size="lg" className="w-full">
                Sign In Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            password.length >= level * 25
                              ? 'bg-brand-500'
                              : 'bg-neutral-200 dark:bg-neutral-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {password.length === 0 ? '' : 
                       password.length < 8 ? 'Weak - Add more characters' :
                       password.length < 12 ? 'Medium - Use at least 12 characters' :
                       'Strong - Great job!'}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    ⚠️ Passwords do not match
                  </p>
                )}
              </div>

              {/* Password Requirements List */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2.5">
                  Password Requirements:
                </p>
                <ul className="space-y-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                  <li className={`flex items-start gap-1.5 ${password.length >= 8 ? 'text-brand-600 dark:text-brand-400' : ''}`}>
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${password.length >= 8 ? 'bg-brand-500' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
                    At least 8 characters long
                  </li>
                  <li className={`flex items-start gap-1.5 ${/[A-Z]/.test(password) ? 'text-brand-600 dark:text-brand-400' : ''}`}>
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-brand-500' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
                    One uppercase letter (A-Z)
                  </li>
                  <li className={`flex items-start gap-1.5 ${/[a-z]/.test(password) ? 'text-brand-600 dark:text-brand-400' : ''}`}>
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${/[a-z]/.test(password) ? 'bg-brand-500' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
                    One lowercase letter (a-z)
                  </li>
                  <li className={`flex items-start gap-1.5 ${/[0-9]/.test(password) ? 'text-brand-600 dark:text-brand-400' : ''}`}>
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-brand-500' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
                    One number (0-9)
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading || password !== confirmPassword || !password || !confirmPassword}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" color="brand" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Remember your old password?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

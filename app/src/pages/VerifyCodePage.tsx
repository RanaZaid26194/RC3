import { useState, useEffect } from 'react';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { attemptCodeVerification, getActiveVerificationCode } from '@/lib/emailService';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

function CodeInput({ value, onChange, error, disabled }: CodeInputProps) {
  const digits = '0123456789'.split('');
  
  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;
    
    const newDigits = value.split('');
    newDigits[index] = digit.slice(0, 1);
    
    // Auto-focus next input
    if (digit && index < 5) {
      const nextInput = document.getElementById(`code-digit-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
    
    onChange(newDigits.join('').slice(0, 6));
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value.split('')[index] && index > 0) {
      const prevInput = document.getElementById(`code-digit-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      digits.forEach((digit, i) => {
        if (i < 6) {
          const input = document.getElementById(`code-digit-${i}`) as HTMLInputElement;
          if (input) input.value = digit;
        }
      });
      onChange(digits.join('').padEnd(6, '0').slice(0, 6));
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((_, index) => (
        <input
          key={index}
          id={`code-digit-${index}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value.split('')[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all
            ${error 
              ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30 focus:border-red-500' 
              : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800 focus:border-brand-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-400'}
            focus:outline-none focus:ring-4 focus:ring-brand-500/20
            dark:text-white
          `}
        />
      ))}
    </div>
  );
}

export function VerifyCodePage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);

  useEffect(() => {
    if (!email) {
      setError('No verification request found. Please start over.');
      return;
    }

    // Check if verification code exists for this email
    const request = getActiveVerificationCode(email);
    if (!request) {
      setError('No active verification code found. Please request a new one.');
      setMaxAttemptsReached(true);
    } else {
      setAttempts(request.attempts || 0);
      if (request.attempts >= 3) {
        setMaxAttemptsReached(true);
      }
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('No verification request found.');
      return;
    }

    if (code.length !== 6) {
      setError('Please enter a complete 6-digit code.');
      return;
    }

    setLoading(true);

    try {
      const result = attemptCodeVerification(email, code);
      
      if (result.success) {
        // Redirect to set new password page
        window.location.href = `/set-new-password?email=${encodeURIComponent(email)}`;
      } else {
        setAttempts(prev => prev + 1);
        setError(result.message);
        
        if (result.error === 'MAX_ATTEMPTS_REACHED' || result.error === 'CODE_EXPIRED') {
          setMaxAttemptsReached(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <Navigate to="/forgot-password" replace />
    );
  }

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
            title="Verify Your Code"
            subtitle={`We sent a 6-digit verification code to ${email}`}
          />
        </div>

        {error && <div role="alert" className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}

        {maxAttemptsReached && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                  Too many failed attempts
                </p>
                <p className="text-xs text-red-700 dark:text-red-400">
                  Your verification code has been locked for security reasons. Please request a new code.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8">
          {!maxAttemptsReached ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="verification-code" className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 text-center">
                    Enter 6-Digit Code
                  </label>
                  
                  <CodeInput
                    value={code}
                    onChange={setCode}
                    error={!!error}
                    disabled={loading || attempts >= 3}
                  />
                  
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                    {attempts >= 2 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        ⚠️ One more incorrect attempt and your code will expire
                      </span>
                    ) : (
                      'Enter the code we sent to your email address'
                    )}
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading || code.length !== 6 || attempts >= 3}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" color="brand" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Verify Code
                    </>
                  )}
                </Button>

                <div className="pt-2 space-y-3">
                  <Link to={`/forgot-password`}>
                    <Button variant="outline" className="w-full">
                      Request New Code
                    </Button>
                  </Link>
                  
                  <Link to="/login">
                    <Button variant="ghost" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Code Expired
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  For security reasons, too many incorrect attempts were made.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <Link to={`/forgot-password`}>
                  <Button variant="primary" className="w-full">
                    Request New Code
                  </Button>
                </Link>
                
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
            Need help?{' '}
            <a href="mailto:support@recrulens.ai" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

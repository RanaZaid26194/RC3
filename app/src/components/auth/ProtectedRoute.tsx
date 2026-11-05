import { type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { getCurrentUser, logoutUser } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { UserRole } from '@/types';

interface Props {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const user = getCurrentUser();
  const navigate = useNavigate();

  // 1. Not authenticated -> Redirect to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role restriction check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center p-4">
        <Card className="max-w-md p-6 text-center space-y-4 shadow-lg border-amber-200 dark:border-amber-800">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
              403 Unauthorized Access
            </span>
            <h2 className="mt-2 text-xl font-bold text-neutral-900 dark:text-white">
              Recruiter Authorization Required
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              You are signed in as <span className="font-semibold text-neutral-800 dark:text-neutral-200">{user.name}</span> ({user.role}).
              This area contains protected recruiter pipelines and candidate evaluation rubrics.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              onClick={() => navigate('/portal')}
              className="w-full gap-2 text-xs"
            >
              <ArrowLeft className="h-4 w-4" /> Go to Candidate Portal
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                logoutUser();
                navigate('/login');
              }}
              className="w-full gap-2 text-xs text-neutral-600 dark:text-neutral-300"
            >
              <LogOut className="h-4 w-4" /> Sign In as Recruiter
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

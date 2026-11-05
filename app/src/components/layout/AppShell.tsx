import { useState, useEffect, type ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, UserCheck, ShieldCheck, RefreshCw, LogOut } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '../ui/Button';
import { NAV_ITEMS } from '@/app/nav';
import { getCurrentUser, switchRole, logoutUser } from '@/lib/auth';
import { resetDemoData } from '@/lib/storage';

export const APP_NAME = 'RecruLens';

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for user state changes across tabs or navigations
  useEffect(() => {
    setUser(getCurrentUser());
  }, [location.pathname]);

  // Auth pages render without shell sidebar
  if (location.pathname === '/login' || location.pathname === '/register') {
    return (
      <main id="main" tabIndex={-1} className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {children}
      </main>
    );
  }

  // Not logged in -> redirect to login
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleToggleRole = () => {
    const nextRole = user.role === 'recruiter' ? 'candidate' : 'recruiter';
    const updated = switchRole(nextRole);
    setUser(updated);
    if (nextRole === 'candidate') {
      navigate('/portal');
    } else {
      navigate('/jobs');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    navigate('/login');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to clean initial state?')) {
      resetDemoData();
      window.location.reload();
    }
  };

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const link = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 text-sm font-medium transition',
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/40 dark:text-blue-300'
        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
    );

  const nav = (
    <nav aria-label="Main" className="flex flex-col gap-1.5">
      {visibleNav.map(({ to, label, icon: I }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/jobs' || to === '/portal'}
          className={link}
          onClick={() => setOpen(false)}
        >
          <I className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 lg:grid lg:grid-cols-[260px_1fr]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg dark:focus:bg-neutral-900"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <aside className="hidden flex-col justify-between border-r border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 lg:flex">
        <div>
          {/* Logo & Brand */}
          <div className="mb-6 flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="RecruLens Logo"
                className="h-12 w-12 rounded-xl object-contain shadow-sm border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-1"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <span className="font-display text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {APP_NAME}
                </span>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  Talent Intelligence
                </span>
              </div>
            </div>
          </div>

          {/* Role Indicator Banner */}
          <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-800/60">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-neutral-600 dark:text-neutral-300">
                {user.role === 'recruiter' ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Recruiter Mode
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Candidate Mode
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={handleToggleRole}
                title="Quick demo switch"
                className="text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Switch
              </button>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500 truncate">{user.name}</p>
          </div>

          {/* Navigation Links */}
          {nav}
        </div>

        {/* Footer actions with Logout and Reset */}
        <div className="border-t border-neutral-200 pt-3 space-y-1.5 dark:border-neutral-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Sign Out
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetData}
            className="w-full justify-start text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Reset Demo Data
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-900 lg:hidden">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="RecruLens Logo"
            className="h-9 w-9 rounded-lg object-contain bg-white dark:bg-neutral-800 p-0.5 border border-neutral-200 dark:border-neutral-700"
          />
          <span className="font-display text-base font-bold text-neutral-900 dark:text-white">
            {APP_NAME}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-xs text-rose-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {open && (
        <div className="animate-fade-up border-b border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900 lg:hidden">
          {nav}
        </div>
      )}

      {/* Main Content Area */}
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

import { useState, useEffect, type ReactNode } from 'react';
import { NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Menu, X, UserCheck, ShieldCheck, RefreshCw, LogOut } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '../ui/Button';
import { ScrollProgress } from '../ui/Motion';
import { Modal } from '../ui/Modal';
import { NAV_ITEMS } from '@/app/nav';
import { getCurrentUser, logoutUser, getStoredUsers, switchAccount, type StoredUser } from '@/lib/auth';
import { resetDemoData } from '@/lib/storage';

export const APP_NAME = 'RecruLens';

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for user state changes across tabs or navigations
  useEffect(() => {
    setUser(getCurrentUser());
  }, [location.pathname]);

  // Public auth and legal pages render without shell sidebar
  if (
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/terms' ||
    location.pathname === '/privacy'
  ) {
    return (
      <main id="main" tabIndex={-1} className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {children}
      </main>
    );
  }

  // Not logged in -> redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSwitchAccount = (targetUser: StoredUser) => {
    const updated = switchAccount(targetUser.id);
    setUser(updated);
    setShowAccountModal(false);
    if (updated.role === 'candidate') {
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
      'group relative flex min-h-11 items-center gap-3 overflow-hidden rounded-[var(--radius-md)] px-3 text-sm font-medium transition-all duration-200 ease-out-expo',
      'before:absolute before:left-0 before:top-1/2 before:h-0 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-brand-600 before:transition-all before:duration-300 hover:before:h-6',
      isActive
  ? 'bg-brand-50 text-brand-800 font-semibold dark:bg-brand-950/30 dark:text-brand-300 shadow-sm before:h-6'
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
          <I className="nav-glyph h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-white p-1 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                <img
                  src="/logo.png"
                  alt="RecruLens Logo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
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

          {/* Authenticated User Account Card */}
          <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50/80 p-3 dark:border-neutral-800 dark:bg-neutral-800/60">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                user.role === 'recruiter'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}>
                {user.role === 'recruiter' ? (
                  <>
                    <ShieldCheck className="h-3 w-3" /> Recruiter
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3 w-3" /> Candidate
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={() => setShowAccountModal(true)}
                className="text-[11px] font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Switch Account
              </button>
            </div>
            <div className="mt-2">
              <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
            </div>
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white p-0.5 shadow-xs dark:border-neutral-700 dark:bg-neutral-800">
            <img
              src="/logo.png"
              alt="RecruLens Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="font-display text-base font-bold text-neutral-900 dark:text-white">
            {APP_NAME}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            aria-label="Sign out"
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
      <main id="main" tabIndex={-1} className="mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <ScrollProgress />
        {children}
      </main>

      {/* Real Account Switcher Modal */}
      {showAccountModal && (
        <Modal
          open={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          title="Switch Authenticated Account"
        >
          <div className="space-y-4 text-xs">
            <p className="text-neutral-500">
              Select an account to sign in as, or go to the login screen to authenticate with different credentials.
            </p>

            <div className="space-y-2">
              {getStoredUsers().map((acc) => {
                const isCurrent = acc.email === user.email;
                return (
                  <div
                    key={acc.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50/40 dark:border-blue-700 dark:bg-blue-950/20'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                        {acc.name}
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">(Current)</span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500">{acc.email}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        acc.role === 'recruiter'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {acc.role}
                      </span>
                      {!isCurrent && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSwitchAccount(acc)}
                          className="text-xs"
                        >
                          Sign In
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAccountModal(false);
                  logoutUser();
                  navigate('/login');
                }}
                className="text-xs text-rose-600 hover:text-rose-700"
              >
                Log Out to Login Screen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAccountModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

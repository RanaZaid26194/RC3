import { load, save, uid } from './storage';
import type { User, UserRole } from '@/types';

const AUTH_USER_KEY = 'auth:current_user';
const USERS_KEY = 'auth:users';

export interface StoredUser extends User {
  passwordHash: string;
}

// Simple deterministic hash for browser environment
export function hashPassword(password: string): string {
  let hash = 0;
  const salted = password + ':recrulens_salt_2026';
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

export const DEFAULT_RECRUITER: StoredUser = {
  id: 'usr_recruiter_1',
  name: 'Sarah Jenkins',
  email: 'recruiter@recrulens.ai',
  role: 'recruiter',
  passwordHash: hashPassword('password123'),
};

export const DEFAULT_CANDIDATE: StoredUser = {
  id: 'cand_1',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  role: 'candidate',
  passwordHash: hashPassword('password123'),
};

export function getStoredUsers(): StoredUser[] {
  return load<StoredUser[]>(USERS_KEY, [DEFAULT_RECRUITER, DEFAULT_CANDIDATE]);
}

export function switchAccount(targetUserId: string): User {
  const users = getStoredUsers();
  const target = users.find((u) => u.id === targetUserId);
  if (!target) throw new Error('Account not found');
  const sessionUser: User = {
    id: target.id,
    name: target.name,
    email: target.email,
    role: target.role,
    avatar: target.avatar,
  };
  setCurrentUser(sessionUser);
  return sessionUser;
}

export function getCurrentUser(): User | null {
  return load<User | null>(AUTH_USER_KEY, DEFAULT_RECRUITER);
}

export function setCurrentUser(user: User | null): void {
  save(AUTH_USER_KEY, user);
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function registerUser(name: string, email: string, role: UserRole, password: string): User {
  if (!name.trim()) throw new Error('Full name is required.');
  if (!email.trim() || !email.includes('@')) throw new Error('A valid email address is required.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters long.');

  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const newUser: StoredUser = {
    id: uid('usr'),
    name: name.trim(),
    email: normalizedEmail,
    role,
    passwordHash: hashPassword(password),
  };

  users.push(newUser);
  if (!save(USERS_KEY, users)) {
    throw new Error('Could not save the account in this browser (storage unavailable). Export a backup or allow site storage and try again.');
  }

  const sessionUser: User = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    avatar: newUser.avatar,
  };

  setCurrentUser(sessionUser);
  return sessionUser;
}

export function loginUser(email: string, password: string): User {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error('No user account found matching that email.');
  }

  const inputHash = hashPassword(password);
  if (user.passwordHash && user.passwordHash !== inputHash) {
    throw new Error('Incorrect password. Please try again.');
  }

  const sessionUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };

  setCurrentUser(sessionUser);
  return sessionUser;
}

export function switchRole(role: UserRole): User {
  const user = role === 'recruiter' ? DEFAULT_RECRUITER : DEFAULT_CANDIDATE;
  const sessionUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };
  setCurrentUser(sessionUser);
  return sessionUser;
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const users = getStoredUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized);
}

export function resetPassword(email: string, newPassword: string): void {
  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }
  const users = getStoredUsers();
  const normalized = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalized);
  if (!user) {
    throw new Error('No user account found matching that email.');
  }
  user.passwordHash = hashPassword(newPassword);
  save(USERS_KEY, users);
}

export function logoutUser(): void {
  setCurrentUser(null);
}

export interface AccountBackup {
  exportedAt: string;
  accounts: StoredUser[];
}

/** Accounts are browser-local. This JSON file is how they move to another machine. */
export function exportAccounts(): string {
  const backup: AccountBackup = {
    exportedAt: new Date().toISOString(),
    accounts: getStoredUsers(),
  };
  return JSON.stringify(backup, null, 2);
}

function isValidStoredUser(value: unknown): value is StoredUser {
  if (!value || typeof value !== 'object') return false;
  const u = value as Record<string, unknown>;
  return (
    typeof u.id === 'string' &&
    typeof u.name === 'string' &&
    typeof u.email === 'string' &&
    u.email.includes('@') &&
    (u.role === 'recruiter' || u.role === 'candidate') &&
    typeof u.passwordHash === 'string' &&
    u.passwordHash.length > 0
  );
}

export function importAccounts(raw: string): { added: number; updated: number; total: number } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  const candidateList = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as AccountBackup).accounts)
    ? (parsed as AccountBackup).accounts
    : null;
  if (!candidateList) throw new Error('No account list found in that file.');

  const incoming = candidateList.filter(isValidStoredUser);
  if (incoming.length === 0) throw new Error('No valid accounts found in that file.');

  const users = getStoredUsers();
  let added = 0;
  let updated = 0;

  incoming.forEach((account) => {
    const normalizedEmail = account.email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    const clean: StoredUser = {
      ...account,
      email: normalizedEmail,
      name: account.name.trim(),
    };
    if (existing) {
      Object.assign(existing, clean);
      updated += 1;
    } else {
      users.push(clean);
      added += 1;
    }
  });

  if (!save(USERS_KEY, users)) {
    throw new Error('Could not write accounts to this browser storage.');
  }

  return { added, updated, total: users.length };
}

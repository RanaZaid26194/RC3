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
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
};

export const DEFAULT_CANDIDATE: StoredUser = {
  id: 'cand_1',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  role: 'candidate',
  passwordHash: hashPassword('password123'),
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
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
  save(USERS_KEY, users);

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

export function logoutUser(): void {
  setCurrentUser(null);
}

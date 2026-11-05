import { load, save, uid } from './storage';
import type { User, UserRole } from '@/types';

const AUTH_USER_KEY = 'auth:current_user';
const USERS_KEY = 'auth:users';

export const DEFAULT_RECRUITER: User = {
  id: 'usr_recruiter_1',
  name: 'Sarah Jenkins',
  email: 'recruiter@recrulens.ai',
  role: 'recruiter',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
};

export const DEFAULT_CANDIDATE: User = {
  id: 'cand_1',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  role: 'candidate',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
};

export function getCurrentUser(): User {
  return load<User>(AUTH_USER_KEY, DEFAULT_RECRUITER);
}

export function setCurrentUser(user: User): void {
  save(AUTH_USER_KEY, user);
}

export function switchRole(role: UserRole): User {
  const user = role === 'recruiter' ? DEFAULT_RECRUITER : DEFAULT_CANDIDATE;
  setCurrentUser(user);
  return user;
}

export function registerUser(name: string, email: string, role: UserRole, _password: string): User {
  const users = load<User[]>(USERS_KEY, [DEFAULT_RECRUITER, DEFAULT_CANDIDATE]);
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('User with this email already exists.');
  }

  const newUser: User = {
    id: uid('usr'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
  };

  users.push(newUser);
  save(USERS_KEY, users);
  setCurrentUser(newUser);
  return newUser;
}

export function loginUser(email: string, _password: string, role?: UserRole): User {
  const users = load<User[]>(USERS_KEY, [DEFAULT_RECRUITER, DEFAULT_CANDIDATE]);
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (user) {
    setCurrentUser(user);
    return user;
  }
  // Fallback demo quick login
  const fallback = role === 'candidate' ? DEFAULT_CANDIDATE : DEFAULT_RECRUITER;
  setCurrentUser(fallback);
  return fallback;
}

export function logoutUser(): void {
  setCurrentUser(DEFAULT_RECRUITER);
}

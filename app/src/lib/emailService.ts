import { load, save } from './storage';

// Rate limiting storage
const RATE_LIMIT_KEY = 'password_reset:rate_limit';
const CODE_STORAGE_KEY = 'password_reset:verification_codes';

export interface PasswordResetRequest {
  id: string;
  email: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  lastAttemptAt: number;
}

export interface RateLimitData {
  email: string;
  count: number;
  lastRequestAt: number;
}

// Configuration
const CODE_LENGTH = 6;
const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 3;

// Generate secure random 6-digit code
export function generateVerificationCode(): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}

// Check rate limit for email
export function checkRateLimit(email: string): { allowed: boolean; remaining: number; retryAfterMs?: number } {
  const rateLimits = load<RateLimitData[]>(RATE_LIMIT_KEY, []);
  const now = Date.now();
  
  // Clean old entries and find current email's data
  const cleanLimits = rateLimits.filter(l => now - l.lastRequestAt < RATE_LIMIT_WINDOW_MS);
  const userLimit = cleanLimits.find(l => l.email === email.toLowerCase());
  
  // Save cleaned data
  save(RATE_LIMIT_KEY, cleanLimits);
  
  if (!userLimit) {
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW };
  }
  
  const remaining = MAX_REQUESTS_PER_WINDOW - userLimit.count;
  
  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    const timeSinceLast = now - userLimit.lastRequestAt;
    const retryAfter = RATE_LIMIT_WINDOW_MS - timeSinceLast;
    return { allowed: false, remaining: 0, retryAfterMs: retryAfter };
  }
  
  return { allowed: true, remaining };
}

// Increment rate limit counter
export function incrementRateLimit(email: string): void {
  const rateLimits = load<RateLimitData[]>(RATE_LIMIT_KEY, []);
  const now = Date.now();
  
  // Clean old entries
  const cleanLimits = rateLimits.filter(l => now - l.lastRequestAt < RATE_LIMIT_WINDOW_MS);
  
  // Update or create entry
  const existingIndex = cleanLimits.findIndex(l => l.email === email.toLowerCase());
  if (existingIndex >= 0) {
    cleanLimits[existingIndex] = { 
      email: email.toLowerCase(), 
      count: cleanLimits[existingIndex].count + 1,
      lastRequestAt: now 
    };
  } else {
    cleanLimits.push({ email: email.toLowerCase(), count: 1, lastRequestAt: now });
  }
  
  save(RATE_LIMIT_KEY, cleanLimits);
}

// Save verification code
export function saveVerificationCode(request: PasswordResetRequest): void {
  const codes = load<PasswordResetRequest[]>(CODE_STORAGE_KEY, []);
  
  // Remove existing code for this email
  const filtered = codes.filter(c => c.email !== request.email.toLowerCase());
  filtered.push(request);
  
  save(CODE_STORAGE_KEY, filtered);
}

// Get active verification code by email
export function getActiveVerificationCode(email: string): PasswordResetRequest | null {
  const codes = load<PasswordResetRequest[]>(CODE_STORAGE_KEY, []);
  const now = Date.now();
  
  // Find non-expired code for this email
  const validCode = codes.find(c => 
    c.email.toLowerCase() === email.toLowerCase() && 
    c.expiresAt > now
  );
  
  return validCode || null;
}

// Attempt to verify code
export function attemptCodeVerification(email: string, enteredCode: string): {
  success: boolean;
  message: string;
  error?: string;
} {
  const request = getActiveVerificationCode(email);
  
  if (!request) {
    return { 
      success: false, 
      message: 'No verification code found. Please request a new one.',
      error: 'NO_CODE_FOUND'
    };
  }
  
  const now = Date.now();
  
  // Check if expired
  if (now > request.expiresAt) {
    return {
      success: false,
      message: 'This verification code has expired. Please request a new one.',
      error: 'CODE_EXPIRED'
    };
  }
  
  // Check max attempts
  if (request.attempts >= MAX_ATTEMPTS) {
    return {
      success: false,
      message: 'Maximum verification attempts reached. Please request a new code.',
      error: 'MAX_ATTEMPTS_REACHED'
    };
  }
  
  // Verify code
  if (enteredCode.trim() !== request.code) {
    // Increment attempts
    request.attempts += 1;
    request.lastAttemptAt = now;
    saveVerificationCode(request);
    
    const remainingAttempts = MAX_ATTEMPTS - request.attempts;
    return {
      success: false,
      message: `Incorrect code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
      error: 'INVALID_CODE'
    };
  }
  
  // Code verified successfully - delete it
  const codes = load<PasswordResetRequest[]>(CODE_STORAGE_KEY, []);
  const filtered = codes.filter(c => c.id !== request.id);
  save(CODE_STORAGE_KEY, filtered);
  
  return { success: true, message: 'Verification successful!' };
}

// Clean expired codes
export function cleanupExpiredCodes(): void {
  const codes = load<PasswordResetRequest[]>(CODE_STORAGE_KEY, []);
  const now = Date.now();
  const validCodes = codes.filter(c => c.expiresAt > now);
  
  if (validCodes.length !== codes.length) {
    save(CODE_STORAGE_KEY, validCodes);
  }
}

// Send email (simulated for offline demo)
export function sendPasswordResetEmail(email: string, code: string): { sent: boolean; debug?: string } {
  // In production, use EmailJS, SendGrid, AWS SES, etc.
  // For offline demo, we simulate sending
  
  // Log for development/debugging
  console.log('=== PASSWORD RESET EMAIL SIMULATION ===');
  console.log(`To: ${email}`);
  console.log(`Verification Code: ${code}`);
  console.log(`Expires in: ${CODE_EXPIRY_MS / 1000 / 60} minutes`);
  console.log('=====================================\n');
  
  // Store for quick reference (remove in production!)
  const debugEmails = load<string[]>('password_reset:debug_emails', []);
  if (!debugEmails.find(e => e.includes(email))) {
    debugEmails.push(`${email} → ${code}`);
    save('password_reset:debug_emails', debugEmails.slice(-10)); // Keep last 10
  }
  
  return { sent: true, debug: `For demo: Code ${code} sent to ${email}` };
}

// Initialize
cleanupExpiredCodes();

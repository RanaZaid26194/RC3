// Tiny validation helpers. Return an error string or '' when valid.
export const required = (v: string, label = 'This field') => (v.trim() ? '' : `${label} is required`);
export const minLen = (v: string, n: number, label = 'This field') => (v.trim().length >= n ? '' : `${label} must be at least ${n} characters`);
export const email = (v: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address');
export const positiveNumber = (v: string | number, label = 'Value') => (Number(v) > 0 ? '' : `${label} must be greater than 0`);
export const firstError = (...errs: string[]) => errs.find(Boolean) ?? '';

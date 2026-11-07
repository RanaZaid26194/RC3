import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'recrulens_theme';

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark');

  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }
}

export function setTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }));
}

/**
 * React hook for consuming and updating theme
 */
export function useTheme() {
  const [theme, setLocalTheme] = useState<Theme>(() => getTheme());
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const t = getTheme();
    return t === 'system' ? getSystemTheme() : t;
  });

  useEffect(() => {
    const update = () => {
      const current = getTheme();
      setLocalTheme(current);
      const effective = current === 'system' ? getSystemTheme() : current;
      setResolvedTheme(effective);
      applyTheme(current);
    };

    update();

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>;
      setLocalTheme(customEvent.detail);
      const effective = customEvent.detail === 'system' ? getSystemTheme() : customEvent.detail;
      setResolvedTheme(effective);
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if (getTheme() === 'system') {
        update();
      }
    };

    window.addEventListener('theme-change', handleThemeChange);
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setLocalTheme(newTheme);
    setResolvedTheme(newTheme === 'system' ? getSystemTheme() : newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme: changeTheme,
  };
}

// Immediately apply theme on script load
if (typeof window !== 'undefined') {
  applyTheme(getTheme());
}

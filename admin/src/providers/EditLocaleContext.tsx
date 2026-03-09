import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

interface EditLocaleContextValue {
  locale: string;
  setLocale: (locale: string) => void;
}

const EditLocaleContext = createContext<EditLocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
});

/**
 * Module-level ref so the httpClient wrapper can read the current locale
 * without needing React context access.
 */
let currentEditLocale = 'en';

export function getCurrentEditLocale(): string {
  return currentEditLocale;
}

interface EditLocaleProviderProps {
  defaultLocale?: string;
  children: ReactNode;
}

/**
 * Provides the content editing locale.
 * Always initializes to the app's default locale (from API settings).
 * Completely independent from the UI language (topbar toggle).
 */
export function EditLocaleProvider({ defaultLocale = 'en', children }: EditLocaleProviderProps) {
  const [locale, setLocaleState] = useState(() => {
    currentEditLocale = defaultLocale;
    return defaultLocale;
  });

  const setLocale = useCallback((newLocale: string) => {
    currentEditLocale = newLocale;
    setLocaleState(newLocale);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <EditLocaleContext.Provider value={value}>
      {children}
    </EditLocaleContext.Provider>
  );
}

export function useEditLocale() {
  return useContext(EditLocaleContext);
}

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

const LOCALE_STORAGE_KEY = 'psyched_edit_locale';

interface EditLocaleProviderProps {
  defaultLocale?: string;
  children: ReactNode;
}

export function EditLocaleProvider({ defaultLocale = 'en', children }: EditLocaleProviderProps) {
  const [locale, setLocaleState] = useState(() => {
    // Check localStorage for a previously saved preference
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    const initial = stored ?? defaultLocale;
    currentEditLocale = initial;
    return initial;
  });

  const setLocale = useCallback((newLocale: string) => {
    currentEditLocale = newLocale;
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
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

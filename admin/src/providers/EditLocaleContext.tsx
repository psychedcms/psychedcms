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
 * Get the user's preferred language.
 * Reads from react-admin's store (RaStore.locale), falling back to the app default.
 */
function getPreferredLocale(defaultLocale: string): string {
  try {
    const raStored = localStorage.getItem('RaStore.locale');
    if (raStored) {
      // RA store values are JSON-encoded
      return JSON.parse(raStored) as string;
    }
  } catch {
    // ignore parse errors
  }
  return defaultLocale;
}

export function EditLocaleProvider({ defaultLocale = 'en', children }: EditLocaleProviderProps) {
  const [locale, setLocaleState] = useState(() => {
    const initial = getPreferredLocale(defaultLocale);
    currentEditLocale = initial;
    return initial;
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

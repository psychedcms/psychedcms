import { useEffect, useState } from 'react';

export interface LocaleSettings {
  defaultLocale: string;
  supportedLocales: string[];
}

const entrypoint = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Fetches global locale settings from the API.
 * Returns default values while loading.
 */
export function useLocaleSettings(): LocaleSettings & { loading: boolean } {
  const [settings, setSettings] = useState<LocaleSettings>({
    defaultLocale: 'en',
    supportedLocales: ['en'],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${entrypoint}/locale-settings`)
      .then((res) => res.json())
      .then((data: LocaleSettings) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { ...settings, loading };
}

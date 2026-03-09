import { useEffect, useState, useCallback } from 'react';

export interface LocaleSettings {
  defaultLocale: string;
  supportedLocales: string[];
}

const entrypoint = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Fetches global locale settings from the API.
 * Returns default values while loading.
 * Provides a reload function to refresh after settings are updated.
 */
export function useLocaleSettings(): LocaleSettings & { loading: boolean; reload: () => void } {
  const [settings, setSettings] = useState<LocaleSettings>({
    defaultLocale: 'en',
    supportedLocales: ['en'],
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(() => {
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

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { ...settings, loading, reload: fetchSettings };
}

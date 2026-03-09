import { fetchHydra } from '@api-platform/admin';
import { getCurrentEditLocale } from './EditLocaleContext.tsx';
import type { HttpClientOptions, HydraHttpClientResponse } from '@api-platform/admin';

/**
 * Wraps fetchHydra to add Accept-Language header based on the current editing locale.
 */
export function localeHttpClient(
  url: URL,
  options: HttpClientOptions = {},
): Promise<HydraHttpClientResponse> {
  const locale = getCurrentEditLocale();
  const headers = options.headers instanceof Headers
    ? options.headers
    : new Headers(options.headers as HeadersInit | undefined);

  headers.set('Accept-Language', locale);

  return fetchHydra(url, { ...options, headers });
}

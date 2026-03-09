import { useEffect, useState, useMemo } from 'react';
import { HydraAdmin, hydraDataProvider, ResourceGuesser } from '@api-platform/admin';
import { CustomRoutes } from 'react-admin';
import type { Resource } from '@api-platform/api-doc-parser';

import { freezeRegistry, AppWrapperSlot, renderSettingsRoutes } from '@psychedcms/admin-core';

// Register plugins — side-effect imports trigger registerPlugin()
import '@psychedcms/admin-translatable';
import { useLocaleSettings, getCurrentEditLocale } from '@psychedcms/admin-translatable';

import { PsychedSchemaProvider } from './providers/PsychedSchemaProvider.tsx';
import { createI18nProvider } from './providers/i18nProvider.ts';
import { PsychedLayout } from './components/layout/index.ts';
import { PsychedCreateGuesser, PsychedEditGuesser, PsychedShowGuesser, PsychedListGuesser, TaxonomyList, GenreList, GenreCreate, GenreEdit, MediaList, MediaEdit } from './components/forms/index.ts';

import { fetchHydra } from '@api-platform/admin';
import type { HttpClientOptions, HydraHttpClientResponse } from '@api-platform/admin';

// Freeze registry before any rendering
freezeRegistry();

const entrypoint = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Read the UI locale from react-admin's store (set by the app bar toggle).
function getUiLocale(): string {
  try {
    const stored = localStorage.getItem('RaStore.locale');
    if (stored) return JSON.parse(stored) as string;
  } catch { /* ignore */ }
  return 'fr';
}

// Build the HTTP client by composing plugin middleware over fetchHydra.
// - Detail requests (edit/show): use the content editing locale, no fallback
// - Collection requests (lists): use the UI locale, with fallback
function localeHttpClient(
  url: URL,
  options: HttpClientOptions = {},
): Promise<HydraHttpClientResponse> {
  const headers = options.headers instanceof Headers
    ? options.headers
    : new Headers(options.headers as HeadersInit | undefined);

  // Detail = /api/{resource}/{id} where the last segment is a numeric or UUID id
  const segments = url.pathname.replace(/\/$/, '').split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? '';
  const isDetail = segments.length >= 3 && segments[0] === 'api'
    && /^[\da-f-]+$/i.test(lastSegment);

  if (isDetail) {
    headers.set('Accept-Language', getCurrentEditLocale());
    headers.set('X-No-Translation-Fallback', '1');
  } else {
    headers.set('Accept-Language', getUiLocale());
  }

  return fetchHydra(url, { ...options, headers });
}

const dataProvider = hydraDataProvider({
  entrypoint,
  httpClient: localeHttpClient,
});

/**
 * Custom component that renders resources with our custom Create/Edit guessers.
 * Uses HydraAdmin's dataProvider introspection to discover resources dynamically.
 */
function PsychedAdmin({ i18nProvider }: { i18nProvider: ReturnType<typeof createI18nProvider> }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataProvider
      .introspect()
      .then(({ data }) => {
        setResources(data.resources ?? []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to introspect API:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return null;
  }

  if (resources.length === 0) {
    return <HydraAdmin entrypoint={entrypoint} dataProvider={dataProvider} i18nProvider={i18nProvider} layout={PsychedLayout} />;
  }

  return (
    <HydraAdmin entrypoint={entrypoint} dataProvider={dataProvider} i18nProvider={i18nProvider} layout={PsychedLayout}>
      {resources
        .filter((r) => !r.deprecated)
        .map((resource) => (
          <ResourceGuesser
            key={resource.name}
            name={resource.name}
            list={PsychedListGuesser}
            show={PsychedShowGuesser}
            create={PsychedCreateGuesser}
            edit={PsychedEditGuesser}
            {...(resource.name === 'taxonomies' ? { list: TaxonomyList, recordRepresentation: 'name' } : {})}
            {...(resource.name === 'genres' ? { list: GenreList, create: GenreCreate, edit: GenreEdit, recordRepresentation: 'taxonomyLabel' } : {})}
            {...(resource.name === 'media' ? { list: MediaList, edit: MediaEdit, recordRepresentation: 'originalFilename' } : {})}
            {...(resource.name === 'users' ? { recordRepresentation: 'email' } : {})}
          />
        ))}
      <CustomRoutes>
        {renderSettingsRoutes()}
      </CustomRoutes>
    </HydraAdmin>
  );
}

function App() {
  const { defaultLocale, loading } = useLocaleSettings();

  // Create i18n provider with the user's preferred UI locale (from RA store or API default)
  const i18nProvider = useMemo(() => {
    let uiLocale = defaultLocale;
    try {
      const stored = localStorage.getItem('RaStore.locale');
      if (stored) uiLocale = JSON.parse(stored) as string;
    } catch { /* ignore */ }
    return createI18nProvider(uiLocale);
  }, [defaultLocale]);

  if (loading) {
    return null;
  }

  return (
    <PsychedSchemaProvider entrypoint={entrypoint}>
      <AppWrapperSlot>
        <PsychedAdmin i18nProvider={i18nProvider} />
      </AppWrapperSlot>
    </PsychedSchemaProvider>
  );
}

export default App;

import { useEffect, useState, useMemo } from 'react';
import { HydraAdmin, hydraDataProvider, ResourceGuesser } from '@api-platform/admin';
import { CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import type { Resource } from '@api-platform/api-doc-parser';

import { PsychedSchemaProvider } from './providers/PsychedSchemaProvider.tsx';
import { EditLocaleProvider } from './providers/EditLocaleContext.tsx';
import { localeHttpClient } from './providers/localeHttpClient.ts';
import { useLocaleSettings } from './hooks/useLocaleSettings.ts';
import { createI18nProvider } from './providers/i18nProvider.ts';
import { PsychedLayout } from './components/layout/index.ts';
import { GlobalSettings, PreferencesSettings } from './components/settings/index.ts';
import { PsychedCreateGuesser, PsychedEditGuesser, PsychedShowGuesser, PsychedListGuesser, TaxonomyList, GenreList, GenreCreate, GenreEdit, MediaList, MediaEdit } from './components/forms/index.ts';

const entrypoint = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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
        <Route path="/settings/global" element={<GlobalSettings />} />
        <Route path="/settings/preferences" element={<PreferencesSettings />} />
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
      <EditLocaleProvider defaultLocale={defaultLocale}>
        <PsychedAdmin i18nProvider={i18nProvider} />
      </EditLocaleProvider>
    </PsychedSchemaProvider>
  );
}

export default App;

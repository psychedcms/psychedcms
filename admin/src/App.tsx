import { useEffect, useState } from 'react';
import { HydraAdmin, hydraDataProvider, ResourceGuesser } from '@api-platform/admin';
import type { Resource } from '@api-platform/api-doc-parser';

import { PsychedSchemaProvider } from './providers/PsychedSchemaProvider.tsx';
import { PsychedLayout } from './components/layout/index.ts';
import { PsychedCreateGuesser, PsychedEditGuesser, PsychedListGuesser } from './components/forms/index.ts';

const entrypoint = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Custom component that renders resources with our custom Create/Edit guessers.
 * Uses HydraAdmin's dataProvider introspection to discover resources dynamically.
 */
function PsychedAdmin() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataProvider = hydraDataProvider({ entrypoint });

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
    return <HydraAdmin entrypoint={entrypoint} layout={PsychedLayout} />;
  }

  return (
    <HydraAdmin entrypoint={entrypoint} layout={PsychedLayout}>
      {resources
        .filter((r) => !r.deprecated)
        .map((resource) => (
          <ResourceGuesser
            key={resource.name}
            name={resource.name}
            list={PsychedListGuesser}
            create={PsychedCreateGuesser}
            edit={PsychedEditGuesser}
          />
        ))}
    </HydraAdmin>
  );
}

function App() {
  return (
    <PsychedSchemaProvider entrypoint={entrypoint}>
      <PsychedAdmin />
    </PsychedSchemaProvider>
  );
}

export default App;

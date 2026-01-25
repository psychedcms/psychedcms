import { HydraAdmin } from "@api-platform/admin";

import { PsychedSchemaProvider } from "./providers/PsychedSchemaProvider.tsx";
import { PsychedLayout } from "./components/layout/index.ts";

const entrypoint = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function App() {
  return (
    <PsychedSchemaProvider entrypoint={entrypoint}>
      <HydraAdmin entrypoint={entrypoint} layout={PsychedLayout} />
    </PsychedSchemaProvider>
  );
}

export default App;

import { HydraAdmin } from "@api-platform/admin";

const entrypoint = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function App() {
  return <HydraAdmin entrypoint={entrypoint} />;
}

export default App;

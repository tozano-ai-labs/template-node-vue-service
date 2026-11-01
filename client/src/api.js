const HEALTH_PATH = "/api/health";

export async function fetchHealth(fetchImpl = globalThis.fetch) {
  const response = await fetchImpl(HEALTH_PATH);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

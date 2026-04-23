// Endpoint de santé pour vérifier que les Netlify Functions tournent.
// curl https://<site>.netlify.app/api/ping
//   → { ok: true, runtime, blobs: "available" | "unavailable" }

import { getStore } from "@netlify/blobs";

export default async () => {
  let blobs = "unknown";
  let blobsError: string | undefined;
  try {
    const store = getStore("rutas-piratas");
    // Test de lecture léger pour vérifier que les Blobs sont accessibles.
    await store.get("__ping__");
    blobs = "available";
  } catch (err: any) {
    blobs = "unavailable";
    blobsError = String(err?.message || err);
  }

  return new Response(
    JSON.stringify({
      ok: true,
      now: new Date().toISOString(),
      runtime: `node ${process.versions.node}`,
      blobs,
      blobsError,
    }, null, 2),
    {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    }
  );
};

export const config = {
  path: "/api/ping",
};

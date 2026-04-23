// Health-check : vérifie que la Function tourne et que les Blobs sont dispo.
// Accessible via /api/ping (redirect netlify.toml) ou /.netlify/functions/ping.

import { connectLambda, getStore } from "@netlify/blobs";

export const handler = async (event) => {
  let blobs = "unknown";
  let blobsError;
  try {
    connectLambda(event);
    const store = getStore("rutas-piratas");
    await store.get("__ping__");
    blobs = "available";
  } catch (err) {
    blobs = "unavailable";
    blobsError = String(err?.message || err);
  }

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
    body: JSON.stringify(
      {
        ok: true,
        now: new Date().toISOString(),
        runtime: `node ${process.versions.node}`,
        blobs,
        blobsError,
      },
      null,
      2
    ),
  };
};

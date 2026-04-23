// Backend partagé pour les randonnées (Netlify Function, handler classique).
// - GET  /.netlify/functions/data  → { hikes, regs }
// - POST /.netlify/functions/data  → sauvegarde (header x-admin-pwd requis)
// La route publique /api/data est gérée par le redirect dans netlify.toml.

import { getStore } from "@netlify/blobs";

const STORE_NAME = "rutas-piratas";
const KEY = "data";
const ADMIN_PWD = "piratas2024";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-admin-pwd",
};

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "content-type": "application/json",
    "cache-control": "no-store",
    ...CORS,
  },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  try {
    const method = (event.httpMethod || "").toUpperCase();
    if (method === "OPTIONS") {
      return { statusCode: 204, headers: CORS, body: "" };
    }

    const store = getStore(STORE_NAME);

    if (method === "GET") {
      const raw = await store.get(KEY, { type: "json" });
      return json(200, raw ?? { hikes: [], regs: {} });
    }

    if (method === "POST") {
      const pwd =
        event.headers?.["x-admin-pwd"] ||
        event.headers?.["X-Admin-Pwd"] ||
        "";
      if (pwd !== ADMIN_PWD) {
        return json(401, { error: "unauthorized" });
      }
      let body;
      try {
        body = JSON.parse(event.body || "{}");
      } catch {
        return json(400, { error: "invalid json" });
      }
      if (!body || typeof body !== "object") {
        return json(400, { error: "body must be an object" });
      }
      const { hikes, regs } = body;
      if (!Array.isArray(hikes) || typeof regs !== "object" || regs === null) {
        return json(400, { error: "expected { hikes: [], regs: {} }" });
      }
      await store.setJSON(KEY, { hikes, regs });
      return json(200, { ok: true });
    }

    return json(405, { error: "method not allowed" });
  } catch (err) {
    console.error("[data] fatal:", err);
    return json(500, {
      error: "server error",
      message: String(err?.message || err),
      name: err?.name,
    });
  }
};

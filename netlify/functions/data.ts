import { getStore } from "@netlify/blobs";

// Netlify Function qui sert de backend pour les randonnées partagées.
// - GET  /api/data  → renvoie { hikes, regs } depuis Netlify Blobs
// - POST /api/data  → sauvegarde { hikes, regs } (header x-admin-pwd requis)
//
// Le stockage est persistant, partagé entre tous les utilisateurs du site,
// et survit aux redéploiements.

const STORE_NAME = "rutas-piratas";
const KEY = "data";
const ADMIN_PWD = "piratas2024"; // même mot de passe que côté client

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type, x-admin-pwd",
    },
  });

export default async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return json(204, null);

    const store = getStore(STORE_NAME);

    if (req.method === "GET") {
      const raw = await store.get(KEY, { type: "json" });
      return json(200, raw ?? { hikes: [], regs: {} });
    }

    if (req.method === "POST") {
      const pwd = req.headers.get("x-admin-pwd");
      if (pwd !== ADMIN_PWD) {
        return json(401, { error: "unauthorized" });
      }
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return json(400, { error: "invalid json" });
      }
      if (!body || typeof body !== "object") {
        return json(400, { error: "body must be an object" });
      }
      const { hikes, regs } = body as { hikes?: unknown; regs?: unknown };
      if (!Array.isArray(hikes) || typeof regs !== "object" || regs === null) {
        return json(400, { error: "expected { hikes: [], regs: {} }" });
      }
      await store.setJSON(KEY, { hikes, regs });
      return json(200, { ok: true });
    }

    return json(405, { error: "method not allowed" });
  } catch (err: any) {
    // Log côté Netlify + réponse lisible côté client
    console.error("[data] fatal:", err);
    return json(500, {
      error: "server error",
      message: String(err?.message || err),
      name: err?.name,
    });
  }
};

export const config = {
  path: "/api/data",
};

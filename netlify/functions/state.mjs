import { getStore } from "@netlify/blobs";

const KEY = "guild-state";
const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const store = getStore("guild");

  if (req.method === "GET") {
    try {
      const value = await store.get(KEY, { type: "json" });
      return new Response(JSON.stringify(value || null), {
        status: 200,
        headers: CORS_HEADERS,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "read_failed", detail: String(err) }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();

      // basic shape check so a bad payload can't wipe out the guild state
      if (!body || typeof body !== "object" || !Array.isArray(body.members)) {
        return new Response(JSON.stringify({ error: "invalid_payload" }), {
          status: 400,
          headers: CORS_HEADERS,
        });
      }

      await store.setJSON(KEY, body);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: CORS_HEADERS,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "write_failed", detail: String(err) }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }
  }

  return new Response(JSON.stringify({ error: "method_not_allowed" }), {
    status: 405,
    headers: CORS_HEADERS,
  });
};

export const config = {
  path: "/api/state",
};

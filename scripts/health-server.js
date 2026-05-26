#!/usr/bin/env bun

// ClineBox Health Server
// Lightweight health endpoint for container health checks.
// Uses Bun's built-in HTTP server.

const PORT = 8788;

Bun.serve({
  hostname: "127.0.0.1",
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({ ok: true, service: "clinebox" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Health server listening on http://127.0.0.1:${PORT}/health`);

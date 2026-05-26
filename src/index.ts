// ClineBox Worker Entrypoint
// Routes requests to appropriate handlers.

import { ClineBox } from "./container";
import {
  Env,
  handleLanding,
  handleWizard,
  handleGatewayInfo,
  handleCreateGateway,
  handleProvision,
  handleWake,
  handleStatus,
  handleHealth,
  handleProxy,
  handleNotFound,
} from "./routes";

export { ClineBox };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Route matching
    if (path === "/" || path === "/index.html") {
      return handleLanding(request, env);
    }

    if (path === "/wizard") {
      return handleWizard(request, env);
    }

    if (path === "/api/provision" && request.method === "POST") {
      return handleProvision(request, env);
    }

    if (path === "/api/wake" && request.method === "POST") {
      return handleWake(request, env);
    }

    if (path === "/api/status") {
      return handleStatus(request, env);
    }

    if (path === "/api/gateway-info") {
      return handleGatewayInfo(request, env);
    }

    if (path === "/api/create-gateway" && request.method === "POST") {
      return handleCreateGateway(request, env);
    }

    if (path === "/api/health") {
      return handleHealth(request, env);
    }

    // Proxy route: /proxy/:port/*
    const proxyMatch = path.match(/^\/proxy\/(\d+)(?:\/(.*))?$/);
    if (proxyMatch) {
      const port = proxyMatch[1];
      return handleProxy(request, env, port);
    }

    return handleNotFound(request);
  },
};

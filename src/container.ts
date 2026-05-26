// ClineBox Durable Object (Container Lifecycle)
import { Container } from "@cloudflare/containers";
import type { Env } from "./routes";

interface ClineBoxState {
  workspaceName: string;
  template: string;
  provider: string;
  model: string;
  accountId: string;
  gatewayId: string;
  provisioned: boolean;
  containerStatus: string;
}

export class ClineBox extends Container<Env> {
  defaultPort = 8788;
  sleepAfter = "2h";

  envVars = {
    CLINEBOX_WORKSPACE: "/workspace",
  };

  private get store() {
    return (this as unknown as { ctx: { storage: DurableObjectStorage } }).ctx.storage;
  }

  async fetch(request: Request): Promise<Response> {
    const path = new URL(request.url).pathname;
    try {
      if (path === "/api/provision" && request.method === "POST") {
        return this.handleProvision(request);
      }
      if (path === "/api/wake" && request.method === "POST") {
        return this.handleWake();
      }
      if (path === "/api/status") {
        return this.handleStatus();
      }
      return this.containerFetch(request);
    } catch (err) {
      return new Response(
        JSON.stringify({ ok: false, error: (err as Error).message || "Unknown" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  private async handleProvision(request: Request): Promise<Response> {
    try {
      const body = await request.json() as Record<string, unknown>;
      const state: ClineBoxState = {
        workspaceName: (body.workspaceName as string) || "",
        template: (body.template as string) || "",
        provider: (body.provider as string) || "",
        model: (body.model as string) || "",
        accountId: (body.accountId as string) || "",
        gatewayId: (body.gatewayId as string) || "",
        provisioned: false,
        containerStatus: "provisioning",
      };
      await this.store.put("state", state);
      await this.store.put("apiKey", (body.apiKey as string) || "");
      return new Response(
        JSON.stringify({ ok: true, workspaceName: state.workspaceName, containerId: "clinebox-" + state.workspaceName, status: "provisioning" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ ok: false, error: (err as Error).message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  private async handleWake(): Promise<Response> {
    const state = await this.store.get<ClineBoxState>("state");
    if (!state) {
      return new Response(JSON.stringify({ ok: false, error: "No workspace provisioned" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    state.containerStatus = "waking";
    await this.store.put("state", state);
    try {
      const response = await this.containerFetch(new Request("http://localhost:8788/health"));
      const health = await response.json();
      state.containerStatus = "healthy";
      await this.store.put("state", state);
      return new Response(JSON.stringify({ ok: true, status: "healthy", health }), { headers: { "Content-Type": "application/json" } });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, status: "error", error: (err as Error).message }), { status: 502, headers: { "Content-Type": "application/json" } });
    }
  }

  private async handleStatus(): Promise<Response> {
    const state = await this.store.get<ClineBoxState>("state");
    if (!state) {
      return new Response(JSON.stringify({ ok: true, container: "not_provisioned" }), { headers: { "Content-Type": "application/json" } });
    }
    let containerStatus = state.containerStatus;
    try {
      const r = await this.containerFetch(new Request("http://localhost:8788/health"));
      if (r.ok) containerStatus = "healthy";
    } catch {
      containerStatus = state.containerStatus === "healthy" ? "sleeping" : state.containerStatus;
    }
    return new Response(JSON.stringify({
      ok: true, container: containerStatus, workspaceName: state.workspaceName,
      template: state.template, model: state.model, provider: state.provider, provisioned: state.provisioned,
    }), { headers: { "Content-Type": "application/json" } });
  }
}

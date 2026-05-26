// ClineBox Route Handlers
import { getGatewayUrl } from "./models";
import {
  validatePort, validateProvider, validateTemplate,
  validateAccountId, validateGatewayId, validateApiKey, validateGitRepo,
  validateWorkspaceName,
} from "./validation";

export interface Env {
  CLINEBOX: DurableObjectNamespace;
  CLINEBOX_IDLE_TIMEOUT?: string;
  CLINEBOX_ALLOW_DIRECT_MODEL_CALLS?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_AI_GATEWAY_ID?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  CLINE_API_KEY?: string;
  GITHUB_TOKEN?: string;
}

export interface ProvisionRequest {
  workspaceName: string; template: string; sizeProfile: string;
  provider: string; model: string; accountId: string;
  gatewayId: string; apiKey: string;
}

export interface StatusResponse {
  ok: boolean; worker: string; container: string;
  workspaceName?: string; template?: string; model?: string; provider?: string;
}

// ─── Landing Page ─────────────────────────────────────────────────────

export async function handleLanding(_request: Request, env: Env): Promise<Response> {
  const status = await getRuntimeStatus(env);
  const c = status.container === "healthy";
  return new Response(landingHtml(status.workspaceName, status.template, status.model, status.provider, c), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function landingHtml(ws?: string, tmpl?: string, model?: string, prov?: string, healthy = false): string {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>ClineBox</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a0f;color:#e4e4e7;display:flex;justify-content:center;padding:2rem}
.container{max-width:640px;width:100%}
h1{font-size:2rem;font-weight:600;margin-bottom:.5rem;color:#fff}
.subtitle{color:#a1a1aa;margin-bottom:2rem;font-size:.9rem}
.card{background:#18181b;border-radius:12px;padding:1.5rem;margin-bottom:1rem;border:1px solid #27272a}
.card h2{font-size:1.1rem;margin-bottom:1rem;color:#d4d4d8}
.status-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
.status-item{background:#1f1f23;border-radius:8px;padding:.75rem}
.status-label{font-size:.75rem;color:#71717a;text-transform:uppercase;letter-spacing:.05em}
.status-value{font-size:.9rem;margin-top:.25rem}
.status-ok{color:#22c55e}
.code{background:#1f1f23;padding:.75rem 1rem;border-radius:8px;font-family:monospace;font-size:.85rem;margin:.5rem 0;overflow-x:auto;color:#a1a1aa}
.btn{display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:.6rem 1.2rem;border-radius:8px;font-weight:500;font-size:.9rem;border:none;cursor:pointer}
.btn:hover{background:#2563eb}
.footer{margin-top:2rem;text-align:center;color:#52525b;font-size:.8rem}
.link{color:#3b82f6;text-decoration:none}
</style></head>
<body><div class="container">
<h1>\u25c7 ClineBox</h1><p class="subtitle">AI Coding Workspace on Cloudflare</p>
<div class="card"><h2>Status</h2><div class="status-grid">
<div class="status-item"><div class="status-label">Worker</div><div class="status-value status-ok">Healthy</div></div>
<div class="status-item"><div class="status-label">Container</div><div class="status-value${healthy?" status-ok":""}">${healthy?"Healthy":"Not Provisioned"}</div></div>
<div class="status-item"><div class="status-label">Workspace</div><div class="status-value">${ws||"\u2014"}</div></div>
<div class="status-item"><div class="status-label">Template</div><div class="status-value">${tmpl||"\u2014"}</div></div>
<div class="status-item"><div class="status-label">Model</div><div class="status-value">${model||"\u2014"}</div></div>
<div class="status-item"><div class="status-label">Provider</div><div class="status-value">${prov||"\u2014"}</div></div>
</div></div>
<div class="card"><h2>Connect to Workspace</h2><div class="code">bash scripts/clinebox-connect.sh</div><div class="code" style="margin-top:4px;font-size:.8rem">npx wrangler containers ssh clinebox</div></div>
<div class="card"><h2>Quick Start</h2><div class="code">cd /workspace<br/>cline</div></div>
<div class="card"><a href="/wizard" class="btn">Setup Workspace</a></div>
<div class="footer"><a href="https://github.com/djinn/clinebox" class="link">GitHub</a> &nbsp;\u00b7&nbsp; <a href="/api/health" class="link">Health</a> &nbsp;\u00b7&nbsp; <a href="/api/status" class="link">API Status</a></div>
</div></body></html>`;
}

// ─── API: Gateway Info ────────────────────────────────────────────────

export async function handleGatewayInfo(request: Request, env: Env): Promise<Response> {
  // Return the Cloudflare Account ID from env (auto-injected by Cloudflare)
  const accountId = env.CLOUDFLARE_ACCOUNT_ID || "";
  const gatewayId = env.CLOUDFLARE_AI_GATEWAY_ID || "";

  // Try to fetch available AI Gateways from Cloudflare API
  let gateways: Array<{ id: string; name: string }> = [];
  if (accountId) {
    try {
      const apiToken = request.headers.get("CF-Access-Client-Id") || "";
      const resp = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai-gateway/gateways`,
        {
          headers: {
            "Authorization": `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (resp.ok) {
        const data = await resp.json() as { result?: Array<{ id: string; name: string }> };
        gateways = data.result || [];
      }
    } catch {
      // Fallback: return empty list, UI will show create option
    }
  }

  return json({
    ok: true,
    accountId,
    gatewayId,
    gateways,
  });
}

// ─── API: Create Gateway ──────────────────────────────────────────────

export async function handleCreateGateway(request: Request, env: Env): Promise<Response> {
  try {
    const accountId = env.CLOUDFLARE_ACCOUNT_ID || "";
    if (!accountId) {
      return json({ ok: false, error: "Cloudflare Account ID not available" }, 400);
    }

    const body = await request.json() as { name?: string };
    const gatewayName = body.name || `clinebox-${Date.now()}`;

    const apiToken = request.headers.get("CF-Access-Client-Id") || "";

    const resp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai-gateway/gateways`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: gatewayName,
          cache: { enabled: true },
          rate_limiting: { enabled: true, limit: 1000, period: "60s" },
          logging: { enabled: true },
        }),
      }
    );

    const data = await resp.json() as { result?: { id: string; name: string }; success: boolean; errors?: Array<{ message: string }> };

    if (!resp.ok || !data.success) {
      const errMsg = data.errors?.[0]?.message || "Failed to create gateway";
      return json({ ok: false, error: errMsg }, 400);
    }

    return json({
      ok: true,
      gateway: data.result,
      message: `AI Gateway "${gatewayName}" created successfully`,
    });
  } catch (err) {
    return json({ ok: false, error: (err as Error).message || "Unknown error" }, 500);
  }
}

// ─── Wizard Page ──────────────────────────────────────────────────────

import { wizardHtml } from "./wizard";

export async function handleWizard(_request: Request, _env: Env): Promise<Response> {
  return new Response(wizardHtml(), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// ─── API: Provision ───────────────────────────────────────────────────

export async function handleProvision(request: Request, env: Env): Promise<Response> {
  try {
    const body: ProvisionRequest = await request.json();
    const validations = [
      validateWorkspaceName(body.workspaceName),
      validateTemplate(body.template),
      validateProvider(body.provider),
      validateAccountId(body.accountId),
      validateGatewayId(body.gatewayId),
      validateApiKey(body.apiKey),
    ];
    for (const v of validations) {
      if (!v.valid) {
        return json({ ok: false, status: "validation_error", error: v.error }, 400);
      }
    }
    const gatewayUrl = getGatewayUrl(body.accountId, body.gatewayId, body.provider);
    const id = env.CLINEBOX.idFromName("default");
    const stub = env.CLINEBOX.get(id);
    const msg = {
      type: "provision", workspaceName: body.workspaceName,
      template: body.template,
      provider: body.provider, model: body.model,
      accountId: body.accountId, gatewayId: body.gatewayId,
      apiKey: body.apiKey,
    };
    const doResp = await stub.fetch(new Request("http://do.internal/api/provision", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    }));
    const doResult = await doResp.json() as Record<string, unknown>;
    return json({
      ok: true, workspaceName: body.workspaceName,
      status: "provisioning", model: body.model,
      provider: body.provider, gatewayUrl: gatewayUrl || undefined,
      ...doResult,
    });
  } catch (err) {
    return json({ ok: false, status: "error", error: (err as Error).message || "Unknown" }, 500);
  }
}

// ─── API: Wake ────────────────────────────────────────────────────────

export async function handleWake(request: Request, env: Env): Promise<Response> {
  try {
    const id = env.CLINEBOX.idFromName("default");
    const stub = env.CLINEBOX.get(id);
    const resp = await stub.fetch(new Request("http://do.internal/api/wake", { method: "POST" }));
    return json(await resp.json());
  } catch (err) {
    return json({ ok: false, status: "error", error: (err as Error).message || "Unknown" }, 500);
  }
}

// ─── API: Status ──────────────────────────────────────────────────────

export async function handleStatus(_request: Request, env: Env): Promise<Response> {
  return json(await getRuntimeStatus(env));
}

// ─── API: Health ──────────────────────────────────────────────────────

export async function handleHealth(_request: Request, _env: Env): Promise<Response> {
  return json({ ok: true, service: "clinebox" });
}

// ─── API: Proxy ───────────────────────────────────────────────────────

export async function handleProxy(request: Request, env: Env, port: string): Promise<Response> {
  const portNum = parseInt(port, 10);
  const portValidation = validatePort(portNum);
  if (!portValidation.valid) {
    return json({ error: portValidation.error }, 400);
  }
  try {
    const id = env.CLINEBOX.idFromName("default");
    const stub = env.CLINEBOX.get(id);
    const proxyUrl = new URL(request.url);
    const proxyPath = proxyUrl.pathname.replace(`/proxy/${port}`, "") || "/";
    const proxyReq = new Request(`http://do.internal:${port}${proxyPath}`, {
      method: request.method, headers: request.headers, body: request.body,
    });
    return await stub.fetch(proxyReq);
  } catch (err) {
    return json({ ok: false, error: `Proxy error: ${(err as Error).message}` }, 502);
  }
}

// ─── 404 ──────────────────────────────────────────────────────────────

export async function handleNotFound(_request: Request): Promise<Response> {
  return json({ error: "Not found" }, 404);
}

// ─── Helpers ──────────────────────────────────────────────────────────

async function getRuntimeStatus(env: Env): Promise<StatusResponse> {
  try {
    const id = env.CLINEBOX.idFromName("default");
    const stub = env.CLINEBOX.get(id);
    const resp = await stub.fetch(new Request("http://do.internal/api/status", { method: "GET" }));
    const s = await resp.json() as Record<string, unknown>;
    return {
      ok: true, worker: "healthy",
      container: (s.container as string) || "not_provisioned",
      workspaceName: s.workspaceName as string | undefined,
      template: s.template as string | undefined,
      model: s.model as string | undefined,
      provider: s.provider as string | undefined,
    };
  } catch {
    return { ok: true, worker: "healthy", container: "not_provisioned" };
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status, headers: { "Content-Type": "application/json" },
  });
}


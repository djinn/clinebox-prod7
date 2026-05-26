<div align="center">

<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/djinn/clinebox">
  <img alt="Deploy to Cloudflare" src="https://camo.githubusercontent.com/aa3de9a0130879a84691a2286f5302105d5f3554c5d0af4e3f2f24174eeeea25/68747470733a2f2f6465706c6f792e776f726b6572732e636c6f7564666c6172652e636f6d2f627574746f6e" width="250">
</a>

</div>

# ClineBox

**Deploy a globally distributed AI coding workspace to Cloudflare in minutes.**

SSH in. Run Cline. Build.

No VPS. No Kubernetes. No Terraform archaeology.

> *"This is going to be mad lit."*
> — anonymous, gen alpha

---

## What Is ClineBox?

ClineBox converts **Cloudflare Containers** into disposable, AI-native development environments. It is not container hosting — it is **AI workspace orchestration**.

A few minutes after clicking the Deploy button you receive:

- A **running container** on Cloudflare's global network
- **Cline CLI** pre-installed and ready
- **AI Gateway** configured — all model traffic is logged, governed, and routed through Cloudflare
- An **optional Git repository** cloned into your workspace
- A **shell ready** to use via `wrangler containers ssh`
- **Global accessibility** through Cloudflare's edge infrastructure

### Why ClineBox?

| Problem | Solution |
|---|---|
| Setting up a dev environment takes hours | One-click deploy, ready in minutes |
| Kubernetes is overkill for a single workspace | Serverless containers, no cluster management |
| API keys leak across environments | AI Gateway centralizes all model access |
| Cold starts destroy trust | Honest provisioning UI with status feedback |
| Workspace setup is repetitive | Templates for Node.js, Python, Go, Rust, Zig |

Every model call routes through Cloudflare AI Gateway by default. Direct model calls are disabled. No container becomes its own billing leak.


## Quick Start

### 1. Click the Deploy Button

Click the **Deploy to Cloudflare** button at the top of this page. Cloudflare will ask you to log in to GitHub and fork the repository. Once forked, Cloudflare provisions a Worker, Durable Object, and Container automatically.

### 2. Complete the Setup Wizard

Open your new Worker URL. The setup wizard will ask for:

- **Cloudflare Account ID** — from your Cloudflare dashboard
- **AI Gateway ID** — create one at AI > AI Gateway
- **AI provider and model** — Anthropic, OpenAI, Google, OpenRouter, or Cline API
- **Provider API key** — your key for the chosen provider
- **Workspace name** — lowercase with hyphens
- **Container size** — small, standard, or large
- **Template** — Node.js, Python, Go, Rust, Zig, or blank
- **Optional Git repo** — a GitHub URL to clone into the workspace

### 3. Connect

```bash
# One command — detects auth, connects, drops you into the workspace
bash scripts/clinebox-connect.sh
```

Or if you prefer the raw command:

```bash
npx wrangler containers ssh clinebox
```

Once connected, just run:

```bash
clinebox
```

That's it. The `clinebox` command sources your AI Gateway configuration, runs a quick health check on first use, and drops you into the workspace with Cline ready to go.

---

## Architecture

```
Browser
   |
Cloudflare Worker     <- serves UI, routes requests, orchestrates provisioning
   |
Durable Object        <- owns container lifecycle, maintains runtime state
   |
Cloudflare Container  <- Debian Bookworm + Bun + Cline CLI + workspace
   |
Cline CLI + AI Gateway -> models (Anthropic, OpenAI, Google, OpenRouter)
```

| Component | Responsibility |
|---|---|
| **Worker** | Serves setup UI and landing page, routes API requests, wakes containers, proxies allowed ports, exposes health/status endpoints |
| **Durable Object** | Owns container lifecycle (provision, start, stop, wake), proxies requests into the container, maintains runtime state with SQLite storage |
| **Container** | Debian Bookworm with Bun, Cline CLI, Git, tmux, ripgrep, and workspace. Runs a health endpoint on port 8788 |
| **AI Gateway** | All model calls route through `gateway.ai.cloudflare.com`. Provides logging, spend visibility, rate limiting, and provider abstraction |

---

## Features

- **One-click Cloudflare Deploy** - No terminal required to get started
- **Setup Wizard** - First-launch configuration for workspace, model, and Git repo
- **Workspace Templates** - Pre-configured environments: Node.js (Bun + TypeScript), Python (pip + uv), Go, Rust (rustup + cargo), Zig, or blank
- **AI Gateway Integration** - All model traffic centralized through Cloudflare
- **Multi-Provider Support** - OpenAI, Anthropic, Google, OpenRouter, Cline API
- **SSH Workflow** - Familiar ssh-like experience via `wrangler containers ssh`
- **Proxy** - Route traffic to allowed ports (3000, 5173, 8000, 8787)
- **Health Checks** - Worker and container health endpoints
- **Cold Start UX** - Provisioning status feedback with no fake immediacy
- **Disposable by Design** - Tear down and redeploy in minutes

---

## Manual Deployment

If you prefer to deploy from your local machine instead of using the Deploy Button:

### Prerequisites

- [Bun](https://bun.sh) installed — `curl -fsSL https://bun.sh/install | bash`
- A [Cloudflare account](https://dash.cloudflare.com) with Workers paid plan
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) authenticated — `npx wrangler login`
- A [Cloudflare AI Gateway](https://dash.cloudflare.com/?to=/:account/ai/ai-gateway) created in the dashboard

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/djinn/clinebox.git
cd clinebox

# 2. Install dependencies
bun install

# 3. Configure required secrets
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
npx wrangler secret put CLOUDFLARE_AI_GATEWAY_ID
npx wrangler secret put ANTHROPIC_API_KEY

# 4. (Optional) Add additional provider keys
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put GOOGLE_API_KEY
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put CLINE_API_KEY
npx wrangler secret put GITHUB_TOKEN

# 5. Deploy the Worker, Durable Object, and Container
npx wrangler deploy

# 6. Open the generated URL in your browser
echo "Complete the setup wizard at the URL shown above."
```

### Verify the Deployment

```bash
curl https://<your-worker>.<your-subdomain>.workers.dev/api/health
```

Expected response:

```json
{
  "ok": true,
  "service": "clinebox"
}
```

---

## Security

Cline executes shell commands. That is the point and the risk.

- **Never** expose public shells, arbitrary ports, or log secrets
- **Always** validate ports, providers, models, and shell parameters
- API keys live in **Cloudflare Secrets** - never in logs, responses, or HTML
- Proxy is restricted to an allowlist of ports

See [SECURITY.md](docs/SECURITY.md) for the full threat model.

---

## Documentation

| Document | Description |
|---|---|
| [DEPLOY.md](docs/DEPLOY.md) | Step-by-step deployment guide |
| [SECURITY.md](docs/SECURITY.md) | Threat model and security requirements |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues and solutions |
| [SSH.md](docs/SSH.md) | SSH connection guide |
| [MODELS.md](docs/MODELS.md) | Supported models and providers |
| [AI_GATEWAY.md](docs/AI_GATEWAY.md) | AI Gateway configuration |

---

## Philosophy

Kubernetes optimized for fleets. AI-native developers increasingly want lightweight campsites.

ClineBox is:

- **Sharp** - does one thing well
- **Lightweight** - minimal infrastructure overhead
- **Disposable** - deploy, use, tear down, repeat
- **Operationally boring** - the infrastructure disappears behind the workflow

The product is operational simplicity.

---

## License

MIT

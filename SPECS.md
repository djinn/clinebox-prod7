# SPECS.md

# Project Name

ClineBox

# Tagline

Deploy a globally distributed AI coding workspace to Cloudflare in minutes.

SSH in.
Run Cline.
Build.

No VPS.
No Kubernetes.
No Terraform archaeology.

---

# 1. Vision

ClineBox converts Cloudflare Containers into disposable AI-native development environments.

The user clicks:

```txt
Deploy to Cloudflare
```

A few minutes later they receive:

* a running container
* Cline preinstalled
* AI Gateway configured
* optional Git repo cloned
* shell ready
* globally accessible through Cloudflare infrastructure

This product is not “container hosting”.

It is:

* AI workspace orchestration
* coding agent infrastructure
* serverless developer environments

The infrastructure industry keeps selling datacenters.

Developers increasingly want campsites.

---

# 2. Product Goals

Build a deployable GitHub repository that provides:

1. Cloudflare Deploy Button support
2. Cloudflare Worker orchestration
3. Cloudflare Durable Object lifecycle management
4. Cloudflare Container runtime
5. AI Gateway-based model routing
6. Cline CLI preinstalled
7. SSH-based developer workflow
8. First-launch setup wizard
9. Workspace templates
10. Optional Git repository bootstrap
11. Disposable workspace experience

---

# 3. Non-Goals

Not in v1:

* Browser IDE
* Multi-user tenancy
* Persistent disks
* SaaS billing
* Public terminal exposure
* Kubernetes orchestration
* GPU workloads
* Long-lived production hosting

This is a developer workspace product first.

---

# 4. User Experience

## Initial Flow

User:

1. Opens GitHub repository
2. Clicks “Deploy to Cloudflare”
3. Cloudflare provisions:

   * Worker
   * Durable Object
   * Container infrastructure
4. User opens generated Worker URL
5. Setup wizard asks:

   * Workspace name
   * Container size profile
   * Template type
   * Model provider
   * Model
   * Cloudflare Account ID
   * AI Gateway ID
   * Provider API key
   * Optional Git repository
6. User clicks:

   * “Provision Workspace”
7. Worker provisions container
8. User sees warmup/provisioning status
9. User runs:

```bash id="9e9nrn"
npx wrangler containers ssh clinebox
```

10. User starts using Cline:

```bash id="xwy1zl"
cd /workspace
cline
```

---

# 5. Architecture

## System Architecture

```txt id="8o7mp7"
Browser
   ↓
Cloudflare Worker
   ↓
Durable Object
   ↓
Cloudflare Container
   ↓
Cline CLI + Workspace
```

---

# 6. Core Components

## 6.1 Worker

Responsibilities:

* serve setup UI
* route requests
* wake containers
* proxy allowed ports
* expose health APIs
* expose status APIs
* orchestrate provisioning

---

## 6.2 Durable Object

Responsibilities:

* own container lifecycle
* start/stop/wake containers
* proxy requests into container
* maintain runtime state
* handle container fetch logic

---

## 6.3 Container

Responsibilities:

* execute shell environment
* host filesystem
* run Cline
* manage workspace
* run template tooling
* expose health endpoint

---

## 6.4 AI Gateway

Responsibilities:

* centralize model access
* logging
* spend visibility
* provider abstraction
* rate limiting
* future fallback routing

All model calls must go through AI Gateway by default.

---

# 7. Technology Stack

## Runtime

* Cloudflare Workers
* Cloudflare Containers
* Durable Objects
* TypeScript
* Bun 1.2
* Wrangler

---

## Container Runtime

* Debian Bookworm (slim)
* Bash
* Git
* Bun 1.2
* tmux
* ripgrep
* jq
* vim
* nano

---

## AI Runtime

* Cline CLI

---

## Future Runtime

Potential future migration:

* `@cloudflare/sandbox`

Not required for v1.

---

# 8. Repository Structure

```txt id="h2r6r7"
clinebox/
├── README.md
├── SPECS.md
├── package.json
├── tsconfig.json
├── wrangler.jsonc
├── Dockerfile
├── .gitignore
├── .dockerignore
│
├── src/
│   ├── index.ts
│   ├── container.ts
│   ├── routes.ts
│   ├── wizard.ts
│   ├── config.ts
│   ├── models.ts
│   ├── templates.ts
│   ├── validation.ts
│   └── ui/
│       ├── index.html
│       ├── wizard.html
│       └── status.html
│
├── scripts/
│   ├── bootstrap.sh
│   ├── firstboot.sh
│   ├── configure-cline.sh
│   ├── validate-env.sh
│   ├── doctor.sh
│   ├── print-banner.sh
│   └── health-server.js
│
├── docs/
│   ├── DEPLOY.md
│   ├── SECURITY.md
│   ├── TROUBLESHOOTING.md
│   ├── SSH.md
│   ├── MODELS.md
│   └── AI_GATEWAY.md
│
└── .github/
    └── workflows/
        └── deploy.yml
```

---

# 9. Deploy Button

README must contain:

```md id="s1k8h7"
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](
https://deploy.workers.cloudflare.com/?url=https://github.com/<OWNER>/<REPO>
)
```

Deploy Button responsibilities:

* clone repository
* provision Worker
* deploy Durable Objects
* deploy Containers
* apply Wrangler configuration

The Deploy Button is not the setup wizard.

The setup wizard lives inside the deployed Worker.

That separation matters.

---

# 10. Wrangler Configuration

## wrangler.jsonc

```jsonc id="8hzxby"
{
  "$schema": "node_modules/wrangler/config-schema.json",

  "name": "clinebox",

  "main": "src/index.ts",

  "compatibility_date": "2026-05-21",

  "containers": [
    {
      "class_name": "ClineBox",
      "image": "./Dockerfile",
      "max_instances": 5,
      "instance_type": "basic"
    }
  ],

  "durable_objects": {
    "bindings": [
      {
        "name": "CLINEBOX",
        "class_name": "ClineBox"
      }
    ]
  },

  "migrations": [
    {
      "tag": "v1",
      "new_sqlite_classes": ["ClineBox"]
    }
  ],

  "vars": {
    "CLINEBOX_IDLE_TIMEOUT": "2h",
    "CLINEBOX_ALLOW_DIRECT_MODEL_CALLS": "false"
  }
}
```

---

# 11. Durable Object

## src/container.ts

```ts id="w1bzx6"
import { Container } from "@cloudflare/containers";

export class ClineBox extends Container {
  defaultPort = 8788;

  sleepAfter = "2h";

  envVars = {
    CLINEBOX_WORKSPACE: "/workspace"
  };

  async fetch(request: Request) {
    return this.containerFetch(request);
  }
}
```

---

# 12. Worker Routes

## Required Routes

### GET /

Landing page.

Displays:

* deployment status
* workspace status
* container state
* model configuration
* SSH instructions

---

### GET /wizard

Setup wizard UI.

---

### POST /api/provision

Creates/configures workspace.

---

### POST /api/wake

Wakes container.

---

### GET /api/status

Returns runtime state.

---

### GET /api/health

Worker health endpoint.

---

### GET /proxy/:port/*

Optional reverse proxy.

Must validate allowed ports.

---

# 13. Setup Wizard

## Required Inputs

### Workspace

```txt id="6jxct0"
my-workspace
```

---

### Template Type

Options:

* node
* python
* go
* rust
* zig
* blank

---

### Size Profile

Options:

* small
* standard
* large

---

### AI Provider

Options:

* OpenAI
* Anthropic
* Google
* OpenRouter
* Cline API

---

### Model

Provider-specific list.

---

### Cloudflare Account ID

Required.

---

### AI Gateway ID

Required.

---

### Provider API Key

Required.

---

### Optional Git Repository

Example:

```txt id="a2n3u2"
https://github.com/user/project
```

---

# 14. Template Types

## node

Installs:

* pnpm
* TypeScript
* npm tooling

---

## python

Installs:

* Python 3
* pip
* uv

---

## go

Installs:

* Go stable

---

## rust

Installs:

* rustup
* cargo

---

## zig

Installs:

* Zig binary

---

## blank

Minimal environment.

---

# 15. AI Gateway

## Requirement

All model traffic must route through Cloudflare AI Gateway by default.

Direct model calls are disabled by default.

---

## Why

AI Gateway provides:

* logging
* spend visibility
* central governance
* request inspection
* future provider failover
* centralized model routing

Without a gateway every container becomes its own billing leak.

---

# 16. AI Gateway Variables

## Required Variables

```txt id="6ys6t7"
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_AI_GATEWAY_ID
CLINEBOX_MODEL_PROVIDER
CLINEBOX_MODEL_NAME
CLINEBOX_ALLOW_DIRECT_MODEL_CALLS=false
```

---

# 17. Secrets

## Required Secrets

```txt id="1l6xna"
OPENAI_API_KEY
ANTHROPIC_API_KEY
GOOGLE_API_KEY
OPENROUTER_API_KEY
CLINE_API_KEY
GITHUB_TOKEN
```

Secrets must:

* remain in Cloudflare Secrets
* never appear in logs
* never appear in API responses
* never appear in HTML

---

# 18. AI Gateway URL Structure

## OpenAI

```txt id="4esj6j"
https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai
```

---

## Anthropic

```txt id="b4a9vb"
https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/anthropic
```

---

## OpenRouter

```txt id="u4ay4d"
https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openrouter
```

---

# 19. Model Profiles

## src/models.ts

```ts id="73tksw"
export const MODEL_PROFILES = {
  "gateway-openai-gpt4o": {
    provider: "openai",
    model: "gpt-4o"
  },

  "gateway-anthropic-sonnet": {
    provider: "anthropic",
    model: "claude-sonnet-4"
  },

  "gateway-google-gemini": {
    provider: "google",
    model: "gemini-2.5-pro"
  },

  "gateway-openrouter-sonnet": {
    provider: "openrouter",
    model: "anthropic/claude-sonnet-4"
  }
};
```

---

# 20. Dockerfile

## Requirements

Must:

* use Debian Bookworm slim with Bun
* install Cline globally via Bun
* create non-root user
* create `/workspace`
* expose health endpoint

---

## Dockerfile

```Dockerfile id="r7ewol"
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV BUN_VERSION=1.2.5

RUN apt-get update && apt-get install -y \
    bash \
    curl \
    git \
    jq \
    tmux \
    vim \
    nano \
    ripgrep \
    python3 \
    python3-pip \
    unzip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash -s -- bun-v${BUN_VERSION} \
    && ln -sf /root/.bun/bin/bun /usr/local/bin/bun \
    && ln -sf /root/.bun/bin/bunx /usr/local/bin/bunx

# Install Cline globally via Bun
RUN bun install -g cline

RUN useradd -m -s /bin/bash developer

RUN mkdir -p /workspace

COPY scripts/ /opt/clinebox/scripts/

RUN chmod +x /opt/clinebox/scripts/*.sh

USER developer

WORKDIR /workspace

ENTRYPOINT ["/opt/clinebox/scripts/bootstrap.sh"]
```

---

# 21. Bootstrap Flow

## bootstrap.sh

Responsibilities:

* validate environment
* configure AI Gateway
* configure model provider
* configure Cline
* clone repo
* install template dependencies
* print welcome banner
* start health endpoint
* keep container alive

---

# 22. AI Gateway Environment

## ~/.clinebox/ai-gateway.env

```bash id="h8lh4w"
export OPENAI_BASE_URL="https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${CLOUDFLARE_AI_GATEWAY_ID}/openai"

export ANTHROPIC_BASE_URL="https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${CLOUDFLARE_AI_GATEWAY_ID}/anthropic"

export DEEPSEEK_BASE_URL="https://api.deepseek.com"

export OPENROUTER_BASE_URL="https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${CLOUDFLARE_AI_GATEWAY_ID}/openrouter"
```

Source from:

```bash id="rw4ky5"
~/.bashrc
```

---

# 23. Health System

## Container Health Endpoint

```txt id="3sl8mf"
localhost:8788/health
```

Returns:

```json id="s9uhyq"
{
  "ok": true,
  "service": "clinebox"
}
```

---

# 24. Doctor Command

## doctor.sh

Must validate:

* Cloudflare Account ID
* AI Gateway ID
* provider selection
* model selection
* API key existence
* gateway reachability
* Cline installation
* workspace permissions

Usage:

```bash id="nwwp4s"
clinebox doctor
```

---

# 25. SSH Experience

## Goal

The product should feel like:

```bash id="mf1dkl"
ssh workspace
```

Reality:

```bash id="7vdj9h"
npx wrangler containers ssh clinebox
```

Documentation should aggressively simplify this.

---

# 26. Landing Page

## Sections

### Status Card

Displays:

* Worker healthy
* Container healthy
* Workspace name
* Template
* Selected model

---

### SSH Instructions

```bash id="lvd9rq"
npx wrangler containers ssh clinebox
```

---

### Quick Start

```bash id="h5mg79"
cd /workspace
cline
```

---

# 27. Proxy Rules

## Allowed Ports

Default allowlist:

```txt id="p2mxt8"
3000
5173
8000
8787
```

---

## Forbidden

Never expose:

* SSH
* Docker daemon
* arbitrary localhost services

---

# 28. Security Model

## Threat Model

Cline executes shell commands.

That is the point and the risk.

The failure mode is pretending this is “safe by default”.

---

## Security Requirements

### Never

* expose public shell
* expose arbitrary ports
* log secrets
* proxy unrestricted traffic

---

## Always

* validate ports
* validate providers
* validate models
* sanitize shell parameters
* isolate workspace state

---

# 29. Cold Start UX

## Critical Constraint

Container startup may take minutes due to:

* image build
* image pull
* runtime warmup

The UI must:

* show provisioning state
* show warmup progress
* allow retries
* avoid fake immediacy

Nothing destroys trust faster than pretending cold starts do not exist.

---

# 30. GitHub Actions

## deploy.yml

Must:

* install dependencies
* typecheck
* deploy Worker
* deploy Containers

---

# 31. Acceptance Tests

## Test 1

Deploy succeeds.

---

## Test 2

Container wakes successfully.

---

## Test 3

SSH works.

---

## Test 4

`cline --version` works.

---

## Test 5

Git repo cloning works.

---

## Test 6

Health endpoint responds.

---

## Test 7

AI Gateway reachable.

---

## Test 8

Secrets never appear in logs.

---

# 32. Future Features

## Browser Terminal

Cloudflare Access protected.

---

## MCP Registry

Install MCP servers from templates.

---

## Workspace Persistence

R2 snapshots.

---

## GitHub OAuth

One-click repo import.

---

## Multi-user Mode

Per-user containers.

---

## Agent Swarms

Multiple coordinated Cline sessions.

---

## Sandbox SDK Migration

Potential future move to:

* `@cloudflare/sandbox`

---

# 33. Product Philosophy

Kubernetes optimized for fleets.

AI-native developers increasingly want:

* lightweight campsites
* disposable environments
* globally distributed workspaces
* fast startup
* minimal ceremony

This product should feel:

* sharp
* lightweight
* disposable
* operationally boring

The infrastructure should disappear behind the workflow.

That is the moat.

---

# 34. Implementation Order

Cline should implement in this order:

1. Wrangler scaffold
2. Worker routing
3. Durable Object
4. Container integration
5. Docker image
6. Health endpoint
7. SSH workflow
8. Setup wizard
9. AI Gateway integration
10. Model abstraction
11. Template system
12. Proxy validation
13. Security validation
14. Documentation
15. CI/CD
16. Acceptance tests

Prefer boring TypeScript.

Prefer explicit shell scripts.

Prefer readable infrastructure over clever abstraction layers.

The product is operational simplicity.

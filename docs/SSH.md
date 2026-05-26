# SSH into ClineBox

## Prerequisites

Before you can SSH into your container, you need:

1. **An SSH public key** added to your Cloudflare account
2. **Wrangler CLI** authenticated with Cloudflare

---

## One-Time Setup

### Step 1: Generate an SSH Key

```bash
# Check if you already have one
ls ~/.ssh/

# If you see id_ed25519.pub or id_rsa.pub, skip to step 2.
# If not, generate a new key:
ssh-keygen -t ed25519 -C "clinebox"
```

### Step 2: Add the Key to Cloudflare

```bash
npx wrangler containers ssh-add-key clinebox-key ~/.ssh/id_ed25519.pub
```

This registers your public key with Cloudflare so you can SSH into containers.

### Step 3: Log in to Cloudflare

```bash
# Option A -- Browser login (if you have one):
npx wrangler login

# Option B -- API token (headless/server):
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
```

---

## Connect to Container

```bash
# Using the helper script (handles all checks)
bash scripts/clinebox-connect.sh

# Or directly with wrangler
npx wrangler containers ssh clinebox
```

---

## First Connection

On first SSH:

1. The container bootstraps automatically
2. Cline CLI is pre-installed
3. AI Gateway is configured
4. Welcome banner appears

---

## Quick Start

Once connected, just run:

```bash
clinebox
```

This sources your AI Gateway configuration, runs a quick health check on first use, and drops you into the workspace with Cline ready.

---

## Manual Start

If you prefer to do things manually:

```bash
cd /workspace
cline
```

---

## Doctor Command

```bash
clinebox-doctor
```

Validates:
- Cloudflare Account ID
- AI Gateway ID
- Model provider and selection
- API key existence
- Gateway reachability
- Cline installation
- Workspace permissions

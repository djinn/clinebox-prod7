# Deploying ClineBox

This document covers deploying ClineBox manually using Wrangler. For the fastest path, use the Deploy Button in the README.

The Cloudflare Deploy Button requires a GitHub repository. You need to create one and push this code to it.

---

## Step 1: Create a GitHub Repository

Go to [github.com/new](https://github.com/new) and create a new repository.

- **Repository name:** `clinebox-prod` (or your preferred name)
- **Visibility:** Public (required for the Deploy Button)
- **Do not initialize** with README, .gitignore, or license

After creation, you will see a quick setup page. Keep it open.

---

## Step 2: Clone and Push

```bash
# Clone this repository
git clone https://github.com/djinn/clinebox.git
cd clinebox

# Point it to your new repository
git remote set-url origin https://github.com/YOUR_USERNAME/clinebox-prod.git

# Push to your repository
git push -u origin main
```

Your Deploy Button URL is now:

```
https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR_USERNAME/clinebox-prod
```

Open this URL to deploy via the button, or continue with the CLI steps below.

---

## Step 3: Prerequisites (CLI Deploy)

- **Bun** installed — `curl -fsSL https://bun.sh/install | bash`
- **A Cloudflare account** with the Workers paid plan (Containers are not available on the free plan)
- **Wrangler CLI** authenticated — `npx wrangler login`
- **A Cloudflare AI Gateway** created in the Cloudflare dashboard (AI > AI Gateway)

---

## Step 4: Install Dependencies

```bash
bun install
```

---

## Step 5: Configure Secrets

ClineBox requires several secrets. These are stored securely in Cloudflare and never appear in logs or responses.

### Required Secrets

```bash
# Your Cloudflare Account ID (find this in the Cloudflare dashboard)
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID

# Your AI Gateway ID (create one in AI > AI Gateway)
npx wrangler secret put CLOUDFLARE_AI_GATEWAY_ID

# At least one provider API key
npx wrangler secret put ANTHROPIC_API_KEY
```

### Optional Secrets

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put GOOGLE_API_KEY
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put CLINE_API_KEY
npx wrangler secret put GITHUB_TOKEN
```

> **Important:** Secrets are write-only. Once set, you cannot read them back from the CLI. Set them correctly the first time.

---

## Step 6: Configure Wrangler (Optional)

Edit `wrangler.jsonc` if you need to change defaults:

```jsonc
{
  "name": "clinebox",              // Your Worker name
  "compatibility_date": "2026-05-21",

  "containers": [
    {
      "class_name": "ClineBox",
      "image": "./Dockerfile",
      "max_instances": 5,          // Max concurrent container instances
      "instance_type": "basic"     // basic, standard, or large
    }
  ],

  "vars": {
    "CLINEBOX_IDLE_TIMEOUT": "2h",
    "CLINEBOX_ALLOW_DIRECT_MODEL_CALLS": "false"
  }
}
```

### Configuration Reference

| Variable | Default | Description |
|---|---|---|
| `CLINEBOX_IDLE_TIMEOUT` | `2h` | Container sleep timeout |
| `CLINEBOX_ALLOW_DIRECT_MODEL_CALLS` | `false` | Bypass AI Gateway |

---

## Step 7: Deploy

```bash
npx wrangler deploy
```

This command:

1. Builds the Worker from `src/index.ts`
2. Deploys the Durable Object class (`ClineBox`)
3. Builds and deploys the Container image from the `Dockerfile`
4. Applies the Wrangler configuration
5. Outputs a Worker URL

The deployment typically takes **2–5 minutes** due to the container image build.

---

## Step 8: Complete the Setup Wizard

1. Open the Worker URL from the deploy output in your browser
2. Click **Setup Workspace**
3. Fill in the wizard:
   - **Workspace Name** — lowercase, hyphens allowed (e.g., `my-project`)
   - **Template** — Node.js, Python, Go, Rust, Zig, or Blank
   - **Size Profile** — Small, Standard, or Large
   - **AI Provider** — OpenAI, Anthropic, Google, OpenRouter, or Cline API
   - **Model** — Provider-specific model selection
   - **Cloudflare Account ID** — Your 32-character hex account ID
   - **AI Gateway ID** — Your AI Gateway ID from the dashboard
   - **Provider API Key** — The API key for your chosen provider
   - **Git Repository** — Optional GitHub HTTPS URL to clone into the workspace
4. Click **Provision Workspace**

---

## Step 9: Connect to the Container

```bash
# Use the helper script (recommended)
bash scripts/clinebox-connect.sh

# Or the raw wrangler command
npx wrangler containers ssh clinebox
```

Once connected:

```bash
# Run the doctor to verify everything is working
/opt/clinebox/scripts/doctor.sh

# Start coding
cd /workspace
cline
```

---

## Day 2 Operations

### Check Worker Health

```bash
curl https://<your-worker>.<your-subdomain>.workers.dev/api/health
```

### Check Container Status

```bash
curl https://<your-worker>.<your-subdomain>.workers.dev/api/status
```

### Wake the Container

```bash
curl -X POST https://<your-worker>.<your-subdomain>.workers.dev/api/wake
```

### Update the Deployment

```bash
# Pull latest changes
git pull

# Redeploy
npx wrangler deploy
```

### Delete the Deployment

```bash
npx wrangler delete
```

---

## Troubleshooting

| Issue | Resolution |
|---|---|
| Container won't start | Check secrets are set: `npx wrangler secret list` |
| SSH fails | Add SSH key: `npx wrangler containers ssh-add-key mykey ~/.ssh/id_ed25519.pub` then login: `npx wrangler login` |
| Model calls fail | Run `clinebox doctor` inside the container |
| Cold start takes too long | This is expected — image build/pull takes minutes |
| Deploy fails | Verify your plan supports Containers (paid plan required) |

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed guidance.

---

## Next Steps

- Read the [Security Model](SECURITY.md)
- Learn about [SSH into the container](SSH.md)
- Explore [supported models](MODELS.md)
- Configure [AI Gateway](AI_GATEWAY.md)

#!/bin/bash
# ClineBox Connect
# One-command SSH into your ClineBox workspace.
#
# Usage:
#   ./clinebox-connect.sh              # uses default worker name "clinebox"
#   ./clinebox-connect.sh my-worker    # uses custom worker name
#
# First time setup:
#   1. Check for SSH key:      ls ~/.ssh/
#   2. Generate if needed:     ssh-keygen -t ed25519 -C "clinebox"
#   3. Add key to Cloudflare:  npx wrangler containers ssh-add-key clinebox-key ~/.ssh/id_ed25519.pub
#   4. Login to Cloudflare:    npx wrangler login
#   5. Connect:                ./clinebox-connect.sh

set -euo pipefail

WORKER_NAME="${1:-clinebox}"

echo ""
echo "◇ ClineBox — Connecting to ${WORKER_NAME}..."
echo ""

# Check for npx
if ! command -v npx &>/dev/null; then
  echo "ERROR: npx not found. Install Bun or Node.js first:"
  echo "  curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

# Check for SSH key
SSH_KEY=""
for key in ~/.ssh/id_*.pub; do
  if [ -f "$key" ]; then
    SSH_KEY="$key"
    break
  fi
done

if [ -z "$SSH_KEY" ]; then
  echo "┌─────────────────────────────────────────────────────────────┐"
  echo "│ No SSH public key found.                                   │"
  echo "│                                                             │"
  echo "│ 1. Generate an SSH key:                                      │"
  echo "│    ssh-keygen -t ed25519 -C \"clinebox\"                      │"
  echo "│                                                             │"
  echo "│ 2. Add it to your Cloudflare account:                       │"
  echo "│    npx wrangler containers ssh-add-key \\                     │"
  echo "│      clinebox-key ~/.ssh/id_ed25519.pub                     │"
  echo "│                                                             │"
  echo "│ 3. Then run this script again.                              │"
  echo "└─────────────────────────────────────────────────────────────┘"
  exit 1
fi

# Check Cloudflare auth
if ! npx wrangler whoami &>/dev/null; then
  echo "┌─────────────────────────────────────────────────────────────┐"
  echo "│ Not authenticated with Cloudflare.                         │"
  echo "│                                                             │"
  echo "│ Option A — Login via browser:                               │"
  echo "│   npx wrangler login                                        │"
  echo "│                                                             │"
  echo "│ Option B — Use API token (headless):                        │"
  echo "│   export CLOUDFLARE_API_TOKEN=\"your-token\"                  │"
  echo "│   export CLOUDFLARE_ACCOUNT_ID=\"your-account-id\"           │"
  echo "│   $0                                                        │"
  echo "└─────────────────────────────────────────────────────────────┘"
  exit 1
fi

# All good — connect
echo "✓ SSH key found: ${SSH_KEY}"
echo "✓ Authenticated with Cloudflare"
echo ""
echo "Connecting to container '${WORKER_NAME}'..."
echo "(This may take a moment to wake the container)"
echo ""
exec npx wrangler containers ssh "${WORKER_NAME}"

#!/bin/bash
set -euo pipefail

# ClineBox Cline Configuration
# Configures Cline CLI with AI Gateway settings.
# Called by bootstrap after environment is injected.

echo "=== Configuring Cline ==="

CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-}"
CLOUDFLARE_AI_GATEWAY_ID="${CLOUDFLARE_AI_GATEWAY_ID:-}"
CLINEBOX_MODEL_PROVIDER="${CLINEBOX_MODEL_PROVIDER:-}"
CLINEBOX_MODEL_NAME="${CLINEBOX_MODEL_NAME:-}"
CLINEBOX_ALLOW_DIRECT_MODEL_CALLS="${CLINEBOX_ALLOW_DIRECT_MODEL_CALLS:-false}"

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ] || [ -z "$CLOUDFLARE_AI_GATEWAY_ID" ]; then
    echo "ERROR: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_GATEWAY_ID are required."
    exit 1
fi

if [ -z "$CLINEBOX_MODEL_PROVIDER" ] || [ -z "$CLINEBOX_MODEL_NAME" ]; then
    echo "ERROR: CLINEBOX_MODEL_PROVIDER and CLINEBOX_MODEL_NAME are required."
    exit 1
fi

mkdir -p "$HOME/.clinebox"

# Write AI Gateway environment file
cat > "$HOME/.clinebox/ai-gateway.env" << ENVEOF
export OPENAI_BASE_URL="https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${CLOUDFLARE_AI_GATEWAY_ID}/openai"
export ANTHROPIC_BASE_URL="https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${CLOUDFLARE_AI_GATEWAY_ID}/anthropic"
export DEEPSEEK_BASE_URL="https://api.deepseek.com"
export OPENROUTER_BASE_URL="https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${CLOUDFLARE_AI_GATEWAY_ID}/openrouter"
ENVEOF

# Write Cline environment configuration
cat > "$HOME/.clinebox/cline.env" << CLINEEOF
export CLINEBOX_MODEL_PROVIDER="${CLINEBOX_MODEL_PROVIDER}"
export CLINEBOX_MODEL_NAME="${CLINEBOX_MODEL_NAME}"
export CLINEBOX_ALLOW_DIRECT_MODEL_CALLS="${CLINEBOX_ALLOW_DIRECT_MODEL_CALLS}"
CLINEEOF

# Configure Cline CLI settings
mkdir -p "$HOME/.config/cline"

cat > "$HOME/.config/cline/settings.json" << SETTINGSEOF
{
  "apiProvider": "${CLINEBOX_MODEL_PROVIDER}",
  "apiModelId": "${CLINEBOX_MODEL_NAME}",
  "allowDirectModelCalls": ${CLINEBOX_ALLOW_DIRECT_MODEL_CALLS},
  "autoApproval": false
}
SETTINGSEOF

# Set up .clineignore if not exists
if [ ! -f "$HOME/.clineignore" ]; then
    cat > "$HOME/.clineignore" << IGNOREEOF
node_modules/
.git/
dist/
.wrangler/
IGNOREEOF
fi

echo "=== Cline configured ==="

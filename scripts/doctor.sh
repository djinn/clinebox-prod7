#!/bin/bash
set -euo pipefail

# ClineBox Doctor
# Validates the workspace environment.

echo "=== ClineBox Doctor ==="
echo ""

errors=0

check() {
    local name="$1"
    local cmd="$2"
    if eval "$cmd" > /dev/null 2>&1; then
        echo "  ✓ $name"
    else
        echo "  ✗ $name"
        errors=$((errors + 1))
    fi
}

echo "  Checking Cloudflare Account ID..."
check "Cloudflare Account ID set" \
    '[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]'

echo "  Checking AI Gateway ID..."
check "AI Gateway ID set" \
    '[ -n "${CLOUDFLARE_AI_GATEWAY_ID:-}" ]'

echo "  Checking provider selection..."
check "Model provider set" \
    '[ -n "${CLINEBOX_MODEL_PROVIDER:-}" ]'

echo "  Checking model selection..."
check "Model name set" \
    '[ -n "${CLINEBOX_MODEL_NAME:-}" ]'

echo "  Checking API key..."
case "${CLINEBOX_MODEL_PROVIDER:-}" in
    openai)
        check "OpenAI API key" '[ -n "${OPENAI_API_KEY:-}" ]'
        ;;
    anthropic)
        check "Anthropic API key" '[ -n "${ANTHROPIC_API_KEY:-}" ]'
        ;;
    google)
        check "Google API key" '[ -n "${GOOGLE_API_KEY:-}" ]'
        ;;
    deepseek)
        check "DeepSeek API key" '[ -n "${DEEPSEEK_API_KEY:-}" ]'
        ;;
    openrouter)
        check "OpenRouter API key" '[ -n "${OPENROUTER_API_KEY:-}" ]'
        ;;
esac

echo "  Checking network..."
check "Gateway DNS resolution" \
    'nslookup gateway.ai.cloudflare.com 2>/dev/null || host gateway.ai.cloudflare.com 2>/dev/null || curl -s -o /dev/null --connect-timeout 5 https://gateway.ai.cloudflare.com'

echo "  Checking Cline installation..."
check "Cline installed" 'command -v cline'
check "Cline version" 'cline --version'

echo "  Checking workspace..."
check "Workspace directory exists" '[ -d /workspace ]'
check "Workspace writable" '[ -w /workspace ]'

echo "  Checking configuration..."
check "AI Gateway env exists" \
    '[ -f "$HOME/.clinebox/ai-gateway.env" ]'
check "Cline config exists" \
    '[ -f "$HOME/.config/cline/settings.json" ]'

echo ""
if [ "$errors" -eq 0 ]; then
    echo "  All checks passed."
else
    echo "  $errors check(s) failed."
fi
echo "=== Doctor Complete ==="

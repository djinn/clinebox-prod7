#!/bin/bash
set -euo pipefail

# ClineBox Environment Validation
# Validates required environment variables are set.

echo "=== Validating Environment ==="

errors=0

check_var() {
    local var_name="$1"
    local var_value="${2:-}"
    if [ -z "$var_value" ]; then
        echo "ERROR: $var_name is not set or empty"
        errors=$((errors + 1))
    else
        echo "OK: $var_name is set"
    fi
}

check_var "CLOUDFLARE_ACCOUNT_ID" "${CLOUDFLARE_ACCOUNT_ID:-}"
check_var "CLOUDFLARE_AI_GATEWAY_ID" "${CLOUDFLARE_AI_GATEWAY_ID:-}"
check_var "CLINEBOX_MODEL_PROVIDER" "${CLINEBOX_MODEL_PROVIDER:-}"
check_var "CLINEBOX_MODEL_NAME" "${CLINEBOX_MODEL_NAME:-}"

# Validate provider
case "${CLINEBOX_MODEL_PROVIDER:-}" in
    openai|anthropic|google|deepseek|openrouter|cline)
        echo "OK: Provider '${CLINEBOX_MODEL_PROVIDER}' is valid"
        ;;
    "")
        # Already caught above
        ;;
    *)
        echo "ERROR: Invalid provider '${CLINEBOX_MODEL_PROVIDER}'"
        errors=$((errors + 1))
        ;;
esac

# Check provider API key
case "${CLINEBOX_MODEL_PROVIDER:-}" in
    openai)
        check_var "OPENAI_API_KEY" "${OPENAI_API_KEY:-}"
        ;;
    anthropic)
        check_var "ANTHROPIC_API_KEY" "${ANTHROPIC_API_KEY:-}"
        ;;
    google)
        check_var "GOOGLE_API_KEY" "${GOOGLE_API_KEY:-}"
        ;;
    deepseek)
        check_var "DEEPSEEK_API_KEY" "${DEEPSEEK_API_KEY:-}"
        ;;
    openrouter)
        check_var "OPENROUTER_API_KEY" "${OPENROUTER_API_KEY:-}"
        ;;
esac

if [ "$errors" -gt 0 ]; then
    echo "FAILED: $errors validation error(s)"
    exit 1
fi

echo "=== Environment validation passed ==="

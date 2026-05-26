#!/bin/bash
set -euo pipefail

# ClineBox Bootstrap
# Runs on container startup.

echo "=== ClineBox Bootstrap ==="

# Run firstboot if needed
if [ ! -f "$HOME/.clinebox/.bootstrapped" ]; then
    /opt/clinebox/scripts/firstboot.sh
fi

# Source AI Gateway environment
if [ -f "$HOME/.clinebox/ai-gateway.env" ]; then
    # shellcheck source=/dev/null
    source "$HOME/.clinebox/ai-gateway.env"
fi

# Source configuration
if [ -f "$HOME/.clinebox/cline.env" ]; then
    # shellcheck source=/dev/null
    source "$HOME/.clinebox/cline.env"
fi

# Print welcome banner
/opt/clinebox/scripts/print-banner.sh

# Start health endpoint in background
bun /opt/clinebox/scripts/health-server.js &

# Keep container alive
exec tail -f /dev/null

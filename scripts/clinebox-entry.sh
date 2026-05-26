#!/bin/bash
set -euo pipefail

# ClineBox Entry Point
# Run inside the container to start or resume a Cline session.
# Usage: clinebox
#
# This is the primary command users run after SSH'ing in.
# It sources the AI Gateway config and drops into the workspace with Cline.

# Source AI Gateway environment
if [ -f "$HOME/.clinebox/ai-gateway.env" ]; then
  # shellcheck source=/dev/null
  source "$HOME/.clinebox/ai-gateway.env"
fi

# Source Cline configuration
if [ -f "$HOME/.clinebox/cline.env" ]; then
  # shellcheck source=/dev/null
  source "$HOME/.clinebox/cline.env"
fi

# Ensure we're in the workspace
cd /workspace

# Print a brief header
echo ""
echo "  ◇ ClineBox — /workspace"
echo "  ─────────────────────────────"
echo ""

# Run the doctor in quick mode if first time
if [ ! -f "$HOME/.clinebox/.checked" ]; then
  echo "  Running initial health check..."
  /opt/clinebox/scripts/doctor.sh 2>/dev/null || true
  touch "$HOME/.clinebox/.checked"
  echo ""
fi

# Launch Cline
exec cline "$@"

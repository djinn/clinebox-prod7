#!/bin/bash
set -euo pipefail

# ClineBox First Boot
# Runs once on initial container startup.

echo "=== ClineBox First Boot ==="

mkdir -p "$HOME/.clinebox"

# Write AI Gateway environment file
cat > "$HOME/.clinebox/ai-gateway.env" << 'EOF'
# AI Gateway URLs - populated by configure-cline.sh
# DeepSeek uses its own API directly (OpenAI-compatible)
EOF

# Write Cline configuration file
cat > "$HOME/.clinebox/cline.env" << 'EOF'
# ClineBox Configuration - populated by configure-cline.sh
EOF

# Source AI Gateway env and Cline config in .bashrc
if ! grep -q "source \$HOME/.clinebox/ai-gateway.env" "$HOME/.bashrc" 2>/dev/null; then
    echo "" >> "$HOME/.bashrc"
    echo "# ClineBox AI Gateway" >> "$HOME/.bashrc"
    echo "if [ -f \"\$HOME/.clinebox/ai-gateway.env\" ]; then" >> "$HOME/.bashrc"
    echo "  source \"\$HOME/.clinebox/ai-gateway.env\"" >> "$HOME/.bashrc"
    echo "fi" >> "$HOME/.bashrc"
    echo "" >> "$HOME/.bashrc"
    echo "# ClineBox Configuration" >> "$HOME/.bashrc"
    echo "if [ -f \"\$HOME/.clinebox/cline.env\" ]; then" >> "$HOME/.bashrc"
    echo "  source \"\$HOME/.clinebox/cline.env\"" >> "$HOME/.bashrc"
    echo "fi" >> "$HOME/.bashrc"

    # Add aliases
    echo "" >> "$HOME/.bashrc"
    echo "# ClineBox aliases" >> "$HOME/.bashrc"
    echo "alias clinebox='/opt/clinebox/scripts/clinebox-entry.sh'" >> "$HOME/.bashrc"
    echo "alias clinebox-doctor='/opt/clinebox/scripts/doctor.sh'" >> "$HOME/.bashrc"

    # Add welcome message
    echo "echo \"ClineBox ready. Type 'clinebox' to start.\"" >> "$HOME/.bashrc"
fi

# Mark bootstrapped
touch "$HOME/.clinebox/.bootstrapped"

echo "=== First boot complete ==="

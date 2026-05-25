#!/usr/bin/env bash
# Run once automatically when a new GitHub Codespace is created (postCreateCommand).
# Sets up everything needed to run the Pro Diagnosis + Remedy Package pipeline.

set -e

echo "=== Installing npm dependencies ==="
npm install --legacy-peer-deps

echo "=== Installing system Chromium (for PDF generation) ==="
sudo apt-get update -qq
sudo apt-get install -y -qq chromium

echo "=== Installing Playwright Chromium + system deps (for audit browser sessions) ==="
npx playwright install chromium --with-deps

echo "=== Installing Claude Code CLI ==="
npm install -g @anthropic-ai/claude-code@latest

echo "=== Configuring Claude Code: Playwright MCP (headless) ==="
claude mcp add playwright -- npx @playwright/mcp --headless || true

echo "=== Writing Claude Code permissions ==="
mkdir -p .claude
cat > .claude/settings.local.json << 'EOF'
{
  "permissions": {
    "allow": [
      "mcp__playwright__browser_navigate",
      "mcp__playwright__browser_navigate_back",
      "mcp__playwright__browser_snapshot",
      "mcp__playwright__browser_take_screenshot",
      "mcp__playwright__browser_evaluate",
      "mcp__playwright__browser_run_code_unsafe",
      "mcp__playwright__browser_click",
      "mcp__playwright__browser_type",
      "mcp__playwright__browser_fill_form",
      "mcp__playwright__browser_hover",
      "mcp__playwright__browser_press_key",
      "mcp__playwright__browser_wait_for",
      "mcp__playwright__browser_resize",
      "mcp__playwright__browser_select_option",
      "mcp__playwright__browser_console_messages",
      "mcp__playwright__browser_network_requests",
      "mcp__playwright__browser_network_request",
      "mcp__playwright__browser_tabs",
      "mcp__playwright__browser_close",
      "mcp__playwright__browser_drag",
      "mcp__playwright__browser_drop",
      "mcp__playwright__browser_handle_dialog",
      "mcp__playwright__browser_file_upload",
      "Bash(node scripts/fill-template.mjs*)",
      "Bash(node scripts/generate-audit-pdf.mjs*)",
      "Bash(node scripts/send-delivery.mjs*)",
      "WebSearch",
      "Bash(node -e ' *)"
    ]
  }
}
EOF

echo "=== Codespace setup complete. Run 'claude' to start. ==="

#!/usr/bin/env bash
set -euo pipefail

export VP_HOME=/tmp/vite-plus
export VP_NODE_MANAGER=no
export VP_PM_MANAGER=yes

curl -fsSL https://vite.plus | bash
export PATH="$VP_HOME/bin:$PATH"

vp install --frozen-lockfile
vp run build:platform

test -s apps/platform/client/dist/index.html
test -d apps/platform/server/.cloudflare/output/v0

echo "Platform build complete"
#!/usr/bin/env bash
set -euo pipefail

export VP_HOME=/tmp/vite-plus
export VP_NODE_MANAGER=no
export VP_PM_MANAGER=yes

curl -fsSL https://vite.plus | bash

export PATH="$VP_HOME/bin:$PATH"

vp install --frozen-lockfile
vp run build:site

echo "=== License artifact diagnostics ==="

for file in \
  apps/site/.output/public/licenses.txt \
  apps/site/.cloudflare/output/v0/workers/default/assets/licenses.txt \
  apps/site/.cloudflare/output/v0/workers/default/assets/llms.txt
do
  if test -f "$file"; then
    ls -lh "$file"
  else
    echo "MISSING: $file"
  fi
done
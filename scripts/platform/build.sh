#!/usr/bin/env bash
set -euo pipefail

bun run build:platform

test -s apps/platform/client/dist/index.html
test -d apps/platform/server/.cloudflare/output/v0

echo "Platform build complete"
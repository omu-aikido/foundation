#!/usr/bin/env bash
set -euo pipefail

bun run build:site

site="apps/site"

license="$site/node_modules/.cache/nuxt/.nuxt/dist/client/licenses.txt"

if [[ ! -s "$license" ]]; then
  license="$site/.nuxt/dist/client/licenses.txt"
fi

if [[ ! -s "$license" ]]; then
  echo "Error: Client license report not found" >&2
  exit 1
fi

for dir in \
  "$site/.output/public" \
  "$site/.cloudflare/output/v0/workers/default/assets"
do
  if [[ ! -d "$dir" ]]; then
    echo "Error: Missing output directory: $dir" >&2
    exit 1
  fi

  cp "$license" "$dir/licenses.txt"
done

echo "Published licenses.txt"
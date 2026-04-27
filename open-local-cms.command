#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
CMS_URL="http://127.0.0.1:4010"

cd "$ROOT_DIR"

if command -v curl >/dev/null 2>&1 && curl -s "$CMS_URL" >/dev/null 2>&1; then
  open "$CMS_URL"
  exit 0
fi

(
  sleep 3
  open "$CMS_URL"
) &

npm run cms:local

#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER="root"
REMOTE_HOST="REDACTED_IP"
REMOTE_PATH="/var/www/html/"

echo "Building..."
pnpm build

echo "Deploying to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}..."
rsync -avz --delete dist/ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"

echo "Done."

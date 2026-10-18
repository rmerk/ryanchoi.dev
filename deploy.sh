#!/usr/bin/env bash
set -euo pipefail

DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-.env.deploy}"

if [[ ! -f "$DEPLOY_ENV_FILE" ]]; then
  echo "Missing $DEPLOY_ENV_FILE. Create it with REMOTE_USER, REMOTE_HOST, and REMOTE_PATH." >&2
  exit 1
fi

source "$DEPLOY_ENV_FILE"

: "${REMOTE_USER:?Set REMOTE_USER in $DEPLOY_ENV_FILE}"
: "${REMOTE_HOST:?Set REMOTE_HOST in $DEPLOY_ENV_FILE}"
: "${REMOTE_PATH:?Set REMOTE_PATH in $DEPLOY_ENV_FILE}"

echo "Building..."
pnpm build

echo "Deploying to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}..."
rsync -avz --delete ${RSYNC_PATH:+--rsync-path="$RSYNC_PATH"} dist/ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"

echo "Done."

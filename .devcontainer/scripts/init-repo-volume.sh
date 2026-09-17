#!/bin/bash
# initializeCommand: create and populate the repo clone volume.
# Runs on the HOST before docker compose up. Idempotent — skips if
# the volume already has a .git directory.
# Handles both full checkouts (.git is a directory) and worktrees
# (.git is a pointer file) by resolving to the real .git dir.
set -euo pipefail

VOLUME_NAME="${CDO_REPO_VOLUME:-cdo-repo}"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# Check prerequisites
for cmd in docker git git-lfs; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "init-repo-volume: $cmd is required. Install it first."
    exit 1
  }
done

# Resolve the real .git directory (handles worktrees where .git is a pointer file)
GIT_COMMON_DIR="$(git -C "$REPO_ROOT" rev-parse --git-common-dir 2>/dev/null)"
GIT_DIR="$(cd "$REPO_ROOT" && cd "$GIT_COMMON_DIR" && pwd)"
LFS_DIR="${GIT_DIR}/lfs"

echo "init-repo-volume: git dir = $GIT_DIR"

# Create volume if it doesn't exist
if ! docker volume inspect "$VOLUME_NAME" >/dev/null 2>&1; then
  echo "init-repo-volume: creating volume $VOLUME_NAME..."
  docker volume create "$VOLUME_NAME"
fi

# Check if the volume already has a clone
HAS_GIT=$(docker run --rm -v "$VOLUME_NAME":/repo alpine sh -c \
  'test -d /repo/.git && echo yes || echo no')

if [ "$HAS_GIT" = "yes" ]; then
  echo "init-repo-volume: volume already has a clone, fetching latest..."
  docker run --rm -v "$VOLUME_NAME":/repo --entrypoint sh alpine/git:latest -c \
    "git config --global --add safe.directory /repo && cd /repo && git fetch origin" \
    || echo "init-repo-volume: warning: fetch failed (may be offline)"
else
  echo "init-repo-volume: cloning repository into volume (one-time, ~2 min)..."
  docker run --rm \
    -v "$VOLUME_NAME":/repo \
    -v "${GIT_DIR}":/host-git:ro \
    -v "${LFS_DIR}":/host-lfs:ro \
    --entrypoint sh alpine/git:latest -c "
      git config --global --add safe.directory /host-git
      git config --global --add safe.directory /repo
      cd /repo
      git clone --no-hardlinks /host-git . 2>&1 | tail -3
      git -c remote.origin.url=file:///host-git lfs pull 2>&1 | tail -3
      git remote set-url origin https://github.com/code-dot-org/code-dot-org.git
      chown -R 1000:1000 /repo
    "

  # Copy locals.yml from host checkout into the volume
  docker run --rm \
    -v "$VOLUME_NAME":/repo \
    -v "${REPO_ROOT}/.devcontainer/scripts/sandbox-locals.yml":/tmp/sandbox-locals.yml:ro \
    alpine sh -c "cp /tmp/sandbox-locals.yml /repo/locals.yml && chown 1000:1000 /repo/locals.yml"
fi

# Ensure all volume contents are owned by uid 1000 (cdo user).
# Files copied by root (fixes, locals.yml) may have wrong ownership.
docker run --rm -v "$VOLUME_NAME":/repo alpine sh -c \
  'find /repo -not -user 1000 -exec chown 1000:1000 {} + 2>/dev/null || true'

echo "init-repo-volume: done"

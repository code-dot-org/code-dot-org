#!/bin/bash
# Sandbox entrypoint: prepare the repo volume, then exec CMD.
# Invoked both by ENTRYPOINT (plain docker run) and by postStartCommand
# (devcontainer path, where the CLI replaces ENTRYPOINT with keep-alive).
# Pass "true" as $1 to do the work then exit (postStartCommand mode).
set -euo pipefail

bootstrap_apps() {
  # Only needed for fullstack profile (level pages need /blockly/* assets).
  # Frontend and rails profiles don't need the apps webpack build.
  # Controlled by DEVCONTAINER_BOOTSTRAP_APPS env var (set only in fullstack compose).
  [ "${DEVCONTAINER_BOOTSTRAP_APPS:-}" = "true" ] || return 0

  local blockly_target="/code-dot-org/dashboard/public/blockly"
  if [ -L "$blockly_target" ] && [ -d "$(readlink -f "$blockly_target")" ]; then
    return
  fi

  if command -v bundle >/dev/null 2>&1 && [ -f /code-dot-org/Rakefile ] && \
     git -C /code-dot-org rev-parse HEAD >/dev/null 2>&1; then
    echo "entrypoint: downloading apps package from S3..."
    cd /code-dot-org
    bundle exec rake package:apps:update 2>&1 || true
    bundle exec rake package:apps:symlink 2>&1 || \
      echo "entrypoint: apps bootstrap skipped (S3 package not available for this commit)"
  fi
}

install_hooks() {
  local hooks_dir="/code-dot-org/.git/hooks"
  local tools_dir="/code-dot-org/tools/hooks"
  if [ -d "$tools_dir" ] && [ -d "$hooks_dir" ]; then
    for hook in pre-commit post-checkout post-merge; do
      if [ -f "$tools_dir/$hook" ] && [ ! -L "$hooks_dir/$hook" ]; then
        ln -sf "../../tools/hooks/$hook" "$hooks_dir/$hook"
      fi
    done
  fi
}

# Nothing here migrates or seeds. That is an operator function: development
# mode already raises PendingMigrationError naming what to run, and
# `rake dashboard:setup_db` is the one-shot sync. Doing it on start spends
# minutes on every container for a database that is usually already correct,
# and hides the drift it is papering over.
install_hooks
bootstrap_apps

if [ "${1:-}" = "true" ]; then
  echo "entrypoint: ready (postStartCommand mode)"
  exit 0
fi

exec "$@"

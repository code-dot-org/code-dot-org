#!/bin/bash
# Sandbox entrypoint: start in-container services, bootstrap assets, exec CMD.
# Invoked both by ENTRYPOINT (plain docker run) and by postStartCommand
# (devcontainer path, where the CLI replaces ENTRYPOINT with keep-alive).
# Pass "true" as $1 to run services then exit (postStartCommand mode).
set -euo pipefail

start_services() {
  # MinIO (emulated S3) — always in-container, no sidecar.
  if command -v minio >/dev/null 2>&1 && [ -d /opt/minio-data ]; then
    MINIO_ROOT_USER=local-development MINIO_ROOT_PASSWORD=allstudents \
      minio server /opt/minio-data --address 127.0.0.1:33993 --quiet &
    echo "entrypoint: waiting for minio..."
    until curl -sf http://127.0.0.1:33993/minio/health/ready >/dev/null 2>&1; do
      sleep 0.2
    done
    echo "entrypoint: minio ready"
  fi
}

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

auto_migrate() {
  # Auto-apply pending migrations if Rails and a DB are available.
  # The baked DB image may be behind HEAD's migrations.
  [ -f /code-dot-org/dashboard/Rakefile ] || return 0
  command -v bundle >/dev/null 2>&1 || return 0

  cd /code-dot-org/dashboard
  if bundle exec rails runner "exit(ActiveRecord::Migration.check_pending! rescue 1)" 2>/dev/null; then
    return 0
  fi

  echo "entrypoint: pending migrations detected, running db:migrate..."
  bundle exec rake db:migrate 2>&1 || echo "entrypoint: dev db:migrate had errors (may be non-fatal)"
  RAILS_ENV=test bundle exec rake db:migrate 2>&1 || echo "entrypoint: test db:migrate had errors (may be non-fatal)"
  echo "entrypoint: migrations complete"
}

start_services
install_hooks
auto_migrate
bootstrap_apps

if [ "${1:-}" = "true" ]; then
  echo "entrypoint: services started (postStartCommand mode)"
  exit 0
fi

exec "$@"

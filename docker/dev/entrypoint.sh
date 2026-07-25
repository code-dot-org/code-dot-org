#!/bin/bash
# Sandbox entrypoint: prepare the repo volume and database, then exec CMD.
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

auto_migrate() {
  # Auto-apply pending migrations if Rails and a DB are available.
  # Uses a lightweight MySQL query instead of booting Rails (saves ~60s).
  [ -f /code-dot-org/dashboard/Rakefile ] || return 0
  command -v mysql >/dev/null 2>&1 || return 0

  cd /code-dot-org/dashboard

  # Count migration files vs schema_migrations rows without booting Rails.
  local file_count dir_count
  file_count=$(ls db/migrate/*.rb 2>/dev/null | wc -l)
  dir_count=$(mysql -h "${DB_HOST:-db}" -u root -ppassword -N -e \
    "SELECT COUNT(*) FROM dashboard_development.schema_migrations" 2>/dev/null || echo 0)

  if [ "$file_count" = "$dir_count" ] 2>/dev/null; then
    return 0
  fi

  echo "entrypoint: pending migrations detected ($file_count files vs $dir_count applied), running db:migrate..."
  bundle exec rake db:migrate 2>&1 || echo "entrypoint: dev db:migrate had errors (may be non-fatal)"
  RAILS_ENV=test bundle exec rake db:migrate 2>&1 || echo "entrypoint: test db:migrate had errors (may be non-fatal)"
  echo "entrypoint: migrations complete"
}

install_hooks
auto_migrate
bootstrap_apps

if [ "${1:-}" = "true" ]; then
  echo "entrypoint: ready (postStartCommand mode)"
  exit 0
fi

exec "$@"

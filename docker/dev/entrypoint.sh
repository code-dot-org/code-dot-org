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

  # A checkout that was also built natively carries an absolute symlink to a
  # host path, which does not exist here. Repointing it fixes this container
  # and breaks the host's, so say so rather than doing it quietly.
  if [ -L "$blockly_target" ]; then
    echo "entrypoint: $blockly_target points at $(readlink "$blockly_target"), which does not exist in this container."
    echo "entrypoint: repointing it. On the host, 'bundle exec rake package:apps:symlink' puts it back."
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

assert_db_config() {
  # The migration check below talks to the sidecar directly, so it reports
  # cheerfully even when Rails is configured to talk to something else — which
  # is what a checkout's own locals.yml, written for a native install, does.
  # Catch that here, where the file can still be named, instead of leaving it
  # to surface later as a socket error against /run/mysqld/mysqld.sock.
  local locals=/code-dot-org/locals.yml
  local host="${DB_HOST:-db}"
  [ -f "$locals" ] || return 0
  grep -qE "^db_writer:.*@${host}[:/]" "$locals" && return 0

  echo "entrypoint: $locals does not point db_writer at the '${host}' service, so Rails will not reach this container's database." >&2
  echo "entrypoint: the devcontainer mounts its own locals file there; if you see this, that mount is missing or CDO_LOCALS names the wrong file." >&2
  exit 1
}

auto_migrate() {
  # Auto-apply pending migrations if Rails and a DB are available.
  # Uses a lightweight MySQL query instead of booting Rails (saves ~60s).
  [ -f /code-dot-org/dashboard/Rakefile ] || return 0
  command -v mysql >/dev/null 2>&1 || return 0

  cd /code-dot-org/dashboard

  # Count migration files vs schema_migrations rows without booting Rails.
  local file_count dir_count
  # shellcheck disable=SC2012 # migration filenames are ls-safe by convention
  file_count=$(ls db/migrate/*.rb 2>/dev/null | wc -l)
  dir_count=$(mysql -h "${DB_HOST:-db}" -u root -ppassword -N -e \
    "SELECT COUNT(*) FROM dashboard_development.schema_migrations" 2>/dev/null || echo 0)

  if [ "$file_count" = "$dir_count" ] 2>/dev/null; then
    return 0
  fi

  # Failures here are fatal. A half-migrated database is not a working
  # container, and reporting it as "may be non-fatal" only moves the error to
  # whatever the developer tries first.
  echo "entrypoint: pending migrations detected ($file_count files vs $dir_count applied), running db:migrate..."
  migrate_or_die development
  migrate_or_die test
  echo "entrypoint: migrations complete"
}

migrate_or_die() {
  RAILS_ENV="$1" bundle exec rake db:migrate 2>&1 && return 0
  echo "entrypoint: db:migrate failed for the $1 database; refusing to start with a half-migrated schema." >&2
  exit 1
}

start_services
install_hooks
assert_db_config
auto_migrate
bootstrap_apps

if [ "${1:-}" = "true" ]; then
  echo "entrypoint: services started (postStartCommand mode)"
  exit 0
fi

exec "$@"

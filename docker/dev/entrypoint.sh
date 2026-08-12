#!/bin/bash
# Sandbox entrypoint: start in-container services, bootstrap assets, exec CMD.
# Invoked as the image's ENTRYPOINT, and again as the devcontainer's
# postStartCommand — the CLI leaves the entrypoint in place, so both happen on
# the same container start. See bootstrap_once at the bottom, which is what
# makes that safe. Pass "true" as $1 to bootstrap and exit rather than exec.
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
    # Two gigabytes of somebody's build output is about to be replaced. Name
    # it, and name what replaced it, so this is legible afterwards in a
    # checkout that is shared with a native setup.
    local package_dir=/code-dot-org/dashboard/public/apps-package
    if [ -d "$package_dir" ]; then
      echo "entrypoint: overwriting the apps package in $package_dir (commit_hash $(cat "$package_dir/commit_hash" 2>/dev/null || echo unknown))"
    fi
    echo "entrypoint: downloading apps package from S3..."
    cd /code-dot-org
    bundle exec rake package:apps:update 2>&1 || true
    bundle exec rake package:apps:symlink 2>&1 || \
      echo "entrypoint: apps bootstrap skipped (S3 package not available for this commit)"
    if [ -d "$package_dir" ]; then
      echo "entrypoint: apps package now at commit_hash $(cat "$package_dir/commit_hash" 2>/dev/null || echo unknown)"
    fi
    if [ -L "$blockly_target" ]; then
      echo "entrypoint: $blockly_target -> $(readlink "$blockly_target")"
    fi
  fi
}

install_hooks() {
  local hooks_dir="/code-dot-org/.git/hooks"
  local tools_dir="/code-dot-org/tools/hooks"
  if [ -d "$tools_dir" ] && [ -d "$hooks_dir" ]; then
    # Only where nothing is installed at all. `[ ! -L ]` meant "not one of
    # mine", which is not the same thing: git-lfs writes real files at
    # post-checkout, post-merge, post-commit and pre-push when it clones a
    # repository, and this replaced two of them. Content survives that —
    # smudge and clean are filters, configured system-wide, not hooks — but
    # `git lfs post-checkout` is what repairs a working tree whose files were
    # not smudged on the way in, and either way these hooks belong to git-lfs
    # and not to us. The cost of deferring is the repo's own reminder that
    # dependencies changed; that is the cheaper thing to lose.
    for hook in pre-commit post-checkout post-merge; do
      if [ -f "$tools_dir/$hook" ] && [ ! -e "$hooks_dir/$hook" ]; then
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

bootstrap() {
  start_services
  install_hooks
  assert_db_config
  auto_migrate
  bootstrap_apps
}

# Exactly once per container start, whoever asks. Two things invoke this file
# and neither knows about the other: the image's ENTRYPOINT, and — under the
# devcontainer CLI, which does not replace the entrypoint — postStartCommand.
# Unguarded, both copies run at once; the visible result is two
# `rake package:apps:update` processes unpacking the same two gigabytes into
# the same directory, one of them still going after the CLI reports success.
#
# The marker lives in /dev/shm, a tmpfs the runtime creates fresh for every
# container start, so it means "this boot" and not "this image": a stop/start
# still re-checks migrations. The lock is what makes the second caller wait
# for the first rather than skip a bootstrap that has not finished yet, which
# is also what makes `devcontainer up` return only when the work is done.
#
# Closing the descriptor matters: the ENTRYPOINT path ends in `exec "$@"`, and
# an inherited lock would be held for the life of the container.
bootstrap_once() {
  if [ ! -w /dev/shm ]; then
    bootstrap
    return
  fi
  exec 9>/dev/shm/cdo-entrypoint.lock
  flock 9
  if [ -e /dev/shm/cdo-entrypoint.done ]; then
    echo "entrypoint: bootstrap already ran for this container start"
  else
    bootstrap
    : > /dev/shm/cdo-entrypoint.done
  fi
  exec 9>&-
}

bootstrap_once

if [ "${1:-}" = "true" ]; then
  echo "entrypoint: services started (postStartCommand mode)"
  exit 0
fi

exec "$@"

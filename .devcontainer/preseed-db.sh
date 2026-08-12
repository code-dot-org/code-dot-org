#!/bin/bash
# Pre-seeds a MySQL datadir for the cdo-devdb image: runs SETUP.md's setup
# against mysql:8.0, the version Dockerfile.db builds on (InnoDB refuses a
# datadir a newer server wrote), stops it cleanly, and tars the datadir.
#
#   .devcontainer/preseed-db.sh
#   docker build -f .devcontainer/Dockerfile.db -t cdo-devdb:local .devcontainer
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${HERE}/.." && pwd)"
OUTPUT="${1:-${HERE}/mysql-data.tar}"
NETWORK="cdo-preseed-$$"
DB_CONTAINER="cdo-preseed-db-$$"
APP_CONTAINER="cdo-preseed-app-$$"
DATADIR="/var/lib/mysql"

die() { echo "preseed-db: error: $*" >&2; exit 1; }
info() { echo "preseed-db: $*"; }

cleanup() {
  docker rm -f "$APP_CONTAINER" "$DB_CONTAINER" 2>/dev/null || true
  docker network rm "$NETWORK" 2>/dev/null || true
}
trap cleanup EXIT

info "creating network..."
docker network create "$NETWORK"

info "starting mysql:8.0 sidecar..."
# --skip-log-bin: the seed writes about a gigabyte of binary log. The image
# would carry that log forever, and no devcontainer reads it.
docker run -d --name "$DB_CONTAINER" --network "$NETWORK" --network-alias db \
  -e MYSQL_ROOT_PASSWORD=not-a-secret-password \
  -e MYSQL_ROOT_HOST='%' \
  mysql:8.0 --skip-log-bin

info "waiting for mysql..."
until docker exec "$DB_CONTAINER" mysqladmin -uroot -pnot-a-secret-password ping --silent 2>/dev/null; do
  sleep 0.5
done
# The bootstrap server answers a ping before the real server starts. Repeat
# the first real query until it succeeds.
info "waiting for mysql to accept queries..."
until docker exec "$DB_CONTAINER" mysql -uroot -pnot-a-secret-password -e "SELECT 1" >/dev/null 2>&1; do
  sleep 1
done
info "mysql ready"

info "creating databases..."
# Only dashboard_test: db:setup_or_migrate's exists? check uses SHOW
# TABLES, so an empty dashboard_development reads as "exists" and takes
# the slow db:migrate path instead of db:create.
docker exec "$DB_CONTAINER" mysql -uroot -pnot-a-secret-password -e \
  "CREATE DATABASE IF NOT EXISTS dashboard_test;"

info "seeding the databases..."
docker run --rm --name "$APP_CONTAINER" --network "$NETWORK" \
  -v "${REPO_ROOT}":/code-dot-org \
  -v "${HERE}/locals.yml.sample":/code-dot-org/locals.yml:ro \
  --entrypoint bash \
  "${CDO_DEV_IMAGE:-ghcr.io/code-dot-org/cdo-dev:latest}" -c "
    set -euo pipefail
    cd /code-dot-org/dashboard
    # SETUP.md's two commands for a new developer; see dashboard/Rakefile.
    echo 'preseed: running dashboard:setup_db...'
    bundle exec rake dashboard:setup_db
    # db:test:prepare, not db:migrate: dashboard/lib/tasks/seed_in_test.rake
    # makes this seed, not just shape, the test database — saving ~77 s on
    # a fresh container's first testunit run.
    echo 'preseed: preparing and seeding the test database...'
    RAILS_ENV=test bundle exec rake db:test:prepare
    echo 'preseed: seeding complete'
  "

# SIGTERM, then wait: mysqld flushes InnoDB and exits 0. The generous
# timeout avoids docker's 10 s default SIGKILL mid-flush, which would need
# crash recovery on the next start.
info "stopping mysql..."
docker stop --timeout 120 "$DB_CONTAINER" >/dev/null

exit_code="$(docker inspect -f '{{.State.ExitCode}}' "$DB_CONTAINER")"
oom_killed="$(docker inspect -f '{{.State.OOMKilled}}' "$DB_CONTAINER")"
[ "$exit_code" = "0" ] || die "mysqld exited $exit_code; the datadir is not clean"
[ "$oom_killed" = "false" ] || die "mysqld was OOM-killed; the datadir is not clean"
info "mysqld exited 0"

info "exporting datadir to ${OUTPUT}..."
# docker cp wraps the tar in a mysql/ directory; re-tar from the root so
# ADD unpacks files where Dockerfile.db expects them.
EXPORT_DIR=$(mktemp -d)
docker cp "$DB_CONTAINER":${DATADIR}/. "$EXPORT_DIR"/
tar -C "$EXPORT_DIR" -cf "$OUTPUT" .
rm -rf "$EXPORT_DIR"

info "pre-seed complete: $(du -sh "$OUTPUT" | cut -f1)"

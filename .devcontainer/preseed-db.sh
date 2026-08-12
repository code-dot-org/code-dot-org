#!/bin/bash
# Pre-seed a MySQL datadir for the cdo-devdb image. This script sets up a
# dashboard database the way SETUP.md does, stops the server, and writes the
# datadir to a tar file.
#
# The server that does the seeding is mysql:8.0, the image Dockerfile.db
# builds on. The two versions therefore agree by construction. InnoDB refuses
# to open a datadir that a newer server wrote.
#
# CI runs this script too. See .github/workflows/cdo-devdb-image.yml, which
# publishes the image. To make your own image, run:
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
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_ROOT_HOST='%' \
  mysql:8.0 --skip-log-bin

info "waiting for mysql..."
until docker exec "$DB_CONTAINER" mysqladmin -uroot -ppassword ping --silent 2>/dev/null; do
  sleep 0.5
done
# The bootstrap server answers a ping before the real server starts. Repeat
# the first real query until it succeeds.
info "waiting for mysql to accept queries..."
until docker exec "$DB_CONTAINER" mysql -uroot -ppassword -e "SELECT 1" >/dev/null 2>&1; do
  sleep 1
done
info "mysql ready"

info "creating databases..."
# Create dashboard_test only. The database_exists? check in db:setup_or_migrate
# uses SHOW TABLES, so it reads an empty dashboard_development as "exists" and
# takes the db:migrate path. That path replays every migration from version 0.
# Let db:create make the development database instead.
docker exec "$DB_CONTAINER" mysql -uroot -ppassword -e \
  "CREATE DATABASE IF NOT EXISTS dashboard_test;"

info "seeding the databases..."
docker run --rm --name "$APP_CONTAINER" --network "$NETWORK" \
  -v "${REPO_ROOT}":/code-dot-org \
  -v "${HERE}/locals.yml.sample":/code-dot-org/locals.yml:ro \
  --entrypoint bash \
  "${CDO_DEV_IMAGE:-ghcr.io/code-dot-org/cdo-dev:latest}" -c "
    set -euo pipefail
    cd /code-dot-org/dashboard
    # The two commands SETUP.md gives a new developer. dashboard:setup_db is
    # db:setup_or_migrate plus seed:default; see dashboard/Rakefile.
    echo 'preseed: running dashboard:setup_db...'
    bundle exec rake dashboard:setup_db
    # Use db:test:prepare, not db:migrate. The test database must arrive
    # seeded, not only shaped. dashboard extends this task in
    # dashboard/lib/tasks/seed_in_test.rake to load fixtures and to run
    # seed:test after the schema load. That work is the ~77 s a fresh
    # container otherwise pays on its first testunit run, and seed:standards
    # alone is 15 s of it. seed:test already contains the secret_words and
    # secret_pictures steps that TESTING.md tells you to run by hand.
    echo 'preseed: preparing and seeding the test database...'
    RAILS_ENV=test bundle exec rake db:test:prepare
    echo 'preseed: seeding complete'
  "

# Stop the server the way docker stops it: SIGTERM, then wait. mysqld flushes
# InnoDB and exits 0. The timeout is generous on purpose — docker's 10 s
# default sends SIGKILL in the middle of a large flush, and a datadir written
# that way needs crash recovery on every later start.
info "stopping mysql..."
docker stop --timeout 120 "$DB_CONTAINER" >/dev/null

exit_code="$(docker inspect -f '{{.State.ExitCode}}' "$DB_CONTAINER")"
oom_killed="$(docker inspect -f '{{.State.OOMKilled}}' "$DB_CONTAINER")"
[ "$exit_code" = "0" ] || die "mysqld exited $exit_code; the datadir is not clean"
[ "$oom_killed" = "false" ] || die "mysqld was OOM-killed; the datadir is not clean"
info "mysqld exited 0"

info "exporting datadir to ${OUTPUT}..."
# docker cp writes a tar with a directory wrapper (mysql/file). Extract it to
# a host directory first, then write a new tar from the root level, so that
# ADD unpacks the files where Dockerfile.db expects them.
EXPORT_DIR=$(mktemp -d)
docker cp "$DB_CONTAINER":${DATADIR}/. "$EXPORT_DIR"/
tar -C "$EXPORT_DIR" -cf "$OUTPUT" .
rm -rf "$EXPORT_DIR"

info "pre-seed complete: $(du -sh "$OUTPUT" | cut -f1)"

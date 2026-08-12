#!/bin/bash
# Bake a seeded MySQL datadir for the cdo-devdb image: seed a real dashboard
# under this exact server version, shut it down cleanly, and tar the datadir.
#
# The seeding server is mysql:8.0, the same image Dockerfile.db builds on, so
# server and datadir versions match by construction — InnoDB refuses to open a
# datadir from a newer server.
#
# CI runs this too — see .github/workflows/cdo-devdb-image.yml, which is where
# the published image comes from. Run it by hand to get one of your own:
#
#   .devcontainer/bake-db.sh
#   docker build -f .devcontainer/Dockerfile.db -t cdo-devdb:local .devcontainer
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${HERE}/.." && pwd)"
OUTPUT="${1:-${HERE}/mysql-data.tar}"
NETWORK="cdo-bake-$$"
DB_CONTAINER="cdo-bake-db-$$"
APP_CONTAINER="cdo-bake-app-$$"
DATADIR="/var/lib/mysql"

die() { echo "bake-db: error: $*" >&2; exit 1; }
info() { echo "bake-db: $*"; }

cleanup() {
  docker rm -f "$APP_CONTAINER" "$DB_CONTAINER" 2>/dev/null || true
  docker network rm "$NETWORK" 2>/dev/null || true
}
trap cleanup EXIT

info "creating network..."
docker network create "$NETWORK"

info "starting mysql:8.0 sidecar..."
# --skip-log-bin: a seed writes about a gigabyte of binary log that the baked
# image would carry forever and no devcontainer would ever read.
docker run -d --name "$DB_CONTAINER" --network "$NETWORK" --network-alias db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_ROOT_HOST='%' \
  mysql:8.0 --skip-log-bin

info "waiting for mysql..."
until docker exec "$DB_CONTAINER" mysqladmin -uroot -ppassword ping --silent 2>/dev/null; do
  sleep 0.5
done
# ping succeeds against the bootstrap server before the real server is ready.
# Retry the first real query until it works.
info "waiting for mysql to accept queries..."
until docker exec "$DB_CONTAINER" mysql -uroot -ppassword -e "SELECT 1" >/dev/null 2>&1; do
  sleep 1
done
info "mysql ready"

info "creating databases..."
# Only dashboard_test here: db:setup_or_migrate's database_exists? check
# (SHOW TABLES) treats a pre-existing-but-empty dashboard_development as
# "exists" and takes the db:migrate path (full historical replay from schema
# version 0) instead of db:create + db:schema:load. Let db:create make it.
docker exec "$DB_CONTAINER" mysql -uroot -ppassword -e \
  "CREATE DATABASE IF NOT EXISTS dashboard_test;"

info "running schema:load + seed..."
docker run --rm --name "$APP_CONTAINER" --network "$NETWORK" \
  -v "${REPO_ROOT}":/code-dot-org \
  -v "${HERE}/locals.yml.sample":/code-dot-org/locals.yml:ro \
  -e DEVCONTAINER_BOOTSTRAP_APPS=false \
  --entrypoint bash \
  "${CDO_DEV_IMAGE:-ghcr.io/code-dot-org/cdo-dev:latest}" -c "
    set -euo pipefail
    cd /code-dot-org/dashboard
    echo 'bake: running db:setup_or_migrate...'
    bundle exec rake db:setup_or_migrate
    echo 'bake: running seed:default...'
    bundle exec rake seed:default
    echo 'bake: migrating test DB...'
    RAILS_ENV=test bundle exec rake db:migrate
    echo 'bake: complete'
  "

info "shutting down mysql cleanly..."
docker exec "$DB_CONTAINER" mysqladmin -uroot -ppassword shutdown --wait
until ! docker exec "$DB_CONTAINER" mysqladmin -uroot -ppassword ping --silent 2>/dev/null; do
  sleep 0.5
done

info "verifying clean shutdown..."
if docker logs "$DB_CONTAINER" 2>&1 | grep -q "Shutdown complete"; then
  info "clean shutdown confirmed"
else
  die "dirty shutdown detected"
fi

info "exporting datadir to ${OUTPUT}..."
# docker cp produces a tar with a directory wrapper (mysql/file) — extract
# to a host dir first, then re-tar at root level so ADD unpacks correctly.
EXPORT_DIR=$(mktemp -d)
docker cp "$DB_CONTAINER":${DATADIR}/. "$EXPORT_DIR"/
tar -C "$EXPORT_DIR" -cf "$OUTPUT" .
rm -rf "$EXPORT_DIR"

info "bake complete: $(du -sh "$OUTPUT" | cut -f1)"

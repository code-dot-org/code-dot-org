#!/bin/bash
# Bake a seeded MySQL datadir for the cdo-dev-db image.
#
# Runs the cdo-migrate image — Rails source and curriculum baked, the same
# image the k8s seed Job uses — against a mysql:8.0 sidecar (matching the
# runtime topology). db:setup_or_migrate takes the schema:load path on the
# fresh server, NOT migration replay. The repo volume is not involved: the
# code that seeds is the code in the image, so the bake works before
# init-repo-volume.sh has ever run.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT="${1:-$SCRIPT_DIR/../mysql-data.tar}"
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
docker run -d --name "$DB_CONTAINER" --network "$NETWORK" --network-alias db \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_ROOT_HOST='%' \
  mysql:8.0

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

# locals.yml is mounted, not baked: the migrate image deliberately carries
# no configuration. The test-DB migrate rides along because sandboxes run
# the test suite; it is not part of the image's default job (a k8s seed Job
# has no test database).
info "running migrate job (db:setup_or_migrate + seed:default)..."
docker run --rm --name "$APP_CONTAINER" --network "$NETWORK" \
  -v "$SCRIPT_DIR/sandbox-locals.yml":/code-dot-org/locals.yml:ro \
  -e AWS_EC2_METADATA_DISABLED=true \
  "${CDO_MIGRATE_IMAGE:-ghcr.io/code-dot-org/cdo-migrate:latest}" \
  bash -c "
    set -euo pipefail
    cdo-migrate
    echo 'bake: migrating test DB...'
    cd /code-dot-org/dashboard
    RAILS_ENV=test bundle exec rake db:migrate
    echo 'bake: complete'
  "

info "shutting down mysql cleanly..."
# mysqladmin exits 137 here: --wait retries after mysqld is gone, the
# container stops, and the exec is killed. The real check is the ping loop
# and the "Shutdown complete" assertion below, so ignore the status.
docker exec "$DB_CONTAINER" mysqladmin -uroot -ppassword shutdown || true
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

#!/bin/bash
# Proves a cdo-devdb image is a database, not just a tarball that unpacked:
# checks every migration is applied, the seed's curriculum and clock, and
# that the test database arrived seeded, not merely present.
#
#   .devcontainer/devdb-smoke.sh cdo-devdb:local
set -euo pipefail

IMAGE="${1:?usage: devdb-smoke.sh <image-ref>}"
CONTAINER="devdb-smoke-$$"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d --name "$CONTAINER" "$IMAGE" >/dev/null
for _ in $(seq 60); do
  docker exec "$CONTAINER" mysqladmin -uroot -pnot-a-secret-password ping --silent 2>/dev/null && break
  sleep 2
done

q() { docker exec "$CONTAINER" mysql -uroot -pnot-a-secret-password -N -e "$1" 2>/dev/null; }

applied="$(q 'SELECT COUNT(*) FROM dashboard_development.schema_migrations')"
# shellcheck disable=SC2012 # migration filenames are ls-safe by convention
expected="$(ls "$REPO_ROOT"/dashboard/db/migrate/*.rb | wc -l)"
test "$applied" = "$expected" \
  || { echo "migrations: $applied applied, $expected in the checkout" >&2; exit 1; }

levels="$(q 'SELECT COUNT(*) FROM dashboard_development.levels')"
test "$levels" -gt 50000 \
  || { echo "levels: only $levels seeded" >&2; exit 1; }

test "$(q "SELECT COUNT(*) FROM dashboard_development.scripts WHERE name = 'hourofcode'")" = 1 \
  || { echo "the hourofcode script is missing" >&2; exit 1; }

# Must arrive seeded, not merely present: same schema, plus something only
# seed:test puts there. Saves ~77 s on a fresh container's first testunit run.
test_applied="$(q 'SELECT COUNT(*) FROM dashboard_test.schema_migrations')"
test "$test_applied" = "$applied" \
  || { echo "test database: $test_applied migrations against the dev database's $applied" >&2; exit 1; }

words="$(q 'SELECT COUNT(*) FROM dashboard_test.secret_words')"
test "$words" -gt 0 \
  || { echo "test database is unseeded: secret_words is empty" >&2; exit 1; }

# SETUP.md wants +00:00 globally. It comes from the image's CMD, so it
# survives a container recreate where SET PERSIST would not.
tz="$(q 'SELECT @@global.time_zone')"
test "$tz" = "+00:00" \
  || { echo "global time_zone is $tz, not +00:00" >&2; exit 1; }

echo "smoke: $(docker exec "$CONTAINER" uname -m), $applied migrations, $levels levels, test database seeded ($words secret words), time_zone $tz"

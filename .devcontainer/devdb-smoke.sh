#!/bin/bash
# Prove a cdo-devdb image is a database and not just a tarball that unpacked:
# it starts, every migration in this checkout is applied, the curriculum the
# seed ran for is really in there, the test database arrived seeded rather
# than merely present, and the clock is the one SETUP.md asks for.
#
# Takes an image reference. Two callers: the workflow's per-arch smoke matrix,
# which runs it natively on each architecture, and anyone who just built one.
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
  docker exec "$CONTAINER" mysqladmin -uroot -ppassword ping --silent 2>/dev/null && break
  sleep 2
done

q() { docker exec "$CONTAINER" mysql -uroot -ppassword -N -e "$1" 2>/dev/null; }

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

# The test database has to arrive seeded, not merely present: same schema as
# the dev one, and something in it that only seed:test puts there. Without
# this a fresh container pays ~77 s on its first testunit run.
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

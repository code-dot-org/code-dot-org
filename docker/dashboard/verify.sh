#!/usr/bin/env bash
#
# End-to-end verification of the cdo-dashboard image: boots the artifact and
# drives it through every interaction model it ships for. Usage:
#   ./verify.sh <image-ref> <engine>
# e.g.
#   ./verify.sh cdo-dashboard:test docker
#   ./verify.sh cdo-dashboard:test podman
#
# Orchestration is compose.yaml, configuration is adhoc.env, and the phase
# payloads live in verify/ — this script only sequences and asserts.
# Rationale for each check: README.md.

# pipefail: phases pipe container output into grep, and without it a container
# that prints its marker and then dies at teardown reports ok.
set -uo pipefail

IMAGE="${1:?usage: verify.sh <image-ref> <engine>}"
ENGINE="${2:?usage: verify.sh <image-ref> <engine>}"
export IMAGE
DIR="$(cd "$(dirname "$0")" && pwd)"

# Per-run project so concurrent runs cannot collide; plain output because
# compose's ANSI codes and podman's provider banner otherwise land in the
# captured markers below.
export PODMAN_COMPOSE_WARNING_LOGS=false
compose() {
  "$ENGINE" compose --ansi never --progress quiet \
    -f "$DIR/compose.yaml" -p "cdo-dash-verify-$$" "$@"
}

cleanup() { compose down -v --timeout 5 > /dev/null 2>&1; }
trap cleanup EXIT

fail() {
  echo "FAIL  $1" >&2
  echo "---- last web logs ----" >&2
  compose logs --tail 40 web >&2 || true
  exit 1
}

step() { echo "===== $1"; }

# app <cmd...> — one-off container with the web service's image and env.
app() { compose run --rm --no-deps web "$@"; }

step "backing services"
compose up -d --wait mysql redis || fail "mysql/redis never became healthy"
compose exec mysql mysql -uroot \
  -e 'CREATE DATABASE dashboard_adhoc; CREATE DATABASE pegasus_adhoc;' \
  || fail "database create"

step "1/4 schema loads from the image"
app bundle exec rails db:schema:load || fail "db:schema:load"
tables="$(compose exec mysql mysql -uroot -N \
  -e 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema="dashboard_adhoc"')"
[ "$tables" -gt 200 ] || fail "expected >200 tables, got ${tables}"
echo "ok    ${tables} tables"

step "2/4 model write: create a teacher via rails runner"
created="$(app bundle exec rails runner "$(cat "$DIR/verify/create_teacher.rb")" 2>&1 \
  | grep -o 'USER-CREATED id=[0-9]*')" || fail "user creation"
user_id="${created#USER-CREATED id=}"
echo "ok    user id=${user_id}"

step "3/4 worker: enqueue and perform a job through Delayed::Worker"
app bundle exec rails runner "$(cat "$DIR/verify/perform_probe_job.rb")" 2>&1 \
  | grep -q DJ-OK || fail "delayed_job enqueue/perform"
echo "ok    enqueue + work_off performed the job"

step "4/4 api over HTTP: sign in and fetch the user"
compose up -d --wait web || fail "puma never became healthy"
echo "ok    health_check healthy"

body="$(app sh -c "$(cat "$DIR/verify/session_probe.sh")")" \
  || fail "sign-in flow: ${body}"
echo "$body" | grep -qF "\"id\":${user_id}" || fail "api body lacks id=${user_id}: ${body}"
echo "$body" | grep -qF '"is_signed_in":true' || fail "api body lacks is_signed_in: ${body}"
echo "$body" | grep -qF '"user_type":"teacher"' || fail "api body lacks user_type: ${body}"
echo "ok    /api/v1/users/current returned the created user"

echo "----"
echo "all verifications passed on $ENGINE"

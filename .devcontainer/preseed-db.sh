#!/bin/bash
# Seeds mysql:8.0 through the docker/dev harness, then copies the datadir to
# .devcontainer/mysql-data for Dockerfile.db.
set -euo pipefail
cd "$(dirname "$0")/../docker/dev"

# A project of its own, so `down -v` cannot remove a developer's database.
export COMPOSE_PROJECT_NAME=cdo-preseed
trap 'docker compose down -v' EXIT

docker compose up -d --wait mysql
# seed:production checks rubrics against S3 unless S3 is emulated.
docker compose run --rm -e CDO_AWS_S3_EMULATED=true app bash -ec '
  cd dashboard
  bundle exec rake db:provision_sql_users
  bundle exec rake dashboard:setup_db seed:production
  RAILS_ENV=test bundle exec rake db:create db:test:prepare'
docker compose stop mysql

db="$(docker compose ps -aq mysql)"
test "$(docker inspect -f '{{.State.ExitCode}}' "$db")" = 0 \
  || { echo "mysqld did not stop cleanly; the datadir is not usable" >&2; exit 1; }
rm -rf ../../.devcontainer/mysql-data
docker cp "$db":/var/lib/mysql ../../.devcontainer/mysql-data

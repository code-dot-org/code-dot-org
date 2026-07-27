#!/bin/bash
# The migrate Job: create-or-migrate the dashboard database, then seed it
# from the curriculum baked into this image.
#
# db:setup_or_migrate takes the schema:load path on an empty server and the
# db:migrate path on an existing one, so the same Job serves first boot and
# every deploy after it. RAILS_ENV and database endpoints come from the
# environment and locals.yml, both provided by the runner.
set -euo pipefail

cd /code-dot-org/dashboard

echo "cdo-migrate: db:setup_or_migrate..."
bundle exec rake db:setup_or_migrate

echo "cdo-migrate: seed:default..."
bundle exec rake seed:default

echo "cdo-migrate: done"

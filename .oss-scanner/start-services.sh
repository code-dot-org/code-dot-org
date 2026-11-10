#!/usr/bin/env bash
# Start the local services the Rails app and its Ruby unit tests expect, inside
# the OSS Scanner image (no network, 2 CPUs / 8 GB). Safe to run repeatedly.
#
#   .oss-scanner/start-services.sh          start MySQL 8, Redis and the S3
#                                           emulator; load the test schemas if
#                                           they are not there yet
#   .oss-scanner/start-services.sh --reset  also drop and reload the test schemas
#                                           (this discards the seeded curriculum
#                                           and demo accounts)
#
# What it sets up (all local, no secrets, RAILS_ENV=test as in the image):
#   - MySQL 8.0 on /var/run/mysqld/mysqld.sock and 127.0.0.1:3306: root with
#     an empty password (the admin credential in config/test.yml.erb), and
#     the password-less `writer` and `reader` users Rails connects as
#   - dashboard_test   <- `rails db:test:prepare`, as CI does: schema.rb, test
#                         fixtures and `seed:test`; for the tests
#   - dashboard_test_app <- the same, for the app run with TEST_ENV_NUMBER=_app;
#                         the image build seeds curriculum and demo accounts here
#   - pegasus_test     <- pegasus/migrations       (Sequel migrations)
#   - Redis on 127.0.0.1:6379
#   - S3 on 127.0.0.1:9000 (moto, in memory), with the app's buckets; the
#     image's locals.yml points the app at it
set -euo pipefail

SRC=${SRC:-/src}
LOG=/var/log/oss-scanner
mkdir -p "$LOG"
export RAILS_ENV=test RACK_ENV=test DISABLE_SPRING=1

start_mysql() {
  mkdir -p /var/run/mysqld && chown mysql:mysql /var/run/mysqld
  if [ ! -d /var/lib/mysql/mysql ]; then
    echo "initializing MySQL data directory"
    rm -rf /var/lib/mysql && mkdir -p /var/lib/mysql && chown mysql:mysql /var/lib/mysql
    mysqld --initialize-insecure --user=mysql --datadir=/var/lib/mysql >"$LOG/mysql-init.log" 2>&1
  fi
  if ! mysqladmin --protocol=socket -uroot ping >/dev/null 2>&1; then
    # Sized for the 8 GB audit machine.
    mysqld --user=mysql --datadir=/var/lib/mysql \
      --socket=/var/run/mysqld/mysqld.sock --bind-address=127.0.0.1 --port=3306 \
      --innodb-buffer-pool-size=256M --performance-schema=OFF --skip-log-bin \
      --mysqlx=OFF --max-connections=100 \
      --sql-mode="STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION" \
      >"$LOG/mysqld.log" 2>&1 &
    for _ in $(seq 1 60); do
      mysqladmin --protocol=socket -uroot ping >/dev/null 2>&1 && break
      sleep 1
    done
  fi
  mysqladmin --protocol=socket -uroot ping >/dev/null
  # Ubuntu's root@localhost may use auth_socket; make it password-less
  # caching_sha2 so both the socket and TCP connections work.
  mysql --protocol=socket -uroot -e \
    "ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY ''; \
     CREATE USER IF NOT EXISTS 'root'@'127.0.0.1' IDENTIFIED WITH caching_sha2_password BY ''; \
     GRANT ALL ON *.* TO 'root'@'127.0.0.1' WITH GRANT OPTION; FLUSH PRIVILEGES;"
  echo "MySQL: up ($(mysqld --version | awk '{print $3}'))"
}

start_redis() {
  if ! redis-cli -h 127.0.0.1 ping >/dev/null 2>&1; then
    redis-server --bind 127.0.0.1 --port 6379 --save '' --appendonly no --daemonize yes \
      --logfile "$LOG/redis.log" --maxmemory 256mb
    for _ in $(seq 1 20); do redis-cli -h 127.0.0.1 ping >/dev/null 2>&1 && break; sleep 0.5; done
  fi
  redis-cli -h 127.0.0.1 ping >/dev/null
  echo "Redis: up"
}

load_schemas() {
  local reset=$1 suffix
  if [ "$reset" = 1 ]; then
    mysql -uroot -e "DROP DATABASE IF EXISTS dashboard_test; DROP DATABASE IF EXISTS dashboard_test_app; \
                     DROP DATABASE IF EXISTS pegasus_test;"
  fi
  mysql -uroot -e "CREATE DATABASE IF NOT EXISTS pegasus_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  # dashboard_test for the tests, dashboard_test_app (TEST_ENV_NUMBER=_app)
  # for the browsable app: the image seeds curriculum into the second one
  # only, since tests create units by the names the seed would take.
  for suffix in "" _app; do
    mysql -uroot -e "CREATE DATABASE IF NOT EXISTS dashboard_test$suffix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    if ! mysql -uroot -e "SELECT 1 FROM dashboard_test$suffix.schema_migrations LIMIT 1" >/dev/null 2>&1; then
      echo "preparing dashboard_test$suffix (schema.rb + test fixtures + seed:test)"
      # What CI runs (dashboard/lib/tasks/seed_in_test.rake): schema, fixtures,
      # and the small `seed:test` set from repo files (games, videos, secret
      # words/pictures, schools, standards, foorms). Not the curriculum seed.
      # SKIP_SCRIPT_PRELOAD: config/initializers/script_preload.rb queries the
      # curriculum tables at boot, which do not exist yet.
      (cd "$SRC/dashboard" && TEST_ENV_NUMBER=$suffix SKIP_SCRIPT_PRELOAD=1 bundle exec rails db:test:prepare) \
        >"$LOG/dashboard$suffix-schema.log" 2>&1 \
        || { echo "dashboard_test$suffix schema load FAILED, see $LOG/dashboard$suffix-schema.log"; \
             tail -20 "$LOG/dashboard$suffix-schema.log"; return 1; }
    fi
  done
  if ! mysql -uroot -e "SELECT 1 FROM pegasus_test.schema_info LIMIT 1" >/dev/null 2>&1; then
    echo "migrating pegasus_test"
    (cd "$SRC/pegasus" && bundle exec rake db:ensure_created db:migrate) >"$LOG/pegasus-schema.log" 2>&1 \
      || { echo "pegasus migrate FAILED, see $LOG/pegasus-schema.log"; tail -20 "$LOG/pegasus-schema.log"; return 1; }
  fi
  echo "schemas: dashboard_test, dashboard_test_app, pegasus_test ready"
}

start_s3() {
  # Buckets the app writes to, from docker/developers/install-s3.sh. moto keeps
  # them in memory, so they are created on every start.
  local buckets="cdo-ai cdo-animation-library cdo-restricted cdo-sound-library cdo-v3-animations
                 cdo-v3-assets cdo-v3-files cdo-v3-libraries cdo-v3-sources videos.code.org"
  if ! curl -s -o /dev/null http://127.0.0.1:9000/; then
    /opt/s3-emulator/bin/moto_server -H 127.0.0.1 -p 9000 >"$LOG/s3.log" 2>&1 &
    for _ in $(seq 1 30); do curl -s -o /dev/null http://127.0.0.1:9000/ && break; sleep 0.5; done
  fi
  /opt/s3-emulator/bin/python - $buckets <<'EOF'
import sys, boto3
s3 = boto3.client('s3', endpoint_url='http://127.0.0.1:9000', region_name='us-east-1',
                  aws_access_key_id='local-development', aws_secret_access_key='allstudents')
existing = {b['Name'] for b in s3.list_buckets()['Buckets']}
for name in sys.argv[1:]:
    if name not in existing:
        s3.create_bucket(Bucket=name)
    s3.put_bucket_versioning(Bucket=name, VersioningConfiguration={'Status': 'Enabled'})
EOF
  echo "S3 emulator: up on 127.0.0.1:9000"
}

provision_sql_users() {
  # What `rake db:provision_sql_users` does in CI and development. That task
  # runs only when CI is set, and CI also points the test config at CI-only
  # hostnames, so call the provisioner directly. Idempotent.
  (cd "$SRC" && bundle exec ruby -Ilib -r ./deployment -r cdo/sql_user_provisioner \
     -e 'Cdo::SqlUserProvisioner.provision_from_config!') >"$LOG/sql-users.log" 2>&1 \
    || { echo "SQL user provisioning FAILED, see $LOG/sql-users.log"; tail -20 "$LOG/sql-users.log"; return 1; }
  echo "SQL users: writer, reader ready"
}

reset=0
[ "${1:-}" = "--reset" ] && reset=1
start_mysql
start_redis
start_s3
provision_sql_users
load_schemas "$reset"

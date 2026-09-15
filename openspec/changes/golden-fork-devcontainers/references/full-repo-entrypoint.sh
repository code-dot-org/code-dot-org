#!/bin/bash
# cdo-spike-e entrypoint: start mysqld + redis-server + minio (emulated S3)
# in the background, wait for all three to answer, then exec the container
# CMD (default: bash). Extends the cdo-spike-c foundation entrypoint by the
# minio block; everything else is byte-identical.
set -euo pipefail

MYSQL_DATADIR=/opt/mysql-data
MYSQL_SOCK=${MYSQL_DATADIR}/mysqld.sock
MYSQL_PID=${MYSQL_DATADIR}/mysqld.pid
MYSQL_LOG=${MYSQL_DATADIR}/error.log

# --no-defaults: the mysql-server apt package's /etc/mysql/my.cnf sets
# user=mysql, datadir=/var/lib/mysql, socket=/var/run/mysqld/mysqld.sock --
# all wrong for this non-root, custom-datadir setup. Passing every flag
# explicitly on the command line avoids fighting that file.
mysqld \
  --no-defaults \
  --datadir="${MYSQL_DATADIR}" \
  --socket="${MYSQL_SOCK}" \
  --pid-file="${MYSQL_PID}" \
  --log-error="${MYSQL_LOG}" \
  --port=3306 \
  --bind-address=127.0.0.1 \
  --skip-log-bin \
  --mysqlx=OFF \
  --innodb-flush-log-at-trx-commit=0 \
  --skip-innodb-doublewrite \
  --innodb-buffer-pool-size=256M \
  &

redis-server --daemonize no --port 6379 --bind 127.0.0.1 &

# Emulated S3 (locals.yml: aws_s3_emulated + aws_s3_endpoint 127.0.0.1:33993).
# Credentials must match locals.yml's aws_s3_access_key_id / _secret_access_key.
# Buckets are pre-created in the image (see Dockerfile).
MINIO_ROOT_USER=local-development MINIO_ROOT_PASSWORD=allstudents \
  minio server /opt/minio-data --address 127.0.0.1:33993 --quiet &

echo "entrypoint: waiting for mysqld..."
until mysqladmin --socket="${MYSQL_SOCK}" -uroot -ppassword ping --silent 2>/dev/null; do
  sleep 0.2
done
echo "entrypoint: mysqld ready"

echo "entrypoint: waiting for redis..."
until redis-cli -h 127.0.0.1 -p 6379 ping 2>/dev/null | grep -q PONG; do
  sleep 0.2
done
echo "entrypoint: redis ready"

echo "entrypoint: waiting for minio..."
until curl -sf http://127.0.0.1:33993/minio/health/ready >/dev/null 2>&1; do
  sleep 0.2
done
echo "entrypoint: minio ready"

exec "$@"

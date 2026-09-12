#!/bin/bash
# cdo-spike-c entrypoint: start mysqld + redis-server in the background,
# wait for both to answer, then exec the container CMD (default: bash).
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

exec "$@"

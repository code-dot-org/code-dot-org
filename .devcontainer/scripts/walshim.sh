#!/bin/bash
# WAL shim: relocate redo+undo logs to tmpfs at container start if they exist.
# Reduces overlayfs writable-layer growth. Skips gracefully if the datadir
# layout doesn't have separate redo/undo files (varies by MySQL version/config).
set -euo pipefail

D=/opt/mysql-data
W=/mysql-wal

mkdir -p "$W"

# After clean shutdown, MySQL 8.0 removes #innodb_redo/. An empty-but-present
# directory tells mysqld "clean 8.0.30+ shutdown, recreate logs fresh" — no
# crash recovery, instant start.
mkdir -p "$W/#innodb_redo"

if [ -d "$D/#innodb_redo" ]; then
  T0=$(date +%s%N)
  cp -r "$D/#innodb_redo" "$W/"
  cp "$D/undo_001" "$D/undo_002" "$W/" 2>/dev/null || true
  rm -rf "$D/#innodb_redo" "$D/undo_001" "$D/undo_002"
  T1=$(date +%s%N)
  echo "WAL copy to tmpfs: $(( (T1-T0)/1000000 ))ms ($(du -sh "$W" | cut -f1))"
fi

# chown must follow the copies: this runs as root, so files copied above
# land root-owned, and mysqld runs as mysql. Chowning first (as this once
# did) leaves the redo copies unreadable and the first start of a fresh
# container aborts with errno 13.
chown -R mysql:mysql "$W"

EXTRA_FLAGS="--innodb-log-group-home-dir=$W --innodb-undo-directory=$W"

exec mysqld --no-defaults \
  --user=mysql \
  --datadir="$D" \
  --socket="$D/mysqld.sock" \
  --pid-file="$D/mysqld.pid" \
  --log-error="$D/error.log" \
  --port=3306 \
  --bind-address=0.0.0.0 \
  --skip-log-bin \
  --mysqlx=OFF \
  --innodb-flush-log-at-trx-commit=0 \
  --skip-innodb-doublewrite \
  --innodb-buffer-pool-size=256M \
  $EXTRA_FLAGS

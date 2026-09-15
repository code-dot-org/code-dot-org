#!/bin/bash
# Part-4 shim: relocate redo+undo to tmpfs by copying the baked files there
# at container start, then pointing mysqld at them. Reads from the image
# layer (no copy-up), writes land on tmpfs.
set -euo pipefail
D=/opt/mysql-data
W=/mysql-wal
T0=$(date +%s%N)
cp -r $D/#innodb_redo $W/
cp $D/undo_001 $D/undo_002 $W/
# rm from the image layer = overlayfs whiteout, near-zero copy-up cost.
# Without this mysqld sees both copies: "Multiple files found for the
# same tablespace ID" and aborts.
rm -rf $D/#innodb_redo $D/undo_001 $D/undo_002
T1=$(date +%s%N)
echo "WAL copy to tmpfs: $(( (T1-T0)/1000000 ))ms ($(du -sh $W | cut -f1))"
mysqld --no-defaults --datadir=$D --socket=$D/mysqld.sock \
  --pid-file=$D/mysqld.pid --log-error=$D/error.log \
  --port=3306 --bind-address=127.0.0.1 \
  --skip-log-bin --mysqlx=OFF \
  --innodb-flush-log-at-trx-commit=0 --skip-innodb-doublewrite \
  --innodb-buffer-pool-size=256M \
  --innodb-log-group-home-dir=$W \
  --innodb-undo-directory=$W \
  &
until mysqladmin --socket=$D/mysqld.sock -uroot -ppassword ping --silent 2>/dev/null; do sleep 0.2; done
echo READY
sleep infinity

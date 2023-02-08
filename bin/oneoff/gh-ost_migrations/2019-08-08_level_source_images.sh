#!/bin/bash

DB_USER=${DB_USER?Required}
DB_PASSWORD=${DB_PASSWORD?Required}
DB_REPLICA_HOST=${DB_REPLICA_HOST?Required}
DB_MASTER_HOST=${DB_MASTER_HOST?Required}

# Options reference: https://github.com/github/gh-ost/blob/master/go/cmd/gh-ost/main.go
args=(
  # MySQL user
  --user=${DB_USER}

  # MySQL password
  --password=${DB_PASSWORD}

  # MySQL hostname (preferably a replica, not the master)
  --host=${DB_REPLICA_HOST}

  # (optional) explicitly tell gh-ost the identity of the master.
  # Format: some.host.com[:port]
  # This is useful in master-master setups where you wish to pick an explicit master,
  # or in a tungsten-replicator where gh-ost is unable to determine the master
  --assume-master-host=${DB_MASTER_HOST}

  # while this file exists, migration will postpone the final stage of swapping tables,
  # and will keep on syncing the ghost table.
  # Cut-over/swapping would be ready to perform the moment the file is deleted.
  --postpone-cut-over-flag-file=/tmp/gh-ost.cutover

  # Have the migration run on a replica, not on the master. At the end of migration replication is stopped,
  # and tables are swapped and immediately swap-revert.
  # Replication remains stopped and you can compare the two tables for building trust
#  --test-on-replica

  # When --test-on-replica is enabled, do not issue commands stop replication (requires --test-on-replica)
#  --test-on-replica-skip-replica-stop

  # directory where hook files are found (default: empty, ie. hooks disabled).
  # Hook files found on this path, and conforming to hook naming conventions will be executed
  --hooks-path=${PWD}

  # database name (mandatory)
  --database="dashboard_production"

  # table name (mandatory)
  --table="level_source_images"

  # verbose
  --verbose

  # alter statement (mandatory)
  --alter="MODIFY level_source_id bigint(11) unsigned"

  # Drop a possibly existing Ghost table (remains from a previous run?) before beginning operation.
  # Default is to panic and abort if such table exists
#  --initially-drop-ghost-table

  # Drop a possibly existing OLD table (remains from a previous run?) before beginning operation.
  # Default is to panic and abort if such table exists
#  --initially-drop-old-table

  # Comma delimited status-name=threshold.
  # e.g: 'Threads_running=100,Threads_connected=500'.
  # When status exceeds threshold, app throttles writes
  --max-load=Threads_running=30

  # set to 'true' when you know for certain your server uses 'ROW' binlog_format.
  # gh-ost is unable to tell, even after reading binlog_format, whether the replication process does indeed use 'ROW',
  # and restarts replication to be certain RBR setting is applied.
  # Such operation requires SUPER privileges which you might not have.
  # Setting this flag avoids restarting replication and you can proceed to use gh-ost without SUPER privileges
  --assume-rbr

  # amount of rows to handle in each iteration (allowed range: 100-100,000)
  --chunk-size=1000

  # batch size for DML events to apply in a single transaction (range 1-100)
  --dml-batch-size=100

  # Default number of retries for various operations before panicking
  --default-retries=1000

  # choose cut-over type (default|atomic, two-step)
  --cut-over=default

  # actually count table rows as opposed to estimate them (results in more accurate progress estimation)
  --exact-rowcount

  # (with --exact-rowcount)
  # when true (default): count rows after row-copy begins, concurrently, and adjust row estimate later on;
  # when false: first count rows, then start row copy
  --concurrent-rowcount

  # when this file is created, gh-ost will immediately terminate, without cleanup
  --panic-flag-file=/tmp/gh-ost.panic.flag

  # replication lag at which to throttle operation
  --max-lag-millis=2000

  # actually execute the alter & migrate the table. Default is noop: do some tests and exit
#  --execute
)

./gh-ost "${args[@]}"

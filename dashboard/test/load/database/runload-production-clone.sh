#!/bin/bash

# Before running this script for the first time, run setup.sh.

set -xe

PASSWORD=$3

# Move to home directory
cd /home/ec2-user

# Adjust process capacity
ulimit -u 16384

cd sysbench

# Copy any code-dot-org load test scripts into the sysbench lua directory.
# TODO:(suresh) Pull the latest from origin in the code-dot-org project
cp /home/ec2-user/code-dot-org/dashboard/test/load/database/lua/* /home/ec2-user/sysbench/src/lua

cd src
cd lua


# As of July 2020, production cluster db writer instance is db.r5.4xlarge, which defaults to 4000 max connections via
# Parameter Group expression: GREATEST({log(DBInstanceClassMemory/805306368)*45},{log(DBInstanceClassMemory/8187281408)*1000})
max_db_connections=4000

# Threads per sysbench client.
threads=20

# Number of events each thread should execute per second.
rate=5

# Each sysbench thread opens one database connection.
let num_sysbench_clients=max_db_connections/threads

# Drop / create the sysbench schema
# Uses mysql CLI instead of Ruby MySQL client because this is a bash script.
# Execution environment: Load testing EC2 instances (multiple concurrent processes as same user)
# Temp file risk: High - multiple concurrent load tests as same user can enumerate `/tmp` and read each other's temp files
# SECURITY: Using -p$PASSWORD on command line exposes password in process lists (ps aux) and shell history.
# MySQL warns: "Using a password on the command line interface can be insecure."
# Use a temporary option file with restricted permissions (600) instead.
TMP_CNF=$(mktemp /tmp/mysql.XXXXXX.cnf)
chmod 600 "$TMP_CNF"
cat > "$TMP_CNF" <<EOF
[client]
password=$PASSWORD
EOF
mysql --defaults-extra-file="$TMP_CNF" -h$1 -udb -e "drop schema if exists sysbench;create schema sysbench;"
rm -f "$TMP_CNF"

# Execute tests
# Launch multiple sysbench clients
for i in $(seq 1 $num_sysbench_clients)
do
	(/home/ec2-user/sysbench/src/sysbench ./$2 --mysql-host=$1 --mysql-port=3306 --mysql-db=sysbench --mysql-user=db --mysql-password=$PASSWORD --db-driver=mysql --threads=$threads --rate=$rate --time=1800 --mysql-ignore-errors=all run)&

	# Sleep one second
	sleep 1
done

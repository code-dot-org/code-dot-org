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
cp `find /home/ec2-user/code-dot-org/dashboard/test/load/database/sysbench/src/lua -name "cdo*.lua"` /home/ec2-user/sysbench/src/lua

cd src
cd lua

# production-clone-loadtest-cluster writer instance class is db.r4.8xlarge, which defaults to 5000 max connections.
max_db_connections=5000

# Threads per sysbench client.
threads=20

# Each sysbench thread opens one database connection.
let num_sysbench_clients=max_db_connections/threads

# Drop / create the sysbench schema
mysql -h$1 -udb -p$PASSWORD -e "drop schema if exists sysbench;create schema sysbench;"

# Execute tests
# Launch multiple sysbench clients
for i in $(seq 1 $num_sysbench_clients)
do
	# Execute write-only test
	(/home/ec2-user/sysbench/src/sysbench ./$2 --mysql-host=$1 --mysql-port=3306 --mysql-db=sysbench --mysql-user=db --mysql-password=$PASSWORD --db-driver=mysql --threads=$threads --time=86400 --mysql-ignore-errors=all run)&

	# Sleep one second
	sleep 1
done

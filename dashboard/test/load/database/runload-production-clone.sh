#!/bin/bash

# Move to home directory
cd /home/ec2-user

# Adjust process capacity
ulimit -u 16384

# Install / Update tools
sudo yum -y -q update
sudo yum -y -q install automake
sudo yum -y -q install libtool
sudo yum -y -q install mysql-devel
sudo yum -y -q install mysql
sudo yum -y -q install git

# Download the sysbench source code
sudo rm sysbench -rf
git clone --branch 1.0.16 https://github.com/akopytov/sysbench.git

# Build sysbench
cd sysbench
sudo ./autogen.sh
sudo ./configure
sudo make
cd src
cd lua

# production-clone-loadtest-cluster writer instance class is db.r4.8xlarge, which defaults to 5000 max connections.
max_db_connections=5000

# Threads per sysbench client.
threads=20

# Each sysbench thread opens one database connection.
let number_of_sysbench_clients=max_db_connections/threads

# Drop / create the sysbench schema
mysql -h$1 -udb -pPassword1 -e "drop schema if exists sysbench;create schema sysbench;"

# Execute tests
if [ "$2" == "oltp_read_only.lua" ]
then
	# Prepare for read-only test
	/home/ec2-user/sysbench/src/sysbench ./$2 --mysql-host=$1 --mysql-port=3306 --mysql-db=sysbench --mysql-user=db --mysql-password=Password1 --db-driver=mysql --tables=250 --table-size=25000 --threads=250 prepare

	# Launch multiple sysbench clients
	for i in {1..$number_of_sysbench_clients}
	do
		# Execute read-only test
		(/home/ec2-user/sysbench/src/sysbench ./$2 --mysql-host=$1 --mysql-port=3306 --mysql-db=sysbench --mysql-user=db --mysql-password=Password1 --db-driver=mysql --tables=250 --table-size=25000 --threads=$threads --time=86400 --range_selects=off --db-ps-mode=disable --skip_trx=on run)&

		# Sleep one second
		sleep 1
	done
elif [ "$2" == "oltp_insert.lua" ]
then
	# Prepare for write-only test
	/home/ec2-user/sysbench/src/sysbench ./$2 --mysql-host=$1 --mysql-port=3306 --mysql-db=sysbench --mysql-user=db --mysql-password=Password1 --db-driver=mysql --tables=250 --table-size=25000 --threads=250 --auto-inc=off prepare

	# Launch multiple sysbench clients
	for i in {1..$number_of_sysbench_clients}
	do
		# Execute write-only test
		(/home/ec2-user/sysbench/src/sysbench ./$2 --mysql-host=$1 --mysql-port=3306 --mysql-db=sysbench --mysql-user=db --mysql-password=Password1 --db-driver=mysql --tables=250 --table-size=25000 --threads=$threads --time=86400 --range_selects=off --db-ps-mode=disable --skip_trx=off --auto-inc=off --mysql-ignore-errors=all run)&

		# Sleep one second
		sleep 1
	done
else
	# Prepare for write-only test
	/home/ec2-user/sysbench/src/sysbench ./$2 --mysql-host=$1 --mysql-port=3306 --mysql-db=sysbench --mysql-user=db --mysql-password=Password1 --db-driver=mysql --tables=250 --table-size=25000 --threads=250 --auto-inc=off prepare

	# Launch multiple sysbench clients
	for i in {1..$number_of_sysbench_clients}
	do
		# Execute write-only test
		(/home/ec2-user/sysbench/src/sysbench ./$2 --mysql-host=$1 --mysql-port=3306 --mysql-db=sysbench --mysql-user=db --mysql-password=Password1 --db-driver=mysql --tables=250 --table-size=25000 --threads=$threads --time=86400 --range_selects=off --db-ps-mode=disable --skip_trx=off --auto-inc=off --mysql-ignore-errors=all run)&

		# Sleep one second
		sleep 1
	done
fi
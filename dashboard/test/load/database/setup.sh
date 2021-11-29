#!/bin/bash

set -xe

# Move to home directory
cd /home/ec2-user

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


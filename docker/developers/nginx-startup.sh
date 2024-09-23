#!/bin/sh

# Copy the configuration over and update the host, if we find a
# host.docker.internal name

echo 'Looking for host.docker.internal'

cp /root/nginx-proxy.conf /root/cdo.conf
if getent hosts host.docker.internal; then
  echo 'Found host.docker.internal'
  sed s/172.17.0.1/host.docker.internal/g -i /root/cdo.conf
fi
cp /root/cdo.conf /etc/nginx/conf.d/cdo.conf

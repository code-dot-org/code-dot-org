#!/bin/sh

- "IMDS_TOKEN=$(wget -qO- --header 'X-aws-ec2-metadata-token-ttl-seconds: 300' --method=PUT 'http://169.254.169.254/latest/api/token')"
- "hostname=$(wget -qO- --header 'X-aws-ec2-metadata-token: $IMDS_TOKEN' 'http://169.254.169.254/latest/meta-data/public-hostname')
- echo "Running on $hostname"


curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 300"
wget -qO- --header "X-aws-ec2-metadata-token-ttl-seconds: 300" --method=PUT "http://169.254.169.254/latest/api/token"
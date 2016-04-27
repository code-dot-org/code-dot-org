#!/bin/bash
set -o errexit
# Code-dot-org Chef bootstrap script.
# One-liner to run:
# aws s3 cp s3://${S3_BUCKET}/chef/bootstrap.sh - | sudo bash -s -- [options]
#
# This file is currently pushed to S3 whenever AWS::CloudFormation#create_or_update is run,
# but updates should be automated through CI in the future.
#
# Options:
# -b [branch]
# -n [node_name]
# -r [run_list]
# -v [chef_version]
# -e [environment]
# -z: Use local-mode Chef client.
#
# Prerequisites:
# curl
# awscli (pip install awscli)
# AWS read permissions for s3://${S3_BUCKET}/chef/ provided by environment (Instance IAM profile, ~/.aws/credentials, etc)
# [local mode] branch-specific Chef cookbooks uploaded to S3

# Set script defaults
ENVIRONMENT=adhoc
BRANCH=staging
CHEF_VERSION=12.7.2
RUN_LIST='recipe[cdo-apps]'
NODE_NAME=$(hostname)
S3_BUCKET=cdo-dist

# Parse options
while getopts ":b:n:r:v:e:z" opt; do
  case "${opt}" in
    e)
      ENVIRONMENT=${OPTARG}
      ;;
    b)
      BRANCH=${OPTARG}
      ;;
    n)
      NODE_NAME=${OPTARG}
      ;;
    r)
      RUN_LIST=${OPTARG}
      ;;
    v)
      CHEF_VERSION=${OPTARG}
      ;;
    z)
      LOCAL_MODE=1
      ;;
    \?)
      echo "Invalid option: -${OPTARG}" >&2
      ;;
  esac
done

# Redirect copy of stdout/stderr to a log file for later auditing.
LOG=/var/log/chef-bootstrap.log
exec >> >(tee -i ${LOG})
exec 2>&1

CHEF_CLIENT=/opt/chef/bin/chef-client
CHEF_REPO_PATH=/var/chef
# Ensure correct version of Chef is installed.
if [ "$(${CHEF_CLIENT} -v)" != "Chef: ${CHEF_VERSION}" ]; then
  curl -L https://omnitruck.chef.io/install.sh | bash -s -- -v ${CHEF_VERSION}
else
  echo "Chef ${CHEF_VERSION} is installed."
fi
${CHEF_CLIENT} -v

mkdir -p /etc/chef
CLIENT_RB=/etc/chef/client.rb
cat <<RUBY > ${CLIENT_RB}
node_name '${NODE_NAME}'
environment '${ENVIRONMENT}'
chef_repo_path '${CHEF_REPO_PATH}'
if '${LOCAL_MODE}' == '1'
  local_mode true
else
  validation_client_name   'code-dot-org-validator'
  chef_server_url          'https://api.chef.io/organizations/code-dot-org'
end
RUBY

# Write default first-boot.json to be used by the chef-client command.
# Existing file takes precedence.
FIRST_BOOT=/etc/chef/first-boot.json
if [ ! -f ${FIRST_BOOT} ] ; then
  cat <<JSON > ${FIRST_BOOT}
{
  "omnibus_updater": {
    "version": "${CHEF_VERSION}"
  },
  "cdo-repository": {
    "branch": "${BRANCH}"
  },
  "run_list": ["${RUN_LIST}"]
}
JSON
fi

# Remove client + node from Chef server on halt/reboot or shutdown.
SHUTDOWN_SH=/etc/init.d/chef_shutdown
cat <<SH > ${SHUTDOWN_SH}
#/bin/sh
/opt/chef/bin/knife node delete ${NODE_NAME} -y -c /etc/chef/client.rb
/opt/chef/bin/knife client delete ${NODE_NAME} -y -c /etc/chef/client.rb
rm -f /etc/chef/client.pem
SH
chmod +x ${SHUTDOWN_SH}
ln -fs ${SHUTDOWN_SH} /etc/rc0.d/S04chef_shutdown
ln -fs ${SHUTDOWN_SH} /etc/rc6.d/S04chef_shutdown

if [ "${LOCAL_MODE}" = "1" ]; then
  mkdir -p ${CHEF_REPO_PATH}/{cookbooks,environments}
  # Install branch-specific Chef cookbooks from s3.
  REPO_COOKBOOK_URL=s3://${S3_BUCKET}/chef/${BRANCH}.tar.gz
  aws s3 cp ${REPO_COOKBOOK_URL} - | tar xz -C ${CHEF_REPO_PATH}

  # Boilerplate `adhoc` environment for local Chef.
cat <<JSON > ${CHEF_REPO_PATH}/environments/adhoc.json
{
  "name": "adhoc",
  "description": "Adhoc Chef environment",
  "cookbook_versions": {},
  "json_class": "Chef::Environment",
  "chef_type": "environment",
  "default_attributes": {},
  "override_attributes": {}
}
JSON

else
  # Copy validation pem.
  aws s3 cp s3://${S3_BUCKET}/chef/validation.pem /etc/chef/validation.pem
fi

# Run chef-client.
${CHEF_CLIENT} -c ${CLIENT_RB} -j ${FIRST_BOOT}

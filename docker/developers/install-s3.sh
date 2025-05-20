#!/bin/bash
set -e

# Only allowed inside the docker container
if [ -z ${WITHIN_DOCKER} ]; then
  echo "ERROR: Cannot run within your normal environment."
  echo "This command is only allowed to run inside the docker container connected to MinIO."
  exit 1
fi

# Only allowed with MinIO
if ! [[ ${AWS_S3_ENDPOINT_URL} =~ ^"http://localhost" ]]; then
  echo "ERROR: Can only run against locally-hosted S3 emulation layer."
  echo "This command is only allowed to target 'http://localhost', not '${AWS_S3_ENDPOINT_URL}'."
  exit 1
fi

# Prevent aws cli from using interactive paging or failing when less isn't found
# See: https://stackoverflow.com/questions/57953187/aws-cli-has-no-output
export AWS_PAGER=

export AWS_ENDPOINT_URL=${AWS_S3_ENDPOINT_URL}

# Create all buckets that our application depends on. Most of these buckets are
# intended to store user-created data, so they just need to exist so we can
# upload to them. Some of them, however, are expected to contain specific data
# necessary for initial seeding or some niche features. See
# docker/developers/utils/s3/populator.rb for details of how we address that.
#
# TODO infra: figure out a way we can declare these dependencies just once in a
# way that will work for either a prod-like environment or local development.
bucket_names=(\
  "cdo-ai"\
  "cdo-animation-library"\
  "cdo-restricted"\
  "cdo-sound-library"\
  "cdo-v3-animations"\
  "cdo-v3-assets"\
  "cdo-v3-files"\
  "cdo-v3-libraries"\
  "cdo-v3-sources"\
  "videos.code.org"\
)

# Note: some other buckets which we do utilize locally but don't necessarily
# require be present include:
#
# cdo-build-package
# cdo-nces
# cdo-v3-trained-ml-models
# images.code.org
# pd-workshop-surveys

for bucket_name in "${bucket_names[@]}"; do
  # Use the standard aws CLI to inspect and create buckets; since we know
  # AWS_ENDPOINT_URL is targeting localhost, we can be confident this will not
  # affect our actual AWS account.
  if [[ -z $(aws s3api head-bucket --bucket "${bucket_name}" 2>&1) ]]; then
    echo "Creating s3 bucket ${bucket_name} [EXISTS]"
  else
    echo "Creating s3 bucket ${bucket_name}"
    aws s3api create-bucket --bucket ${bucket_name} --object-lock-enabled-for-bucket

    # Many (but not all) of these buckets have versioning enabled in our
    # production environment; for a balance of similarity with prod and
    # simplicity of this script, we enable it for everything. This is probably
    # not strictly necessary, but will hopefully reduce surprises.
    echo "Versioning s3 bucket ${bucket_name}"
    aws s3api put-bucket-versioning --bucket ${bucket_name} --versioning-configuration Status=Enabled
  fi
done

#!/bin/bash
set -e

# Prevent aws cli from using interactive paging or failing when less isn't found
# See: https://stackoverflow.com/questions/57953187/aws-cli-has-no-output
export AWS_PAGER=

export AWS_ENDPOINT_URL=${AWS_S3_ENDPOINT_URL}

# Determine all the buckets that exist in the s3 path and create those buckets
if ! aws s3api head-bucket --bucket cdo-animation-library; then
  echo "Creating s3 bucket cdo-animation-library"
  aws s3api create-bucket --bucket cdo-animation-library

  echo "Versioning s3 bucket cdo-animation-library"
  aws s3api put-bucket-versioning --bucket cdo-animation-library --versioning-configuration Status=Enabled
else
  echo "Creating s3 bucket cdo-animation-library [EXISTS]"
fi

if ! aws s3api head-bucket --bucket cdo-v3-animations; then
  echo "Creating s3 bucket cdo-v3-animations"
  aws s3api create-bucket --bucket cdo-v3-animations --object-lock-enabled-for-bucket
else
  echo "Creating s3 bucket cdo-v3-animations [EXISTS]"
fi

if ! aws s3api head-bucket --bucket cdo-v3-assets; then
  echo "Creating s3 bucket cdo-v3-assets"
  aws s3api create-bucket --bucket cdo-v3-assets --object-lock-enabled-for-bucket
else
  echo "Creating s3 bucket cdo-v3-assets [EXISTS]"
fi

if ! aws s3api head-bucket --bucket cdo-v3-files; then
  echo "Creating s3 bucket cdo-v3-files"
  aws s3api create-bucket --bucket cdo-v3-files --object-lock-enabled-for-bucket
else
  echo "Creating s3 bucket cdo-v3-files [EXISTS]"
fi

if ! aws s3api head-bucket --bucket cdo-v3-libraries; then
  echo "Creating s3 bucket cdo-v3-libraries"
  aws s3api create-bucket --bucket cdo-v3-libraries --object-lock-enabled-for-bucket
else
  echo "Creating s3 bucket cdo-v3-libraries [EXISTS]"
fi

if ! aws s3api head-bucket --bucket cdo-v3-sources; then
  echo "Creating s3 bucket cdo-v3-sources"
  aws s3api create-bucket --bucket cdo-v3-sources --object-lock-enabled-for-bucket
else
  echo "Creating s3 bucket cdo-v3-sources [EXISTS]"
fi

if ! aws s3api head-bucket --bucket cdo-sound-library; then
  echo "Creating s3 bucket cdo-sound-library"
  aws s3api create-bucket --bucket cdo-sound-library --object-lock-enabled-for-bucket
else
  echo "Creating s3 bucket cdo-sound-library [EXISTS]"
fi

aws s3api put-object --bucket cdo-sound-library --key hoc_song_meta/ --content-length 0

if ! aws s3api head-bucket --bucket cdo-restricted; then
  echo "Creating s3 bucket cdo-restricted"
  aws s3api create-bucket --bucket cdo-restricted --object-lock-enabled-for-bucket
else
  echo "Creating s3 bucket cdo-restricted [EXISTS]"
fi

if ! aws s3api head-bucket --bucket cdo-ai; then
  echo "Creating s3 bucket cdo-ai"
  aws s3api create-bucket --bucket cdo-ai --object-lock-enabled-for-bucket
else
  echo "Creating s3 bucket cdo-ai [EXISTS]"
fi

if ! aws s3api head-bucket --bucket videos.code.org; then
  echo "Creating s3 bucket videos.code.org"
  aws s3api create-bucket --bucket videos.code.org
else
  echo "Creating s3 bucket videos.code.org [EXISTS]"
fi

export AWS_ENDPOINT_URL=${AWS_LOCALSTACK_ENDPOINT_URL}

# Create keys
mkdir -p keys
if [[ ! -e keys/javabuilder.pem ]]; then
  echo "Creating keys/javabuilder.pem"
  openssl genrsa 2048 > keys/javabuilder.pem
fi

# Create secrets
SECRETS="
firebase_secret
firebase_shared_secret
cloudfront_private_key
cloudfront_key_pair_id
devinternal_db_writer
applications_gsheet_key
eir_teacher_enrollments_gsheet_key
properties_encryption_key
javabuilder_key_password
pardot_private_key
redshift_host
redshift_password
redshift_username
slack_bot_token
"

IFS=$'\n'
for secret in ${SECRETS}; do
  #if ! aws secretsmanager describe-secret --secret-id "development/cdo/${secret}" 2>/dev/null; then
  if ! aws secretsmanager get-secret-value --secret-id "development/cdo/${secret}"; then
    echo "Creating secret '${secret}' [DOES NOT EXIST]"
  fi

  if ! aws secretsmanager describe-secret --secret-id "development/cdo/${secret}"; then
    echo "Creating secret '${secret}'"
    aws secretsmanager create-secret --name "development/cdo/${secret}" --secret-string "placeholder-${secret}"
  else
    echo "Creating secret '${secret}' [EXISTS]"
  fi
done

# Add the javabuilder private key
if ! aws secretsmanager describe-secret --secret-id "development/cdo/javabuilder_private_key"; then
  aws secretsmanager create-secret --name "development/cdo/javabuilder_private_key" --secret-string file://keys/javabuilder.pem
else
  aws secretsmanager update-secret --secret-id "development/cdo/javabuilder_private_key" --secret-string file://keys/javabuilder.pem
fi

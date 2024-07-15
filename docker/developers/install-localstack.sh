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

# Create secrets
aws secretsmanager describe-secret --secret-id "development/cdo/firebase_secret" 2>/dev/null || \
	aws secretsmanager create-secret --name "development/cdo/firebase_secret" --secret-string "placeholder-firebase-secret"

aws secretsmanager describe-secret --secret-id "development/cdo/firebase_shared_secret" 2>/dev/null || \
	aws secretsmanager create-secret --name "development/cdo/firebase_shared_secret" --secret-string "placeholder-firebase-shared-secret"

aws secretsmanager describe-secret --secret-id "development/cdo/slack_bot_token" 2>/dev/null || \
	aws secretsmanager create-secret --name "development/cdo/slack_bot_token" --secret-string "placeholder-slack-token"

aws secretsmanager describe-secret --secret-id "development/cdo/cloudfront_private_key" 2>/dev/null || \
	aws secretsmanager create-secret --name "development/cdo/cloudfront_private_key" --secret-string "placeholder-cloudfront-private-key"

aws secretsmanager describe-secret --secret-id "development/cdo/cloudfront_key_pair_id" 2>/dev/null || \
	aws secretsmanager create-secret --name "development/cdo/cloudfront_key_pair_id" --secret-string "placeholder-cloudfront-key-pair-id"

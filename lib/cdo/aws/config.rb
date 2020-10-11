# AWS Ruby SDK doesn't auto-detect region from EC2 Instance Metadata.
# Ref: https://github.com/aws/aws-sdk-ruby/issues/1455
ENV['AWS_DEFAULT_REGION'] ||= CDO.aws_region

# Support Google Account credentials if provided in the AWS config.
begin
  require 'aws/google'
  Aws::Google.config = {
    role_arn: CDO.aws_role,
    client_id: CDO.google_client_id,
    client_secret: CDO.google_client_secret,
    profile: 'cdo',
    port: CDO.dashboard_port
  }.compact
rescue LoadError
  # ignore
end

# Set `instance_profile_credentials_retries` and `instance_profile_credentials_timeout` from the AWS config variables
# `metadata_service_num_attempts` and `metadata_service_timeout`, if provided.
# Ref: https://github.com/aws/aws-sdk-ruby/issues/717
if (retries = Aws.shared_config.
  instance_variable_get(:@parsed_config)&.
  dig(Aws.shared_config.profile_name, 'metadata_service_num_attempts'))

  Aws.config.update(instance_profile_credentials_retries: retries.to_i)
end

if (timeout = Aws.shared_config.
    instance_variable_get(:@parsed_config)&.
    dig(Aws.shared_config.profile_name, 'metadata_service_timeout'))

  Aws.config.update(instance_profile_credentials_timeout: timeout.to_i)
end

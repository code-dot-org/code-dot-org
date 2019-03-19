require 'aws/google'

if CDO.aws_role &&
  CDO.google_client_id &&
  CDO.google_client_secret
  Aws::Google.config = {
    role_arn: CDO.aws_role,
    google_client_id: CDO.google_client_id,
    google_client_secret: CDO.google_client_secret,
    profile: 'cdo',
    port: CDO.dashboard_port
  }
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

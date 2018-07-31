require_relative './google_credentials'

module Cdo
  module CdoCredentialProvider
    def current_provider
      providers.find do |method_name, options|
        send(method_name, options.merge(config: @config))&.set?
      end.first
    end

    def google_credentials(options)
      if CDO.aws_role &&
        CDO.google_client_id &&
        CDO.google_client_secret
        Cdo::GoogleCredentials.config = {
          role_arn: CDO.aws_role,
          google_client_id: CDO.google_client_id,
          google_client_secret: CDO.google_client_secret,
          profile: 'cdo'
        }
      end
      super(options)
    end
  end
end
Aws::CredentialProviderChain.prepend Cdo::CdoCredentialProvider

module Services
  module Lti
    class DeepLinkingResponseBuilder < Services::Base
      attr_reader :id_token

      def initialize(id_token:)
        @id_token = id_token
      end

      def call
        {
          iss: Policies::Lti::JWT_ISSUER,
          aud: id_token[:iss],
          iat: Time.now.to_i,
          exp: 5.minutes.from_now.to_i,
          Policies::Lti::MessageType::CLAIM => Policies::Lti::MessageType::DEEP_LINKING_RESPONSE,
          Policies::Lti::VERSION_CLAIM => '1.3.0',
          **id_token.slice(Policies::Lti::LTI_DEPLOYMENT_ID_CLAIM.to_sym),
        }
      end

      def deep_linking_settings
        @deep_linking_settings ||= id_token[Policies::Lti::DEEP_LINKING_SETTINGS_CLAIM.to_sym]
      end
    end
  end
end
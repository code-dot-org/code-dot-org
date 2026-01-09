module Services
  module Lti
    class DeepLinkingResponseBuilder < Services::Base
      include LtiAccessToken
      attr_reader :request_issuer, :client_id, :deployment_id, :deep_linking_settings, :content_items

      def initialize(request_issuer:, client_id:, deployment_id:, deep_linking_settings:, content_items: [])
        @request_issuer = request_issuer
        @client_id = client_id
        @deployment_id = deployment_id
        @deep_linking_settings = deep_linking_settings
        @content_items = content_items
      end

      def call
        sign_jwt({
          # The iss and aud claims are flipped in this JWT compared to normal requests to
          # LTI advantage services because it is a response to a deep linking request.
          iss: client_id,
          aud: request_issuer,
          iat: Time.now.to_i,
          exp: 5.minutes.from_now.to_i,
          jti: SecureRandom.alphanumeric(10),
          nonce: Digest::SHA2.hexdigest(SecureRandom.alphanumeric(10)),
          # Deep Linking specific claims
          Policies::Lti::MessageType::CLAIM => Policies::Lti::MessageType::DEEP_LINKING_RESPONSE,
          Policies::Lti::VERSION_CLAIM => '1.3.0',
          Policies::Lti::LTI_DEPLOYMENT_ID_CLAIM => deployment_id,
          # The data claim is optional, but if it was present in the deep linking request,
          # it must be included in the response, and the values must match.
          Policies::Lti::DEEP_LINKING_DATA_CLAIM => deep_linking_settings['data'],
          # While technically optional, the content items array must be populated
          # to create deep links in the LMS.
          Policies::Lti::DEEP_LINKING_CONTENT_ITEMS_CLAIM => content_items
        })
      end
    end
  end
end
module Services
  module Lti
    class DeepLinkingResponseBuilder < Services::Base
      include LtiAccessToken
      attr_reader :audience, :deployment_id, :deep_linking_settings, :content_items

      def initialize(audience:, deployment_id:, deep_linking_settings:, content_items: [])
        @audience = audience
        @deployment_id = deployment_id
        @deep_linking_settings = deep_linking_settings
        @content_items = content_items
      end

      def call
        sign_jwt({
          iss: Policies::Lti::JWT_ISSUER,
          # aud is the issuer of the JWT for the deep linking request
          aud: audience,
          iat: Time.now.to_i,
          exp: 5.minutes.from_now.to_i,
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
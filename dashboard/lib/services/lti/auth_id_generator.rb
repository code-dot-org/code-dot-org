require 'cdo/honeybadger'
require 'cdo/aws/cloudwatch_logs'

module Services
  module Lti
    class AuthIdGenerator
      LOG_GROUP_NAME = 'LTI'.freeze

      def initialize(id_token)
        @id_token = id_token
      end

      def call
        "#{issuer}|#{audience}|#{subject}"
      end

      attr_reader :id_token

      private def issuer
        id_token[:iss]
      end

      private def audience
        case id_token[:aud]
        when String
          id_token[:aud]
        when Array
          # Per LTI spec, the client ID is used to identify an LTI 1.3 app to the LMS.
          # Only ONE client_id identifies an LTI Tool and is sent in the JWK audience claim.
          if id_token[:aud].length > 1
            event = {
              message: 'Too many client_ids in the audience claim',
              audience: id_token[:aud],
              aud_count: id_token[:aud].length,
            }.to_json

            Cdo::CloudWatchLogs.put_log_event(LOG_GROUP_NAME, 'GenerateAuthenticationIDError', {timestamp: (Time.now.to_f * 1000).to_i, message: event})
            raise ArgumentError, "Invalid Audience Claim: #{id_token[:aud]}, with more than 1 client_id. #{id_token[:aud].length} client_ids given."
          else
            id_token[:aud].first
          end
        else
          raise ArgumentError, "Invalid Audience Claim: #{id_token[:aud]}, with class: #{id_token[:aud].class}"
        end
      end

      private def subject
        id_token[:sub]
      end
    end
  end
end

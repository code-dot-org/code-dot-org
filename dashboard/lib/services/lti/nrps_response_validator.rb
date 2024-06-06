module Services
  module Lti
    class NRPSResponseValidator < Services::Base
      REQUIRED_CUSTOM_FIELDS = %i[section_ids section_names].freeze

      # @param nrps_response [Hash] The NRPS response to be validated
      # @example nrps_response
      #   {
      #     members: [
      #       {
      #         message: [
      #           {
      #             'https://purl.imsglobal.org/spec/lti/claim/custom': {
      #               section_ids: '1,2,3',
      #               section_names: '["Section 1", "Section 2", "Section 3"]'
      #             }
      #           }
      #         ]
      #       }
      #     }
      #   }
      def initialize(nrps_response)
        @nrps_response = nrps_response
      end

      # @return [Array<String>] Error messages. If the NRPS response is valid, the array is empty.
      def call
        errors = []

        REQUIRED_CUSTOM_FIELDS.each do |custom_field|
          next unless custom_field_missing?(custom_field)
          errors << ::I18n.t('lti.error.missing_tool_config', field: "custom_fields[#{custom_field}]")
        end

        errors
      end

      attr_reader :nrps_response

      private def custom_field_missing?(field)
        Array.wrap(nrps_response[:members]).any? do |member|
          Array.wrap(member[:message]).any? do |message|
            custom_fields = message[Policies::Lti::LTI_CUSTOM_CLAIMS.to_sym]
            custom_fields.is_a?(Hash) && !custom_fields.key?(field)
          end
        end
      end
    end
  end
end

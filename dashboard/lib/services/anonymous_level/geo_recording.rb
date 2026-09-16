# frozen_string_literal: true

require 'cdo/geocoder'

module Services
  module AnonymousLevel
    class GeoRecording < Services::Base
      attr_reader :anon_user_id, :ip_address

      def initialize(anon_user_id:, ip_address:)
        @anon_user_id = anon_user_id
        @ip_address   = ip_address
      end

      def call
        return unless DCDO.get('anonymous_level_tracking_enabled', false)

        anonymous_level_geo = ::AnonymousLevel::Geo.find_or_initialize_by(anon_user_id:)
        return anonymous_level_geo if anonymous_level_geo.persisted?

        location = Geocoder.find(ip_address)

        anonymous_level_geo.update!(
          anon_user_id:,
          country:     location&.country.presence,
          state:       location&.state.presence,
          city:        location&.city.presence,
          postal_code: location&.postal_code.presence,
        )

        anonymous_level_geo
      end
    end
  end
end

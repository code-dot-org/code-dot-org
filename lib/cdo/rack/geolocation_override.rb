module Rack
  # Overrides the viewer's country via the GeolocationOverride cookie.
  # Accepts a 2-letter uppercase country code (e.g. "ES") — sets the
  # CloudFront header directly — or an IP address that Geocoder resolves.
  #
  # This middleware is likely to only be available in the development and test
  # environments by default and is controlled by the use_geolocation_override
  # config flag in locals.yml.
  class GeolocationOverride
    KEY = 'GeolocationOverride'.freeze

    def initialize(app)
      @app = app
    end

    def call(env)
      override = Rack::Request.new(env).cookies[KEY]
      if override&.match?(/\A[A-Z]{2}\z/)
        env['HTTP_CLOUDFRONT_VIEWER_COUNTRY'] = override
        return @app.call(env)
      end

      env['REMOTE_ADDR'] = override if override

      # Coerce Geocoder to turn an internal ip to localhost so it will consider
      # it a locale with a 'RD' country code.
      if Geocoder.search(env['REMOTE_ADDR']).try(:first)&.data&.[]('bogon')
        env['REMOTE_ADDR'] = '127.0.0.1'
      end

      # Also override the data cloudfront is providing
      # See: RequestExtension.country in lib/cdo/rack/request.rb
      location = Geocoder.search(env['REMOTE_ADDR']).try(:first)
      country_code = location&.country_code.to_s.upcase
      env['HTTP_CLOUDFRONT_VIEWER_COUNTRY'] = country_code if country_code

      # Call the application as normal
      @app.call(env)
    end
  end
end

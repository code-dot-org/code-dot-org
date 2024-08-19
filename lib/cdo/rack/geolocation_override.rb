module Rack
  # This middleware will look for the GeolocationOverride cookie which specifies
  # an ip address to force as the remote IP. It will then override all relevant
  # sources for the remote IP used in the project to reflect the one provided.
  #
  # This effectively allows a cookie to force the geographic region.
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
      # Forcibly update the REMOTE_ADDR to the value given by the cookie
      override = Rack::Request.new(env).cookies[KEY]
      env['REMOTE_ADDR'] = override if override

      # Coerce Geocoder to turn an internal ip to localhost so it will consider
      # it a locale with a 'RD' country code.
      if Geocoder.search(env['REMOTE_ADDR']).try(:first)&.data&.[]('bogon')
        env['REMOTE_ADDR'] = '127.0.0.1'
      end

      # Also override the data cloudfront is providing
      # See: RequestExtension.country in lib/cdo/rack/request.rb
      location = Geocoder.search(request.ip).try(:first)
      country_code = location&.country_code.to_s.upcase
      env['HTTP_CLOUDFRONT_VIEWER_COUNTRY'] = country_code if country_code

      # Call the application as normal
      @app.call(env)
    end
  end
end

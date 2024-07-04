module Rack
  class GeolocationOverride
    KEY = 'GeolocationOverride'.freeze

    def initialize(app)
      @app = app
    end

    def call(env)
      # Forcibly update the REMOTE_ADDR to any given by the X_REMOTE_ADDR header
      override = Rack::Request.new(env).cookies[KEY]
      env['REMOTE_ADDR'] = override if override

      # Coerce Geocoder to turn an internal ip to localhost so it will consider
      # it a locale with a 'RD' country code.
      if Geocoder.search(env['REMOTE_ADDR']).try(:first)&.data&.[]('bogon')
        env['REMOTE_ADDR'] = '127.0.0.1'
      end

      # Call the application as normal
      @app.call(env)
    end
  end
end

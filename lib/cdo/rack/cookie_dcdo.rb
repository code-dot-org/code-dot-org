require 'json'
require 'request_store'
require 'dynamic_config/dcdo'

# This middleware enables the setting of DCDO via cookies for testing purposes.
# See: 'dashboard/test/ui/features/cookie_dcdo.rb'
module Rack
  class CookieDCDO
    def initialize(app)
      modify_dcdo

      @app = app
    end

    def call(env)
      # Stores the cookie DCDO data per request.
      RequestStore.store[:DCDO] = JSON.parse(Rack::Request.new(env).cookies['DCDO'] || '{}')

      @app.call(env)
    ensure
      # Clears the cookie DCDO after the request to avoid data leaking.
      RequestStore.store[:DCDO] = nil
    end

    # Redefines `DCDO#get` to return the cookie DCDO value if it exists;
    private def modify_dcdo
      DCDO.define_singleton_method(:get) do |key, *args|
        RequestStore.store[:DCDO]&.key?(key) ? RequestStore.store[:DCDO][key] : super(key, *args)
      end
    end
  end
end

require 'json'
require 'request_store'
require 'dynamic_config/dcdo'

# This middleware enables the setting of DCDO via cookies for testing purposes.
# See: 'dashboard/test/ui/features/cookie_dcdo.rb'
module Rack
  class CookieDCDO
    KEY = 'DCDO'.freeze

    def initialize(app)
      @app = app

      modify_dcdo
    end

    def call(env)
      RequestStore.store[KEY] = JSON.parse(
        Rack::Request.new(env).cookies[KEY] || '{}'
      )

      @app.call(env)
    ensure
      # Clears the cookie DCDO after the request to avoid data leaking.
      RequestStore.store.delete(KEY)
    end

    private def modify_dcdo
      # Redefines `DCDO#get` to return the cookie DCDO value if it exists.
      DCDO.define_singleton_method(:get) do |key, *args|
        RequestStore.store[KEY]&.key?(key) ? RequestStore.store.dig(KEY, key) : super(key, *args)
      end
    end
  end
end

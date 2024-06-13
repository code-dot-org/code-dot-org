require 'json'
require 'request_store'
require 'dynamic_config/dcdo'

# This middleware enables the setting of DCDO via cookies for testing purposes.
# See: 'dashboard/test/ui/features/cookie_dcdo.rb'
module Rack
  class CookieDCDO
    def initialize(app)
      @app = app
    end

    def call(env)
      # Stores the cookie DCDO data per request.
      RequestStore.store[:DCDO] = JSON.parse(Rack::Request.new(env).cookies['DCDO'] || '{}')

      if Rack::Request.new(env).cookies['DCDO']
        Rails.logger.info "\n"
        Rails.logger.info "=" * 80
        Rails.logger.info "Request Cookies: #{Rack::Request.new(env).cookies.inspect}"
        Rails.logger.info '-' * 80
        Rails.logger.info "request_store_dcdo[#{RequestStore.store.object_id}]: #{RequestStore.store[:DCDO].inspect}"
        Rails.logger.info "=" * 80
        Rails.logger.info "\n"
      end

      unless DCDO.instance_variable_get(:@_redefined)
        # Redefines `DCDO#get` to return the cookie DCDO value if it exists.
        DCDO.define_singleton_method(:get) do |key, *args|
          if key == 'cookie_dcdo_test'
            Rails.logger.info "\n" * 2
            Rails.logger.info '*' * 80
            Rails.logger.info "DCDO INSTANCE ID: #{object_id.inspect}"
            Rails.logger.info "DCDO KEY: #{key.inspect}"
            Rails.logger.info '-' * 80
            Rails.logger.info "Request key: request_store_dcdo[#{RequestStore.store.object_id}]"
            Rails.logger.info "RequestStore DCDO: #{RequestStore.store[:DCDO].inspect}"
            Rails.logger.info '*' * 80
            Rails.logger.info "\n" * 2
          end

          RequestStore.store[:DCDO]&.key?(key) ? RequestStore.store[:DCDO][key] : super(key, *args)
        end

        DCDO.instance_variable_set(:@_redefined, true)
      end

      @app.call(env)
    ensure
      # Clears the cookie DCDO after the request to avoid data leaking.
      RequestStore.store[:DCDO] = nil
    end
  end
end

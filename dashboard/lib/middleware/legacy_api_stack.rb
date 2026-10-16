# frozen_string_literal: true

require 'shared_resources'
require_relative '../../legacy/middleware/animation_library_api'
require_relative '../../legacy/middleware/channels_api'
require_relative '../../legacy/middleware/files_api'
require_relative '../../legacy/middleware/net_sim_api'
require_relative '../../legacy/middleware/sound_library_api'

module Middleware
  # Groups the legacy Sinatra applications into a single Rack middleware stack.
  # Each app is configured to re-raise unhandled errors so downstream Rails
  # exceptions can continue propagating to Rails' exception-handling middleware.
  class LegacyApiStack
    APPS = [
      FilesApi,
      ChannelsApi,
      SharedResources,
      NetSimApi,
      AnimationLibraryApi,
      SoundLibraryApi,
    ].freeze

    # Origins other than studio's own that may send unsafe (non-GET) requests
    # through this stack: the code.org marketing site posts its Amazon Future
    # Engineer and census forms here. Sinatra's default protection answers a
    # mismatched Origin by clearing the Rack session, which since this stack
    # moved behind RedisSessionStore is the Rails session, signing the user out.
    def self.permitted_origins
      [CDO.code_org_url('', 'https:'), *CDO.marketing_sites_hosts]
    end

    def initialize(app)
      permitted_origins = self.class.permitted_origins
      @app = Rack::Builder.new do
        APPS.each do |middleware|
          # Prevent Sinatra from converting downstream exceptions into generic 500
          # responses before Rails has a chance to handle them appropriately.
          middleware.set :raise_errors, true
          middleware.set :show_exceptions, false
          middleware.set :protection, permitted_origins: permitted_origins

          use middleware
        end

        run app
      end.to_app
    end

    def call(env)
      @app.call(env)
    end
  end
end

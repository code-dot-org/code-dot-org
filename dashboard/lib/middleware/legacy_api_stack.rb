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

    def initialize(app)
      @app = Rack::Builder.new do
        APPS.each do |middleware|
          # Prevent Sinatra from converting downstream exceptions into generic 500
          # responses before Rails has a chance to handle them appropriately.
          middleware.set :raise_errors, true
          middleware.set :show_exceptions, false

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

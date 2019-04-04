require 'rack-mini-profiler'

# Configure the rack mini-profiler, which displays a on-page breakdown of the
# time spent rendering the page including details on the SQL queries run,
# and can run memory, GC, and stack analysis.

# Display the mini-profiler on the right side of the page so that it is less
# likely to overlap important content.
Rack::MiniProfiler.config.position = 'right'

# Only pre-authorize the min profiler when this setting is enabled (in locals.yml).
# See ApplicationController.check_profiler for more details on when the profiler
# is actually enabled per-page and user in different environments
Rack::MiniProfiler.config.pre_authorize_cb = proc {CDO.rack_mini_profiler_enabled}

# See https://github.com/MiniProfiler/rack-mini-profiler#storage
# Rack::MiniProfiler.config.storage = Rack::MiniProfiler::FileStore
Rack::MiniProfiler.config.storage = Rack::MiniProfiler::FileStore

# Only allow when it's explicitly allowed based on the rules in ApplicationController.check_profiler,
# across all environments for consistency.
# By default, this would be :allow_all for dev and test, :whitelist for other environments.
# The whitelist mode means we must explicitly call authorize_request on a given request.
Rack::MiniProfiler.config.authorization_mode = :whitelist

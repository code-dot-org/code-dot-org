if Rails.env.development?
  require 'rack-mini-profiler'

  # Configure the rack mini-profiler, which displays a on-page breakdown of the
  # time spent rendering the page including details on the SQL queries run.

  # Display the mini-profiler on the right side of the page so that it is less
  # likely to overlap important content.
  Rack::MiniProfiler.config.position = 'right'

  # This callback is run for each page to determine whether to enable the
  # mini-profiler. It is enabled only in development and only if the
  # RACK_MINI_PROFILER environment variable is 'on'. This can be done either by
  # setting the environment variable prior to running the server, or by hitting
  # a page with a "pp=enabled" query string parameter and then refreshing the page.
  Rack::MiniProfiler.config.pre_authorize_cb = lambda {|_env|
    ENV['RACK_MINI_PROFILER'] == 'on'
  }
end

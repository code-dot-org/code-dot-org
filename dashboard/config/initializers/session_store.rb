require 'connection_pool'
require 'cdo/cookie_helpers'

session_cookie_key = environment_specific_cookie_name('_learn_session')
Dashboard::Application.config.session_store Middlewares::RedisSessionStore,
  key: session_cookie_key,
  servers: [CDO.session_store_server || 'redis://localhost:6379/0/session'],
  secure: !CDO.no_https_store && (!Rails.env.development? || CDO.https_development),
  domain: :all,

  # Users who interact with the site at least once a month will remain logged in.
  expire_after: 40.days,

  # At 4 connections per thread, up to 5 threads per worker, 48 workers per
  # server, we expect 960 connections per server for each instance of the
  # session store we initialize. Currently, that's two: one for Dashboard, one
  # for Pegasus; see lib/cdo/rack/request.rb
  pool_size: 4

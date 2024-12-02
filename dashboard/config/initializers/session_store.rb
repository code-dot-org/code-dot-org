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

  # Enable pooling by specifying a pool size; we arbitrarily use the value this
  # would default to anyway, for simplicity. In practice, we run with enough
  # parallel worker processes in production that we only use an average of
  # ~1.34 connections per pool, so this could be reduced if desired.
  pool_size: 5

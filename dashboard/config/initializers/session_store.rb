require 'connection_pool'
require 'cdo/cookie_helpers'

session_cookie_key = environment_specific_cookie_name('_learn_session')
Dashboard::Application.config.session_store Middlewares::RedisSessionStore,
  key: session_cookie_key,
  servers: [CDO.session_store_server || 'redis://localhost:6379/0/session'],
  secure: !CDO.no_https_store && (!Rails.env.development? || CDO.https_development),
  domain: :all,
  expire_after: 40.days, # Users who interact with the site at least once a month will remain logged in.
  pool_size: 5 # We arbitrarily use the value this would default to anyway; we just have to specify *something* here to enable pooling in the first place.

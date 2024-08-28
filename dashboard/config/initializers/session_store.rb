require 'cdo/cookie_helpers'

session_cookie_key = environment_specific_cookie_name('_learn_session')
Dashboard::Application.config.session_store :redis_store,
  key: session_cookie_key,
  servers: [CDO.session_store_server || 'redis://localhost:6379/0/session'],
  secure: !CDO.no_https_store && (!Rails.env.development? || CDO.https_development),
  domain: :all,
  expire_after: 200.days # don't expire in the same school year

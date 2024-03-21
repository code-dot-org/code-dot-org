require 'cdo/cookie_helpers'
require_relative '../custom_session_store/migrate_cookies_to_redis_store'

session_cookie_key = environment_specific_cookie_name('_learn_session')
Dashboard::Application.config.session_store :migrate_cookies_to_redis_store,
  servers: CDO.session_store_servers || %w(redis://localhost:6379/0/session),
  key: session_cookie_key,
  secure: !CDO.no_https_store && (!Rails.env.development? || CDO.https_development),
  domain: :all,
  expire_after: 200.days # don't expire in the same school year

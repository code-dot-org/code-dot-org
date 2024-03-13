require 'cdo/cookie_helpers'
session_cookie_key = environment_specific_cookie_name('_learn_session')
Dashboard::Application.config.session_store :cookie_store,
  key: session_cookie_key,
  secure: !CDO.no_https_store && (!Rails.env.development? || CDO.https_development),
  domain: :all

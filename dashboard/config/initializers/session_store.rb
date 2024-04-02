require 'cdo/cookie_helpers'
require_relative '../custom_session_store/instrumented_cookie_store'

session_cookie_key = environment_specific_cookie_name('_learn_session')
Dashboard::Application.config.session_store :instrumented_cookie_store,
  key: session_cookie_key,
  secure: !CDO.no_https_store && (!Rails.env.development? || CDO.https_development),
  domain: :all,
  expire_after: 200.days # don't expire in the same school year

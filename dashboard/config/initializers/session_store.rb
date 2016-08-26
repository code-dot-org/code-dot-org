session_cookie_key = '_learn_session'
session_cookie_key += "_#{Rails.env}" unless Rails.env.production?
Dashboard::Application.config.session_store :cookie_store,
  key: session_cookie_key,
  secure: !Rails.env.development? || CDO.https_development,
  domain: :all

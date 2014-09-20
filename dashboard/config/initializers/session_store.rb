# Be sure to restart your server when you modify this file.
session_cookie_key = "_learn_session"
session_cookie_key += "_#{Rails.env}" unless Rails.env.production?
Dashboard::Application.config.session_store :cookie_store, key: session_cookie_key, :httponly => false, domain: :all

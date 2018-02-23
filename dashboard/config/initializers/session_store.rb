require 'cookie_helpers'
Dashboard::Application.config.session_store(*CookieHelpers::SESSION_STORE)

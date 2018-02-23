
# We have various cookies that we want to be environment specific. We accomplish
# this by tacking on the rack_env (unless we're in prod). This helper gets the
# appropriate cookie name
# @param {string} Base cookie name
# @returns {string} Actual cookie name, with the rack_env appended
def environment_specific_cookie_name(base_name)
  return base_name if CDO.rack_env?(:production)
  "#{base_name}_#{CDO.rack_env}"
end

require 'action_dispatch'
module CookieHelpers
  SESSION_KEY_BASE = '_learn_session'
  SESSION_KEY = environment_specific_cookie_name(SESSION_KEY_BASE)

  # Class / options array for creating session-store middleware.
  # @example
  #   use *CookieHelpers::SESSION_STORE
  #   Rails.application.config.session_store *CookieHelpers::SESSION_STORE
  SESSION_STORE = [
    ActionDispatch::Session::CookieStore,
    {
      key: SESSION_KEY,
      secure: !CDO.no_https_store && (!Rails.env.development? || CDO.https_development),
      domain: :all
    }
  ]
end

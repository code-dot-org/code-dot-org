class I18nController < ApplicationController
  # The CSRF token is not available on every code.org page, and this API needs to work on all page; therefore CSRF
  # protections checks will be skipped for the i18n API.
  protect_from_forgery except: [:track_string_usage]

  # The max number of i18n string keys which can be recorded in one request.
  # This is to protect us from malicious API calls where thousands or millions of items are given in a single request.
  # It doesn't stop us from receiving it, but it does stop us from doing anything with it.
  I18N_KEY_COUNT_LIMIT = 500
end

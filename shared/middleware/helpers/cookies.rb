# frozen_string_literal: true

require 'public_suffix'

module Middleware
  module Helpers
    module Cookies
      LOCALE_KEY = 'language_'

      def set_locale_cookie(value)
        request.cookies[LOCALE_KEY] = value
        set_global_cookie(LOCALE_KEY, value)
      end

      def set_global_cookie(key, value, high_priority: false)
        cookie_data = {
          domain: ".#{PublicSuffix.parse(request.hostname).domain}", # the root domain (e.g., ".code.org")
          path: '/',
          same_site: :lax,
        }

        if value
          response.set_cookie(key, cookie_data.merge(value: value, max_age: 315_569_520))
        else
          response.delete_cookie(key, cookie_data)
        end

        # Prevents the cookie from being discarded under resource constraints.
        response.set_cookie_header = "#{response.set_cookie_header}; priority=high" if high_priority
      end
    end
  end
end

# Patch Rack::Response with extra utility methods.
module Rack
  class Response
    # From Rack 2.0 alpha: rack/rack#957
    def has_header?(key);   headers.key? key;   end
    def get_header(key);    headers[key];       end
    def set_header(key, v); headers[key] = v;   end

    def add_header(key, v)
      if v.nil?
        get_header key
      elsif has_header? key
        set_header key, "#{get_header key},#{v}"
      else
        set_header key, v
      end
    end

    # Sets or deletes a CDO domain cookie with long-term persistence.
    #
    # This method configures cookies to be accessible across the entire root domain
    # by automatically parsing the dashboard hostname. It also supports a non-standard
    # priority attribute for Blink-based browsers to manage storage eviction.
    #
    # @param key [String] the name of the cookie
    # @param value [String, nil] the content of the cookie; providing nil triggers deletion
    # @param priority [Symbol, nil] browser eviction hint (`low`, `medium`, or `high`)
    # @param options [Hash] additional attributes such as `httponly`, `secure`, or `same_site`
    #
    # @example Setting a high priority session cookie
    #   set_cdo_cookie('user_session', "token_123", priority: :high, httponly: true)
    #
    # @example Deleting a CDO domain cookie
    #   set_cdo_cookie('user_session', nil)
    #
    # @return [void]
    def set_cdo_cookie(key, value, priority: nil, **options)
      global_data = {
        domain: ".#{PublicSuffix.parse(CDO.dashboard_hostname).domain}", # the root domain (e.g., ".code.org")
        path: '/',
        same_site: :lax,
      }

      if value
        set_cookie(key, {**options, **global_data, value: value, max_age: 315_569_520})
        # Hints to the browser which cookies to retain first when domain storage limits are reached.
        self.set_cookie_header = "#{set_cookie_header}; priority=#{priority}" if priority
      else
        delete_cookie(key, global_data)
      end
    end
  end
end
